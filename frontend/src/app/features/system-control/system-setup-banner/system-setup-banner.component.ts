import { AsyncPipe, DatePipe, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { map, Observable, ReplaySubject, Subject, switchMap, takeUntil } from 'rxjs';
import { Plant } from '../../../data/models';
import { SystemSetupType } from '../constants';
import {
  SystemControlToggleConfirmModalComponent,
  SystemControlToggleConfirmModalComponent_Data,
  SystemControlToggleConfirmModalComponent_Result,
} from '../system-control-toggle-confirm-modal/system-control-toggle-confirm-modal.component';
import { SystemControlService } from '../system-control.service';
import { SystemSetupTagComponent } from '../system-setup-tag/system-setup-tag.component';
import { SystemSetupControlResponse_DTO } from '../system-setup.dto';

@Component({
  selector: 'app-system-setup-banner',
  imports: [
    NzAlertModule,
    AsyncPipe,
    NzButtonModule,
    NzIconModule,
    SystemSetupTagComponent,
    NgClass,
    DatePipe,
  ],
  templateUrl: './system-setup-banner.component.html',
  styleUrl: './system-setup-banner.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemSetupBannerComponent {
  @Input() plant: Plant | null | undefined;

  systemSetup$: Observable<SystemSetupControlResponse_DTO | undefined> | undefined;
  systemSetupLoading$: Observable<boolean> | undefined;
  systemSetupError$: Observable<Error | undefined> | undefined;

  private _plant$ = new ReplaySubject<Plant>(1);
  private _destroy$ = new Subject<void>();

  constructor(
    private systemControlService: SystemControlService,
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
  ) {
    const request$ = this._plant$.pipe(
      switchMap((plant) => this.systemControlService.getSystemSetup(plant.id)),
      takeUntil(this._destroy$),
    );

    this.systemSetup$ = request$.pipe(map((request) => request.data));
    this.systemSetupLoading$ = request$.pipe(map((request) => request.isLoading));
    this.systemSetupError$ = request$.pipe(map((request) => request.error));
  }

  ngOnChanges() {
    if (this.plant) {
      this._plant$.next(this.plant);
    }
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  onToggleControl(
    action: 'take' | 'release',
    plantId: string,
    thisSetup: SystemSetupType,
    setupInControl: SystemSetupType,
  ) {
    let title = '';
    switch (action) {
      case 'take':
        title = $localize`Take Control`;
        break;
      case 'release':
        title = $localize`Release Control`;
        break;
      default:
        title = $localize`System Control`;
    }

    const modal = this.modal.create<
      SystemControlToggleConfirmModalComponent,
      SystemControlToggleConfirmModalComponent_Data,
      SystemControlToggleConfirmModalComponent_Result
    >({
      nzTitle: title,
      nzContent: SystemControlToggleConfirmModalComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        action,
        plantId,
        thisSetup,
        setupInControl,
      },
      nzFooter: null,
      nzBodyStyle: {
        padding: '0',
      },
    });

    modal.afterClose.subscribe((result) => {
      // TODO: refresh system setup with the result
    });
  }
}
