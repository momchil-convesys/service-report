import { Injectable } from '@angular/core';
import { isBefore } from 'date-fns';
import { Observable, Subject, map, takeUntil } from 'rxjs';
import { Device, Plant } from 'src/app/data/models';
import {
  PVPowerDataForDevice_NEW,
  PVPowerDataForPlant_NEW,
} from 'src/app/features/pv-charts/pv-power/_data/pv-power';
import { AccessControlPermission, DataRequest } from '../../../../constants';
import { DataAdapter } from '../../../../data/adapters';
import { Inverter_DTO } from '../../../../data/dtos';
import { PlantsService } from '../../../../data/services/plants.service';
import { UsersService } from '../../../../data/services/users.service';
import { getLimitTypeForDateInThePast } from '../../../../helpers/dirty-fixes';
import { DatetimeRangeModel } from '../../../../shared/datetime-range-select/models';
import {
  MasterGwScheduledPowerLimitDataPoint_ForDevice,
  MasterGwScheduledPowerLimitDataPoint_ForPlant,
} from '../../../power-limit-schedule/_data/dto';
import { PVPowerApiService } from './api.service';
import { adjustPVPowerData } from './pv-power-data-alteration';
import { roundPVPowerData_Mutable } from './pv-power-data-round';
import { PVPowerDataForDeviceDTO_NEW, PVPowerDataForPlantDTO_NEW } from './pv-power.dto';

@Injectable()
export class PVPowerDataService {
  private _destroy$ = new Subject<void>();

  constructor(
    private api: PVPowerApiService,
    private plantsService: PlantsService,
    private usersService: UsersService,
  ) {}

  ngOnDestroy() {
    this._destroy$.next();
  }

  getPVPowerDataForPlant(
    plant: Plant,
    targetRange: DatetimeRangeModel,
  ): Observable<DataRequest<PVPowerDataForPlant_NEW>> {
    let liveData = !isBefore(targetRange.to, new Date());

    const showOriginalLimitData = this.usersService.hasCurrentUserPermission(
      AccessControlPermission.ThirdEye,
    );

    return this.api
      .fetchPVPowerDataForPlant(
        plant.id,
        targetRange.from.toISOString(),
        targetRange.to.toISOString(),
        liveData,
      )
      .pipe(
        map((req) => ({
          ...req,
          data: req.data
            ? this._adaptPlantData(plant, req.data, targetRange, showOriginalLimitData)
            : undefined,
        })),
        takeUntil(this._destroy$),
      );
  }

  getPVPowerDataForDevice(
    device: Device,
    targetRange: DatetimeRangeModel,
    inverter?: Inverter_DTO,
  ): Observable<DataRequest<PVPowerDataForDevice_NEW>> {
    let liveData = !isBefore(targetRange.to, new Date());

    return this.api
      .fetchPVPowerDataForDevice(
        device.id,
        targetRange.from.toISOString(),
        targetRange.to.toISOString(),
        liveData,
        inverter,
      )
      .pipe(
        map((req) => ({
          ...req,
          data: req.data
            ? this._adaptDeviceData(device, req.data, targetRange, inverter)
            : undefined,
        })),
        takeUntil(this._destroy$),
      );
  }

  private _adaptPlantData(
    plant: Plant,
    data: PVPowerDataForPlantDTO_NEW,
    targetRange: DatetimeRangeModel,
    showOriginalLimitData: boolean,
  ): PVPowerDataForPlant_NEW {
    const plantId: string | undefined = data.plantId;

    const exportFileName = this.plantsService.generateFileNameForExport_New(
      $localize`Active Power`,
      plantId,
      undefined,
      targetRange,
    );

    const dataPoints = data.dataPoints.map((dataPointDTO) => ({
      ...dataPointDTO,
      timestamp: DataAdapter.dtoToModelTimestamp(dataPointDTO.timestamp),
    }));

    const irradianceDataPoints =
      data.irradianceDataPoints?.map((dataPointDTO) => ({
        ...dataPointDTO,
        timestamp: DataAdapter.dtoToModelTimestamp(dataPointDTO.timestamp),
      })) || [];

    const scheduledPowerLimitDataPoints: MasterGwScheduledPowerLimitDataPoint_ForPlant[] =
      data.scheduledPowerLimitDataPoints || [];

    /**
     * TODO: temprorary fix. Altering data points!!!
     */
    const scheduledPowerLimitDataPoints_Adjusted: MasterGwScheduledPowerLimitDataPoint_ForPlant[] =
      adjustPVPowerData(
        scheduledPowerLimitDataPoints,
        dataPoints,
        plant.plantSpecificMetadata?.hasPowerMeter || false,
        plant.plantSpecificMetadata?.maxPowerLimitTreshold,
        getLimitTypeForDateInThePast(plant, data.interval.to),
      );

    const result: PVPowerDataForPlant_NEW = {
      ...data,
      interval: {
        from: DataAdapter.dtoToModelTimestamp(data.interval.from),
        to: DataAdapter.dtoToModelTimestamp(data.interval.to),
      },
      dataPoints: dataPoints,
      scheduledPowerLimitDataPoints,
      scheduledPowerLimitDataPoints_Adjusted,
      irradianceDataPoints,
      exportFileName,
      showOriginalLimitData,
      extraSeriesLabels: data.extraSeriesLabels || [],
    };

    roundPVPowerData_Mutable(result);

    return result;
  }

  private _adaptDeviceData(
    device: Device,
    data: PVPowerDataForDeviceDTO_NEW,
    targetRange: DatetimeRangeModel,
    inverter?: Inverter_DTO,
  ): PVPowerDataForDevice_NEW {
    const deviceId: string | undefined = device.id;

    const exportFileName = this.plantsService.generateFileNameForExport_New(
      $localize`Active Power`,
      device.plantId,
      deviceId,
      targetRange,
      inverter,
    );

    const maxPowerValue = inverter
      ? inverter.inverterSpecificMetadata?.inverterMaxPower
      : this.plantsService.getCachedDeviceById(deviceId)?.deviceSpecificMetadata.deviceMaxPower;

    const dataPoints = data.dataPoints.map((dataPointDTO) => ({
      ...dataPointDTO,
      timestamp: DataAdapter.dtoToModelTimestamp(dataPointDTO.timestamp),
    }));

    const irradianceDataPoints =
      data.irradianceDataPoints?.map((dataPointDTO) => ({
        ...dataPointDTO,
        timestamp: DataAdapter.dtoToModelTimestamp(dataPointDTO.timestamp),
      })) || [];

    const scheduledPowerLimitDataPoints: MasterGwScheduledPowerLimitDataPoint_ForDevice[] =
      data.scheduledPowerLimitDataPoints || [];

    const result: PVPowerDataForDevice_NEW = {
      ...data,
      interval: {
        from: DataAdapter.dtoToModelTimestamp(data.interval.from),
        to: DataAdapter.dtoToModelTimestamp(data.interval.to),
      },
      dataPoints,
      scheduledPowerLimitDataPoints,
      irradianceDataPoints,
      exportFileName,
      maxPowerValue,
      plantId: device.plantId,
      extraSeriesLabels: data.extraSeriesLabels || [],
    };

    // roundPVPowerData_ForDevice_Mutable(result);

    return result;
  }
}
