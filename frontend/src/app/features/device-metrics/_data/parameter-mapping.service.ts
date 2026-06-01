import { Injectable } from '@angular/core';
import { DeviceParameterDefinition } from '../../../data/models';

export interface GroupedParameter {
  name: string;
  parameterIds: string[];
  primaryParameter: DeviceParameterDefinition;
  allParameters: DeviceParameterDefinition[];
}

@Injectable()
export class ParameterMappingService {
  /**
   * Groups parameters by name, creating a mapping where parameters with the same name
   * are grouped together under a single GroupedParameter object.
   * Preserves the original order of parameters as much as possible.
   */
  groupParametersByName(parameters: DeviceParameterDefinition[]): GroupedParameter[] {
    const parameterMap = new Map<string, DeviceParameterDefinition[]>();
    const groupOrder: string[] = []; // Track the order of first occurrence of each group name

    // Group parameters by name while preserving order
    parameters.forEach((parameter) => {
      const existingGroup = parameterMap.get(parameter.name);
      if (existingGroup) {
        existingGroup.push(parameter);
      } else {
        parameterMap.set(parameter.name, [parameter]);
        groupOrder.push(parameter.name); // Record the order of first occurrence
      }
    });

    // Convert to GroupedParameter array in the original order
    return groupOrder.map((name) => {
      const parameters = parameterMap.get(name)!;

      return {
        name,
        parameterIds: parameters.map((p) => p.id),
        primaryParameter: parameters[0], // Use first parameter as primary (maintains original order)
        allParameters: parameters,
      };
    });
  }

  /**
   * Gets the value for a grouped parameter from device metrics.
   * If multiple parameters exist with the same name, it returns the first non-null value.
   */
  getGroupedParameterValue(
    deviceMetrics: { values: { [parameterId: string]: number | string | null } },
    groupedParameter: GroupedParameter,
  ): number | string | null | undefined {
    for (const parameterId of groupedParameter.parameterIds) {
      const value = deviceMetrics.values[parameterId];
      if (value !== null && value !== undefined) {
        return value;
      }
    }
    return undefined;
  }

  /**
   * Gets the unit for a grouped parameter.
   * Uses the unit from the primary parameter (first in the group).
   */
  getGroupedParameterUnit(groupedParameter: GroupedParameter): string | null {
    return groupedParameter.primaryParameter.unit;
  }

  /**
   * Checks if a grouped parameter has any non-null values across all devices.
   */
  hasAnyValue(
    deviceMetricsList: { values: { [parameterId: string]: number | string | null } }[],
    groupedParameter: GroupedParameter,
  ): boolean {
    return deviceMetricsList.some(
      (deviceMetrics) => this.getGroupedParameterValue(deviceMetrics, groupedParameter) !== null,
    );
  }

  /**
   * Gets all parameter IDs that belong to a grouped parameter.
   */
  getAllParameterIds(groupedParameter: GroupedParameter): string[] {
    return groupedParameter.parameterIds;
  }
}
