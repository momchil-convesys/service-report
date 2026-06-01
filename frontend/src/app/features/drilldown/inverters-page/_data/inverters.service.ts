import { Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { DataRequest } from '../../../../constants';
import { ApiService } from '../../../../data/api';
import { TransformerStation_DTO } from '../../../../data/dtos';
import { PlantsService } from '../../../../data/services/plants.service';

/**
 * Metadata - fetched with a separate request
 * before the data (the realtime values) is fetched.
 *
 * TODO (Backend)
 *
 * GET /devices/{deviceId}/transformer-station-metadata
 *
 * Response: Object of type TransformerStation_Metadata_DTO
 *
 * GET /plant/{plantId}/transformer-station-metadata
 *
 * Response: Array of objects of type TransformerStation_DTO[]
 */

@Injectable({
  providedIn: 'root',
})
export class InvertersService {
  private _plantScopeMetadataCache$: {
    [plantId: string]: Observable<DataRequest<TransformerStation_DTO[]>> | undefined;
  } = {};

  private _deviceScopeMetadataCache$: {
    [deviceId: string]: Observable<DataRequest<TransformerStation_DTO[]>> | undefined;
  } = {};

  constructor(
    private api: ApiService,
    private plantsService: PlantsService,
  ) {}

  getTsMetadata(deviceId: string): Observable<DataRequest<TransformerStation_DTO[]>> {
    /**
     * The plant cache is available in the cases when metadata is requested for inverter details.
     */
    if (this._plantScopeMetadataCache$) {
      const plantId = this.plantsService.getCachedPlantByDeviceId(deviceId)?.id;
      if (plantId && this._plantScopeMetadataCache$[plantId]) {
        return this._plantScopeMetadataCache$[plantId].pipe(
          map((req) => ({
            ...req,
            data: req.data
              ? req.data.filter((tsMetadata) => tsMetadata.deviceId === deviceId)
              : undefined,
          })),
        );
      }
    }

    if (this._deviceScopeMetadataCache$[deviceId]) {
      return this._deviceScopeMetadataCache$[deviceId];
    }

    this._deviceScopeMetadataCache$[deviceId] = this.api
      .fetchObject_NoAdapter<TransformerStation_DTO>(
        `/devices/${deviceId}/transformer-station-metadata`,
      )
      .pipe(
        map((req) => ({
          ...req,
          data: req.data ? [this._adaptTsMetadataDTO_mutate(req.data)] : undefined,
        })),
        shareReplay(1),
      );

    return this._deviceScopeMetadataCache$[deviceId];
  }

  getTsMetadataForPlant(plantId: string): Observable<DataRequest<TransformerStation_DTO[]>> {
    if (this._plantScopeMetadataCache$[plantId]) {
      return this._plantScopeMetadataCache$[plantId];
    }

    this._plantScopeMetadataCache$[plantId] = this.api
      .fetchObject_NoAdapter<
        TransformerStation_DTO[]
      >(`/plants/${plantId}/transformer-station-metadata`)
      .pipe(
        map((req) => ({
          ...req,
          data: req.data ? req.data.map((ts) => this._adaptTsMetadataDTO_mutate(ts)) : undefined,
        })),
        shareReplay(1),
      );

    return this._plantScopeMetadataCache$[plantId];
  }

  private _adaptTsMetadataDTO_mutate(dto: TransformerStation_DTO): TransformerStation_DTO {
    dto.displayName = this.plantsService.getCachedDeviceById(dto.deviceId)?.name || 'TS ???';
    dto.inverters.forEach(
      (inv) => (inv.context = { tsDisplayName: dto.displayName, tsId: dto.deviceId }),
    );

    return dto;
  }
}
