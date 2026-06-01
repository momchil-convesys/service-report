import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { Device } from '../../../data/models';
import { PlantsService } from '../../../data/services/plants.service';
import { DeviceLinkModule } from '../../../shared/device-link/device-link.module';
import { RelativeTimestampComponent } from '../../../shared/relative-timestamp/relative-timestamp.component';
import { ErrorStacksLiveDataService } from '../_data/data-live.service';
import { ErrorStack } from '../_data/error-stack.model';

interface NotificationData {
  device: Device;
  errorStack: ErrorStack;
}

@Component({
  selector: 'app-global-notifications',
  imports: [
    DeviceLinkModule,
    RelativeTimestampComponent,
    NzButtonModule,
    NzIconModule,
    NzBadgeModule,
    NzTooltipModule,
    NzDrawerModule,
  ],
  providers: [],
  templateUrl: './global-notifications.component.html',
  styleUrls: ['./global-notifications.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalNotificationsComponent {
  notificationsList: NotificationData[] = [];

  drawerVisible = false;

  constructor(
    private router: Router,
    dataService: ErrorStacksLiveDataService,
    plantsService: PlantsService,
    private cdr: ChangeDetectorRef,
  ) {
    dataService.errorStacksLiveStream$.subscribe((errorStack) => {
      // If notification is already in list
      if (
        this.notificationsList.some(
          (notification) => notification.errorStack.uniqueId === errorStack.uniqueId,
        )
      ) {
        return;
      }

      const device = plantsService.getCachedDeviceById(errorStack.deviceId);

      if (!device) {
        console.warn(
          'Failed to show notification for new error stack! Related device was not found in cache.',
        );
        return;
      }

      this.notificationsList.unshift({ device, errorStack });
      this.cdr.detectChanges();
    });
  }

  onShowErrorStack(notificationData: NotificationData) {
    const device = notificationData.device;
    const errorStack = notificationData.errorStack;

    const stackUrl = `/home/${device.plantId}/devices/${device.id}/faults/error-stacks/detail/${device.id}/${errorStack.id}`;

    void this.router.navigateByUrl(stackUrl);

    this.onClearNotification(notificationData);
    this.hideDrawer();
  }

  onClearNotification(notificationData: NotificationData) {
    this.notificationsList = this.notificationsList.filter(
      (notification) => notification.errorStack.uniqueId !== notificationData.errorStack.uniqueId,
    );
    this.cdr.detectChanges();
  }

  onClearNotifications() {
    this.notificationsList = [];
    this.cdr.detectChanges();
  }

  onClickNotificationsButton() {
    this.showDrawer();
  }

  showDrawer(): void {
    this.drawerVisible = true;
    this.cdr.detectChanges();
  }

  hideDrawer(): void {
    this.drawerVisible = false;
    this.cdr.detectChanges();
  }
}
