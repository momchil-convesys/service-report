import { Injectable } from '@angular/core';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { DataRequest } from '../../../../../constants';
import { ServerSentEventsService } from '../../../../../data/api';
import { PlantsService } from '../../../../../data/services/plants.service';
import { utcToZonedTimeSafe } from '../../../../../helpers';
import { DeviceMetricsDTO } from '../../../../device-metrics/_data/device-metrics.dto';
import { DeviceMetrics } from '../../../../device-metrics/_data/device-metrics.model';
import { inverterMetricsUpdateCallback } from './updater';

@Injectable()
export class InverterDetailsApiService {
  private destroy$ = new Subject<void>();

  constructor(
    private sse: ServerSentEventsService,
    private plantsService: PlantsService,
  ) {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchInverterMetrics(
    transformerStationId: string,
    inverterId: string,
  ): Observable<DataRequest<DeviceMetrics>> {
    const plantTimeZone =
      this.plantsService.getCachedPlantByDeviceId(transformerStationId)?.timeZone;

    const requestUrl = `/devices/${transformerStationId}/metrics?inverterId=${inverterId}`;

    return this.sse.fetch<DeviceMetricsDTO>(requestUrl, inverterMetricsUpdateCallback).pipe(
      map((req) => ({
        ...req,
        data: req.data ? this._adaptInverterMetricsDTO(req.data, plantTimeZone) : undefined,
      })),
      takeUntil(this.destroy$),
    );
  }

  private _adaptInverterMetricsDTO(
    dto: DeviceMetricsDTO,
    plantTimeZone: string | undefined,
  ): DeviceMetrics {
    return {
      ...dto,
      state: null,
      timestamp: utcToZonedTimeSafe(dto.timestamp, plantTimeZone),
    };
  }
}
