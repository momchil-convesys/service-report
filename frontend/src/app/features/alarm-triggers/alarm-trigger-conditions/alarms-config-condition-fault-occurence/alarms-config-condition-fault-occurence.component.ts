import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, filter, map } from 'rxjs';
import {
  DurationUnit,
  durationUnitLabels,
  durationUnitLabels_NumericalForm_Plural,
  durationUnitLabels_NumericalForm_Single,
} from '../../../../constants';
import { FaultDefinition, FaultsTemplate } from '../../../../data/models';
import { FaultTemplatesService } from '../../../../data/services/fault-templates.service';
import { FaultsSelectComponent } from '../../../../shared/faults-select/faults-select.component';
import { AlarmConditionFaultRecurrence } from '../../_data/models';

export interface AlarmConfigConditionForm_FaultOccurence {
  faultIds: FormControl<string[]>;
  count: FormControl<number>;
  duration: FormGroup<{
    unit: FormControl<DurationUnit>;
    value: FormControl<number>;
  }>;
}

@Component({
  selector: 'app-alarms-config-condition-fault-occurence',
  templateUrl: './alarms-config-condition-fault-occurence.component.html',
  styleUrls: ['./alarms-config-condition-fault-occurence.component.less'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class AlarmsConfigConditionFaultOccurenceComponent implements OnChanges {
  @Input() formGroup!: FormGroup<AlarmConfigConditionForm_FaultOccurence>;
  @Input() metadataId: string | null = null;

  @ViewChild('faultsSelect') faultsSelect: FaultsSelectComponent | undefined;

  faultsTemplate$: Observable<FaultsTemplate> | undefined;
  faultsById$: Observable<{ [faultId: string]: FaultDefinition | undefined }> | undefined;

  drawerVisible = false;

  durationUnits = Object.values(DurationUnit).filter(
    (unit) => unit !== DurationUnit.QuaterOfAnHour,
  );
  durationUnitLabels = durationUnitLabels;
  durationUnitLabels_NumericalForm_Single = durationUnitLabels_NumericalForm_Single;
  durationUnitLabels_NumericalForm_Plural = durationUnitLabels_NumericalForm_Plural;

  static createFormGroup(
    condition: AlarmConditionFaultRecurrence | undefined,
  ): FormGroup<AlarmConfigConditionForm_FaultOccurence> {
    return new FormGroup<AlarmConfigConditionForm_FaultOccurence>({
      faultIds: new FormControl(condition?.faultIds || [], {
        nonNullable: true,
        validators: Validators.required,
      }),
      count: new FormControl(condition?.count || 10, {
        nonNullable: true,
        validators: Validators.required,
      }),
      duration: new FormGroup({
        unit: new FormControl(condition?.duration.unit || DurationUnit.Days, {
          nonNullable: true,
          validators: Validators.required,
        }),
        value: new FormControl(condition?.duration.value || 7, {
          nonNullable: true,
          validators: Validators.required,
        }),
      }),
    });
  }

  constructor(private faultTemplatesService: FaultTemplatesService) {}

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

    this.faultsTemplate$ = this.faultTemplatesService
      .getFaultsTemplateForDeviceMetadataId(this.metadataId)
      .pipe(
        map((req) => req.data),
        filter((data): data is FaultsTemplate => data !== undefined),
      );

    this.faultsById$ = this.faultTemplatesService.getAllFaultDefinitionsById();
  }

  onRemoveSelectedFault(faultId: string) {
    this.formGroup.controls.faultIds.setValue(
      this.formGroup.controls.faultIds.value.filter((item) => item !== faultId),
    );
  }

  openDrawer(): void {
    this.drawerVisible = true;
  }

  closeDrawer(saveChanges: boolean): void {
    if (saveChanges) {
      this.formGroup.controls.faultIds.setValue(this.faultsSelect?.getSelectedFaultIds() || []);
    }

    this.drawerVisible = false;
  }
}
