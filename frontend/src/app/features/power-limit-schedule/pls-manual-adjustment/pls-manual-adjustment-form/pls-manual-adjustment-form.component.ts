import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Subject, takeUntil } from 'rxjs';
import { localizedNumber } from '../../../../app-locale';
import { CustomError } from '../../../../constants';
import { markAllControlsAsDirty } from '../../../../helpers';
import { calcScheduleAdjustmentPercentage } from '../../../../helpers/_schedule-adjustment-coefficient';
import { CustomAlertComponent } from '../../../../shared/custom-alert/custom-alert.component';
import { PlsValueFormattedComponent } from '../../../../shared/power-limit/pls-value-formatted/pls-value-formatted.component';
import { PowerLimitIconComponent } from '../../../../shared/power-limit/power-limit-icon/power-limit-icon.component';
import { TargetLimit_PreCalc } from '../../../pv-charts/pv-production-chart/_data/pv-production';
import { plsUnitsMap } from '../../_data/models';
import { TableRow } from '../pls-manual-adjustment-table/_data-helpers';

interface PlsManualAdjustment_FormInterface {
  powerLimitOption: FormControl<'set' | 'reset' | 'revoke'>;
  powerLimitValue: FormControl<string | null>;

  usernameAutosaveHint: FormControl<string>;
  passcode: FormControl<string>;
}

export interface PlsManualAdjustment_FormValue {
  passcode: string;
  powerLimitValue_MWh: number | null;
}

@Component({
  selector: 'app-pls-manual-adjustment-form',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzInputModule,
    NzFormModule,
    NzRadioModule,
    NzSpinModule,
    NzAlertModule,
    NzButtonModule,
    NzIconModule,
    NzSelectModule,
    NzSliderModule,
    NzAlertModule,
    PowerLimitIconComponent,
    PlsValueFormattedComponent,
    CustomAlertComponent,
  ],
  templateUrl: './pls-manual-adjustment-form.component.html',
  styleUrl: './pls-manual-adjustment-form.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlsManualAdjustmentFormComponent implements OnInit, OnDestroy {
  @Input({ required: true }) data: TableRow | undefined;

  @Input() loadingMessage: string | null = null;
  @Input() customError: CustomError | null = null;

  @Input({ required: true }) scheduleAdjustmentCoefficient: number = 1;
  @Input({ required: true }) powerLimitType: 'energy' | 'power' | undefined;

  // NOTE: (submit) is a standard event, so we use (submitForm) to avoid collision
  @Output() submitForm = new EventEmitter<PlsManualAdjustment_FormValue>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('powerLimitInput', { read: ElementRef }) powerLimitInputRef: ElementRef | undefined;

  calculatedAdjustmentHint: null | {
    adjustmentPercentageFormatted: string;
    adjustedValue_MWh: number | null;
  } = null;

  form!: FormGroup<PlsManualAdjustment_FormInterface>;

  originalValue: TargetLimit_PreCalc | undefined;

  private _destroy$ = new Subject<void>();

  ngOnChanges() {
    this.originalValue = this.data?.targetLimitDetails.activeRecord?.targetLimitOriginal;
  }

  ngOnInit(): void {
    let powerLimitValidators: ValidatorFn[] = this._getPowerLimitValidators();

    this.form = new FormGroup<PlsManualAdjustment_FormInterface>(
      {
        powerLimitOption: new FormControl('set', { nonNullable: true, updateOn: 'change' }),
        powerLimitValue: new FormControl(null, {
          validators: powerLimitValidators,
          updateOn: 'change',
        }),
        passcode: new FormControl('', { validators: Validators.required, nonNullable: true }),
        usernameAutosaveHint: new FormControl('Master Control Password', { nonNullable: true }),
      },
      { updateOn: 'submit' },
    );

    this.form.controls.powerLimitOption.valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe((powerLimitOption) => {
        if (powerLimitOption === 'set') {
          this.form.controls.powerLimitValue.setValue(null);
          this.form.controls.powerLimitValue.setErrors(null);

          this.form.controls.powerLimitValue.enable({ emitEvent: false });

          this.powerLimitInputRef?.nativeElement.focus();
        } else {
          this.form.controls.powerLimitValue.setValue(null);
          this.form.controls.powerLimitValue.setErrors(null);

          this.form.controls.powerLimitValue.disable({ emitEvent: false });
        }
      });

    this.form.controls.powerLimitValue.valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe((fcValue) => {
        if (!this.form.controls.powerLimitValue.valid) {
          this.calculatedAdjustmentHint = null;
          return;
        }

        const coefficient = this.scheduleAdjustmentCoefficient || 1;

        if (coefficient === 1) {
          this.calculatedAdjustmentHint = null;
          return;
        }

        const targetPowerLimit_MWh = fcValue !== null ? localizedNumber(fcValue) : null;

        const targetPowerLimitAdjusted_MWh = targetPowerLimit_MWh
          ? Math.round(targetPowerLimit_MWh * coefficient * 1000) / 1000
          : targetPowerLimit_MWh;

        const scheduleAdjustmentPercentage = calcScheduleAdjustmentPercentage(coefficient);

        const scheduleAdjustmentPercentageFormatted: string =
          scheduleAdjustmentPercentage !== undefined && scheduleAdjustmentPercentage !== 0
            ? `${scheduleAdjustmentPercentage > 0 ? '+' : '-'}${scheduleAdjustmentPercentage}%`
            : '';

        this.calculatedAdjustmentHint = {
          adjustmentPercentageFormatted: scheduleAdjustmentPercentageFormatted,
          adjustedValue_MWh: targetPowerLimitAdjusted_MWh,
        };
      });
  }

  ngAfterViewInit() {
    if (this.form.controls.powerLimitOption.value === 'set') {
      setTimeout(() => {
        this.powerLimitInputRef?.nativeElement.focus();
      }, 301);
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  onCancel() {
    this.cancel.next();
  }

  onSubmit() {
    this.form.updateValueAndValidity();

    markAllControlsAsDirty(Object.values(this.form.controls));

    if (!this.form.valid) {
      return;
    }

    const formValue = this.form.getRawValue();

    let newValue_MWh: number | null = null;

    if (formValue.powerLimitOption === 'set') {
      newValue_MWh =
        formValue.powerLimitValue !== null ? localizedNumber(formValue.powerLimitValue) : null;
    } else if (formValue.powerLimitOption === 'reset') {
      if (this.originalValue === undefined) {
        this.form.setErrors({
          originalValueUnknown: true,
        });

        return;
      }
      newValue_MWh = this.originalValue?.value_Mega;
    } else {
      newValue_MWh = null;
    }

    const result: PlsManualAdjustment_FormValue = {
      passcode: formValue.passcode,
      powerLimitValue_MWh: newValue_MWh,
    };

    this.submitForm.next(result);
  }

  getUnitSuffixFormatted(): string {
    if (this.powerLimitType) {
      return ` ${plsUnitsMap[this.powerLimitType]}`;
    }

    return '';
  }

  private _getPowerLimitValidators(): ValidatorFn[] {
    const numberValidator = (control: AbstractControl) => {
      if (
        control.value === undefined ||
        control.value === null ||
        isNaN(localizedNumber(control.value))
      ) {
        return {
          invalidNumber: true,
        };
      }

      return null;
    };

    return [Validators.required, numberValidator, Validators.min(0)];
  }
}
