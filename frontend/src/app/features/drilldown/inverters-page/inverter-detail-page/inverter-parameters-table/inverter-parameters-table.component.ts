import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { NzTableModule } from 'ng-zorro-antd/table';
import { TypedChange } from '../../../../../constants';
import { DeviceParameterDefinition, DeviceParametersTemplate } from '../../../../../data/models';
import { DeviceParameterUnitDisplayComponent } from '../../../../../shared/device-parameter-unit-display/device-parameter-unit-display.component';
import { ValueDisplayComponent } from '../../../../../shared/value-display/value-display.component';
import { DeviceMetrics } from '../../../../device-metrics/_data/device-metrics.model';

interface ComponentChanges extends SimpleChanges {
  tsParametersTemplate: TypedChange<DeviceParametersTemplate | undefined>;
  deviceMetrics: TypedChange<DeviceMetrics | undefined>;
  loading: TypedChange<boolean>;
}

@Component({
  selector: 'app-inverter-parameters-table',
  imports: [DatePipe, NzTableModule, ValueDisplayComponent, DeviceParameterUnitDisplayComponent],
  templateUrl: './inverter-parameters-table.component.html',
  styleUrl: './inverter-parameters-table.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InverterParametersTableComponent {
  @Input({ required: true }) tsParametersTemplate: DeviceParametersTemplate | undefined;
  @Input({ required: true }) deviceMetrics: DeviceMetrics | undefined;
  @Input({ required: true }) loading: boolean | undefined;

  parameters: DeviceParameterDefinition[] = [];

  ngOnChanges(changes: ComponentChanges): void {
    if (changes.tsParametersTemplate) {
      this.parameters = this._constructVisibleParameters(changes.tsParametersTemplate.currentValue);
    }
  }

  getValueForParameterId(parameterId: string) {
    return this.deviceMetrics?.values[parameterId];
  }

  getValueForParameterId_asNumber(parameterId: string): number | null | undefined {
    return this.deviceMetrics?.values[parameterId] as number;
  }

  private _constructVisibleParameters(
    parametersTemplate: DeviceParametersTemplate | undefined,
  ): DeviceParameterDefinition[] {
    if (!parametersTemplate) {
      return [];
    }

    const result: DeviceParameterDefinition[] = [];

    parametersTemplate.parameterIdsVisibleInInverterMetrics.forEach((parameterId) => {
      const paramDefinition = parametersTemplate.parameters.find(
        (parameter) => parameter.id === parameterId,
      );
      if (paramDefinition) {
        result.push(paramDefinition);
      }
    });

    return result;
  }
}
