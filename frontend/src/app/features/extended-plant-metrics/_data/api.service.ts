import { Injectable } from '@angular/core';
import { isBefore } from 'date-fns';
import { Observable, Subject, takeUntil, throttleTime } from 'rxjs';
import { DataRequest } from '../../../constants';
import { ApiService, ServerSentEventsService } from '../../../data/api';
import { Plant } from '../../../data/models';
import { DatetimeRangeModel } from '../../../shared/datetime-range-select/models';
import {
  LevelOfMeasurement,
  PlantMetricsCurrentValuesData_DTO,
  PlantMetricsMetadata_DTO,
  PowerMetersCumulativeData_DTO,
} from './dto';
import { dataUpdateCallback } from './updater';

@Injectable()
export class ExtendedPlantMetricsApiService {
  private _destroy$ = new Subject<void>();

  constructor(
    private baseApi: ApiService,
    private sseApi: ServerSentEventsService,
  ) {}

  ngOnDestroy() {
    this._destroy$.next();
  }

  fetchMetadata(plantId: string): Observable<DataRequest<PlantMetricsMetadata_DTO>> {
    return this.baseApi
      .fetchObject<
        PlantMetricsMetadata_DTO,
        PlantMetricsMetadata_DTO
      >(`/extended-plant-metrics-metadata?plantId=${plantId}`)
      .pipe(takeUntil(this._destroy$));

    // const firstValue = of({
    //   isLoading: true,
    //   data: undefined,
    // });

    // const secondValue = of({
    //   isLoading: false,
    //   data: mock_PlantMetricsMetadata,
    // }).pipe(delay(1000));

    // const result = concat(firstValue, secondValue);

    // return result;
  }

  fetchLiveData(
    plant: Plant,
    levelOfMeasurement: LevelOfMeasurement,
  ): Observable<DataRequest<PlantMetricsCurrentValuesData_DTO>> {
    return this.sseApi
      .fetch<PlantMetricsCurrentValuesData_DTO>(
        `/extended-plant-metrics-current-values?plantId=${plant.id}&levelOfMeasurement=${levelOfMeasurement}`,
        (prev, next) => next,
      )
      .pipe(takeUntil(this._destroy$));
  }

  fetchCumulativeData(
    plant: Plant,
    targetRange: DatetimeRangeModel,
    levelOfMeasurement: LevelOfMeasurement,
    subLevelId: string | null,
  ): Observable<DataRequest<PowerMetersCumulativeData_DTO>> {
    let queryParams = `?plantId=${
      plant.id
    }&levelOfMeasurement=${levelOfMeasurement}&integrationPeriod=${
      targetRange.integrationPeriod
    }&from=${targetRange.from.toISOString()}&to=${targetRange.to.toISOString()}`;

    if (subLevelId) {
      queryParams += `&subLevelId=${subLevelId}`;
    }

    const requestUrl = `/extended-plant-metrics-historical-data${queryParams}`;

    let liveData = !isBefore(new Date(targetRange.to), new Date());

    if (liveData) {
      return this.sseApi
        .fetch<PowerMetersCumulativeData_DTO>(requestUrl, dataUpdateCallback)
        .pipe(
          throttleTime(2000, undefined, { leading: true, trailing: true }),
          takeUntil(this._destroy$),
        );
    }

    return this.baseApi
      .fetchObject<
        PowerMetersCumulativeData_DTO,
        PowerMetersCumulativeData_DTO
      >(requestUrl, undefined)
      .pipe(takeUntil(this._destroy$));
  }
}
