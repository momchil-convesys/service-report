import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzResultModule } from 'ng-zorro-antd/result';
import { BehaviorSubject, Observable, Subject, take, takeUntil } from 'rxjs';
import { CustomError, DataRequest } from '../../../../constants';
import { Plant } from '../../../../data/models';
import { PlsManualAdjustmentsDataService } from '../_data/pls-manual-adjustments-data.service';
import {
  PlsManualAdjustment_FormValue,
  PlsManualAdjustmentFormComponent,
} from '../pls-manual-adjustment-form/pls-manual-adjustment-form.component';
import { TableRow } from '../pls-manual-adjustment-table/_data-helpers';

export interface PlsManualAdjustment_ModalComponentData {
  data: TableRow;
  plant: Plant | undefined;
}

export interface PlsManualAdjustment_ModalComponentResult {
  requestSent: boolean;
}

@Component({
  selector: 'app-pls-manual-adjustment-modal',
  imports: [CommonModule, NzResultModule, NzButtonModule, PlsManualAdjustmentFormComponent],
  providers: [PlsManualAdjustmentsDataService],
  templateUrl: './pls-manual-adjustment-modal.component.html',
  styleUrl: './pls-manual-adjustment-modal.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlsManualAdjustmentModalComponent implements OnDestroy {
  readonly modal: NzModalRef<any, PlsManualAdjustment_ModalComponentResult>;
  readonly data: PlsManualAdjustment_ModalComponentData;

  loadingMessage$ = new BehaviorSubject<string | null>(null);
  customError$ = new BehaviorSubject<CustomError | null>(null);
  successResult$ = new BehaviorSubject<boolean>(false);

  private _destroy$ = new Subject<void>();

  constructor(private _api: PlsManualAdjustmentsDataService) {
    this.modal = inject(NzModalRef);
    this.data = inject(NZ_MODAL_DATA);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  onCancel(): void {
    const result: PlsManualAdjustment_ModalComponentResult = { requestSent: false };

    this.modal.destroy(result);
  }

  onFinish(): void {
    const result: PlsManualAdjustment_ModalComponentResult = { requestSent: true };

    this.modal.destroy(result);
  }

  onSubmit(value: PlsManualAdjustment_FormValue) {
    this.successResult$.next(false);
    this.customError$.next(null);
    this.loadingMessage$.next($localize`Sending request`);

    const request$: Observable<DataRequest<any>> = this._api
      .adjustScheduleInterval(
        this.data.plant,
        this.data.data.interval,
        value.powerLimitValue_MWh,
        value.passcode,
      )
      .pipe(take(2), takeUntil(this._destroy$));

    request$.subscribe((res) => {
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
    });
  }
}
