import { Injectable } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { DataRequest } from '../../../constants';
import { PlantsService } from '../../../data/services/plants.service';
import { ErrorStacksApiService } from './api.service';
import { ErrorStackAdapter, ErrorStackDetailAdapter } from './error-stack.adapter';
import { ErrorStack, ErrorStackDetail } from './error-stack.model';

@Injectable({
  providedIn: 'root',
})
export class ErrorStacksDataService {
  private _stacksById: {
    [uniqueStackId: string]: Observable<DataRequest<ErrorStackDetail>> | undefined;
  } = {};

  constructor(
    private api: ErrorStacksApiService,
    private plantsService: PlantsService,
  ) {}

  getErrorStack(deviceId: string, stackId: string): Observable<DataRequest<ErrorStackDetail>> {
    const uniqueStackId = deviceId + stackId;

    let result$ = this._stacksById[uniqueStackId];

    if (result$) {
      return result$;
    }

    result$ = this.api.fetchErrorStack(deviceId, stackId).pipe(
      map((req) => ({
        ...req,
        data: req.data
          ? ErrorStackDetailAdapter.dtoToModel(
              req.data,
              this.plantsService.getCachedPlantByDeviceId(req.data.deviceId)?.timeZone,
            )
          : undefined,
      })),
      shareReplay(1),
    );

    this._stacksById[uniqueStackId] = result$;

    return result$;
  }

  getErrorStacks(
    plantId: string | undefined,
    deviceId: string | undefined,
    page: number,
    limit: number,
    queryOptions: { [key: string]: string } = {},
  ): Observable<DataRequest<ErrorStack[]>> {
    return this.api.fetchErrorStacks(plantId, deviceId, page, limit, queryOptions).pipe(
      map((req) => ({
        ...req,
        data: req.data
          ? req.data.map((dto) =>
              ErrorStackAdapter.dtoToModel(
                dto,
                this.plantsService.getCachedPlantByDeviceId(dto.deviceId)?.timeZone,
              ),
            )
          : undefined,
      })),
      shareReplay(1),
    );
  }

  getErrorStacksForPlant(plantId: string): Observable<DataRequest<ErrorStack[]>> {
    return this.api.fetchErrorStacksForPlant(plantId).pipe(
      map((req) => ({
        ...req,
        data: req.data
          ? req.data.map((dto) =>
              ErrorStackAdapter.dtoToModel(
                dto,
                this.plantsService.getCachedPlantByDeviceId(dto.deviceId)?.timeZone,
              ),
            )
          : undefined,
      })),
    );
  }
}
