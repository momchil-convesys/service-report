import { Injectable } from '@angular/core';
import { isBefore } from 'date-fns';
import { catchError, map, Observable, of, Subject, takeUntil } from 'rxjs';
import { DataRequest, IntegrationPeriod, SSE_DataUpdateMethod } from '../../../constants';
import { DataAdapter } from '../../../data/adapters';
import { ApiService, ServerSentEventsService } from '../../../data/api';
import { PlantsService } from '../../../data/services/plants.service';
import { handleAnyError } from '../../../helpers';
import { DatetimeRangeModel } from '../../../shared/datetime-range-select/models';
import {
  EnergyTrendDataDTO,
  HybridInverterCurrentDataDTO,
  HybridInverterHistoricalDataDTO,
} from './dtos';
import { MonbatBatteryHistoricalData, MonbatBatteryString } from './models';

@Injectable()
export class BatteriesApiService {
  private _destroy$ = new Subject<void>();

  constructor(
    private baseApi: ApiService,
    private sseApi: ServerSentEventsService,
    private plantsService: PlantsService,
  ) {}

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * GET /hybrid-inverter-historical-data
   *    Query params
   *        deviceId: string (required)
   *        targetDate: string (required)
   *
   * Response:
   *    Object of type HybridInverterHistoricalDataDTO
   */

  fetchHybridInverterHistoricalData(
    deviceId: string,
    from: string,
    to: string,
  ): Observable<DataRequest<HybridInverterHistoricalDataDTO>> {
    const requestUrl = `/hybrid-inverter-historical-data?deviceId=${deviceId}&from=${from}&to=${to}`;

    // If requested data is in the past
    if (isBefore(new Date(to), new Date())) {
      return this.baseApi.fetchObject<
        HybridInverterHistoricalDataDTO,
        HybridInverterHistoricalDataDTO
      >(requestUrl);
    }

    // Live updated data
    return this.sseApi
      .fetch<HybridInverterHistoricalDataDTO>(requestUrl, (currentData, newData, updateMethod) => {
        if (updateMethod === SSE_DataUpdateMethod.Append) {
          return {
            ...currentData,
            dataPoints: [...currentData.dataPoints, ...newData.dataPoints],
            accumulatedData: newData.accumulatedData,
          };
        }

        if (updateMethod === SSE_DataUpdateMethod.Patch) {
          const patchedDataPoints = [...currentData.dataPoints];
          newData.dataPoints.forEach((newPoint) => {
            const pointIndex = patchedDataPoints.findIndex(
              (p) => p.timestamp === newPoint.timestamp,
            );
            if (pointIndex >= 0) {
              patchedDataPoints[pointIndex] = newPoint;
            }
          });
          return {
            ...currentData,
            dataPoints: patchedDataPoints,
            accumulatedData: newData.accumulatedData,
          };
        }

        if (updateMethod === SSE_DataUpdateMethod.Replace) {
          return {
            ...newData,
          };
        }

        console.warn(
          `New data from SSE was not applied! Unknown update method: ${updateMethod}. Request: ${requestUrl}`,
        );
        return currentData;
      })
      .pipe(
        catchError((error: string) =>
          of({ isLoading: false, error: handleAnyError(error, undefined) }),
        ),
        takeUntil(this._destroy$),
      );
  }

  fetchEnergyTrendData(
    deviceId: string,
    from: string,
    to: string,
  ): Observable<DataRequest<EnergyTrendDataDTO>> {
    const requestUrl = `/hybrid-inverter-energy-trend?deviceId=${deviceId}&from=${from}&to=${to}`;
    // console.log(requestUrl, requestUrl);

    // resolve plant time zone once
    const tz = this.plantsService.getCachedPlantByDeviceId(deviceId)?.timeZone;
    // console.log('tz', tz);
    // Past range -> REST
    if (isBefore(new Date(to), new Date())) {
      return this.baseApi.fetchObject<EnergyTrendDataDTO, EnergyTrendDataDTO>(requestUrl).pipe(
        map((req) =>
          req.data ? { ...req, data: { ...req.data, timeZone: tz ?? req.data.timeZone } } : req,
        ),
        catchError((error: string) =>
          of({ isLoading: false, error: handleAnyError(error, undefined) }),
        ),
        takeUntil(this._destroy$),
      );
    }

    // Live range -> SSE
    return this.sseApi
      .fetch<EnergyTrendDataDTO>(requestUrl, (currentData, newData, updateMethod) => {
        if (updateMethod === SSE_DataUpdateMethod.Append) {
          return {
            ...currentData,
            dataPoints: [...currentData.dataPoints, ...newData.dataPoints],
            timeZone: tz ?? currentData.timeZone,
          };
        }

        if (updateMethod === SSE_DataUpdateMethod.Patch) {
          const patched = [...currentData.dataPoints];
          newData.dataPoints.forEach((np) => {
            const i = patched.findIndex((p) => p.timestamp === np.timestamp);
            if (i >= 0) patched[i] = np;
          });
          return {
            ...currentData,
            dataPoints: patched,
            timeZone: tz ?? currentData.timeZone,
          };
        }

        if (updateMethod === SSE_DataUpdateMethod.Replace) {
          return {
            ...newData,
            timeZone: tz ?? newData.timeZone,
          };
        }

        console.warn(
          `New data from SSE was not applied! Unknown update method: ${updateMethod}. Request: ${requestUrl}`,
        );
        return currentData;
      })
      .pipe(
        // safety net: ensure timeZone is present on the DataRequest payload
        map((req) =>
          req.data ? { ...req, data: { ...req.data, timeZone: tz ?? req.data.timeZone } } : req,
        ),
        catchError((error: string) =>
          of({ isLoading: false, error: handleAnyError(error, undefined) }),
        ),
        takeUntil(this._destroy$),
      );
  }

  /**
   * Current / latest / up to date parameters
   *
   * GET /hybrid-inverter-current-data
   *    Query params
   *        deviceId: string (required)
   *		 sse: bool (optional)
   *
   * Initial Response:
   *    Object of type HybridInverterCurrentDataDTO
   *
   * Server Sent Events:
   *    Objects of type HybridInverterCurrentDataDTO
   */
  fetchHybridInverterCurrentData(
    deviceId: string,
  ): Observable<DataRequest<HybridInverterCurrentDataDTO>> {
    // const point: HybridInverterDataPointDTO = {
    //   timestamp: new Date().toISOString(),
    //   activePower: 0,
    //   powerMeter: 15.25,
    //   energyDistribution: {
    //     gridIn: 0,
    //     gridOut: 15.25,
    //     batteryIn: 0,
    //     batteryOut: 10,
    //     consumption: { total: 15.25, fromGrid: 15.25, fromBatteries: 10 },
    //   },
    // };

    // const nullPoint: HybridInverterDataPointDTO = {
    //   timestamp: new Date().toISOString(),
    //   activePower: null,
    //   powerMeter: null,
    //   energyDistribution: {
    //     gridIn: null,
    //     gridOut: null,
    //     batteryIn: null,
    //     batteryOut: null,
    //     consumption: { total: null, fromGrid: null, fromBatteries: null },
    //   },
    // };

    // return of({
    //   isLoading: false,
    //   data: <HybridInverterCurrentDataDTO>{
    //     deviceId,
    //     timestamp: new Date().toISOString(),
    //     dataPoint: nullPoint,
    //   },
    // });

    let queryParams = `?deviceId=${deviceId}`;

    return this.sseApi.fetch<HybridInverterCurrentDataDTO>(
      `/hybrid-inverter-current-data${queryParams}`,
      (_, newData) => newData,
    );
  }

  /**
   * GET /battery-strings?deviceId={}
   * Response:
   *    Array of objects of type BatteryString
   */

  fetchBatteryStringsForDevice(deviceId: string): Observable<DataRequest<MonbatBatteryString[]>> {
    const requestUrl = `/battery-strings?deviceId=${deviceId}`;

    // Use SSE for live updated data
    return this.sseApi
      .fetch<MonbatBatteryString[]>(requestUrl, (currentData, newData, updateMethod) => {
        if (updateMethod === SSE_DataUpdateMethod.Replace) {
          return newData;
        }

        console.warn(
          `New data from SSE was not applied! Unsupported update method: ${updateMethod}. Request: ${requestUrl}`,
        );

        return currentData;
      })
      .pipe(
        catchError((error: string) =>
          of({ isLoading: false, error: handleAnyError(error, undefined) }),
        ),
        takeUntil(this._destroy$),
      );
  }

  /**
   * GET /battery-strings/:deviceId/historical-data // TODO
   */

  /**
   * GET /battery-strings/:deviceId/battery-historical-data/:batteryId
   *
   * Params:
   *    from
   *    to
   *
   * Response:
   *    Object of type BatteryHistoricalData
   */

  fetchBatteryHistoricalData(
    deviceId: string,
    batteryId: string,
    from: Date,
    to: Date,
  ): Observable<DataRequest<MonbatBatteryHistoricalData>> {
    let queryParams = `?from=${DataAdapter.modelToDtoTimestamp(
      from,
    )}&to=${DataAdapter.modelToDtoTimestamp(to)}`;

    return this.baseApi
      .fetchObject<
        MonbatBatteryHistoricalData,
        MonbatBatteryHistoricalData
      >(`/battery-strings/${deviceId}/battery-historical-data/${batteryId}${queryParams}`, undefined)
      .pipe(
        map((req) => {
          if (req.data) {
            const datetimeRange: DatetimeRangeModel = {
              type: 'date-range',
              from,
              to,
              integrationPeriod: IntegrationPeriod.Days,
              predefinedRangeTypeOption: 'custom-range',
              pickerId: 0,
            };

            const exportFileName = this.plantsService.generateFileNameForExport_New(
              $localize`Battery data` + ' ' + req.data.batteryDisplayName,
              undefined,
              deviceId,
              datetimeRange,
            );

            req.data.exportFileName = exportFileName;

            req.data.timeZone = this.plantsService.getCachedPlantByDeviceId(deviceId)?.timeZone;
          }

          return req;
        }),
      );
  }

  fetchBatteryRealTimeData(
    deviceId: string,
    batteryId: string,
    timeSpanSeconds: number,
  ): Observable<DataRequest<MonbatBatteryHistoricalData>> {
    let queryParams = `?timeSpanSeconds=${timeSpanSeconds}`;

    const requestUrl = `/battery-strings/${deviceId}/battery-real-time-data/${batteryId}${queryParams}`;

    // Live updated data
    return this.sseApi
      .fetch<MonbatBatteryHistoricalData>(requestUrl, (currentData, newData, updateMethod) => {
        if (updateMethod === SSE_DataUpdateMethod.Append) {
          const newDataPoints = newData.dataPoints;

          return {
            ...currentData,
            dataPoints: [...currentData.dataPoints.slice(newDataPoints.length), ...newDataPoints],
          };
        }

        if (updateMethod === SSE_DataUpdateMethod.Patch) {
          const patchedDataPoints = [...currentData.dataPoints];
          newData.dataPoints.forEach((newPoint) => {
            const pointIndex = patchedDataPoints.findIndex(
              (p) => p.timestamp === newPoint.timestamp,
            );
            if (pointIndex >= 0) {
              patchedDataPoints[pointIndex] = newPoint;
            }
          });
          return {
            ...currentData,
            dataPoints: patchedDataPoints,
          };
        }

        if (updateMethod === SSE_DataUpdateMethod.Replace) {
          return {
            ...newData,
          };
        }

        console.warn(
          `New data from SSE was not applied! Unknown update method: ${updateMethod}. Request: ${requestUrl}`,
        );
        return currentData;
      })
      .pipe(
        catchError((error: string) =>
          of({ isLoading: false, error: handleAnyError(error, undefined) }),
        ),
        takeUntil(this._destroy$),
      );
  }
}
