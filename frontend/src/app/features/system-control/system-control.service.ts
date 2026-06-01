import { Injectable } from '@angular/core';
import { catchError, defer, finalize, map, Observable, of, shareReplay } from 'rxjs';
import { DataRequest, SSE_DataRequest } from '../../constants';
import { ApiService, ServerSentEventsService } from '../../data/api';
import { handleAnyError } from '../../helpers';
import { SystemSetupType } from './constants';
import {
  SystemSetupControlRequestBody_DTO,
  SystemSetupControlResponse_DTO,
} from './system-setup.dto';

@Injectable({
  providedIn: 'root',
})
export class SystemControlService {
  private _cachedRequests: {
    [plantId: string]: Observable<SSE_DataRequest<SystemSetupControlResponse_DTO>>;
  } = {};

  constructor(
    private sse: ServerSentEventsService,
    private api: ApiService,
  ) {}

  getSystemSetup(plantId: string): Observable<SSE_DataRequest<SystemSetupControlResponse_DTO>> {
    if (this._cachedRequests[plantId]) {
      return this._cachedRequests[plantId];
    }

    const request$ = defer(() => {
      return this.sse.fetch<SystemSetupControlResponse_DTO>(
        `/system-setup/control?plantId=${plantId}`,
      );
    }).pipe(
      finalize(() => {
        // This is called when the last subscriber unsubscribes
        delete this._cachedRequests[plantId];
      }),
      catchError((error: string) =>
        of({ isLoading: false, error: handleAnyError(error, undefined), eventName: null }),
      ),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    this._cachedRequests[plantId] = request$;

    return request$;
  }

  takeControl(
    plantId: string,
    thisSetup: SystemSetupType,
    passcode: string,
  ): Observable<DataRequest<SystemSetupControlResponse_DTO>> {
    return this._setSystemSetupInControl(plantId, thisSetup, passcode);
  }

  releaseControl(
    plantId: string,
    thisSetup: SystemSetupType,
    passcode: string,
  ): Observable<DataRequest<SystemSetupControlResponse_DTO>> {
    const newSystemSetupInControl = thisSetup === 'on-site' ? 'cloud' : 'on-site';

    return this._setSystemSetupInControl(plantId, newSystemSetupInControl, passcode);
  }

  private _setSystemSetupInControl(
    plantId: string,
    systemSetupInControl: SystemSetupType,
    passcode: string,
  ): Observable<DataRequest<SystemSetupControlResponse_DTO>> {
    const endpoint = `/system-setup/control?plantId=${plantId}`;

    const body: SystemSetupControlRequestBody_DTO = {
      plantId,
      systemSetupInControl,
      passcode,
    };

    return this.api.decorateRequest(
      this.api.http
        .put<SystemSetupControlResponse_DTO>(`${this.api.baseUrl}${endpoint}`, body, {
          headers: this.api.defaultHttpHeaders,
        })
        .pipe(map((response) => ({ data: response }))),
    );
  }
}
