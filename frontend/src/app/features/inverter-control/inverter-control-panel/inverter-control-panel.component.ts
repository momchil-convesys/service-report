import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Observable, combineLatest, filter, map } from 'rxjs';
import { DeviceMetadata, Plant } from '../../../data/models';
import { DeviceMetadataService } from '../../../data/services/device-metadata.service';
import { PageRoutingService } from '../../../shared/page-routing.service';
import { InverterControlRequestType } from '../_data/inverter-control.model';
import { InverterControlService } from '../_data/inverter-control.service';
import {
  InverterControlModalComponent,
  InverterControlModalComponentData,
  InverterControlModalComponentResult,
} from './inverter-control-modal/inverter-control-modal.component';
import { ExtendedDevice } from './models';

@Component({
  selector: 'app-inverter-control-panel',
  templateUrl: './inverter-control-panel.component.html',
  styleUrls: ['./inverter-control-panel.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PageRoutingService],
  standalone: false,
})
export class InverterControlPanelComponent {
  devices$: Observable<ExtendedDevice[]>;
  plant$: Observable<Plant>;

  plant: Plant | undefined;

  constructor(
    pageRouting: PageRoutingService,
    private dataService: InverterControlService,
    private deviceMetadataService: DeviceMetadataService,
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
  ) {
    this.devices$ = combineLatest([
      pageRouting.getRelatedDevicesFromQueryParams(),
      this.deviceMetadataService.getDeviceMetadataList().pipe(
        filter((req) => req.isLoading === false),
        map((req) => req.data || []),
      ),
    ]).pipe(
      map(([devices, metadata]) =>
        devices.map((device) => {
          const deviceMetadata: DeviceMetadata | undefined = metadata.find(
            (x) => x.id === device.deviceMetadataId,
          );

          const extendedDevice: ExtendedDevice = {
            ...device,
            powerLimitSettingMin: deviceMetadata?.deviceLimits?.powerLimitSettingMin,
            powerLimitSettingMax: deviceMetadata?.deviceLimits?.powerLimitSettingMax,
          };

          return extendedDevice;
        }),
      ),
    );
    this.plant$ = pageRouting.getPlantFromQueryParams();

    this.plant$.pipe(takeUntilDestroyed()).subscribe((plant) => (this.plant = plant));
  }

  onRequest(
    requestType: InverterControlRequestType,
    devices: ExtendedDevice[],
    tplTitle: TemplateRef<any>,
  ) {
    const modal = this.modal.create<
      InverterControlModalComponent,
      InverterControlModalComponentData,
      InverterControlModalComponentResult
    >({
      nzTitle: tplTitle,
      nzContent: InverterControlModalComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzData: {
        plant: this.plant,
        devices,
        requestType,
      },
      nzFooter: null,
      nzBodyStyle: {
        padding: '0',
      },
    });

    // const instance = modal.getContentComponent();
    // modal.afterOpen.subscribe(() => console.log('HERE: [afterOpen] emitted!'));

    modal.afterClose.subscribe((result) => {
      if (result?.requestSent) {
        this.dataService.shouldUpdateHistoryList$.next(true);
      }
    });
  }
}
