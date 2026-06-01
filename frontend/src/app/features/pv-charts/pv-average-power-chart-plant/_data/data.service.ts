import { Injectable } from '@angular/core';
import { isBefore } from 'date-fns';
import { Observable, Subject, map, takeUntil } from 'rxjs';
import { DataRequest, IntegrationPeriod } from '../../../../constants';
import { Plant } from '../../../../data/models';
import { PlantsService } from '../../../../data/services/plants.service';
import { DatetimeRangeModel } from '../../../../shared/datetime-range-select/models';
import { PVAveragePowerApiService } from './api.service';
import { PVAveragePowerData } from './pv-average-power.model';

@Injectable()
export class PVAveragePowerDataService {
  private _destroy$ = new Subject<void>();

  constructor(
    private api: PVAveragePowerApiService,
    private plantsService: PlantsService,
  ) {}

  ngOnDestroy() {
    this._destroy$.next();
  }

  getPVAveragePowerData(
    plant: Plant,
    targetRange: DatetimeRangeModel,
  ): Observable<DataRequest<PVAveragePowerData>> {
    const from = targetRange.from.toISOString();
    const to = targetRange.to.toISOString();

    const integrationPeriod: IntegrationPeriod = IntegrationPeriod.QuaterOfAnHour;

    let liveData = !isBefore(new Date(to), new Date());

    return this.api.fetchPVAveragePowerData(plant.id, from, to, integrationPeriod, liveData).pipe(
      map((req) => {
        if (req.data) {
          const exportFileName = this.plantsService.generateFileNameForExport_New(
            $localize`Average Power`,
            plant.id,
            undefined,
            targetRange,
          );

          const data: PVAveragePowerData = {
            ...req.data,
            exportFileName,
          };

          return {
            ...req,
            data,
          };
        }

        return req;
      }),
      takeUntil(this._destroy$),
    );
  }
}
