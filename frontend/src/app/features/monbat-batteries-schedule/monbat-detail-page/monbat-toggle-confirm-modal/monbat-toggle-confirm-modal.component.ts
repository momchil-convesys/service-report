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
import { MonbatApiService } from '../../_data/api.service';
import { MonbatPowerLimitScheduleStatus } from '../../_data/constants';
import { MonbatSchedule } from '../../_data/models';
import {
  MonbatToggleConfirmFormComponent,
  MonbatToggleConfirmFormValue,
} from '../monbat-toggle-confirm-form/monbat-toggle-confirm-form.component';

export interface MonbatToggleConfirmModalComponent_Data {
  schedule: MonbatSchedule;
  action: 'enable' | 'disable';
}

export interface MonbatToggleConfirmModalComponent_Result {
  updatedSchedule: MonbatSchedule | undefined;
}

@Component({
  selector: 'app-monbat-toggle-confirm-modal',
  imports: [
    NzResultModule,
    AsyncPipe,
    NzButtonComponent,
    NzSpinModule,
    NzAlertModule,
    MonbatToggleConfirmFormComponent,
    CustomAlertComponent,
  ],
  templateUrl: './monbat-toggle-confirm-modal.component.html',
  styleUrl: './monbat-toggle-confirm-modal.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MonbatApiService],
})
export class MonbatToggleConfirmModalComponent {
  readonly modal: NzModalRef<any, MonbatToggleConfirmModalComponent_Result> = inject(NzModalRef);
  readonly data: MonbatToggleConfirmModalComponent_Data = inject(NZ_MODAL_DATA);

  loadingMessage$ = new BehaviorSubject<string | null>(null);
  customError$ = new BehaviorSubject<CustomError | undefined>(undefined);
  successResultData$ = new BehaviorSubject<MonbatSchedule | undefined>(undefined);

  preCheckError: { title: string; description: string } | null = null;

  requestSubscription: Subscription | undefined;

  constructor(private dataService: MonbatApiService) {
    this.performPreCheck();
  }

  onCancel(): void {
    const result: MonbatToggleConfirmModalComponent_Result = { updatedSchedule: undefined };

    this.modal.destroy(result);
  }

  onFinish(updatedSchedule: MonbatSchedule): void {
    const result: MonbatToggleConfirmModalComponent_Result = { updatedSchedule };

    this.modal.destroy(result);
  }

  onSubmit(formValue: MonbatToggleConfirmFormValue) {
    let status: MonbatPowerLimitScheduleStatus | null = null;

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
    this.customError$.next(undefined);
    this.loadingMessage$.next($localize`Sending request`);

    if (this.requestSubscription) {
      this.requestSubscription.unsubscribe();
    }

    this.requestSubscription = this.dataService
      .patchPowerLimitSchedule(
        this.data.schedule.plantId,
        this.data.schedule.deviceId,
        this.data.schedule.id,
        {
          status,
          passcode: formValue.passcode,
        },
      )
      .subscribe((res) => {
        if (!res.isLoading) {
          this.loadingMessage$.next(null);
        }

        if (res.error) {
          this.customError$.next({
            title: $localize`Failed to complete request!`,
            error: res.error,
          });
        } else {
          this.successResultData$.next(res.data);
          this.customError$.next(undefined);
        }
      });
  }

  private performPreCheck() {
    /**
     * Any pre checks should be performed here.
     */
    // this.preCheckError = {
    //   title: $localize`Error! Unable to enable schedule!`,
    //   description: $localize``
    // };
  }
}
