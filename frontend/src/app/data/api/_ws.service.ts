import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import {
  filter,
  map,
  Observable,
  repeat,
  retry,
  shareReplay,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
  timeout,
  timer,
} from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

import { KEYCLOAK_DISABLED } from '../../auth/keycloak-constants';
import { checkAuthToken } from '../../auth/keycloak-token-update';
import { ONE_SECOND } from '../../constants';
import { isString } from '../../helpers';
import { PageVisibilityService } from '../services/page-visibility.service';
import { logMalformedMessage, logRetry } from './_ws-helpers';
import { WebSocketNotificationService } from './_ws-notification.service';

const webSocketUrl = `${window.webSocketsBaseUrl}/generic/ws`;

/**
 * If no pongs or other data.
 * Should be greated than heartbeatInterval.
 */
const noMessagesTimeout = 20000;

/**
 * Sending ping messages.
 */
const heartbeatInterval = noMessagesTimeout * 0.5;

const pingKeyword = 'PING';
const pongKeyword = 'PONG';

//------------------------------------------------------------------------------
// Generic web socket

export enum WsTopic {
  MonbatActiveSchedule = 'ws-monbat-active-schedule',
  PowerLimitSchedule = 'ws-power-limit-schedule',
  AlarmEvents = 'ws-alarm-events',
  ErrorStacks = 'ws-error-stacks',
  DeviceStateChange = 'ws-device-state-change',
  // BatteryString = 'ws-battery-string', Not used any more
}

/**
 * Generic web socket messages are transformed
 * into streams of diffetent types (T) according to topic.
 *
 * Specific messages:
 *
 * WsTopicMessage_MonbatActiveScheduleDTO
 * WsTopicMessage_PowerLimitScheduleDTO
 * AlarmEventDTO
 * DeviceStateChange
 * BatteryString // Not used any more
 * ErrorStackDTO
 */
interface WsStreamRawMessage {
  type: 'new_message'; // 'auth_required', 'generic_error'... TBD

  timestamp: string; // UTC timestamp of sending the message

  // body for type 'new_message'
  body: {
    topic: WsTopic;
    message: any; // according to topic
  };
}

/**
 * Raw messages are parsed and wrapped in
 * WsTopicStreamMessage with the provided type.
 */
export interface WsTopicStreamMessage<T> {
  topic: WsTopic;
  timestamp: string; // UTC timestamp of sending the message
  message: T;
}

@Injectable({
  providedIn: 'root',
})
export class WebSocketsService {
  private _isConnecting = false;

  private _socketStreamSubscription: Subscription | undefined;

  private readonly _rawMessagesStream$ = new Subject<WsStreamRawMessage>();

  private readonly _socket$: WebSocketSubject<WsStreamRawMessage | string | null>;

  private readonly _socketConnectedEvent$ = new Subject<void>();
  private readonly _socketDisconnectedEvent$ = new Subject<void>();

  socketConnectedEvent$ = this._socketConnectedEvent$.asObservable();
  socketDiconnectedEvent$ = this._socketDisconnectedEvent$.asObservable();

  //----------------------------------------------------------------------------

  constructor(
    private keycloak: Keycloak,
    private notificationService: WebSocketNotificationService,
    private visibilityService: PageVisibilityService,
  ) {
    this._socket$ = this._createWebSocket();

    if (KEYCLOAK_DISABLED) {
      return;
    }

    this._connect();

    visibilityService.pageVisible.subscribe(() => {
      this._connect();
    });

    // TODO: send tokens only TBD
    timer(heartbeatInterval, heartbeatInterval)
      .pipe(
        switchMap(async () => checkAuthToken(this.keycloak)),
        takeUntil(this.visibilityService.pageHidden),
        repeat({ delay: () => this.visibilityService.pageVisible }),
      )
      .subscribe((token) => {
        if (this._socketStreamSubscription?.closed) {
          return;
        }

        this._socket$.next(token);
        this._socket$.next(pingKeyword);
      });
  }

  getWebSocketStreamOnTopic<T>(topic: WsTopic): Observable<WsTopicStreamMessage<T>> {
    return this._rawMessagesStream$.pipe(
      filter((msg) => msg.type === 'new_message' && msg.body.topic === topic),
      map((wsGenericMessage) => {
        const result: WsTopicStreamMessage<T> = {
          topic: wsGenericMessage.body.topic,
          timestamp: wsGenericMessage.timestamp,
          message: wsGenericMessage.body.message,
        };

        return result;
      }),
      shareReplay(1),
    );
  }

  private _createWebSocket(): WebSocketSubject<WsStreamRawMessage | string | null> {
    return webSocket<WsStreamRawMessage | string | null>({
      url: webSocketUrl,
      deserializer: (event: MessageEvent<string>) => this._parseMessageString(event.data),
      openObserver: {
        next: () => {
          // console.log('WebSocketService | OPEN observer');

          this.notificationService.hideSocketNotifications();

          this._isConnecting = false;

          checkAuthToken(this.keycloak).then((token) => {
            if (this._socketStreamSubscription?.closed) {
              return;
            }

            this._socket$.next(token);
            this._socketConnectedEvent$.next();
          });
        },
      },
      closeObserver: {
        next: (e: CloseEvent) => {
          // logCloseEvent(e);

          this._socketDisconnectedEvent$.next();
        },
      },
    });
  }

  private _connect() {
    if (this._isConnecting) {
      return;
    }

    this._isConnecting = true;

    this._socketStreamSubscription?.unsubscribe();
    this._socketStreamSubscription = this._socketStream(this._socket$)
      .pipe(takeUntil(this.visibilityService.pageHidden))
      .subscribe({
        next: (rawMessage) => this._rawMessagesStream$.next(rawMessage),
        error: (err) => {
          /**
           * Unrecoverable error.
           * Probably too many retries.
           */
          console.error('WebSocketService | Failed to reconnect! Error:', err);

          this.notificationService.showSocketError();
        },
        complete: () => {
          this._isConnecting = false;

          /**
           * The stream can complete either because the page was hidden (takeUntil)
           * or because the server gracefully closed the connection.
           */

          if (this.visibilityService.isPageVisible()) {
            /**
             * Unexpected case - the server closed the connection.
             */
            this._connect();
          }
        },
      });
  }

  private _socketStream<T>(socket$: WebSocketSubject<T | string | null>): Observable<T> {
    return socket$.pipe(
      /**
       * Apply retry logic on stream error or timeout.
       */
      timeout(noMessagesTimeout),
      retry({
        /**
         * The last, 7-nth retry, will occur after 115 seconds of no connection
         * and if it fails this will lead to an unrecoverable error.
         */
        count: 7,
        resetOnSuccess: true,
        delay: (err, retryCount) => {
          const waitSeconds = Math.min(retryCount * retryCount, 30);

          logRetry(retryCount, waitSeconds, err, 7);

          /**
           * Retry count will reach 4 after about 30 seconds of no connection.
           */
          if (retryCount > 3) {
            this.notificationService.showSocketWarning();
          }

          return timer(waitSeconds * ONE_SECOND);
        },
      }),

      /**
       * Filter string messages (pongs or tokens) and nulls.
       * Nulls are usually malformed messages that
       * was not parseable by the serializer.
       */
      filter((data: T | string | null): data is T => data !== null && !isString(data)),
    );
  }

  private _parseMessageString(message: string): WsStreamRawMessage | null {
    try {
      if (message === pongKeyword) {
        return null;
      }

      const result = JSON.parse(message);

      if (isString(result)) {
        /**
         * Ignore string messages (pongs from local test server or tokens)
         */
        return null;
      }

      const wsStreamRawMessage = result as WsStreamRawMessage;

      /**
       * Validate mesage format.
       */
      if (!wsStreamRawMessage.type || !wsStreamRawMessage.timestamp || !wsStreamRawMessage.body) {
        throw new Error('Message format was not recognised.');
      }

      return wsStreamRawMessage;
    } catch (err) {
      logMalformedMessage(err, message);

      return null;
    }
  }
}
