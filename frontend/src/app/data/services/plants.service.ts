import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  filter,
  map,
  merge,
  Observable,
  of,
  shareReplay,
  skip,
  switchMap,
  tap,
} from 'rxjs';

import { DataRequest, DeviceState, deviceStatesOrdered } from '../../constants';
import { WsTopicMessage_MonbatActiveScheduleDTO } from '../../features/monbat-batteries-schedule/_data/dto';
import {
  ActivePowerLimitSchedule,
  adaptActivePowerLimitSchedule,
  WsTopicMessage_PowerLimitScheduleDTO,
} from '../../features/power-limit-schedule/_data/active-schedule';
import {
  generateFileNameForExportWithServiceInjected,
  generateFileNameForExportWithServiceInjected_New,
} from '../../helpers';
import { DatetimeRangeModel } from '../../shared/datetime-range-select/models';
import { DeviceAdapter } from '../adapters';
import { ApiService, WebSocketsService, WsTopic } from '../api';
import { DeviceDTO, DeviceStateChange, Inverter_DTO } from '../dtos';
import { Device, DeviceMetadata, Plant, User } from '../models';
import { DeviceMetadataService } from './device-metadata.service';

interface DevicesById {
  [deviceId: string]: Device;
}

interface PlantsById {
  [plantId: string]: Plant;
}

interface PlantsByDeviceId {
  [deviceId: string]: Plant;
}

interface UsersById {
  [userId: string]: User;
}

@Injectable({
  providedIn: 'root',
})
export class PlantsService {
  private readonly _refreshPlants$ = new BehaviorSubject<void>(undefined);
  private _plants: Observable<DataRequest<Plant[]>> | undefined;

  private _plantsById: PlantsByDeviceId | undefined;
  private _devicesById: DevicesById | undefined;
  private _plantsByDeviceId: PlantsByDeviceId | undefined;

  private _possibleDeviceStates: DeviceState[] = [];

  constructor(
    private api: ApiService,
    private webSockets: WebSocketsService,
    private deviceMetadataService: DeviceMetadataService,
  ) {
    this.getPlants().subscribe();
    this._subscribeForLiveData();
  }

  getPlants(): Observable<DataRequest<Plant[]>> {
    if (this._plants) {
      return this._plants;
    }

    this._plants = this._refreshPlants$.pipe(
      switchMap(() =>
        combineLatest([
          this.api.fetchPlants(),
          this.deviceMetadataService.getDeviceMetadataList(),
        ]),
      ),
      // Collect possible device states
      tap(([plantsRequest, metadataListRequest]) => {
        const plants: Plant[] | undefined = plantsRequest.data;
        const metadataList: DeviceMetadata[] | undefined = metadataListRequest.data;
        if (plants && metadataList) {
          this._possibleDeviceStates = this._extractPossibleDeviceStates(plants, metadataList);
        } else {
          this._possibleDeviceStates = [];
        }
      }),

      // Enchance each device with its metadata object
      map(([plantsRequest, metadataListRequest]) => {
        const plants: Plant[] | undefined = plantsRequest.data;
        const metadataList: DeviceMetadata[] | undefined = metadataListRequest.data;
        if (plants && metadataList) {
          return {
            ...plantsRequest,
            data: plants.map((plant) => ({
              ...plant,
              devices: plant.devices.map((device) => ({
                ...device,
                metadata: metadataList.find((x) => x.id === device.deviceMetadataId),
                plantName: plant.name,
              })),
            })),
          };
        }

        return plantsRequest;
      }),

      // Fill caches by id
      tap((req) => {
        if (!req.data) {
          return;
        }

        const plants: Plant[] = req.data;
        const devicesById: DevicesById = {};
        const plantsByDeviceId: PlantsByDeviceId = {};
        const plantsById: PlantsById = {};

        plants.forEach((plant) => {
          plantsById[plant.id] = plant;
          plant.devices.forEach((device) => {
            devicesById[device.id] = device;
            plantsByDeviceId[device.id] = plant;
          });
        });

        this._devicesById = devicesById;
        this._plantsByDeviceId = plantsByDeviceId;
        this._plantsById = plantsById;
      }),

      // Sort to keep consistent order
      map((req) => {
        if (req.data) {
          return {
            ...req,
            data: req.data.sort((a, b) => a.name.localeCompare(b.name)),
          };
        }

        return req;
      }),

      shareReplay(1),
    );

    return this._plants;
  }

  refreshPlants(): void {
    this._devicesById = undefined;
    this._plantsByDeviceId = undefined;
    this._plantsById = undefined;
    this._refreshPlants$.next();
  }

  getPlant(id: string): Observable<DataRequest<Plant>> {
    return this.getPlants().pipe(
      map((request: DataRequest<Plant[]>) => {
        if (request.data) {
          const plant = request.data.find((item) => item.id === id);
          if (!plant) {
            return {
              ...request,
              error: new Error(`Plant with id '${id}' was not found.`),
              data: undefined,
            };
          }

          return {
            ...request,
            data: plant,
          };
        }

        return {
          ...request,
          data: undefined,
        };
      }),
    );
  }

  getDeviceFromPlant(id: string, plantId: string): Observable<DataRequest<Device>> {
    const fetchedDevice$ = this.getPlant(plantId).pipe(
      map((request: DataRequest<Plant>) => {
        const device = request.data?.devices.find((item) => item.id === id);
        if (!device) {
          return {
            ...request,
            error: new Error(`Device with id '${id}' was not found.`),
            data: undefined,
          };
        }

        return {
          ...request,
          data: device,
        };
      }),
    );

    const wsDeviceAsRequest$ = this.webSockets
      .getWebSocketStreamOnTopic<DeviceStateChange>(WsTopic.DeviceStateChange)
      .pipe(
        map((wsMessage) => wsMessage.message),
        map((message) => message.device),
        map((deviceDto) => DeviceAdapter.dtoToModel(deviceDto)),
        filter((device) => device.id === id),
        map((device) => ({
          isLoading: false,
          data: device,
        })),
      );

    return merge(fetchedDevice$, wsDeviceAsRequest$);
  }

  getDeviceById(deviceId: string): Observable<DataRequest<Device>> {
    if (this._devicesById) {
      return of({
        isLoading: false,
        data: this._devicesById[deviceId],
      });
    }

    // TODO: return error if device is not found
    // TODO: maybe use new fetch request for a single device?
    return this.getPlants().pipe(
      map((request: DataRequest<Plant[]>) => {
        return {
          ...request,
          data: this._devicesById ? this._devicesById[deviceId] : undefined,
        };
      }),
    );
  }

  getCachedDeviceById(deviceId: string): Device | undefined {
    if (this._devicesById) {
      return this._devicesById[deviceId];
    }
    return undefined;
  }

  getCachedPlantById(plantId: string): Plant | undefined {
    if (this._plantsById) {
      return this._plantsById[plantId];
    }
    return undefined;
  }

  getCachedPlantByDeviceId(deviceId: string): Plant | undefined {
    if (this._plantsByDeviceId) {
      return this._plantsByDeviceId[deviceId];
    }
    return undefined;
  }

  // TODO: implement when needed
  getCachedRelatedUserById(userId: string): User | undefined {
    return undefined;
  }

  getPlantByDeviceId(deviceId: string): Observable<DataRequest<Plant | undefined>> {
    if (this._plantsByDeviceId) {
      return of({
        isLoading: false,
        data: this._plantsByDeviceId[deviceId],
      });
    }

    return this.getPlants().pipe(
      map((request) => {
        return {
          ...request,
          data: this._plantsByDeviceId ? this._plantsByDeviceId[deviceId] : undefined,
        };
      }),
    );
  }

  getPossibleDeviceStates(): DeviceState[] {
    return this._possibleDeviceStates;
  }

  generateFileNameForExport(
    chartName: string,
    plantId: string | undefined,
    deviceId: string | undefined,
    dateOrDateFrom: Date,
    dateTo: Date | undefined,
    includePlantNameOnly: boolean,
  ) {
    return generateFileNameForExportWithServiceInjected(
      chartName,
      plantId,
      deviceId,
      dateOrDateFrom,
      dateTo,
      includePlantNameOnly,
      this,
    );
  }

  generateFileNameForExport_New(
    chartName: string,
    plantId: string | undefined,
    deviceId: string | undefined,
    targetRange: DatetimeRangeModel,
    inverter?: Inverter_DTO,
  ) {
    return generateFileNameForExportWithServiceInjected_New(
      chartName,
      plantId,
      deviceId,
      targetRange,
      this,
      inverter,
    );
  }

  private _extractPossibleDeviceStates(
    plants: Plant[],
    metadataList: DeviceMetadata[],
  ): DeviceState[] {
    const deviceMetadataIdsArr: string[] = plants
      .map((plant) => plant.devices.map((device) => device.deviceMetadataId))
      .flat();
    const deviceMetadataIds = Array.from(new Set(deviceMetadataIdsArr));
    const deviceMetadatas = metadataList.filter(
      (metadata) => deviceMetadataIds.indexOf(metadata.id) >= 0,
    );

    const availableStates: DeviceState[] = deviceMetadatas
      .map((metadata) => metadata.possibleStates)
      .flat();

    const availableStatesUniquie = Array.from(new Set(availableStates));

    const availableStatesUniquieSorted = availableStatesUniquie.sort(
      (s1, s2) => deviceStatesOrdered.indexOf(s1) - deviceStatesOrdered.indexOf(s2),
    );

    return availableStatesUniquieSorted;
  }

  private _subscribeForLiveData() {
    /**
     * Update device related data (state, power limit, current faults).
     */
    this.webSockets
      .getWebSocketStreamOnTopic<DeviceStateChange>(WsTopic.DeviceStateChange)
      .pipe(
        filter((wsMessage) => wsMessage.message.timestamp !== null),
        filter((wsMessage) => wsMessage.message.device.state !== null),
        map((wsMessage) => wsMessage.message.device),
        filter((dto: DeviceDTO | null): dto is DeviceDTO => dto !== null),
        map((dto) => DeviceAdapter.dtoToModel(dto)),
        catchError((err) => {
          console.warn('Failed to process data received over web socket. Error: ', err);
          return of(null);
        }),
        filter((value) => value !== null),
      )

      .subscribe((updatedDevice: Device) => {
        if (!this._devicesById) {
          return;
        }

        const device = this._devicesById[updatedDevice.id];
        if (!device) {
          return;
        }

        device.state = updatedDevice.state;
        device.stateSubject.next(updatedDevice.state);
        device.currentFaultsSubject.next(updatedDevice.currentFaults);
        device.powerLimitSubject.next(updatedDevice.powerLimit);

        device.monbatActiveScheduleSubject?.next(updatedDevice.monbatActiveSchedule || null);
      });

    /**
     * Update monbat active schedule.
     */
    this.webSockets
      .getWebSocketStreamOnTopic<WsTopicMessage_MonbatActiveScheduleDTO>(
        WsTopic.MonbatActiveSchedule,
      )
      .pipe(map((wsMessage) => wsMessage.message))
      .subscribe((message) => {
        if (!this._devicesById) {
          return;
        }

        const device: Device = this._devicesById[message.deviceId];
        if (!device) {
          return;
        }

        device.monbatActiveScheduleSubject?.next(message.activeSchedule);
      });

    /**
     * Update plant active schedule.
     */
    this.webSockets
      .getWebSocketStreamOnTopic<WsTopicMessage_PowerLimitScheduleDTO>(WsTopic.PowerLimitSchedule)
      .pipe(map((wsMessage) => wsMessage.message))
      .subscribe((message) => {
        if (!this._plantsById) {
          return;
        }

        const plant: Plant = this._plantsById[message.plantId];
        if (!plant) {
          return;
        }

        const activePowerLimitSchedule: ActivePowerLimitSchedule | null =
          message.activePowerLimitSchedule
            ? adaptActivePowerLimitSchedule(
                message.activePowerLimitSchedule,
                plant.timeZone,
                message.isBESS
                  ? (plant.plantSpecificMetadata?.bessSetpointTargetCoefficient ?? undefined)
                  : plant.plantSpecificMetadata?.powerLimitTargetCoefficient,
              )
            : null;

        if (message.isBESS) {
          plant.activeBESSSchedule$.next(activePowerLimitSchedule);
        } else {
          plant.activePowerLimitSchedule$.next(activePowerLimitSchedule);
        }
      });

    /**
     * Sync all plants and devices with backend
     * before relying on web sockets partial updates.
     */
    this.webSockets.socketConnectedEvent$
      .pipe(
        skip(1),
        switchMap(() => this.api.fetchPlants()),
        map((request) => request.data),
        filter((data) => data !== undefined),
      )
      .subscribe((plants) => {
        plants.forEach((updatedPlant) => {
          if (!this._plantsById) {
            return;
          }

          const plant: Plant = this._plantsById[updatedPlant.id];
          if (!plant) {
            return;
          }

          plant.activePowerLimitSchedule$.next(updatedPlant.activePowerLimitSchedule$.getValue());
          plant.activeBESSSchedule$.next(updatedPlant.activeBESSSchedule$.getValue());

          updatedPlant.devices.forEach((updatedDevice) => {
            if (!this._devicesById) {
              return;
            }

            const device = this._devicesById[updatedDevice.id];
            if (!device) {
              return;
            }

            device.state = updatedDevice.state;
            device.stateSubject.next(updatedDevice.state);
            device.currentFaultsSubject.next(updatedDevice.currentFaults);
            device.powerLimitSubject.next(updatedDevice.powerLimit);
          });
        });
      });
  }
}
