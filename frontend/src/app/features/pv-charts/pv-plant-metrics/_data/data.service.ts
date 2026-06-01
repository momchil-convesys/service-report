import { Injectable } from '@angular/core';
import { Observable, Subject, catchError, of, takeUntil, throttleTime } from 'rxjs';
import { DataRequest } from '../../../../constants';
import { ServerSentEventsService } from '../../../../data/api';
import { handleAnyError } from '../../../../helpers';
import { PVPlantEssentialMetrics } from './pv-plant-metrics.model';
import { pvPlantEssentialMetricsUpdateCallback } from './pv-plant-metrics.updater';

@Injectable()
export class PvPlantMetricsDataService {
  private _destroy$ = new Subject<void>();

  constructor(private sse: ServerSentEventsService) {}

  ngOnDestroy() {
    this._destroy$.next();
  }

  getPvPlantMetricsRequest(plantId: string): Observable<DataRequest<PVPlantEssentialMetrics>> {
    const requestUrl = `/pv-plant-metrics?plantId=${plantId}`;

    return this.sse
      .fetch<PVPlantEssentialMetrics>(requestUrl, pvPlantEssentialMetricsUpdateCallback)
      .pipe(
        throttleTime(1000, undefined, { leading: true, trailing: true }),
        catchError((error: string) =>
          of({ isLoading: false, error: handleAnyError(error, undefined) }),
        ),
        takeUntil(this._destroy$),
      );

    // const firstValue = of({
    //   isLoading: true,
    //   data: undefined,
    // });

    // const secondValueStream = of(mock as PVPlantEssentialMetrics).pipe(
    //   delay(1000),
    //   repeat({ delay: 1000 }),
    //   map((data) => {
    //     const newData = { ...data };
    //     if (newData.powerMetersData) {
    //       // newData.powerMetersData.totalActivePower = 60000;
    //     }

    //     newData.plantEssentialMetrics.activePower = Math.random() * 100000;

    //     newData.deviceEssentialMetrics[0].activePower = Math.random() * 10000;
    //     return {
    //       isLoading: false,
    //       data: newData,
    //     };
    //   })
    // );

    // const result = concat(firstValue, secondValueStream);

    // return result;
  }
}
