import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
  Observable,
  combineLatest,
  filter,
  map,
  shareReplay,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';
import {
  AccessControlPermission,
  DataRequest,
  DeviceState,
  DeviceType,
  ExtendedDeviceState,
} from '../../constants';
import { Plant } from '../../data/models';
import { ClockService } from '../../data/services/clock.service';
import { UsersService } from '../../data/services/users.service';
import { ActivePowerLimitSchedule } from '../../features/power-limit-schedule/_data/active-schedule';
import { plsLink, utcToZonedTimeSafe } from '../../helpers';
import { PageRoutingService } from '../../shared/page-routing.service';

@Component({
  selector: 'app-plant',
  templateUrl: './plant.component.html',
  styleUrls: ['./plant.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PageRoutingService],
  standalone: false,
})
export class PlantComponent {
  plant$: Observable<Plant>;

  currentTime$: Observable<Date>;

  showGridExportSchedule: boolean;
  showInverterControl: boolean;

  deviceCountByState$: Observable<{
    [state in DeviceState]: number;
  }>;

  deviceCountWithPowerLimit$: Observable<number>;

  DeviceState = DeviceState;
  deviceStates = Object.values(DeviceState);

  constructor(
    pageRouting: PageRoutingService,
    private usersService: UsersService,
    private clockService: ClockService,
  ) {
    const plantRequest$: Observable<DataRequest<Plant>> = pageRouting
      .getPlantRequestFromQueryParams()
      .pipe(
        tap((req) => {
          if (!req.isLoading && !req.data) {
            // TODO: show specific error
            pageRouting.router.navigate(['404']);
          }
        }),
      );

    this.plant$ = plantRequest$.pipe(
      filter((request) => request.data !== undefined),
      map((req) => req.data as Plant),
    );

    this.currentTime$ = this.clockService.time$.pipe(
      withLatestFrom(this.plant$),
      map(([time, plant]) => {
        const timeZone = plant?.timeZone;
        if (timeZone) {
          return utcToZonedTimeSafe(time, timeZone);
        }
        return time;
      }),
    );

    this.deviceCountWithPowerLimit$ = this.plant$.pipe(
      map((plant) => plant.devices.map((device) => device.powerLimitSubject)),
      switchMap((x) => combineLatest(x)),
      map((x) => x.filter((pl) => pl !== null && pl !== undefined).length),
    );

    this.deviceCountByState$ = this.plant$.pipe(
      map((plant) => plant.devices.map((device) => device.stateSubject)),
      switchMap((x) => combineLatest(x)),
      map((deviceStates: ExtendedDeviceState[]) => {
        const deviceCountBystate: {
          [state in DeviceState]: number;
        } = {
          [DeviceState.On]: 0,
          [DeviceState.Off]: 0,
          [DeviceState.Warning]: 0,
          [DeviceState.Error]: 0,
          [DeviceState.NoCommunication]: 0,
          [DeviceState.ServiceMode]: 0,
          [DeviceState.Invalid]: 0,
          [DeviceState.Standby]: 0,
          [DeviceState.Intermediate]: 0,
        };

        deviceStates.map((state) => {
          if (state.baseState) {
            deviceCountBystate[state.baseState] += 1;
          }
        });

        return deviceCountBystate;
      }),
      shareReplay(1),
    );

    this.showGridExportSchedule = this.usersService.hasCurrentUserPermissions([
      AccessControlPermission.GridExportSchedule_View,
    ]);

    this.showInverterControl = this.usersService.hasCurrentUserPermission(
      AccessControlPermission.InverterControl_Manage,
    );
  }

  isWind(plant: Plant | null | undefined): boolean {
    return plant?.type === DeviceType.Wind;
  }

  isSolar(plant: Plant | null | undefined): boolean {
    return plant?.type === DeviceType.Solar;
  }

  getOverviewTabTitle(plant: Plant | null | undefined): string {
    return plant?.plantSpecificMetadata?.bessId ? 'PV Overview' : 'Overview';
  }

  showPowerLimitSchedule(plant: Plant | null | undefined): boolean {
    return (
      !plant?.plantSpecificMetadata?.bessId &&
      this.usersService.hasCurrentUserPermission(AccessControlPermission.PowerLimitSchedule_View)
    );
  }

  showPowerSchedule(plant: Plant | null | undefined): boolean {
    return (
      !!plant?.plantSpecificMetadata?.bessId &&
      this.usersService.hasCurrentUserPermission(AccessControlPermission.PowerSchedule_View)
    );
  }

  showBESSRelatedTabs(plant: Plant | null | undefined): boolean {
    return !!plant?.plantSpecificMetadata?.bessId;
  }

  getBessId(plant: Plant | null | undefined): string | undefined {
    return plant?.plantSpecificMetadata?.bessId ?? undefined;
  }

  showReactivePower(plant: Plant | null | undefined): boolean {
    return (
      plant?.type === DeviceType.Solar &&
      plant?.plantSpecificMetadata?.hasPowerMeter === true &&
      // TODO
      // !plant?.plantSpecificMetadata?.hasExtendedPlantMetrics &&
      this.usersService.hasCurrentUserPermission(AccessControlPermission.ReactivePower_View)
    );
  }

  showExtendedPlantMetrics(plant: Plant | null | undefined): boolean {
    return (
      plant?.plantSpecificMetadata?.hasExtendedPlantMetrics === true &&
      this.usersService.hasCurrentUserPermission(AccessControlPermission.ExtendedPlantMetrics_View)
    );
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

  plsLink(
    plant: Plant | null | undefined,
    activePowerLimitSchedule: ActivePowerLimitSchedule | null | undefined,
  ): string | undefined {
    return plsLink(plant, activePowerLimitSchedule);
  }

  bessScheduleLink(
    plant: Plant | null | undefined,
    activeBESSSchedule: ActivePowerLimitSchedule | null | undefined,
  ): string | undefined {
    if (!plant || !activeBESSSchedule || !activeBESSSchedule.fileRefId) {
      return undefined;
    }

    return `/home/${plant.id}/power-schedule/${activeBESSSchedule.fileRefId}`;
  }
}
