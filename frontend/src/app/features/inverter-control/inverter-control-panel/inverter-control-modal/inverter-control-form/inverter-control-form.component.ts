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
import { Observable, Subject, combineLatest, map, shareReplay, takeUntil } from 'rxjs';
import { localizedNumber } from '../../../../../app-locale';
import { markAllControlsAsDirty } from '../../../../../helpers';
import { ActivePowerLimitSchedule } from '../../../../power-limit-schedule/_data/active-schedule';
import { InverterControlRequestType } from '../../../_data/inverter-control.model';
import { ExtendedDevice } from '../../models';

type PowerLimitSettingUnit = 'kW' | '%';

interface InverterControlFormInterface {
  requestType: FormControl<InverterControlRequestType>;
  devices: FormControl<ExtendedDevice[]>;
  powerLimitOption: FormControl<'set' | 'revoke'>;
  powerLimitValue: FormControl<string | null>;
  powerLimitValueUnit: FormControl<PowerLimitSettingUnit>;
  usernameAutosaveHint: FormControl<string>;
  passcode: FormControl<string>;
}

export interface InverterControlFormValue {
  requestType: InverterControlRequestType;
  devices: ExtendedDevice[];
  powerLimitValue: number | null | undefined;
  passcode: string;
}

@Component({
  selector: 'app-inverter-control-form[devices][requestType]',
  templateUrl: './inverter-control-form.component.html',
  styleUrls: ['./inverter-control-form.component.less'],
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
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InverterControlFormComponent implements OnInit, OnDestroy {
  @Input({ required: true }) devices: ExtendedDevice[] = [];
  @Input({ required: true }) requestType!: InverterControlRequestType;
  @Input() loadingMessage: string | null = null;
  @Input() errorMessage: { title: string; description: string } | null = null;
  @Input() activePowerLimitSchedule: ActivePowerLimitSchedule | null = null;

  // NOTE: (submit) is a standard event, so we use (submitForm) to avoid collision
  @Output() submitForm = new EventEmitter<InverterControlFormValue>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('powerLimitInput', { read: ElementRef }) powerLimitInputRef: ElementRef | undefined;

  allInverters = $localize`ALL inverters`;
  setPowerLimit = $localize`Set power limit`;
  removePowerLimit = $localize`Remove power limit`;

  powerLimitScheduleEnabled = $localize`Power limit schedule is enabled for this plant!`;
  unpredictableOutcome = $localize`Controlling individual devices may lead to an unpredictable outcome.`;
  ambiguousMaximumPowerValues = $localize`Ambiguous maximum power values!`;
  inconsistentOrNotProvided = $localize`Maximum power values are either inconsistent or not provided at all.`;

  form!: FormGroup<InverterControlFormInterface>;

  powerLimitSettingMax: number | undefined;
  powerLimitSettingMaxKw: number | undefined;

  // For multiple inverters, the % option is not applicable if max values differ
  ambiguousMaxValues = false;

  powerLimitValueKwEquivalent$: Observable<undefined | null | number> | undefined;

  // sliderModel = 50;

  private _destroy$ = new Subject<void>();

  ngOnInit(): void {
    const maxValues: number[] = this.devices
      .map((device) => device.powerLimitSettingMax)
      .filter((value): value is number => value !== undefined);

    this.ambiguousMaxValues = new Set(maxValues).size !== 1;

    this.powerLimitSettingMaxKw =
      maxValues && maxValues.length > 0 ? Math.min(...maxValues) : undefined;

    const powerLimitUnitDefault: PowerLimitSettingUnit = 'kW';

    this.powerLimitSettingMax = this._getPowerLimitSettingMax(powerLimitUnitDefault);

    let powerLimitValidators: ValidatorFn[] | undefined;
    if (this.requestType === 'limit-inverter-power') {
      powerLimitValidators = this._getPowerLimitValidators(this.powerLimitSettingMax);
    }

    this.form = new FormGroup<InverterControlFormInterface>(
      {
        requestType: new FormControl(this.requestType, { nonNullable: true }),
        devices: new FormControl(this.devices || [], { nonNullable: true }),
        powerLimitOption: new FormControl('set', { nonNullable: true, updateOn: 'change' }),
        powerLimitValue: new FormControl(null, {
          validators: powerLimitValidators,
          updateOn: 'change',
        }),
        powerLimitValueUnit: new FormControl(powerLimitUnitDefault, {
          nonNullable: true,
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
          this.form.controls.powerLimitValueUnit.enable({ emitEvent: false });

          setTimeout(() => {
            this.powerLimitInputRef?.nativeElement.focus();
          }, 0);
        } else {
          this.form.controls.powerLimitValue.setValue(null);
          this.form.controls.powerLimitValue.setErrors(null);

          this.form.controls.powerLimitValue.disable({ emitEvent: false });
          this.form.controls.powerLimitValueUnit.disable({ emitEvent: false });
        }
      });

    this.form.controls.powerLimitValueUnit.valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe((powerLimitUnit) => {
        this.powerLimitSettingMax = this._getPowerLimitSettingMax(powerLimitUnit);

        const newValidators = this._getPowerLimitValidators(this.powerLimitSettingMax);

        this.form.controls.powerLimitValue.setValidators(newValidators);

        this.form.controls.powerLimitValue.setValue(null);
        this.form.controls.powerLimitValue.setErrors(null);

        this.powerLimitInputRef?.nativeElement.focus();

        // if (this.form.controls.powerLimitValue.value !== null) {
        //   this.form.controls.powerLimitValue.updateValueAndValidity();
        // }

        // let newValue: number | null = null;

        // if (this.form.controls.powerLimitValue.errors === null) {
        //   const currentValue = this.form.controls.powerLimitValue.value;
        //   newValue = this._convertValueToUnit(currentValue, powerLimitUnit);
        // }

        // this.form.controls.powerLimitValue.setValue(newValue);
        // this.form.controls.powerLimitValue.setErrors(null);
      });

    this.powerLimitValueKwEquivalent$ = combineLatest([
      this.form.controls.powerLimitValue.valueChanges,
      this.form.controls.powerLimitValueUnit.valueChanges,
    ]).pipe(
      map(([value, unit]) => {
        if (unit !== '%') {
          return undefined;
        }

        const powerLimitValueKw = this._convertValueToUnit(value, 'kW');
        return powerLimitValueKw;
      }),
      shareReplay(1),
    );
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  onCancel() {
    this.cancel.next();
  }

  // onSliderMove(value: number) {
  //   this.form.controls.powerLimitValue.setValue(value);
  // }

  // getSliderMarks(): NzMarks {
  //   const unit = this.form.controls.powerLimitValueUnit.value;
  //   if (this.powerLimitSettingMax) {
  //     return {
  //       0: `0 ${unit}`,
  //       [this.powerLimitSettingMax]: `${this.powerLimitSettingMax} ${unit}`,
  //     };
  //   }

  //   return {};
  // }

  // sliderTooltipFormatter = (value: number): string => {
  //   if (this.form.controls.powerLimitValueUnit.value === '%') {
  //     const powerLimitValueKw = this._convertValueToUnit(value, 'kW');

  //     return `${value}% | ${powerLimitValueKw} kW`;
  //   } else if (this.form.controls.powerLimitValueUnit.value === 'kW') {
  //     const powerLimitValuePercent = this._convertValueToUnit(value, '%');

  //     return `${powerLimitValuePercent}% | ${value} kW`;
  //   }

  //   return `${value}`;
  // };

  onSubmit() {
    this.form.updateValueAndValidity();

    markAllControlsAsDirty(Object.values(this.form.controls));

    if (!this.form.valid) {
      return;
    }

    const formValue = this.form.getRawValue();

    let powerLimitValueKw: number | null | undefined;

    if (formValue.requestType === 'limit-inverter-power') {
      if (formValue.powerLimitOption === 'revoke') {
        powerLimitValueKw = null;
      } else if (formValue.powerLimitValueUnit === '%') {
        powerLimitValueKw = this._convertValueToUnit(formValue.powerLimitValue, 'kW');
      } else {
        powerLimitValueKw =
          formValue.powerLimitValue !== null ? localizedNumber(formValue.powerLimitValue) : null;
      }
    }

    const result: InverterControlFormValue = {
      requestType: formValue.requestType,
      devices: formValue.devices,
      powerLimitValue: powerLimitValueKw,
      passcode: formValue.passcode,
    };

    this.submitForm.next(result);
  }

  private _getPowerLimitValidators(powerLimitSettingMax: number | undefined): ValidatorFn[] {
    const numberValidator = (control: AbstractControl) => {
      if (
        control.value === null ||
        control.value === undefined ||
        isNaN(localizedNumber(control.value))
      ) {
        return {
          invalidNumber: true,
        };
      }

      return null;
    };

    const powerLimitValidators = [Validators.required, numberValidator, Validators.min(0)];
    if (powerLimitSettingMax !== undefined) {
      powerLimitValidators.push(Validators.max(powerLimitSettingMax));
    }

    return powerLimitValidators;
  }

  private _getPowerLimitSettingMax(unit: PowerLimitSettingUnit): number | undefined {
    if (unit === '%') {
      return 100; // 100%
    }

    if (unit === 'kW') {
      return this.powerLimitSettingMaxKw;
    }

    return undefined;
  }

  private _convertValueToUnit(
    value: string | number | null,
    powerLimitUnit: PowerLimitSettingUnit,
  ): number | null {
    if (value === null || this.powerLimitSettingMaxKw === undefined) {
      return null;
    }

    const valueAsNumber: number = localizedNumber(value);

    if (powerLimitUnit === '%') {
      // Convert to %
      const result = (valueAsNumber / this.powerLimitSettingMaxKw) * 100;
      return Math.round(result * 10) / 10;
    } else if (powerLimitUnit === 'kW') {
      // Convert to kW
      const result = this.powerLimitSettingMaxKw * valueAsNumber * 0.01;
      return Math.round(result * 10) / 10;
    }

    return null;
  }
}
