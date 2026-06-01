import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { Observable, map, of, shareReplay, switchMap } from 'rxjs';
import { CurrentFaults } from '../../constants';
import { Device } from '../../data/models';
import { DeviceCurrentErrorsModule } from '../device-current-errors/device-current-errors.module';
import { PageRoutingService } from '../page-routing.service';

interface ExtendedCurrentFaults extends CurrentFaults {
  device: Device;
}

@Component({
  selector: 'app-device-current-errors-widget',
  imports: [
    CommonModule,
    NzCardModule,
    NzTooltipModule,
    NzEmptyModule,
    NzIconModule,
    RouterModule,
    DeviceCurrentErrorsModule,
  ],
  templateUrl: './device-current-errors-widget.component.html',
  styleUrls: ['./device-current-errors-widget.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PageRoutingService],
})
export class DeviceCurrentErrorsWidgetComponent {
  faultsForDevice$: Observable<ExtendedCurrentFaults | undefined> = of(undefined);

  constructor(pageRouting: PageRoutingService) {
    this.faultsForDevice$ = pageRouting.getDeviceFromQueryParams().pipe(
      switchMap((device) =>
        device.currentFaultsSubject.pipe(
          map((currentFaults) => {
            if (!currentFaults) {
              return undefined;
            }

            const result: ExtendedCurrentFaults = {
              device,
              errorStackId: currentFaults.errorStackId,
              values: currentFaults.values.map((faultData) => ({
                faultId: faultData.faultId,
                errorStackValue: faultData.errorStackValue,
              })),
            };

            return result;
          }),
        ),
      ),
      shareReplay(1),
    );
  }

  getRouteForStackId(currentFaults: ExtendedCurrentFaults): string {
    return `/home/${currentFaults.device.plantId}/devices/${currentFaults.device.id}/faults/error-stacks/detail/${currentFaults.device.id}/${currentFaults.errorStackId}`;
  }
}
