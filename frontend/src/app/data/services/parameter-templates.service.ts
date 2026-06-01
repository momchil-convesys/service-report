import { Injectable } from '@angular/core';
import { filter, map, mergeMap, Observable, shareReplay } from 'rxjs';
import { DataRequest } from '../../constants';
import { ApiService } from '../api';
import {
  Device,
  DeviceMetadata,
  DeviceParameterDefinition,
  DeviceParametersTemplate,
} from '../models';
import { DeviceMetadataService } from './device-metadata.service';

interface DeviceParametersById {
  [parameterId: string]: DeviceParameterDefinition | undefined;
}

@Injectable({
  providedIn: 'root',
})
export class ParameterTemplatesService {
  private _cache: Observable<DataRequest<DeviceParametersTemplate[]>> | undefined;
  private _parametersById: Observable<DeviceParametersById> | undefined;

  constructor(
    private api: ApiService,
    private deviceMetadataService: DeviceMetadataService,
  ) {}

  getDeviceParametersTemplates(): Observable<DataRequest<DeviceParametersTemplate[]>> {
    if (this._cache) {
      return this._cache;
    }

    this._cache = this.api.fetchDeviceParameterTemplates().pipe(shareReplay(1));

    return this._cache;
  }

  getDeviceParameterById(id: string): Observable<DeviceParameterDefinition | undefined> {
    return this._getDeviceParametersById().pipe(
      map((parametersById: DeviceParametersById) => parametersById[id]),
    );
  }

  getDeviceParametersTemplateForDevice(
    device: Device,
  ): Observable<DataRequest<DeviceParametersTemplate | undefined>> {
    return this.getDeviceParametersTemplateForDeviceMetadataId(device.deviceMetadataId);
  }

  getDeviceParametersTemplateForDeviceMetadataId(
    deviceMetadataId: string,
  ): Observable<DataRequest<DeviceParametersTemplate | undefined>> {
    return this.deviceMetadataService.getDeviceMetadata(deviceMetadataId).pipe(
      map(
        (deviceMetadataRequest: DataRequest<DeviceMetadata | undefined>) =>
          deviceMetadataRequest.data,
      ),
      filter(
        (deviceMetadata: DeviceMetadata | undefined): deviceMetadata is DeviceMetadata =>
          deviceMetadata !== undefined,
      ),
      mergeMap((deviceMetadata) =>
        this._getDeviceParametersTemplateById(deviceMetadata.parametersTemplateId),
      ),
    );
  }

  private _getDeviceParametersById(): Observable<DeviceParametersById> {
    if (this._parametersById) {
      return this._parametersById;
    }

    this._parametersById = this.getDeviceParametersTemplates().pipe(
      filter((request) => !request.isLoading),
      map((request: DataRequest<DeviceParametersTemplate[]>) => {
        const parametersById: DeviceParametersById = {};

        request.data?.forEach((template) => {
          template.parameters.forEach((parameterDefinition) => {
            parametersById[parameterDefinition.id] = parameterDefinition;
          });
        });

        return parametersById;
      }),
      shareReplay(1),
    );

    return this._parametersById;
  }

  private _getDeviceParametersTemplateById(
    id: string,
  ): Observable<DataRequest<DeviceParametersTemplate | undefined>> {
    return this.getDeviceParametersTemplates().pipe(
      filter((request) => !request.isLoading),
      map((request) => request.data?.find((template) => template.id === id)),
      map((template) => {
        if (!template) {
          throw `Device parameters template with id '${id}' was not found!`;
        }

        return {
          isLoading: false,
          data: template,
          error: template
            ? undefined
            : new Error(`Device parameters template with id '${id}' was not found!`),
        };
      }),
    );
  }
}
