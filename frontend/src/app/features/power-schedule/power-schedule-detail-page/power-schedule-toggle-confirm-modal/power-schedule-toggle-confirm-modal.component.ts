import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { BehaviorSubject, Subscription } from 'rxjs';
import { CustomError } from '../../../../constants';
import { CustomAlertComponent } from '../../../../shared/custom-alert/custom-alert.component';
import { PowerScheduleApiService } from '../../_data/api.service';
import { PowerSchedule } from '../../_data/models';
import { PowerScheduleStatus } from '../../_data/power-schedule.dto';
import {
  PowerScheduleToggleConfirmFormComponent,
  PowerScheduleToggleConfirmFormValue,
} from '../power-schedule-toggle-confirm-form/power-schedule-toggle-confirm-form.component';

export interface PowerScheduleToggleConfirmModalComponent_Data {
  schedule: PowerSchedule;
  action: 'enable' | 'disable';
}

export interface PowerScheduleToggleConfirmModalComponent_Result {
  updatedSchedule: PowerSchedule | undefined;
}

@Component({
  selector: 'app-power-schedule-toggle-confirm-modal',
  imports: [
    NzResultModule,
    AsyncPipe,
    PowerScheduleToggleConfirmFormComponent,
    NzButtonComponent,
    NzSpinModule,
    NzAlertModule,
    CustomAlertComponent,
  ],
  templateUrl: './power-schedule-toggle-confirm-modal.component.html',
  styleUrl: './power-schedule-toggle-confirm-modal.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PowerScheduleApiService],
})
export class PowerScheduleToggleConfirmModalComponent {
  readonly modal: NzModalRef<any, PowerScheduleToggleConfirmModalComponent_Result> =
    inject(NzModalRef);
  readonly data: PowerScheduleToggleConfirmModalComponent_Data = inject(NZ_MODAL_DATA);

  loadingMessage$ = new BehaviorSubject<string | null>(null);
  customError$ = new BehaviorSubject<CustomError | null>(null);
  successResultData$ = new BehaviorSubject<PowerSchedule | undefined>(undefined);

  preCheckError: { title: string; description: string } | null = null;

  requestSubscription: Subscription | undefined;

  constructor(private dataService: PowerScheduleApiService) {
    // No pre-check needed for power schedule (unlike PLS which checks for power limit)
  }

  onCancel(): void {
    const result: PowerScheduleToggleConfirmModalComponent_Result = { updatedSchedule: undefined };

    this.modal.destroy(result);
  }

  onFinish(updatedSchedule: PowerSchedule): void {
    const result: PowerScheduleToggleConfirmModalComponent_Result = { updatedSchedule };

    this.modal.destroy(result);
  }

  onSubmit(formValue: PowerScheduleToggleConfirmFormValue) {
    let status: PowerScheduleStatus | null = null;

    if (this.data.action === 'enable') {
      status = 'enabled';
    } else if (this.data.action === 'disable') {
      status = 'disabled';
    }

    if (!status) {
      this.customError$.next({
        title: $localize`Failed to complete request!`,
        error: $localize`Web application error: ` + $localize`Invalid action specified!`,
      });

      return;
    }

    this.successResultData$.next(undefined);
    this.customError$.next(null);
    this.loadingMessage$.next($localize`Sending request`);

    if (this.requestSubscription) {
      this.requestSubscription.unsubscribe();
    }

    this.requestSubscription = this.dataService
      .patchPowerSchedule(this.data.schedule.plantId, this.data.schedule.id, {
        status,
        passcode: formValue.passcode,
      })
      .subscribe((res) => {
        if (!res.isLoading) {
          this.loadingMessage$.next(null);
        }

        if (res.error) {
          this.customError$.next({
            title: $localize`Failed to complete request!`,
            error: res.error,
          });

          console.error('Failed to complete request! Error: ', res.error);
        } else {
          this.successResultData$.next(res.data);
          this.customError$.next(null);
        }
      });
  }
}
