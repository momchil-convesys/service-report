import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { BehaviorSubject, Observable, Subject, of, take, takeUntil } from 'rxjs';
import { DataRequest } from '../../../../constants';
import { Plant } from '../../../../data/models';
import { ActivePowerLimitSchedule } from '../../../power-limit-schedule/_data/active-schedule';
import { InverterControlRequestType } from '../../_data/inverter-control.model';
import { InverterControlService } from '../../_data/inverter-control.service';
import { ExtendedDevice } from '../models';
import { InverterControlFormValue } from './inverter-control-form/inverter-control-form.component';

export interface InverterControlModalComponentData {
  plant: Plant | undefined;
  devices: ExtendedDevice[];
  requestType: InverterControlRequestType;
}

export interface InverterControlModalComponentResult {
  requestSent: boolean;
}

@Component({
  selector: 'app-inverter-control-modal',
  templateUrl: './inverter-control-modal.component.html',
  styleUrls: ['./inverter-control-modal.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class InverterControlModalComponent implements OnDestroy {
  readonly modal: NzModalRef<any, InverterControlModalComponentResult>;
  readonly data: InverterControlModalComponentData;

  loadingMessage$ = new BehaviorSubject<string | null>(null);
  errorMessage$ = new BehaviorSubject<{ title: string; description: string } | null>(null);
  successResult$ = new BehaviorSubject<boolean>(false);

  activePowerLimitSchedule$: Observable<ActivePowerLimitSchedule | null>;

  private _destroy$ = new Subject<void>();

  constructor(private dataService: InverterControlService) {
    this.modal = inject(NzModalRef);
    this.data = inject(NZ_MODAL_DATA);

    if (this.data.plant) {
      this.activePowerLimitSchedule$ =
        this.data.plant.activePowerLimitSchedule$.pipe(takeUntilDestroyed());
    } else {
      this.activePowerLimitSchedule$ = of(null);
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  onCancel(): void {
    const result: InverterControlModalComponentResult = { requestSent: false };

    this.modal.destroy(result);
  }

  onFinish(): void {
    const result: InverterControlModalComponentResult = { requestSent: true };

    this.modal.destroy(result);
  }

  onSubmit(value: InverterControlFormValue) {
    this.successResult$.next(false);
    this.errorMessage$.next(null);
    this.loadingMessage$.next($localize`Sending request`);

    const request$: Observable<DataRequest<any>> = this.dataService
      .sendInverterControlRequest(
        value.requestType,
        value.devices.map((device) => device.id),
        value.powerLimitValue,
        value.passcode,
      )
      .pipe(take(2), takeUntil(this._destroy$));

    request$.subscribe((res) => {
      if (res.isLoading) {
        return;
      }

      this.loadingMessage$.next(null);

      if (res.error) {
        let description = res.error.message;
        if (res.error instanceof HttpErrorResponse) {
          description = res.error?.error?.errorMessage || res.error.statusText;
        }

        this.errorMessage$.next({
          title: $localize`Failed to complete request!`,
          description,
        });

        console.error('Failed to complete request! Error: ', res.error);
      } else {
        this.successResult$.next(true);
      }
    });
  }
}
