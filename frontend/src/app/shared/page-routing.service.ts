import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Observable,
  combineLatest,
  filter,
  map,
  mergeMap,
  of,
  shareReplay,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import { DataRequest, PredefinedTimeRange, predefinedTimeRangeStringValues } from '../constants';
import { Device, Plant } from '../data/models';
import { PlantsService } from '../data/services/plants.service';

export interface QueryParams {
  plantId: string;
  deviceId: string | undefined;
  range?: {
    timestampFrom: string;
    timestampTo: string;
  };
  predefinedRange?: PredefinedTimeRange;
}

@Injectable()
export class PageRoutingService {
  private _queryParams$: Observable<QueryParams>;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public plantsService: PlantsService,
  ) {
    this._queryParams$ = combineLatest([this.route.paramMap, this.route.queryParamMap]).pipe(
      map(([params, queryParams]) => {
        const rangeFrom = queryParams.get('from');
        const rangeTo = queryParams.get('to');

        let predefinedRangeParam;
        let range;

        if (!rangeFrom || !rangeTo) {
          predefinedRangeParam = queryParams.get('predefinedRange');
        } else {
          range = {
            timestampFrom: rangeFrom,
            timestampTo: rangeTo,
          };
        }

        const predefinedRange: PredefinedTimeRange | undefined =
          predefinedRangeParam && predefinedTimeRangeStringValues.includes(predefinedRangeParam)
            ? <PredefinedTimeRange>predefinedRangeParam
            : undefined;

        const result: QueryParams = {
          plantId: params.get('plantId') || '',
          deviceId: params.get('deviceId') || '',
          range: range,
          predefinedRange,
        };

        return result;
      }),
    );
  }

  getParams(): Observable<QueryParams> {
    return this._queryParams$;
  }

  getPlantIdFromQueryParams(): Observable<string> {
    return this._queryParams$.pipe(map((params) => params.plantId));
  }

  getDeviceIdFromQueryParams(): Observable<string | undefined> {
    return this._queryParams$.pipe(map((params) => params.deviceId));
  }

  getRelatedDevicesFromQueryParams(): Observable<Device[]> {
    const plant$: Observable<Plant> = this.getPlantFromQueryParams();
    const deviceId$: Observable<string | undefined> = this.getDeviceIdFromQueryParams();

    return deviceId$.pipe(
      withLatestFrom(plant$),
      switchMap(([deviceId, plant]) => {
        if (deviceId) {
          return this.getDeviceFromQueryParams().pipe(map((device) => [device]));
        }

        return of(plant.devices);
      }),
      shareReplay(1),
    );
  }

  getDeviceRequestFromQueryParams(): Observable<DataRequest<Device>> {
    return this.getDeviceIdFromQueryParams().pipe(
      map((deviceId) => {
        if (!deviceId) {
          throw 'Missing device ID in route parameters.!';
        }

        return deviceId;
      }),
      mergeMap((deviceId) => this.plantsService.getDeviceById(deviceId)),
      shareReplay(1),
    );
  }

  getDeviceFromQueryParams(): Observable<Device> {
    return this.getDeviceRequestFromQueryParams().pipe(
      filter((request) => request.data !== undefined),
      map((req) => req.data as Device),
    );
  }

  getPlantRequestFromQueryParams(): Observable<DataRequest<Plant>> {
    return this._queryParams$.pipe(
      map((params) => {
        if (!params.plantId) {
          throw 'Missing plant ID in route parameters!';
        }

        return params;
      }),
      mergeMap((params) => this.plantsService.getPlant(params.plantId)),
      shareReplay(1),
    );
  }

  getPlantFromQueryParams(): Observable<Plant> {
    return this.getPlantRequestFromQueryParams().pipe(
      filter((request) => request.data !== undefined),
      map((req) => req.data as Plant),
    );
  }

  getTimeRangeFromQueryParams(): Observable<PredefinedTimeRange | Date[] | undefined> {
    return this._queryParams$.pipe(
      map((params: QueryParams) => {
        if (params.range) {
          return [new Date(params.range.timestampFrom), new Date(params.range.timestampTo)];
        }

        return params.predefinedRange;
      }),
      shareReplay(1),
    );
  }
}
