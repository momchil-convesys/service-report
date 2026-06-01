import { Injectable } from '@angular/core';
import { endOfDay, isBefore } from 'date-fns';
import { Observable, Subject, map, takeUntil } from 'rxjs';
import { DataRequest, IntegrationPeriod } from '../../../../constants';
import { Plant } from '../../../../data/models';
import { PlantsService } from '../../../../data/services/plants.service';
import { DatetimeRangeModel } from '../../../../shared/datetime-range-select/models';
import { PVProductionApiService } from './api.service';
import { PVProductionData, TargetLimit_DataPoint } from './pv-production';

@Injectable()
export class PVProductionDataService {
  private _destroy$ = new Subject<void>();

  constructor(
    private api: PVProductionApiService,
    private plantsService: PlantsService,
  ) {}

  ngOnDestroy() {
    this._destroy$.next();
  }

  private setTimestampEndForHistoryPoints(
    historyPoints: Array<{ timestamp: Date; timestampEnd?: Date }>,
    targetPowerLimitData: Array<TargetLimit_DataPoint> | null | undefined,
  ): void {
    historyPoints.forEach((point, index) => {
      let timestampEnd = endOfDay(point.timestamp);

      if (index + 1 < historyPoints.length) {
        timestampEnd = historyPoints[index + 1].timestamp;
      } else {
        if (targetPowerLimitData && targetPowerLimitData.length > 0) {
          timestampEnd = targetPowerLimitData[targetPowerLimitData.length - 1].applicableRange.to;
        }
      }

      point.timestampEnd = timestampEnd;
    });
  }

  getPVProductionData(
    plant: Plant,
    deviceIds: string[],
    targetRange: DatetimeRangeModel,
  ): Observable<DataRequest<PVProductionData>> {
    let from = targetRange.from.toISOString();
    let to = targetRange.to.toISOString();

    const integrationPeriod: IntegrationPeriod = targetRange.integrationPeriod;

    let liveData = !isBefore(new Date(to), new Date());

    return this.api
      .fetchPVProductionData(plant, deviceIds, from, to, integrationPeriod, liveData)
      .pipe(
        map((req) => {
          if (req.data) {
            /**
             * NOTE:
             * req.data.deviceIds is not reliable for plants with power meters,
             * so we use the requested deviceIds array for the file name logic.
             */

            const deviceId: string | undefined = deviceIds.length > 0 ? deviceIds[0] : 'Device';
            const isPlantRelated = deviceIds.length > 1;

            const exportFileName = this.plantsService.generateFileNameForExport_New(
              $localize`Energy Production`,
              plant.id,
              isPlantRelated ? undefined : deviceId,
              targetRange,
            );

            const timeZone = this.plantsService.getCachedPlantByDeviceId(deviceId)?.timeZone;

            const data: PVProductionData = {
              ...req.data,
              exportFileName,
              timeZone,
              targetRange,
            };

            return {
              ...req,
              data,
            };
          }

          return req;
        }),
        map((req) => {
          if (req.data?.scheduleStatusHistory) {
            this.setTimestampEndForHistoryPoints(
              req.data.scheduleStatusHistory,
              req.data.targetPowerLimitData,
            );
          }

          if (req.data?.controlledByExternalSystemHistory) {
            this.setTimestampEndForHistoryPoints(req.data.controlledByExternalSystemHistory, null);
          }

          if (req.data?.controlledManuallyHistory) {
            this.setTimestampEndForHistoryPoints(req.data.controlledManuallyHistory, null);
          }

          return req;
        }),

        takeUntil(this._destroy$),
      );
  }
}
