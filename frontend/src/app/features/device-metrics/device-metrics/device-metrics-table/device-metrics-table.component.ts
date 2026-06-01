import { formatNumber } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  ViewEncapsulation,
} from '@angular/core';
import { APP_LOCALE_ID } from '../../../../app-locale';
import { DeviceParameterDefinition } from '../../../../data/models';
import {
  energyUnitForMultiplier,
  isNumber,
  multiplierForValue,
  powerUnitForMultiplier,
} from '../../../../helpers';
import { DeviceMetrics } from '../../_data/device-metrics.model';
import { GroupedParameter, ParameterMappingService } from '../../_data/parameter-mapping.service';

interface TableDataCellValue {
  parameterId: string;

  originalValue: number | string | null | undefined;
  originalUnit: string | null | undefined;

  transformedValue: number | string | null | undefined;
  transformedUnit: string | null;

  isNumber: boolean;
  isTransformed: boolean;

  originalValueFormatted: string | null;
}

interface ExtendedDeviceMetrics extends DeviceMetrics {
  transformedValues?: { [parameterDefinitionId: string]: TableDataCellValue };
}

// Dev flag used during development of this feature
const useTransformedData = false;

@Component({
  selector: 'app-device-metrics-table[parameters]',
  templateUrl: './device-metrics-table.component.html',
  styleUrls: ['./device-metrics-table.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class DeviceMetricsTableComponent implements OnChanges {
  @Input() isLoading = false;
  @Input({ required: true }) parameters: DeviceParameterDefinition[] | null = null;

  @Input() isSingleDevice = false;
  @Input() shouldUseParameterGroupingByName: boolean = false;

  @Input() set data(value: DeviceMetrics[]) {
    this._extendedData = this._extendData(value);
  }
  get data(): ExtendedDeviceMetrics[] {
    return this._extendedData;
  }

  private _extendedData: ExtendedDeviceMetrics[] = [];
  groupedParameters: GroupedParameter[] = [];

  headerWidth = 200;
  columnWidth = 200;

  constructor(private parameterMappingService: ParameterMappingService) {}

  ngOnChanges() {
    if (this.parameters && this.shouldUseParameterGroupingByName) {
      this.groupedParameters = this.parameterMappingService.groupParametersByName(this.parameters);
    }
  }

  getGroupedParameterValue(
    deviceMetrics: DeviceMetrics,
    groupedParameter: GroupedParameter,
  ): number | string | null | undefined {
    return this.parameterMappingService.getGroupedParameterValue(deviceMetrics, groupedParameter);
  }

  getGroupedParameterUnit(groupedParameter: GroupedParameter): string | null {
    return this.parameterMappingService.getGroupedParameterUnit(groupedParameter);
  }

  private _extendData(data: DeviceMetrics[]): ExtendedDeviceMetrics[] {
    if (!useTransformedData) {
      return data;
    }

    return [
      ...data.map((metrics: DeviceMetrics) => {
        const transformedValues: { [parameterDefinitionId: string]: TableDataCellValue } = {};

        Object.keys(metrics.values).forEach((parameterId) => {
          const originalValue: string | number | undefined | null = metrics.values[parameterId];
          const originalUnit: string | null | undefined = this.parameters?.find(
            (parameter) => parameter.id === parameterId,
          )?.unit;

          let transformedValue = originalValue;
          let transformedUnit = originalUnit || null;
          let isValueNumber = false;
          let isTransformed = false;
          let originalValueFormatted = originalValue?.toString() || null;

          if (isNumber(originalValue)) {
            const value: number = originalValue as number;

            isValueNumber = true;
            transformedValue = formatNumber(originalValue as number, APP_LOCALE_ID, '0.0-10');

            originalValueFormatted = transformedValue;

            // TODO: transform any unit

            const multiplier = multiplierForValue(value);

            if (multiplier !== 1 && originalUnit === 'kW') {
              isTransformed = true;
              transformedValue = formatNumber(value * multiplier, APP_LOCALE_ID, '0.1-1');
              transformedUnit = powerUnitForMultiplier(multiplier);
            } else if (multiplier !== 1 && originalUnit === 'kWh') {
              isTransformed = true;
              transformedValue = formatNumber(value * multiplier, APP_LOCALE_ID, '0.1-1');
              transformedUnit = energyUnitForMultiplier(multiplier);
            }
          }

          transformedValues[parameterId] = {
            parameterId,

            originalValue,
            originalUnit,

            transformedValue,
            transformedUnit,

            isNumber: isValueNumber,
            isTransformed,
            originalValueFormatted,
          };
        });

        const extendedMetrics: ExtendedDeviceMetrics = {
          ...metrics,
          transformedValues,
        };

        return extendedMetrics;
      }),
    ];
  }
}
