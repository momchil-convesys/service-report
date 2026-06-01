import { Injectable } from '@angular/core';
import { Observable, Subject, map, takeUntil } from 'rxjs';
import { DataRequest } from '../../../constants';
import { PlantsService } from '../../../data/services/plants.service';
import { BatteriesApiService } from './api.service';
import { EnergyTrendData, HybridInverterCurrentData, HybridInverterHistoricalData } from './models';

@Injectable()
export class InverterDataService {
  private readonly _destroy$ = new Subject<void>();

  constructor(
    private api: BatteriesApiService,
    private plantsService: PlantsService,
  ) {}

  ngOnDestroy() {
    this._destroy$.next();
  }

  getInverterCurrentlData(deviceId: string): Observable<DataRequest<HybridInverterCurrentData>> {
    return this.api.fetchHybridInverterCurrentData(deviceId).pipe(
      map((req) => {
        let adaptedData: HybridInverterCurrentData | undefined;

        if (req.data) {
          adaptedData = {
            ...req.data,
            timestamp: new Date(req.data.timestamp),
            dataPoint: {
              ...req.data.dataPoint,
              timestamp: new Date(req.data.dataPoint.timestamp),
            },
          };
        }

        return {
          ...req,
          data: adaptedData,
        };
      }),
      takeUntil(this._destroy$),
    );
  }

  getInverterHistoricalData(
    deviceId: string,
    from: string,
    to: string,
  ): Observable<DataRequest<HybridInverterHistoricalData>> {
    return this.api.fetchHybridInverterHistoricalData(deviceId, from, to).pipe(
      map((req) => {
        if (req.data) {
          const exportFileName = this.plantsService.generateFileNameForExport(
            $localize`Inverter data`,
            undefined,
            deviceId,
            new Date(from),
            undefined,
            false,
          );

          const adaptedData: HybridInverterHistoricalData = {
            ...req.data,
            dataPoints: req.data.dataPoints.map((point) => ({
              ...point,
              timestamp: req.data?.integrationPeriod
                ? new Date(new Date(point.timestamp).setHours(0, 0, 0, 0))
                : new Date(point.timestamp),
            })),
            exportFileName,
          };

          return {
            ...req,
            data: adaptedData,
          };
        }

        return {
          ...req,
          data: undefined,
        };
      }),
      takeUntil(this._destroy$),
    );
  }
  getEnergyTrendData(
    deviceId: string,
    from: string,
    to: string,
  ): Observable<DataRequest<EnergyTrendData>> {
    return this.api.fetchEnergyTrendData(deviceId, from, to).pipe(
      map((req) => {
        if (req.data) {
          const exportFileName = this.plantsService.generateFileNameForExport(
            $localize`Energy Trend Data`,
            undefined,
            deviceId,
            new Date(from),
            undefined,
            false,
          );

          const adaptedData: EnergyTrendData = {
            ...req.data,
            dataPoints: req.data.dataPoints.map((point) => ({
              ...point,
              batteryPower:
                point.batteryOut || (point.batteryIn ? point.batteryIn * -1 : point.batteryIn),
              timestamp: req.data?.integrationPeriod
                ? new Date(new Date(point.timestamp).setHours(0, 0, 0, 0)) // if you intentionally bucket to day
                : new Date(point.timestamp),
            })),
            exportFileName,
          };

          return {
            ...req,
            data: adaptedData,
          };
        }

        return {
          ...req,
          data: undefined,
        };
      }),
      takeUntil(this._destroy$),
    );
  }
}
