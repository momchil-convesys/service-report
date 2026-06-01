import { Injectable } from '@angular/core';
import {
  EventSourceMessage,
  EventStreamContentType,
  fetchEventSource,
} from '@microsoft/fetch-event-source';
import Keycloak from 'keycloak-js';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BehaviorSubject, Observable, finalize } from 'rxjs';
import { KEYCLOAK_DISABLED } from '../../auth/keycloak-constants';
import { checkAuthToken } from '../../auth/keycloak-token-update';
import { SSE_DataRequest, SSE_DataUpdateMethod, SSE_EventName } from '../../constants';

/**
 * Server Sent Events
 *
 * On initial request (after opening the connection)
 * the first message should should contain all the requested data
 * and event name will be DATA_INIT
 *
 * E.g:
 *    event: DATA_INIT
 *    data: { dataPoints: [p1, p2, ... pN] }
 *
 * Subsequent messages will contain only partial data
 * and the event name should reflect the way this partial data should be merged
 * to the initial data.
 *
 * -----------------------------------------------------------------------------
 * DATA_REPLACE
 *
 * If initial data should be fully replaced (ALL points)
 *    event: DATA_REPLACE
 *    data: { dataPoints: [p1, p2, ... pN] }
 *
 * Example cases:
 *    - when all data points are affected and need to be replaced
 *    - showing current state of something
 *    - energy flow chart (single data point)
 *
 * -----------------------------------------------------------------------------
 * DATA_APPEND
 *
 * If new data contains points (SUBSET of points) that should be added to initial data
 *    event: DATA_APPEND
 *    data: { dataPoints: [pN+1] }
 *
 * Example cases:
 *    - new data point is added to historical data (line charts)
 *
 * -----------------------------------------------------------------------------
 * DATA_PATCH
 *
 * If new data contains replacement points (SUBSET of points).
 *    event: DATA_PATCH
 *    data: [p2, p17]
 *
 * Example cases:
 *    - updating the last column in a bar chart
 *    - accumulated historical data per day -> current day point is updated live
 *    - accumulated historical data per month -> current month point is updated live
 */

class RetriableError extends Error {}
class FatalError extends Error {}

const defaultDaseUrl = 'http://localhost:3000/api';
const baseUrl = window.apiBaseUrl || defaultDaseUrl;

@Injectable({
  providedIn: 'root',
})
export class ServerSentEventsService {
  private logPrefix = `${this.constructor.name} |`;

  private noConnectionNotificationId: string | undefined;

  constructor(
    private keycloak: Keycloak,
    private message: NzMessageService,
  ) {}

  interceptedFetch = async (...args: any) => {
    let [resource, config] = args;

    // request interceptor
    // ...

    const token = await checkAuthToken(this.keycloak);

    if (config?.headers && !KEYCLOAK_DISABLED) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    const response = await window.fetch(resource, config);

    // response interceptor
    // ...

    return response;
  };

  fetch<T>(
    requestString: string,
    dataUpdater: (prev: T, next: T, updateMethod: SSE_DataUpdateMethod) => T = (_, next) => next,
    options: {
      method: 'GET' | 'POST';
      body?: any;
    } = {
      method: 'GET',
      body: undefined,
    },
  ): Observable<SSE_DataRequest<T>> {
    const stream = new BehaviorSubject<SSE_DataRequest<T>>({
      isLoading: true,
      eventName: null,
    });

    const abortController = new AbortController();
    let requestStringWithQueryParams = requestString;
    if (requestString.includes('?')) {
      requestStringWithQueryParams += '&';
    } else {
      requestStringWithQueryParams += '?';
    }
    requestStringWithQueryParams += 'sse=true';

    fetchEventSource(`${baseUrl}${requestStringWithQueryParams}`, {
      method: options.method,
      fetch: this.interceptedFetch,
      signal: abortController.signal,
      openWhenHidden: false,
      body: options.body ? JSON.stringify(options.body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },

      onopen: async (response) => {
        if (response.ok && response.headers.get('content-type')?.startsWith(EventStreamContentType)) {
          if (this.noConnectionNotificationId) {
            this.message.remove(this.noConnectionNotificationId);
            this.noConnectionNotificationId = undefined;
          }

          return;
          // } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          // TODO: Handle specific errors, parse message
        } else {
          console.warn(
            this.logPrefix,
            `(onopen) FatalError,
            response status: ${response.status}, 
            status text: ${response.statusText}, 
            content type: ${response.headers.get('content-type')}`,
          );

          if (response.ok) {
            // If we get to here, then the server has responded with OK,
            // but the content type is not Event Stream
            throw new FatalError(`Server does not support SSE for this request.`);
          } else {
            throw new FatalError(`Server response: ${response.status} ${response.statusText}`);
          }
        }
      },

      onmessage: async (msg: EventSourceMessage) => {
        try {
          const eventName: SSE_EventName = this.parseEventName(msg.event);

          if (eventName === SSE_EventName.KEEPALIVE) {
            return;
          }

          const newData: T = JSON.parse(msg.data);
          const currentData: T | undefined = stream.getValue().data;

          this.dispatchData(currentData, newData, eventName, stream, dataUpdater);
        } catch (err) {
          console.warn(
            this.logPrefix,
            '(onmessage) Failed to parse server response! EventSourceMessage:',
            msg,
            err,
          );

          /**
           * TODO: temporary fix to ignore strange message types from backend.
           */

          const TMP_FIX = true;
          if (TMP_FIX) {
            const currentData: T | undefined = stream.getValue().data;

            // Emit error only if this is the initial data fetch
            // and ignore subsequent corrupted messages
            if (!currentData) {
              stream.next({
                isLoading: false,
                error: new Error('Failed to parse server response!'),
                eventName: null,
              });
            }
          } else {
            // Original code

            stream.next({
              isLoading: false,
              error: new Error('Failed to parse server response!'),
              eventName: null,
            });
          }
        }
      },

      onclose: () => {
        console.warn(this.logPrefix, '(onclose) Server closed the connection unexpectedly!');

        // If the server closes the connection unexpectedly, retry.
        throw new FatalError('Server closed the connection unexpectedly!');
      },

      onerror: (err) => {
        // The only way to stop automatic retry is to throw an error.
        // abortController is not working in the onerror callback (implementation specifics)

        if (err instanceof FatalError) {
          console.warn(this.logPrefix, '(onerror) FatalError: ', err);

          throw err; // rethrow to stop the operation
        } else {
          // Do nothing to automatically retry.
          // You can also return a specific retry interval here.

          console.warn(this.logPrefix, '(onerror) Will retry! Error:', err);

          if (!this.noConnectionNotificationId) {
            this.noConnectionNotificationId = this.message.warning(
              'Connection with server failed! Retrying...',
              {
                nzDuration: 0,
              },
            ).messageId;
          }
        }
      },
    })
      .catch((err) => {
        console.error(this.logPrefix, '(try/catch) ERROR: ', err);
        stream.next({
          isLoading: false,
          error: err,
          eventName: null,
        });

        if (err instanceof FatalError) {
          this.message.error('Network error occured!', {
            nzDuration: 3000,
          }).messageId;
        }
      })
      .finally(() => {
        if (this.noConnectionNotificationId) {
          this.message.remove(this.noConnectionNotificationId);
          this.noConnectionNotificationId = undefined;
        }
      });

    return stream.asObservable().pipe(
      finalize(() => {
        if (!abortController.signal.aborted) {
          // console.log(this.logPrefix, 'Aborting fetch request (Observer unsubscribed)');
          abortController.abort('Observer unsubscribed'); // TODO: causes exception
        }
      }),
    );
  }

  private dispatchData<T>(
    currentData: T | undefined,
    newData: T,
    eventName: SSE_EventName,
    stream: BehaviorSubject<SSE_DataRequest<T>>,
    dataUpdater: (prev: T, next: T, updateMethod: SSE_DataUpdateMethod) => T,
  ) {
    if (currentData === undefined) {
      stream.next({
        isLoading: false,
        data: newData,
        eventName,
      });
      return;
    }

    switch (eventName) {
      // This case should be already handled
      // by the currentData === undefined condition
      case SSE_EventName.DATA_INIT:
        stream.next({
          isLoading: false,
          data: newData,
          eventName,
        });
        return;

      case SSE_EventName.DATA_APPEND:
        stream.next({
          isLoading: false,
          data: dataUpdater(currentData, newData, SSE_DataUpdateMethod.Append),
          eventName,
        });
        return;

      case SSE_EventName.DATA_PATCH:
        stream.next({
          isLoading: false,
          data: dataUpdater(currentData, newData, SSE_DataUpdateMethod.Patch),
          eventName,
        });
        return;

      case SSE_EventName.DATA_REPLACE:
        stream.next({
          isLoading: false,
          data: dataUpdater(currentData, newData, SSE_DataUpdateMethod.Replace),
          eventName,
        });
        return;

      default:
        console.warn('Unhandled case for SSE Event: ', eventName);
    }
  }
  private parseEventName(eventNameString: string): SSE_EventName {
    if ((<string[]>Object.values(SSE_EventName)).includes(eventNameString)) {
      return <SSE_EventName>eventNameString;
    }

    throw $localize`Unknown event name:` + ` ${eventNameString}`;
  }
}
