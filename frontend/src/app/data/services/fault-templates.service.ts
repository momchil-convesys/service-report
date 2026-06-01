import { Injectable } from '@angular/core';
import { filter, map, mergeMap, Observable, shareReplay } from 'rxjs';
import { DataRequest } from '../../constants';
import { ApiService } from '../api';
import { Device, DeviceMetadata, FaultDefinition, FaultsTemplate } from '../models';
import { DeviceMetadataService } from './device-metadata.service';

interface FaultsById {
  [faultId: string]: FaultDefinition | undefined;
}

@Injectable({
  providedIn: 'root',
})
export class FaultTemplatesService {
  private _cache: Observable<DataRequest<FaultsTemplate[]>> | undefined;
  private _faultsById: Observable<FaultsById> | undefined;

  constructor(
    private api: ApiService,
    private deviceMetadataService: DeviceMetadataService,
  ) {}

  getFaultTemplates(): Observable<DataRequest<FaultsTemplate[]>> {
    if (this._cache) {
      return this._cache;
    }

    this._cache = this.api.fetchFaultTemplates().pipe(shareReplay(1));

    return this._cache;
  }

  getFaultsTemplateById(id: string): Observable<DataRequest<FaultsTemplate | undefined>> {
    return this.getFaultTemplates().pipe(
      filter((request) => !request.isLoading),
      map((request) => request.data?.find((definition) => definition.id === id)),
      map((definition) => {
        if (!definition) {
          throw `Faults definition with id '${id}' was not found!`;
        }

        return {
          isLoading: false,
          data: definition,
          error: definition
            ? undefined
            : new Error(`Faults definition with id '${id}' was not found!`),
        };
      }),
    );
  }

  getFaultsTemplateForDevice(device: Device): Observable<DataRequest<FaultsTemplate | undefined>> {
    return this.getFaultsTemplateForDeviceMetadataId(device.deviceMetadataId);
  }

  getFaultsTemplateForDeviceMetadataId(
    deviceMetadataId: string,
  ): Observable<DataRequest<FaultsTemplate | undefined>> {
    return this.deviceMetadataService.getDeviceMetadata(deviceMetadataId).pipe(
      map(
        (deviceMetadataRequest: DataRequest<DeviceMetadata | undefined>) =>
          deviceMetadataRequest.data,
      ),
      filter(
        (deviceMetadata: DeviceMetadata | undefined): deviceMetadata is DeviceMetadata =>
          deviceMetadata !== undefined,
      ),
      mergeMap((deviceMetadata) => this.getFaultsTemplateById(deviceMetadata.faultsTemplateId)),
    );
  }

  getFaultDefinitionById(id: string): Observable<FaultDefinition | undefined> {
    return this.getAllFaultDefinitionsById().pipe(map((faultsById: FaultsById) => faultsById[id]));
  }

  getAllFaultDefinitionsById(): Observable<FaultsById> {
    if (this._faultsById) {
      return this._faultsById;
    }

    this._faultsById = this.getFaultTemplates().pipe(
      filter((request) => !request.isLoading),
      map((request: DataRequest<FaultsTemplate[]>) => {
        const faultsById: FaultsById = {};

        request.data?.forEach((definition) => {
          [...definition.master, ...(definition.slave || [])].forEach((group) =>
            group.faults.forEach((fault) => {
              faultsById[fault.id] = fault;
            }),
          );
        });

        return faultsById;
      }),
      shareReplay(1),
    );

    return this._faultsById;
  }
}
