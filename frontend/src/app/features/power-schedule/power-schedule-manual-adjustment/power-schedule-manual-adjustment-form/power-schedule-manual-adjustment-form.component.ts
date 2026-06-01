import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
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
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Subject, takeUntil } from 'rxjs';
import { CustomError } from '../../../../constants';
import { markAllControlsAsDirty } from '../../../../helpers';
import { calcScheduleAdjustmentPercentage } from '../../../../helpers/_schedule-adjustment-coefficient';
import { CustomAlertComponent } from '../../../../shared/custom-alert/custom-alert.component';
import { PlsEquivalentIconComponent } from '../../../../shared/power-limit/pls-equivalent-icon/pls-equivalent-icon.component';
import { ValueDisplayComponent } from '../../../../shared/value-display/value-display.component';
import { PriorityMode, priorityModes } from '../../_data/priority-modes.dto';
import { PowerScheduleSetpointValueComponent } from '../../power-schedule-setpoint-value/power-schedule-setpoint-value.component';
import { PriorityModeType } from '../_data/manual-adjustments.dto';

const meaningfullPowerValueThreshold = 100;

interface PowerScheduleManualAdjustment_FormInterface {
  pvPowerOption: FormControl<'set' | 'reset' | 'revoke'>;
  pvPowerValue: FormControl<string | null>;
  bessPowerOption: FormControl<'set' | 'reset' | 'revoke'>;
  bessPowerValue: FormControl<string | null>;
  priorityMode: FormControl<PriorityModeType | null>;
  passcode: FormControl<string>;
}

export interface PowerScheduleManualAdjustment_FormValue {
  pvPowerSetpoint: null | {
    newValue: number | null;
  };
  bessPowerSetpoint: null | {
    newValue: number | null;
  };
  priorityMode: null | {
    newValue: PriorityModeType | null;
  };
  passcode: string;
}

interface SetpointValue {
  value: number | null;
  valueAdjusted: number | null;
}

interface TableRow {
  interval: {
    start: Date;
    end: Date;
  };
  pvPowerSetpoint: SetpointValue;
  pvPowerSetpointCustom: SetpointValue | null;
  bessPowerSetpoint: SetpointValue;
  bessPowerSetpointCustom: SetpointValue | null;
  priorityMode: PriorityModeType | null;
}

@Component({
  selector: 'app-power-schedule-manual-adjustment-form',
  templateUrl: './power-schedule-manual-adjustment-form.component.html',
  styleUrl: './power-schedule-manual-adjustment-form.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzSpinModule,
    NzFormModule,
    NzInputModule,
    NzRadioModule,
    NzSelectModule,
    NzButtonModule,
    CustomAlertComponent,
    PowerScheduleSetpointValueComponent,
    PlsEquivalentIconComponent,
    ValueDisplayComponent,
  ],
  providers: [NzModalService],
})
export class PowerScheduleManualAdjustmentFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) data: TableRow | undefined;
  @Input() type: 'pv' | 'bess' | 'priorityMode' = 'pv';

  @Input() loadingMessage: string | null = null;
  @Input() customError: CustomError | null = null;

  @Input({ required: true }) pvScheduleAdjustmentCoefficient: number = 1;
  @Input({ required: true }) bessScheduleAdjustmentCoefficient: number = 1;

  @Output() submitForm = new EventEmitter<PowerScheduleManualAdjustment_FormValue>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('pvPowerInput', { read: ElementRef }) pvPowerInputRef: ElementRef | undefined;
  @ViewChild('bessPowerInput', { read: ElementRef }) bessPowerInputRef: ElementRef | undefined;

  form!: FormGroup<PowerScheduleManualAdjustment_FormInterface>;

  originalPvPower: number | null | undefined;
  originalBessPower: number | null | undefined;

  calculatedPvPowerAdjustmentHint: null | {
    adjustmentPercentageFormatted: string;
    adjustedValue_kW: number | null;
    energyEquivalent_kWh: number | null;
  } = null;

  calculatedBessPowerAdjustmentHint: null | {
    adjustmentPercentageFormatted: string;
    adjustedValue_kW: number | null;
    energyEquivalent_kWh: number | null;
  } = null;

  readonly priorityModes = priorityModes;
  readonly PriorityMode = PriorityMode;

  private _destroy$ = new Subject<void>();

  constructor(
    private cdr: ChangeDetectorRef,
    private modal: NzModalService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.originalPvPower = this.data?.pvPowerSetpoint?.value;
      this.originalBessPower = this.data?.bessPowerSetpoint?.value;
      if (this.form && this.data?.priorityMode) {
        this.form.controls.priorityMode.setValue(this.data.priorityMode as PriorityModeType, {
          emitEvent: false,
        });
      }
      if (this.form) {
        // Re-evaluate priority mode restrictions when data changes
        this.form.controls.priorityMode.updateValueAndValidity({ emitEvent: false });
      }
      this.cdr.markForCheck();
    }
    if (changes['type'] && this.form) {
      // Update validators and enable/disable fields based on type

      if (this.type === 'pv') {
        this.form.controls.pvPowerOption.enable({ emitEvent: false });
        this.form.controls.pvPowerValue.setValidators(this._getPowerValidators(true));
        this.form.controls.pvPowerValue.enable({ emitEvent: false });
      } else {
        this.form.controls.pvPowerOption.disable({ emitEvent: false });
        this.form.controls.pvPowerValue.clearValidators();
        this.form.controls.pvPowerValue.disable({ emitEvent: false });
      }

      if (this.type === 'bess') {
        this.form.controls.bessPowerOption.enable({ emitEvent: false });
        this.form.controls.bessPowerValue.setValidators(this._getPowerValidators(false));
        this.form.controls.bessPowerValue.enable({ emitEvent: false });
      } else {
        this.form.controls.bessPowerOption.disable({ emitEvent: false });
        this.form.controls.bessPowerValue.clearValidators();
        this.form.controls.bessPowerValue.disable({ emitEvent: false });
      }

      if (this.type === 'priorityMode') {
        this.form.controls.priorityMode.setValidators([
          Validators.required,
          this._priorityModeRestrictionsValidator(),
        ]);
      } else {
        this.form.controls.priorityMode.setValidators([this._priorityModeRestrictionsValidator()]);
      }

      this.form.updateValueAndValidity({ emitEvent: false });
      this.cdr.markForCheck();
    }
    if (changes['loadingMessage'] || changes['customError']) {
      this.cdr.markForCheck();
    }
    if (changes['scheduleAdjustmentCoefficient']) {
      // Recalculate hints when coefficient changes
      if (this.form) {
        if (this.type === 'pv') {
          this._calculatePvPowerHint();
        }
        if (this.type === 'bess') {
          this._calculateBessPowerHint();
        }
      }
      // Trigger change detection to update getter methods
      this.cdr.markForCheck();
    }
  }

  ngOnInit(): void {
    // Only add validators for the relevant field based on type
    const pvPowerValueValidators = this.type === 'pv' ? this._getPowerValidators(true) : [];
    const bessPowerValueValidators = this.type === 'bess' ? this._getPowerValidators(false) : [];
    const priorityModeValidators: ValidatorFn[] =
      this.type === 'priorityMode'
        ? [Validators.required, this._priorityModeRestrictionsValidator()]
        : [this._priorityModeRestrictionsValidator()];

    this.form = new FormGroup<PowerScheduleManualAdjustment_FormInterface>(
      {
        pvPowerOption: new FormControl('set', { nonNullable: true, updateOn: 'change' }),
        pvPowerValue: new FormControl(null, {
          validators: pvPowerValueValidators,
          updateOn: 'change',
        }),
        bessPowerOption: new FormControl('set', { nonNullable: true, updateOn: 'change' }),
        bessPowerValue: new FormControl(null, {
          validators: bessPowerValueValidators,
          updateOn: 'change',
        }),
        priorityMode: new FormControl<PriorityModeType | null>(
          (this.data?.priorityMode as PriorityModeType) ?? null,
          {
            validators: priorityModeValidators,
            updateOn: 'change',
          },
        ),
        passcode: new FormControl('', { validators: Validators.required, nonNullable: true }),
      },
      { updateOn: 'submit' },
    );

    // Set default values and disable fields that are not relevant for this type
    if (this.type !== 'pv') {
      this.form.controls.pvPowerOption.setValue('reset', { emitEvent: false });
      this.form.controls.pvPowerOption.disable({ emitEvent: false });
      this.form.controls.pvPowerValue.setValue(null, { emitEvent: false });
      this.form.controls.pvPowerValue.disable({ emitEvent: false });
    }
    if (this.type !== 'bess') {
      this.form.controls.bessPowerOption.setValue('reset', { emitEvent: false });
      this.form.controls.bessPowerOption.disable({ emitEvent: false });
      this.form.controls.bessPowerValue.setValue(null, { emitEvent: false });
      this.form.controls.bessPowerValue.disable({ emitEvent: false });
    }

    this.cdr.markForCheck();

    // Initial focus on input fields
    setTimeout(() => {
      this.pvPowerInputRef?.nativeElement?.focus();
      this.bessPowerInputRef?.nativeElement?.focus();
    }, 500);

    this.form.controls.pvPowerOption.valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe((option) => {
        if (this.type === 'pv' && option === 'set') {
          this.form.controls.pvPowerValue.setValue(null);
          this.form.controls.pvPowerValue.setErrors(null);
          this.form.controls.pvPowerValue.enable({ emitEvent: false });
          setTimeout(() => this.pvPowerInputRef?.nativeElement.focus(), 100);
        } else if (this.type === 'pv') {
          this.form.controls.pvPowerValue.setValue(null);
          this.form.controls.pvPowerValue.setErrors(null);
          this.form.controls.pvPowerValue.disable({ emitEvent: false });
        }
        // Priority mode restrictions depend on effective PV/BESS setpoints
        this.form.controls.priorityMode.updateValueAndValidity({ emitEvent: false });
      });

    this.form.controls.bessPowerOption.valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe((option) => {
        if (this.type === 'bess' && option === 'set') {
          this.form.controls.bessPowerValue.setValue(null);
          this.form.controls.bessPowerValue.setErrors(null);
          this.form.controls.bessPowerValue.enable({ emitEvent: false });
          setTimeout(() => this.bessPowerInputRef?.nativeElement.focus(), 100);
        } else if (this.type === 'bess') {
          this.form.controls.bessPowerValue.setValue(null);
          this.form.controls.bessPowerValue.setErrors(null);
          this.form.controls.bessPowerValue.disable({ emitEvent: false });
        }
        // Priority mode restrictions depend on effective PV/BESS setpoints
        this.form.controls.priorityMode.updateValueAndValidity({ emitEvent: false });
      });

    this.form.controls.priorityMode.valueChanges.pipe(takeUntil(this._destroy$)).subscribe(() => {
      // If NL is not allowed for the newly selected mode, exit the NL option automatically.
      if (this.type === 'bess' && this.form.controls.bessPowerOption.value === 'revoke') {
        if (!this.canSetBessToNl()) {
          this.form.controls.bessPowerOption.setValue('reset', { emitEvent: false });
          this.form.controls.bessPowerValue.setValue(null, { emitEvent: false });
          this.form.controls.bessPowerValue.setErrors(null);
          this.form.controls.bessPowerValue.disable({ emitEvent: false });
        }
      }

      // Always re-evaluate restriction validator
      this.form.controls.priorityMode.updateValueAndValidity({ emitEvent: false });
    });

    // Calculate adjustment hints for PV power
    this.form.controls.pvPowerValue.valueChanges.pipe(takeUntil(this._destroy$)).subscribe(() => {
      this._calculatePvPowerHint();
      this.form.controls.priorityMode.updateValueAndValidity({ emitEvent: false });
    });

    // Calculate adjustment hints for BESS power
    this.form.controls.bessPowerValue.valueChanges.pipe(takeUntil(this._destroy$)).subscribe(() => {
      this._calculateBessPowerHint();
      this.form.controls.priorityMode.updateValueAndValidity({ emitEvent: false });
    });
  }

  private _calculatePvPowerHint(): void {
    if (!this.form.controls.pvPowerValue.valid) {
      this.calculatedPvPowerAdjustmentHint = null;
      this.cdr.markForCheck();
      return;
    }

    const coefficient = this.pvScheduleAdjustmentCoefficient || 1;

    // if (coefficient === 1) {
    //   this.calculatedPvPowerAdjustmentHint = null;
    //   this.cdr.markForCheck();
    //   return;
    // }

    const fcValue = this.form.controls.pvPowerValue.value;
    const targetPvPower_kW = fcValue !== null ? Number(fcValue) : null;

    const targetPvPowerAdjusted_kW = targetPvPower_kW
      ? Math.round(targetPvPower_kW * coefficient * 1000) / 1000
      : targetPvPower_kW;

    const scheduleAdjustmentPercentage = calcScheduleAdjustmentPercentage(coefficient);

    const scheduleAdjustmentPercentageFormatted: string =
      scheduleAdjustmentPercentage !== undefined && scheduleAdjustmentPercentage !== 0
        ? `${scheduleAdjustmentPercentage > 0 ? '+' : '-'}${scheduleAdjustmentPercentage}%`
        : '';

    // Calculate energy equivalent
    const energyEquivalent_kWh = this._calculatePvEnergyEquivalent(targetPvPowerAdjusted_kW);

    this.calculatedPvPowerAdjustmentHint = {
      adjustmentPercentageFormatted: scheduleAdjustmentPercentageFormatted,
      adjustedValue_kW: targetPvPowerAdjusted_kW,
      energyEquivalent_kWh,
    };
    this.cdr.markForCheck();
  }

  private _calculateBessPowerHint(): void {
    if (!this.form.controls.bessPowerValue.valid) {
      this.calculatedBessPowerAdjustmentHint = null;
      this.cdr.markForCheck();
      return;
    }

    const coefficient = this.bessScheduleAdjustmentCoefficient || 1;

    // if (coefficient === 1) {
    //   this.calculatedBessPowerAdjustmentHint = null;
    //   this.cdr.markForCheck();
    //   return;
    // }

    const fcValue = this.form.controls.bessPowerValue.value;
    const targetBessPower_kW = fcValue !== null ? Number(fcValue) : null;

    const targetBessPowerAdjusted_kW = targetBessPower_kW
      ? Math.round(targetBessPower_kW * coefficient * 1000) / 1000
      : targetBessPower_kW;

    const scheduleAdjustmentPercentage = calcScheduleAdjustmentPercentage(coefficient);

    const scheduleAdjustmentPercentageFormatted: string =
      scheduleAdjustmentPercentage !== undefined && scheduleAdjustmentPercentage !== 0
        ? `${scheduleAdjustmentPercentage > 0 ? '+' : '-'}${scheduleAdjustmentPercentage}%`
        : '';

    // Calculate energy equivalent
    const energyEquivalent_kWh = this._calculateBessEnergyEquivalent(targetBessPowerAdjusted_kW);

    this.calculatedBessPowerAdjustmentHint = {
      adjustmentPercentageFormatted: scheduleAdjustmentPercentageFormatted,
      adjustedValue_kW: targetBessPowerAdjusted_kW,
      energyEquivalent_kWh,
    };
    this.cdr.markForCheck();
  }

  ngAfterViewInit() {
    if (this.type === 'pv' && this.form.controls.pvPowerOption.value === 'set') {
      setTimeout(() => {
        this.pvPowerInputRef?.nativeElement.focus();
      }, 301);
    } else if (this.type === 'bess' && this.form.controls.bessPowerOption.value === 'set') {
      setTimeout(() => {
        this.bessPowerInputRef?.nativeElement.focus();
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

    let pvPowerSetpoint: number | null = null;
    let bessPowerSetpoint: number | null = null;
    let priorityMode: PriorityModeType | null = null;

    // Handle PV power (only if type is 'pv')
    if (this.type === 'pv') {
      if (formValue.pvPowerOption === 'set') {
        pvPowerSetpoint = formValue.pvPowerValue !== null ? Number(formValue.pvPowerValue) : null;
      } else if (formValue.pvPowerOption === 'reset') {
        // Reset to original setpoint value (not adjusted)
        pvPowerSetpoint = this.data?.pvPowerSetpoint?.value ?? null;
      } else {
        pvPowerSetpoint = null;
      }
    }

    // Handle BESS power (only if type is 'bess')
    if (this.type === 'bess') {
      if (formValue.bessPowerOption === 'set') {
        bessPowerSetpoint =
          formValue.bessPowerValue !== null ? Number(formValue.bessPowerValue) : null;
      } else if (formValue.bessPowerOption === 'reset') {
        // Reset to original setpoint value (not adjusted)
        bessPowerSetpoint = this.data?.bessPowerSetpoint?.value ?? null;
      } else {
        bessPowerSetpoint = null;
      }
    }

    // Handle Priority Mode
    // - In pv/bess modals it's optional and only included if changed
    // - In priorityMode modal it's always included (required)
    const existingPriorityMode: PriorityModeType | null =
      (this.data?.priorityMode as PriorityModeType) ?? null;
    if (this.type === 'priorityMode' || formValue.priorityMode !== existingPriorityMode) {
      priorityMode = formValue.priorityMode;
    }

    /**
     * Unit sanity check.
     *
     * Check if entered value is intended to be entered in kilowatts (kW),
     * not mistakenly entered in megawatts (MW) in mind.
     *
     * meaningfullPowerValueThreshold determines the threshold
     * for the value to be considered "meaningful" in kW.
     */
    let needsConfirmation = false;
    let valueToCheck: number | null = null;
    let optionToCheck: 'set' | 'reset' | 'revoke' = 'reset';

    if (this.type === 'pv') {
      valueToCheck = formValue.pvPowerValue !== null ? Number(formValue.pvPowerValue) : null;
      optionToCheck = formValue.pvPowerOption;
    } else if (this.type === 'bess') {
      valueToCheck = formValue.bessPowerValue !== null ? Number(formValue.bessPowerValue) : null;
      optionToCheck = formValue.bessPowerOption;
    }

    needsConfirmation =
      valueToCheck !== null &&
      valueToCheck !== 0 &&
      Math.abs(valueToCheck) <= meaningfullPowerValueThreshold &&
      optionToCheck === 'set';

    if (needsConfirmation && valueToCheck !== null) {
      const confirmMessageFirstPart = $localize`You are submitting <b>{kwValue} kilowatts (kW)</b>.`;
      const confirmMessageSecondPart = $localize`If you intended to enter megawatts (MW), please change the value to <b>{mwValue}</b>.`;

      const createMessage = (kwValue: number): string => {
        const mwValue = kwValue * 1000;
        const firstPart = confirmMessageFirstPart.replace('{kwValue}', kwValue.toString());
        const secondPart = confirmMessageSecondPart.replace('{mwValue}', mwValue.toString());
        return `${firstPart}<br />${secondPart}`;
      };

      const confirmMessage = createMessage(valueToCheck);

      this.modal.confirm({
        nzTitle: $localize`Confirm power value`,
        nzContent: confirmMessage,
        nzOkText: $localize`Yes, submit`,
        nzCancelText: $localize`Cancel`,
        nzOnOk: () => {
          this._doSubmit(pvPowerSetpoint, bessPowerSetpoint, priorityMode, formValue.passcode);
        },
      });
    } else {
      this._doSubmit(pvPowerSetpoint, bessPowerSetpoint, priorityMode, formValue.passcode);
    }
  }

  private _doSubmit(
    pvPowerSetpoint: number | null,
    bessPowerSetpoint: number | null,
    priorityMode: PriorityModeType | null,
    passcode: string,
  ): void {
    const result: PowerScheduleManualAdjustment_FormValue = {
      passcode,
      pvPowerSetpoint: pvPowerSetpoint !== null ? { newValue: pvPowerSetpoint } : null,
      bessPowerSetpoint: bessPowerSetpoint !== null ? { newValue: bessPowerSetpoint } : null,
      priorityMode: priorityMode !== null ? { newValue: priorityMode } : null,
    };

    this.submitForm.next(result);
  }

  formatPower(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '—';
    }
    return `${value > 0 ? '+' : ''}${value} kW`;
  }

  getOriginalPvPowerAdjusted(): number | null | undefined {
    if (this.originalPvPower === null || this.originalPvPower === undefined) {
      return this.originalPvPower;
    }
    const coefficient = this.pvScheduleAdjustmentCoefficient || 1;
    if (coefficient === 1) {
      return this.originalPvPower;
    }
    return Math.round(this.originalPvPower * coefficient * 1000) / 1000;
  }

  getOriginalBessPowerAdjusted(): number | null | undefined {
    if (this.originalBessPower === null || this.originalBessPower === undefined) {
      return this.originalBessPower;
    }
    const coefficient = this.bessScheduleAdjustmentCoefficient || 1;
    if (coefficient === 1) {
      return this.originalBessPower;
    }
    return Math.round(this.originalBessPower * coefficient * 1000) / 1000;
  }

  shouldShowOriginalPvPowerAdjusted(): boolean {
    const adjusted = this.getOriginalPvPowerAdjusted();
    return (
      adjusted !== null &&
      adjusted !== undefined &&
      this.originalPvPower !== null &&
      this.originalPvPower !== undefined &&
      adjusted !== this.originalPvPower
    );
  }

  shouldShowOriginalBessPowerAdjusted(): boolean {
    const adjusted = this.getOriginalBessPowerAdjusted();
    return (
      adjusted !== null &&
      adjusted !== undefined &&
      this.originalBessPower !== null &&
      this.originalBessPower !== undefined &&
      adjusted !== this.originalBessPower
    );
  }

  /**
   * Calculate energy equivalent for PV power setpoint
   * Energy (kWh) = Power (kW) * intervalHours
   */
  private _calculatePvEnergyEquivalent(powerValue_kW: number | null): number | null {
    if (powerValue_kW === null || !this.data?.interval) {
      return null;
    }

    const intervalHours =
      (this.data.interval.end.getTime() - this.data.interval.start.getTime()) / (1000 * 60 * 60);
    const energyKWh = powerValue_kW * intervalHours;

    return energyKWh > 0 ? energyKWh : null;
  }

  /**
   * Calculate energy equivalent for BESS power setpoint
   * Energy (kWh) = Power (kW) * intervalHours
   */
  private _calculateBessEnergyEquivalent(powerValue_kW: number | null): number | null {
    if (powerValue_kW === null || !this.data?.interval) {
      return null;
    }

    const intervalHours =
      (this.data.interval.end.getTime() - this.data.interval.start.getTime()) / (1000 * 60 * 60);
    const energyKWh = Math.abs(powerValue_kW) * intervalHours;

    return energyKWh > 0 ? energyKWh : null;
  }

  private _getPowerValidators(isPv: boolean): ValidatorFn[] {
    const numberValidator = (control: AbstractControl) => {
      if (control.value === undefined || control.value === null || isNaN(Number(control.value))) {
        return {
          invalidNumber: true,
        };
      }

      return null;
    };

    return [Validators.required, numberValidator, ...(isPv ? [Validators.min(0)] : [])];
  }

  /**
   * Priority-mode dependent setpoint restrictions.
   *
   * IMPORTANT:
   * - PV/BESS setpoint can be "NL" (no limit) which is represented by `null`
   * - In PV/BESS modals, the other setpoint is not edited, so we validate against the current effective setpoint:
   *   - custom if present, otherwise original schedule value
   */
  private _priorityModeRestrictionsValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const parent =
        control.parent as FormGroup<PowerScheduleManualAdjustment_FormInterface> | null;
      if (!parent) {
        return null;
      }

      const selectedMode: PriorityModeType =
        (control.value as PriorityModeType | null) ??
        (PriorityMode.DEFAULT as unknown as PriorityModeType);

      const { pvPowerSetpoint, bessPowerSetpoint } =
        this._getEffectiveSetpointsForValidation(parent);

      // If inputs are invalid numbers already, don't add extra restriction noise
      if (
        this.type === 'pv' &&
        parent.controls.pvPowerOption.value === 'set' &&
        parent.controls.pvPowerValue.invalid
      ) {
        return null;
      }
      if (
        this.type === 'bess' &&
        parent.controls.bessPowerOption.value === 'set' &&
        parent.controls.bessPowerValue.invalid
      ) {
        return null;
      }

      const violations = this._getPriorityModeRestrictionViolations(
        selectedMode,
        pvPowerSetpoint,
        bessPowerSetpoint,
      );

      return violations.length > 0 ? { priorityModeRestrictions: { violations } } : null;
    };
  }

  private _getEffectiveSetpointsForValidation(
    form: FormGroup<PowerScheduleManualAdjustment_FormInterface>,
  ): { pvPowerSetpoint: number | null; bessPowerSetpoint: number | null } {
    if (!this.data) {
      return { pvPowerSetpoint: null, bessPowerSetpoint: null };
    }

    const currentPv = this.data?.pvPowerSetpointCustom
      ? this.data.pvPowerSetpointCustom.value
      : this.data.pvPowerSetpoint.value;
    const currentBess = this.data?.bessPowerSetpointCustom
      ? this.data.bessPowerSetpointCustom.value
      : this.data.bessPowerSetpoint.value;

    let pvPowerSetpoint: number | null = currentPv;
    let bessPowerSetpoint: number | null = currentBess;

    if (this.type === 'pv') {
      const option = form.controls.pvPowerOption.value;
      if (option === 'set') {
        pvPowerSetpoint =
          form.controls.pvPowerValue.value !== null
            ? Number(form.controls.pvPowerValue.value)
            : null;
      } else if (option === 'reset') {
        pvPowerSetpoint = this.data.pvPowerSetpoint.value;
      } else {
        // 'revoke' (NL)
        pvPowerSetpoint = null;
      }
    }

    if (this.type === 'bess') {
      const option = form.controls.bessPowerOption.value;
      if (option === 'set') {
        bessPowerSetpoint =
          form.controls.bessPowerValue.value !== null
            ? Number(form.controls.bessPowerValue.value)
            : null;
      } else if (option === 'reset') {
        bessPowerSetpoint = this.data.bessPowerSetpoint.value;
      } else {
        // 'revoke' (NL) - not currently available in UI, but handled defensively
        bessPowerSetpoint = null;
      }
    }

    return { pvPowerSetpoint, bessPowerSetpoint };
  }

  private _getPriorityModeRestrictionViolations(
    mode: PriorityModeType,
    pvPowerSetpoint: number | null,
    bessPowerSetpoint: number | null,
  ): string[] {
    // Helper flags
    const pvIsNL = pvPowerSetpoint === null;
    const bessIsNL = bessPowerSetpoint === null;

    const violations: string[] = [];

    const addIf = (condition: boolean, restrictionText: string) => {
      if (condition) {
        violations.push(restrictionText);
      }
    };

    switch (mode) {
      case 'DEFAULT':
        addIf(bessIsNL, 'BESS setpoint cannot be NL.');
        break;

      case 'CHARGE_BESS_FIRST':
        addIf(bessIsNL, 'BESS setpoint cannot be NL.');
        addIf(!bessIsNL && bessPowerSetpoint >= 0, 'BESS setpoint must be negative.');
        break;

      case 'GRID_EXTRA':
        addIf(pvIsNL, 'PV setpoint cannot be NL.');
        addIf(!bessIsNL && bessPowerSetpoint >= 0, 'BESS setpoint must be negative or NL.');
        break;

      case 'GRID_STRICT':
        addIf(pvIsNL, 'PV setpoint cannot be NL.');
        addIf(!pvIsNL && pvPowerSetpoint <= 0, 'PV setpoint must be positive.');
        addIf(!bessIsNL && bessPowerSetpoint <= 0, 'BESS setpoint must be positive or NL.');
        break;

      case 'REGULATION':
        addIf(pvPowerSetpoint !== 0, 'PV setpoint must equal zero.');
        addIf(bessIsNL, 'BESS setpoint cannot be NL.');
        addIf(!bessIsNL && bessPowerSetpoint >= 0, 'BESS setpoint must be negative.');
        break;

      default:
        break;
    }

    return violations;
  }

  getPriorityModeRestrictionViolations(): string[] {
    const err = this.form?.controls.priorityMode.getError('priorityModeRestrictions') as
      | { violations: string[] }
      | undefined;
    return err?.violations ?? [];
  }

  /**
   * Whether BESS setpoint is allowed to be NL (no limit) for the currently selected priority mode.
   *
   * Based on `priority-modes.dto.ts`:
   * - GRID_EXTRA explicitly allows: "[BESS setpoint < 0] OR [BESS setpoint = NL]"
   * - GRID_STRICT does not prohibit NL (only forbids BESS = 0)
   */
  canSetBessToNl(): boolean {
    const selected: PriorityModeType | null = this.form?.controls.priorityMode.value ?? null;
    const effective: PriorityModeType =
      selected ?? (this.data?.priorityMode as PriorityModeType) ?? ('DEFAULT' as PriorityModeType);

    return effective === 'GRID_EXTRA' || effective === 'GRID_STRICT';
  }
}
