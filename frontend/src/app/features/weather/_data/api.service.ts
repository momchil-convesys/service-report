import { Injectable } from '@angular/core';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { SSE_DataRequest, SSE_EventName } from '../../../constants';
import { ApiService, ServerSentEventsService } from '../../../data/api';
import { Plant } from '../../../data/models';
import { DatetimeRangeModel } from '../../../shared/datetime-range-select/models';
import { endpointForChartIdentifier, PlantWeatherDataChartIdentifier } from './constants';
import { PlantWeather_HistoricalTimelineData_DTO } from './dto';
import { ChartSpecifics } from './interfaces';

@Injectable()
export class WeatherApiService {
  private _destroy$ = new Subject<void>();

  constructor(
    private _baseApi: ApiService,
    private _sseApi: ServerSentEventsService,
  ) {}

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  fetchPlantWeatherData(
    plant: Plant,
    targetRange: DatetimeRangeModel,
    liveData: boolean,
    chartSpecifics: ChartSpecifics,
  ): Observable<SSE_DataRequest<PlantWeather_HistoricalTimelineData_DTO>> {
    const requestUrl = this._constructUrl_PlantWeatherData(plant, targetRange, chartSpecifics);

    return liveData
      ? this._fetchPlantWeatherData_Live(requestUrl)
      : this._fetchPlantWeatherData_Finalized(requestUrl);
  }

  private _fetchPlantWeatherData_Finalized(
    requestUrl: string,
  ): Observable<SSE_DataRequest<PlantWeather_HistoricalTimelineData_DTO>> {
    return this._baseApi
      .fetchObject<
        PlantWeather_HistoricalTimelineData_DTO,
        PlantWeather_HistoricalTimelineData_DTO
      >(requestUrl, undefined)
      .pipe(
        map((req) => ({
          ...req,
          eventName: req.data ? SSE_EventName.DATA_INIT : null,
        })),
        takeUntil(this._destroy$),
      );
  }

  private _fetchPlantWeatherData_Live(
    requestUrl: string,
  ): Observable<SSE_DataRequest<PlantWeather_HistoricalTimelineData_DTO>> {
    return this._sseApi
      .fetch<PlantWeather_HistoricalTimelineData_DTO>(requestUrl)
      .pipe(takeUntil(this._destroy$));
  }

  private _constructUrl_PlantWeatherData(
    plant: Plant,
    targetRange: DatetimeRangeModel,
    chartSpecifics: ChartSpecifics,
  ): string {
    let requestUrl = endpointForChartIdentifier[chartSpecifics.chartIdentifier];

    requestUrl += `?plantId=${plant.id}`;
    requestUrl += `&from=${targetRange.from.toISOString()}`;
    requestUrl += `&to=${targetRange.to.toISOString()}`;

    if (chartSpecifics.chartIdentifier === PlantWeatherDataChartIdentifier.MomentaryPerTS) {
      requestUrl += `&parameterName=${chartSpecifics.parameterName}`;
    }

    if (
      chartSpecifics.chartIdentifier !== PlantWeatherDataChartIdentifier.MomentaryPerTS ||
      chartSpecifics.parameterName === 'rain'
    ) {
      requestUrl += `&integrationPeriod=${targetRange.integrationPeriod}`;
    }

    return requestUrl;
  }
}
