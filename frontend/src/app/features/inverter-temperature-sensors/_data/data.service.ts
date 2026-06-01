import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { DataRequest } from '../../../constants';
import { PlantsService } from '../../../data/services/plants.service';
import { DatetimeRangeModel } from '../../../shared/datetime-range-select/models';
import { TemperatureSensorsApiService } from './api.service';
import { InverterTemperatureSensorsDataDTO } from './dtos';
import { InverterTemperatureSensorsData, MinMaxTemperaturePoints } from './models';

function dtoToModelPoint<T>(point: T & { timestamp: string }): T & { timestamp: Date } {
  return {
    ...point,
    timestamp: dtoToModelTimestamp(point.timestamp),
  };
}

function dtoToModelTimestamp(timestamp: string): Date {
  return new Date(timestamp);
}

@Injectable()
export class TemperatureSensorsDataService {
  constructor(
    private api: TemperatureSensorsApiService,
    private plantsService: PlantsService,
  ) {}

  getTemperatureSensorsDataForDevice(
    deviceId: string,
    targetRange: DatetimeRangeModel,
  ): Observable<DataRequest<InverterTemperatureSensorsData>> {
    return this.api
      .fetchData(deviceId, targetRange.from.toISOString(), targetRange.to.toISOString())
      .pipe(
        map((req) => ({
          ...req,
          data: req.data ? this._adaptDtoToModel(req.data, targetRange) : undefined,
        })),
      );
  }

  private _adaptDtoToModel(
    dto: InverterTemperatureSensorsDataDTO,
    targetRange: DatetimeRangeModel,
  ): InverterTemperatureSensorsData {
    const dataPointsMinMax: MinMaxTemperaturePoints[] = new Array(dto.sensorLabels.length).fill({
      min: null,
      max: null,
    });

    // Find min max in reverse order, so that newest appear first in table
    for (let index = dto.dataPoints.length - 1; index >= 0; index--) {
      const dataPoint = dto.dataPoints[index];

      dto.sensorLabels.forEach(
        (_, sensorIndex) =>
          (dataPointsMinMax[sensorIndex] = this._calcNewMinMax(
            dataPointsMinMax[sensorIndex],
            dataPoint.values[sensorIndex],
            new Date(dataPoint.timestamp),
          )),
      );
    }

    // Validate extreme points
    let extremePointsRaw = dto.extremePoints;
    if (
      extremePointsRaw &&
      extremePointsRaw.maxPoints.length !== extremePointsRaw.minPoints.length &&
      extremePointsRaw.minPoints.length !== dto.sensorLabels.length
    ) {
      extremePointsRaw = undefined;
    }

    const result: InverterTemperatureSensorsData = {
      ...dto,
      targetDate: dtoToModelTimestamp(dto.targetDate),
      dataPoints: dto.dataPoints.map((point) => dtoToModelPoint(point)),
      activePowerDataPoints: dto.activePowerDataPoints?.map((point) => dtoToModelPoint(point)),
      extremePoints: (extremePointsRaw && {
        from: extremePointsRaw.from ? dtoToModelTimestamp(extremePointsRaw.from) : undefined,
        to: extremePointsRaw.to ? dtoToModelTimestamp(extremePointsRaw.to) : undefined,
        minPoints: extremePointsRaw.minPoints.map((point) =>
          point ? { timestamp: dtoToModelTimestamp(point.timestamp), value: point.value } : point,
        ),
        maxPoints: extremePointsRaw.maxPoints.map((point) =>
          point ? { timestamp: dtoToModelTimestamp(point.timestamp), value: point.value } : point,
        ),
      }) as unknown as InverterTemperatureSensorsData['extremePoints'],
      dataPointsMinMax,
      highlightOnLoad: undefined,
      exportFileName: this.plantsService.generateFileNameForExport(
        $localize`Temperature Sensors`,
        undefined,
        dto.deviceId,
        new Date(dto.targetDate),
        undefined,
        false,
      ),
      timeZone: this.plantsService.getCachedPlantByDeviceId(dto.deviceId)?.timeZone,
      targetRange,
    };

    return result;
  }

  private _calcNewMinMax(
    currentMinMax: MinMaxTemperaturePoints,
    value: number | null,
    timestamp: Date,
  ): MinMaxTemperaturePoints {
    let result: MinMaxTemperaturePoints = { ...currentMinMax };

    if (value === null) {
      return result;
    }

    if (currentMinMax.max === null || value > currentMinMax.max.value) {
      result.max = { value, timestamp };
    }

    if (currentMinMax.min === null || value < currentMinMax.min.value) {
      result.min = { value, timestamp };
    }

    return result;
  }
}
