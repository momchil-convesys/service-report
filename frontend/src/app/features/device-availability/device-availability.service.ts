import { Injectable } from '@angular/core';
import { isBefore } from 'date-fns';
import { Observable, Subject, takeUntil } from 'rxjs';
import { DatetimeRangeModel } from 'src/app/shared/datetime-range-select/models';
import { DataRequest } from '../../constants';
import { DataAdapter } from '../../data/adapters';
import { PlantsService } from '../../data/services/plants.service';
import { DeviceAvailabilityApiService } from './_data/api.service';
import { DevicesAvailability } from './_data/models';

@Injectable()
export class DeviceAvailabilityService {
  private readonly _destroy$ = new Subject<void>();

  constructor(
    private api: DeviceAvailabilityApiService,
    private plantsService: PlantsService,
  ) {}

  ngOnDestroy() {
    this._destroy$.next();
  }

  getDevicesAvailability(
    deviceIds: string[],
    targetRange: DatetimeRangeModel,
  ): Observable<DataRequest<DevicesAvailability>> {
    const from = targetRange.from;

    let to = targetRange.to;

    if (!isBefore(targetRange.to, new Date())) {
      to = new Date();
    }

    return this.api
      .fetchDevicesAvailability(
        deviceIds,
        DataAdapter.modelToDtoTimestamp(from),
        DataAdapter.modelToDtoTimestamp(to),
      )
      .pipe(takeUntil(this._destroy$));
  }
}
