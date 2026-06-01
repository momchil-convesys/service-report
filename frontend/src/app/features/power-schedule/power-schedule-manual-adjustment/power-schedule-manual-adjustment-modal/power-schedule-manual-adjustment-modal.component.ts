import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzResultModule } from 'ng-zorro-antd/result';
import { BehaviorSubject, Observable, Subject, take, takeUntil } from 'rxjs';
import { CustomError, DataRequest } from '../../../../constants';
import { Plant } from '../../../../data/models';
import { PriorityModeType } from '../_data/manual-adjustments.dto';
import { PowerScheduleManualAdjustmentsDataService } from '../_data/manual-adjustments.service';
import {
  PowerScheduleManualAdjustment_FormValue,
  PowerScheduleManualAdjustmentFormComponent,
} from '../power-schedule-manual-adjustment-form/power-schedule-manual-adjustment-form.component';

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

export interface PowerScheduleManualAdjustment_ModalComponentData {
  type: 'pv' | 'bess' | 'priorityMode';
  data: TableRow;
  plant: Plant | undefined;
}

export interface PowerScheduleManualAdjustment_ModalComponentResult {
  requestSent: boolean;
}

@Component({
  selector: 'app-power-schedule-manual-adjustment-modal',
  templateUrl: './power-schedule-manual-adjustment-modal.component.html',
  styleUrl: './power-schedule-manual-adjustment-modal.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    NzResultModule,
    NzButtonModule,
    PowerScheduleManualAdjustmentFormComponent,
  ],
  providers: [PowerScheduleManualAdjustmentsDataService],
})
export class PowerScheduleManualAdjustmentModalComponent implements OnInit, OnDestroy {
  readonly modal: NzModalRef<any, PowerScheduleManualAdjustment_ModalComponentResult>;
  readonly data: PowerScheduleManualAdjustment_ModalComponentData;

  loadingMessage$ = new BehaviorSubject<string | null>(null);
  customError$ = new BehaviorSubject<CustomError | null>(null);
  successResult$ = new BehaviorSubject<boolean>(false);

  private _destroy$ = new Subject<void>();

  constructor(
    private _api: PowerScheduleManualAdjustmentsDataService,
    private cdr: ChangeDetectorRef,
  ) {
    this.modal = inject(NzModalRef);
    this.data = inject(NZ_MODAL_DATA);
  }

  ngOnInit() {
    // Trigger change detection after component initialization
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  onCancel(): void {
    const result: PowerScheduleManualAdjustment_ModalComponentResult = { requestSent: false };
    this.modal.destroy(result);
  }

  onFinish(): void {
    const result: PowerScheduleManualAdjustment_ModalComponentResult = { requestSent: true };
    this.modal.destroy(result);
  }

  onSubmit(formValue: PowerScheduleManualAdjustment_FormValue) {
    this.successResult$.next(false);
    this.customError$.next(null);
    this.loadingMessage$.next($localize`Sending request`);

    const request$: Observable<DataRequest<void>> = this._api
      .adjustScheduleInterval(this.data.type, this.data.plant, this.data.data.interval, formValue)
      .pipe(take(2), takeUntil(this._destroy$));

    request$.subscribe({
      next: (res) => {
        if (res.isLoading) {
          return;
        }
        this.loadingMessage$.next(null);
        if (res.error) {
          this.customError$.next({
            title: $localize`Failed to complete request!`,
            error: res.error,
          });
          console.error('Failed to complete request! Error: ', res.error);
        } else {
          this.successResult$.next(true);
        }
      },
      error: (error) => {
        this.loadingMessage$.next(null);
        this.customError$.next({
          title: $localize`Failed to complete request!`,
          error: error.message || 'Unknown error occurred',
        });
        console.error('Failed to complete request! Error: ', error);
      },
    });
  }
}
