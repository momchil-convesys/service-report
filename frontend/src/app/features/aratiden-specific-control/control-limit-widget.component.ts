import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { BehaviorSubject, startWith, Subject, switchMap, take, takeUntil } from 'rxjs';
import { CustomError } from '../../constants';
import { markAllControlsAsDirty } from '../../helpers';
import { CustomAlertComponent } from '../../shared/custom-alert/custom-alert.component';
import { LiveDataIndicatorComponent } from '../../shared/live-data-indicator/live-data-indicator.component';
import { ValueDisplayComponent } from '../../shared/value-display/value-display.component';
import { ControlLimitApiService } from './_data/control-limit-api.service';
import { ControlLimitDTO, ControlLimitUpdateRequestDTO } from './_data/models';

interface ControlLimitForm {
  actionType: FormControl<'update' | 'reset'>;
  limitType: FormControl<'power' | 'energy' | null>;
  limitValue: FormControl<number | null>;
  usernameAutosaveHint: FormControl<string>;
  passcode: FormControl<string>;
}

const unitForType = (type: 'power' | 'energy' | null): string => {
  if (type === 'power') {
    return 'MW';
  } else if (type === 'energy') {
    return 'MWh';
  }
  return '';
};

@Component({
  selector: 'app-control-limit-widget',
  imports: [
    CommonModule,
    NzCardModule,
    NzFormModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzRadioModule,
    NzSelectModule,
    NzSpinModule,
    NzTableModule,
    NzButtonModule,
    NzAlertModule,
    ReactiveFormsModule,
    CustomAlertComponent,
    ValueDisplayComponent,
    LiveDataIndicatorComponent,
    NzResultModule,
  ],
  standalone: true,
  templateUrl: './control-limit-widget.component.html',
  styleUrls: ['./control-limit-widget.component.less'],
  encapsulation: ViewEncapsulation.None,
  providers: [ControlLimitApiService],
})
export class ControlLimitWidgetComponent implements OnInit, OnDestroy {
  @Input({ required: true }) plantId!: string;
  @Input({ required: true }) plantLimitType: 'power' | 'energy' | undefined = undefined;

  currentStateData: ControlLimitDTO | null = null;
  currentStateError: CustomError | null = null;
  currentStateLoading$ = new BehaviorSubject<boolean>(false);

  form!: FormGroup<ControlLimitForm>;

  customError$ = new BehaviorSubject<CustomError | undefined>(undefined);

  limitTypeOptions = [
    { label: `POWER (${unitForType('power')})`, value: 'power' },
    { label: `ENERGY (${unitForType('energy')})`, value: 'energy' },
  ];

  private destroy$ = new Subject<void>();
  private reloadTrigger$ = new Subject<void>();

  isSubmitting$ = new BehaviorSubject<boolean>(false);
  successResult$ = new BehaviorSubject<boolean>(false);

  constructor(private apiService: ControlLimitApiService) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadCurrentState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFinish(): void {
    this.successResult$.next(false);
  }

  private initializeForm(): void {
    this.form = new FormGroup<ControlLimitForm>({
      actionType: new FormControl<'update' | 'reset'>('update', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      limitType: new FormControl<'power' | 'energy' | null>('power', {
        nonNullable: false,
        validators: [Validators.required],
      }),
      limitValue: new FormControl<number | null>(null, {
        nonNullable: false,
        validators: [Validators.required, Validators.min(0)],
      }),
      passcode: new FormControl('', { validators: Validators.required, nonNullable: true }),
      usernameAutosaveHint: new FormControl('Master Control Password', { nonNullable: true }),
    });

    // Update validation based on action type
    this.form.get('actionType')?.valueChanges.subscribe((actionType) => {
      const limitTypeControl = this.form.get('limitType');
      const limitValueControl = this.form.get('limitValue');

      if (actionType === 'update') {
        limitTypeControl?.setValidators([Validators.required]);
        limitValueControl?.setValidators([Validators.required, Validators.min(0)]);
        // Set limitType to 'power' when switching to update mode
        limitTypeControl?.setValue('power');
      } else {
        limitTypeControl?.clearValidators();
        limitValueControl?.clearValidators();
        // Clear values when switching to reset
        limitTypeControl?.setValue(null);
        limitValueControl?.setValue(null);
      }

      limitTypeControl?.updateValueAndValidity();
      limitValueControl?.updateValueAndValidity();
    });
  }

  private loadCurrentState(): void {
    const plantId = this.plantId;

    this.reloadTrigger$
      .pipe(
        startWith(undefined), // Trigger initial load
        switchMap(() => {
          this.currentStateLoading$.next(true);
          this.currentStateError = null;
          return this.apiService.fetchCurrentControlLimit(plantId).pipe(takeUntil(this.destroy$));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((request) => {
        if (request.data) {
          this.currentStateData = request.data;
        }

        if (request.error) {
          this.currentStateError = {
            title: $localize`Failed to load data!`,
            error: request.error,
          };
        }

        this.currentStateLoading$.next(request.isLoading);
      });
  }

  onSubmit(): void {
    this.form.updateValueAndValidity();

    markAllControlsAsDirty(Object.values(this.form.controls));

    if (!this.form.valid) {
      return;
    }

    const formValue = this.form.getRawValue();

    this.isSubmitting$.next(true);
    this.successResult$.next(false);
    this.customError$.next(undefined);

    const isUpdateAction = formValue.actionType === 'update';
    const request: ControlLimitUpdateRequestDTO = {
      plantId: this.plantId,
      limitType: isUpdateAction ? formValue.limitType! : null,
      limitValue: isUpdateAction ? formValue.limitValue! : null,
      passcode: formValue.passcode!,
    };

    this.apiService
      .updateControlLimit(request)
      .pipe(take(2), takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.isLoading) {
            return;
          }

          this.isSubmitting$.next(false);

          if (response.data) {
            this.currentStateData = response.data;
          }

          if (response.error) {
            this.customError$.next({
              title: $localize`Failed to complete request!`,
              error: response.error,
            });
          } else {
            this.successResult$.next(true);
          }
        },
        error: (error) => {
          this.isSubmitting$.next(false);
          this.successResult$.next(false);
          this.customError$.next({
            title: $localize`Failed to complete request!`,
            error: error,
          });
        },
      });
  }

  getUnitForType(type: 'power' | 'energy' | null): string {
    return unitForType(type);
  }

  isFormValid(): boolean {
    const actionType = this.form.get('actionType')?.value;
    const isUpdateAction = actionType === 'update';

    const actionTypeValid = this.form.get('actionType')?.valid ?? false;
    const limitTypeValid = this.form.get('limitType')?.valid ?? false;
    const limitValueValid = this.form.get('limitValue')?.valid ?? false;
    const passcodeValid = this.form.get('passcode')?.valid ?? false;

    return (
      actionTypeValid && passcodeValid && (!isUpdateAction || (limitTypeValid && limitValueValid))
    );
  }
}
