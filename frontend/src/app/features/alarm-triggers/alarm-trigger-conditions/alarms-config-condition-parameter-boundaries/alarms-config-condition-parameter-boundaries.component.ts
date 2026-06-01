import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, filter, map, shareReplay, takeUntil } from 'rxjs';
import { DataRequest } from '../../../../constants';
import { DeviceParameterDefinition, DeviceParametersTemplate } from '../../../../data/models';
import { ParameterTemplatesService } from '../../../../data/services/parameter-templates.service';
import {
  AlarmConditionParameterBoundaries,
  ComparisonOperator,
  comparisonOperatorLabels,
  comparisonOperatorsValues,
} from '../../_data/models';

export interface AlarmConfigConditionForm_ParameterBoundaries {
  parameter: FormControl<string>;
  comparisonOperator: FormControl<ComparisonOperator>;
  value: FormControl<number>;
  unit: FormControl<string>;
}

@Component({
  selector: 'app-alarms-config-condition-parameter-boundaries[formGroup]',
  templateUrl: './alarms-config-condition-parameter-boundaries.component.html',
  styleUrls: ['./alarms-config-condition-parameter-boundaries.component.less'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class AlarmsConfigConditionParameterBoundariesComponent
  implements OnInit, OnDestroy, OnChanges
{
  @Input({ required: true }) formGroup!: FormGroup<AlarmConfigConditionForm_ParameterBoundaries>;
  @Input() metadataId: string | null = null;

  parametersTemplateRequest$:
    | Observable<DataRequest<DeviceParametersTemplate | undefined>>
    | undefined;

  comparisonOperatorsValues = comparisonOperatorsValues;

  private _parameters: DeviceParameterDefinition[] = [];

  private _destroy$ = new Subject<void>();

  static createFormGroup(
    condition: AlarmConditionParameterBoundaries | undefined,
  ): FormGroup<AlarmConfigConditionForm_ParameterBoundaries> {
    return new FormGroup<AlarmConfigConditionForm_ParameterBoundaries>({
      parameter: new FormControl(condition?.parameter || null!, {
        nonNullable: true,
        validators: Validators.required,
      }),
      comparisonOperator: new FormControl(condition?.comparisonOperator || ComparisonOperator.GT, {
        nonNullable: true,
      }),
      value: new FormControl(condition?.value === undefined ? null! : condition?.value, {
        nonNullable: true,
        validators: Validators.required,
      }),
      unit: new FormControl(condition?.unit || null!, {
        nonNullable: true,
      }),
    });
  }

  constructor(private parameterTmplatesService: ParameterTemplatesService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.metadataId) {
      console.warn(
        this.constructor.name,
        this.ngOnChanges.name,
        '| Component called with unexpected metadataId: ',
        this.metadataId,
      );
      return;
    }

    this.parametersTemplateRequest$ = this.parameterTmplatesService
      .getDeviceParametersTemplateForDeviceMetadataId(this.metadataId)
      .pipe(
        // TODO: temporary manipulating parameters for batteries
        map((parametersTemplateReq) => {
          const parametersTemplate = parametersTemplateReq.data;
          if (!parametersTemplate || parametersTemplate.id !== '4') {
            return parametersTemplateReq;
          }

          const filtered = parametersTemplate.parameters.filter((x) => x.name !== 'Reserved');
          const sorted = filtered
            .sort((a, b) => {
              const strA = a.name.replace(/[^\d.]/g, '');
              const strB = b.name.replace(/[^\d.]/g, '');

              return parseInt(strA) - parseInt(strB);
            })
            .sort((a, b) => {
              return a.name[0] > b.name[0] ? -1 : 1;
            });

          return {
            ...parametersTemplateReq,
            data: {
              ...parametersTemplate,
              parameters: sorted,
            },
          };
        }),
        shareReplay(1),
      );

    this.parametersTemplateRequest$
      .pipe(
        map((req) => req.data),
        filter((data): data is DeviceParametersTemplate => data !== undefined),
        takeUntil(this._destroy$),
      )
      .subscribe((parametersTemplate) => {
        this._parameters = parametersTemplate.parameters;
      });
  }

  ngOnInit(): void {
    this.formGroup.controls.parameter.valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe((parameterId) => {
        const unit = parameterId ? this._unitForParameter(parameterId as string) : null;
        this.formGroup.controls.unit.setValue(unit || '');
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  labelForComparisonOperator(operator: string) {
    return comparisonOperatorLabels[operator];
  }

  private _unitForParameter(parameterId: string): string | null | undefined {
    return this._parameters.find(
      (parameterDefinition: DeviceParameterDefinition) => parameterId === parameterDefinition.id,
    )?.unit;
  }
}
