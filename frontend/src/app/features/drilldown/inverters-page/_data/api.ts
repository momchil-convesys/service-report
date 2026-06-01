import { Injectable } from '@angular/core';
import { map, Observable, ReplaySubject, Subject, takeUntil } from 'rxjs';
import {
  DataRequest,
  DeviceState,
  ExtendedDeviceState,
  IntermediateDeviceState,
} from '../../../../constants';
import { ApiService, ServerSentEventsService } from '../../../../data/api';
import { PlantsService } from '../../../../data/services/plants.service';
import { utcToZonedTimeSafe } from '../../../../helpers';
import { InverterMetrics_DataPoint_DTO, TransformerStation_Metrics_DTO } from './dto';
import { tsMetricsForPlantUpdateCallback, tsMetricsUpdateCallback } from './updater';

@Injectable()
export class InverterMetricsService {
  private destroy$ = new Subject<void>();

  // Keep cache for detail page
  lastDataRequest$ = new ReplaySubject<DataRequest<TransformerStation_Metrics_DTO[]>>(1);

  constructor(
    private api: ApiService,
    private sse: ServerSentEventsService,
    private plantsService: PlantsService,
  ) {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getTsMetrics(deviceId: string): Observable<DataRequest<TransformerStation_Metrics_DTO[]>> {
    const plantTimeZone = this.plantsService.getCachedPlantByDeviceId(deviceId)?.timeZone;

    const requestUrl = `/devices/${deviceId}/transformer-station-metrics`;
    return this.sse.fetch<TransformerStation_Metrics_DTO>(requestUrl, tsMetricsUpdateCallback).pipe(
      map((req) => ({
        ...req,
        data: req.data ? [this._adaptTsMetricsDTO_mutate(req.data, plantTimeZone)] : undefined,
      })),
      takeUntil(this.destroy$),
    );
  }

  getTsMetricsForPlant(plantId: string): Observable<DataRequest<TransformerStation_Metrics_DTO[]>> {
    const plantTimeZone = this.plantsService.getCachedPlantById(plantId)?.timeZone;

    const requestUrl = `/plants/${plantId}/transformer-station-metrics`;
    return this.sse
      .fetch<TransformerStation_Metrics_DTO[]>(requestUrl, tsMetricsForPlantUpdateCallback)
      .pipe(
        map((req) => ({
          ...req,
          data: req.data
            ? req.data.map((tsData) => this._adaptTsMetricsDTO_mutate(tsData, plantTimeZone))
            : undefined,
        })),
        takeUntil(this.destroy$),
      );
  }

  //----------------------------------------------------------------------------

  getInverterDataFromTsMetrics(
    tsId: string,
    inverterId: string,
  ): Observable<DataRequest<InverterMetrics_DataPoint_DTO | undefined>> {
    return this.lastDataRequest$.pipe(
      map((req) => ({
        ...req,
        data: req.data?.length
          ? req.data
              .find((tsData) => tsData.deviceId === tsId)
              ?.inverterMetricsDataPoints.find(
                (inverterMetricsDataPoint) => inverterMetricsDataPoint.inverterId === inverterId,
              )
          : undefined,
      })),
    );
  }

  private _adaptTsMetricsDTO_mutate(
    dto: TransformerStation_Metrics_DTO,
    plantTimeZone: string | undefined,
  ): TransformerStation_Metrics_DTO {
    let intermediateStates: IntermediateDeviceState[] | undefined;
    const device = this.plantsService.getCachedDeviceById(dto.deviceId);
    if (device?.metadata?.intermediateStates) {
      intermediateStates = device.metadata.intermediateStates;
    }

    dto.inverterMetricsDataPoints.forEach((inverterData) => {
      inverterData.timestampZoned = utcToZonedTimeSafe(inverterData.timestamp, plantTimeZone);

      const extendedState: ExtendedDeviceState | null =
        inverterData.intermediateStateCode !== null &&
        inverterData.intermediateStateCode !== undefined
          ? {
              baseState: inverterData.state || undefined,
              intermediateStateCode: inverterData.intermediateStateCode || undefined,
              intermediateState: intermediateStates?.find(
                (state) => state.code === inverterData.intermediateStateCode,
              ),
            }
          : null;

      inverterData.extendedState =
        inverterData.state === DeviceState.Intermediate
          ? extendedState
          : {
              baseState: extendedState?.baseState,
              intermediateStateCode: extendedState?.intermediateStateCode,
              intermediateState: undefined,
            };

      inverterData.extendedStateForTooltip = extendedState;

      inverterData.alarms?.forEach((alarm) => {
        alarm.timestampZoned = utcToZonedTimeSafe(alarm.timestamp, plantTimeZone);
      });
    });

    return dto;
  }
}
