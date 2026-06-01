import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { BehaviorSubject, Subscription } from 'rxjs';
import { CustomError, PowerLimitScheduleStatus } from '../../../../constants';
import { Device, Plant } from '../../../../data/models';
import { PlantsService } from '../../../../data/services/plants.service';
import { CustomAlertComponent } from '../../../../shared/custom-alert/custom-alert.component';
import { PowerLimitScheduleApiService } from '../../_data/api.service';
import { PowerLimitSchedule } from '../../_data/models';
import {
  PlsToggleConfirmFormComponent,
  PlsToggleConfirmFormValue,
} from '../pls-toggle-confirm-form/pls-toggle-confirm-form.component';

export interface PlsToggleConfirmModalComponent_Data {
  schedule: PowerLimitSchedule;
  action: 'enable' | 'disable';
}

export interface PlsToggleConfirmModalComponent_Result {
  updatedSchedule: PowerLimitSchedule | undefined;
}

@Component({
  selector: 'app-pls-toggle-confirm-modal',
  imports: [
    NzResultModule,
    AsyncPipe,
    PlsToggleConfirmFormComponent,
    NzButtonComponent,
    NzSpinModule,
    NzAlertModule,
    CustomAlertComponent,
  ],
  templateUrl: './pls-toggle-confirm-modal.component.html',
  styleUrl: './pls-toggle-confirm-modal.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PowerLimitScheduleApiService],
})
export class PlsToggleConfirmModalComponent {
  readonly modal: NzModalRef<any, PlsToggleConfirmModalComponent_Result> = inject(NzModalRef);
  readonly data: PlsToggleConfirmModalComponent_Data = inject(NZ_MODAL_DATA);

  loadingMessage$ = new BehaviorSubject<string | null>(null);
  customError$ = new BehaviorSubject<CustomError | null>(null);
  successResultData$ = new BehaviorSubject<PowerLimitSchedule | undefined>(undefined);

  preCheckError: { title: string; description: string } | null = null;

  requestSubscription: Subscription | undefined;

  constructor(
    private dataService: PowerLimitScheduleApiService,
    private plantsService: PlantsService,
  ) {
    // Prevent enabling schedule if power limit is applied via inverter control panel
    this.performPreCheck();
  }

  onCancel(): void {
    const result: PlsToggleConfirmModalComponent_Result = { updatedSchedule: undefined };

    this.modal.destroy(result);
  }

  onFinish(updatedSchedule: PowerLimitSchedule): void {
    const result: PlsToggleConfirmModalComponent_Result = { updatedSchedule };

    this.modal.destroy(result);
  }

  onSubmit(formValue: PlsToggleConfirmFormValue) {
    let status: PowerLimitScheduleStatus | null = null;

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
      .patchPowerLimitSchedule(this.data.schedule.plantId, this.data.schedule.id, {
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

  private performPreCheck() {
    if (this.data.action !== 'enable') {
      return;
    }

    const plant: Plant | undefined = this.plantsService.getCachedPlantById(
      this.data.schedule.plantId,
    );

    if (!plant) {
      return;
    }

    const devicesWithPowerLimit: Device[] = plant.devices.filter((device) =>
      device.powerLimitSubject.getValue(),
    );

    if (devicesWithPowerLimit.length > 0) {
      this.preCheckError = {
        title: $localize`Error! Unable to enable schedule!`,
        description: $localize`Power limit is already applied to some of the devices. Please revoke individually applied power limit from Inverter Control Panel.`,
      };
    }
  }
}
