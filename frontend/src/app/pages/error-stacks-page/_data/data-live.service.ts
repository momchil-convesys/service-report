import { Injectable } from '@angular/core';
import {
  Observable,
  catchError,
  filter,
  from,
  map,
  merge,
  mergeMap,
  of,
  shareReplay,
  skip,
  switchMap,
  tap,
} from 'rxjs';
import { WebSocketsService, WsTopic } from '../../../data/api';
import { PlantsService } from '../../../data/services/plants.service';
import { ErrorStacksDataService } from './data.service';
import { ErrorStackAdapter } from './error-stack.adapter';
import { ErrorStackDTO } from './error-stack.dto';
import { ErrorStack } from './error-stack.model';

@Injectable({
  providedIn: 'root',
})
export class ErrorStacksLiveDataService {
  errorStacksLiveStream$: Observable<ErrorStack>;

  private _lastKnownActiveTimestamp = new Date();

  constructor(
    private data: ErrorStacksDataService,
    private webSockets: WebSocketsService,
    private plantsService: PlantsService,
  ) {
    const missedStacks$ = this.webSockets.socketConnectedEvent$.pipe(
      skip(1),
      switchMap(() =>
        this.data.getErrorStacks(undefined, undefined, 1, 100, {
          from: this._lastKnownActiveTimestamp.toISOString(),
          to: new Date().toISOString(),
        }),
      ),
      map((req) => req.data),
      filter((data) => data !== undefined),
      mergeMap((array) => from(array)),
    );

    const stacksFromWs$ = this.webSockets
      .getWebSocketStreamOnTopic<ErrorStackDTO>(WsTopic.ErrorStacks)
      .pipe(
        map((wsMessage) => wsMessage.message),
        filter((dto: ErrorStackDTO | null): dto is ErrorStackDTO => dto !== null),
        map((dto) =>
          ErrorStackAdapter.dtoToModel(
            dto,
            this.plantsService.getCachedPlantByDeviceId(dto.deviceId)?.timeZone,
          ),
        ),
        catchError((err) => {
          console.warn('Failed to process data received over web socket. Error: ', err);
          return of(null);
        }),
        filter((errorStack) => errorStack !== null),
      );

    this.errorStacksLiveStream$ = merge(missedStacks$, stacksFromWs$).pipe(
      tap(() => (this._lastKnownActiveTimestamp = new Date())),
      shareReplay(1),
    );
  }
}
