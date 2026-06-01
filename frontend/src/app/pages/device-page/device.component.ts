import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AccessControlPermission, DataRequest, DeviceType } from '../../constants';
import { Device, Plant } from '../../data/models';
import { UsersService } from '../../data/services/users.service';
import { PageRoutingService } from '../../shared/page-routing.service';

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PageRoutingService],
  standalone: false,
})
export class DeviceComponent {
  plantRequest$: Observable<DataRequest<Plant>>;
  deviceRequest$: Observable<DataRequest<Device>>;

  showInverterControl: boolean;

  constructor(
    pageRouting: PageRoutingService,
    private usersService: UsersService,
  ) {
    this.deviceRequest$ = pageRouting.getDeviceRequestFromQueryParams().pipe(
      tap((req) => {
        if (!req.isLoading && !req.data) {
          // TODO: show specific error
          pageRouting.router.navigate(['404']);
        }
      }),
    );
    this.plantRequest$ = pageRouting.getPlantRequestFromQueryParams();

    this.showInverterControl = usersService.hasCurrentUserPermission(
      AccessControlPermission.InverterControl_Manage,
    );
  }

  isWind(device: Device | undefined): boolean {
    return device?.type === DeviceType.Wind;
  }

  isSolar(device: Device | undefined): boolean {
    return device?.type === DeviceType.Solar;
  }

  isBattery(device: Device | undefined): boolean {
    return device?.type === DeviceType.BatteryString;
  }

  showInvertersTab(plant: Plant | null | undefined): boolean {
    return (
      plant?.plantSpecificMetadata?.hasTsWithInverters === true &&
      this.usersService.hasCurrentUserPermission(AccessControlPermission.InverterMetrics_View)
    );
  }

  showFaultsTab(plant: Plant | null | undefined): boolean {
    return plant?.plantSpecificMetadata?.hasFaultsTab === true;
  }

  showMonbatScheduleTab(device: Device | null | undefined): boolean {
    /**
     * TODO: do not check against HARDCODED ids!
     */
    return device?.deviceMetadataId === '9';
  }
}
