import { AsyncPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { BehaviorSubject, Subscription } from 'rxjs';
import { DataRequest } from '../../../constants';
import { SystemSetupType } from '../constants';
import {
  SystemControlToggleConfirmFormComponent,
  SystemControlToggleConfirmFormValue,
} from '../system-control-toggle-confirm-form/system-control-toggle-confirm-form.component';
import { SystemControlService } from '../system-control.service';

export interface SystemControlToggleConfirmModalComponent_Data {
  plantId: string;
  thisSetup: SystemSetupType;
  setupInControl: SystemSetupType;
  action: 'take' | 'release';
}

export interface SystemControlToggleConfirmModalComponent_Result {
  updatedSystemSetup: any | undefined;
}

@Component({
  selector: 'app-system-control-toggle-confirm-modal',
  imports: [
    NzResultModule,
    AsyncPipe,
    SystemControlToggleConfirmFormComponent,
    NzButtonComponent,
    NzSpinModule,
    NzAlertModule,
  ],
  templateUrl: './system-control-toggle-confirm-modal.component.html',
  styleUrl: './system-control-toggle-confirm-modal.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SystemControlService],
})
export class SystemControlToggleConfirmModalComponent {
  readonly modal: NzModalRef<any, SystemControlToggleConfirmModalComponent_Result> =
    inject(NzModalRef);
  readonly data: SystemControlToggleConfirmModalComponent_Data = inject(NZ_MODAL_DATA);

  loadingMessage$ = new BehaviorSubject<string | null>(null);
  errorMessage$ = new BehaviorSubject<{ title: string; description: string } | null>(null);
  successResultData$ = new BehaviorSubject<any | undefined>(undefined);

  requestSubscription: Subscription | undefined;

  constructor(private systemControlService: SystemControlService) {}

  onCancel(): void {
    const result: SystemControlToggleConfirmModalComponent_Result = {
      updatedSystemSetup: undefined,
    };

    this.modal.destroy(result);
  }

  onFinish(updatedSystemSetup: any): void {
    const result: SystemControlToggleConfirmModalComponent_Result = { updatedSystemSetup };

    this.modal.destroy(result);
  }

  onSubmit(formValue: SystemControlToggleConfirmFormValue) {
    this.successResultData$.next(undefined);
    this.errorMessage$.next(null);
    this.loadingMessage$.next($localize`Sending request`);

    if (this.requestSubscription) {
      this.requestSubscription.unsubscribe();
    }

    // Call the system control service
    let serviceCall;
    if (this.data.action === 'take') {
      serviceCall = this.systemControlService.takeControl(
        this.data.plantId,
        this.data.thisSetup,
        formValue.passcode,
      );
    } else {
      serviceCall = this.systemControlService.releaseControl(
        this.data.plantId,
        this.data.thisSetup,
        formValue.passcode,
      );
    }

    this.requestSubscription = serviceCall.subscribe((res: DataRequest<any>) => {
      if (!res.isLoading) {
        this.loadingMessage$.next(null);
      }

      if (res.error) {
        let description = res.error.message;
        if (res.error instanceof HttpErrorResponse) {
          description = res.error?.error?.errorMessage || res.error.statusText;
        }

        this.errorMessage$.next({
          title: $localize`Failed to complete request!`,
          description,
        });
      } else {
        this.successResultData$.next(res.data);
        this.errorMessage$.next(null);
      }
    });
  }
}
