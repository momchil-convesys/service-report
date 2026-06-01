import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AlarmTriggerType,
  durationUnitLabels_NumericalForm_Plural,
  durationUnitLabels_NumericalForm_Single,
} from '../../../constants';
import { DeviceParameterDefinition, FaultDefinition } from '../../../data/models';
import { FaultTemplatesService } from '../../../data/services/fault-templates.service';
import { ParameterTemplatesService } from '../../../data/services/parameter-templates.service';
import {
  AlarmConditionDeviceStateChange,
  AlarmConditionFaultRecurrence,
  AlarmConditionParameterBoundaries,
  AlarmConditionType,
  comparisonOperatorLabels,
} from '../_data/models';

@Component({
  selector: 'app-alarm-trigger-condition-preview[condition][type]',
  templateUrl: './alarm-trigger-condition-preview.component.html',
  styleUrls: ['./alarm-trigger-condition-preview.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AlarmTriggerConditionPreviewComponent {
  @Input({ required: true }) condition!: AlarmConditionType;
  @Input({ required: true }) type!: AlarmTriggerType;

  AlarmTriggerType = AlarmTriggerType;

  faultsById$: Observable<{ [faultId: string]: FaultDefinition | undefined }> | undefined;

  durationUnitLabels_NumericalForm_Single = durationUnitLabels_NumericalForm_Single;
  durationUnitLabels_NumericalForm_Plural = durationUnitLabels_NumericalForm_Plural;

  constructor(
    private parameterTemplatesService: ParameterTemplatesService,
    private faultTemplatesService: FaultTemplatesService,
  ) {
    this.faultsById$ = this.faultTemplatesService.getAllFaultDefinitionsById();
  }

  pb(condition: AlarmConditionType): AlarmConditionParameterBoundaries {
    return <AlarmConditionParameterBoundaries>condition;
  }

  fr(condition: AlarmConditionType): AlarmConditionFaultRecurrence {
    return <AlarmConditionFaultRecurrence>condition;
  }

  sc(condition: AlarmConditionType): AlarmConditionDeviceStateChange {
    return <AlarmConditionDeviceStateChange>condition;
  }

  labelForComparisonOperator(operator: string) {
    return comparisonOperatorLabels[operator];
  }

  parameterById(parameterId: string): Observable<DeviceParameterDefinition | undefined> {
    return this.parameterTemplatesService.getDeviceParameterById(parameterId);
  }
}
