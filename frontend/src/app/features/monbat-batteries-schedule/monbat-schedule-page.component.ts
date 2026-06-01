import { Component, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { ActivePowerLimitSchedule } from 'src/app/features/power-limit-schedule/_data/active-schedule';
import { AccessControlPermission } from '../../constants';
import { Device, Plant } from '../../data/models';
import { UsersService } from '../../data/services/users.service';
import { PageRoutingService } from '../../shared/page-routing.service';
import { MonbatPowerLimitScheduleDTO } from './_data/dto';
import { MonbatService } from './_data/monbat-sync.service';

@Component({
  selector: 'app-monbat-schedule-page',
  templateUrl: './monbat-schedule-page.component.html',
  styleUrls: ['./monbat-schedule-page.component.less'],
  encapsulation: ViewEncapsulation.None,
  providers: [MonbatService],
  standalone: false,
})
export class MonbatSchedulePageComponent {
  showDetail = false;
  singlePaneMode = false;

  plant$: Observable<Plant>;
  device$: Observable<Device>;

  currentSchedule$: Observable<ActivePowerLimitSchedule | null>;

  hasPermissionToUpload: boolean;
  hasPermissionToAdjust: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private monbatService: MonbatService,
    pageRouting: PageRoutingService,
    private usersService: UsersService,
  ) {
    this.plant$ = pageRouting.getPlantFromQueryParams();
    this.device$ = pageRouting.getDeviceFromQueryParams();

    this.currentSchedule$ = this.plant$.pipe(
      switchMap((plant) => plant.activePowerLimitSchedule$.asObservable()),
      takeUntilDestroyed(),
    );

    this.hasPermissionToUpload = this.usersService.hasCurrentUserPermission(
      AccessControlPermission.PowerLimitSchedule_Upload,
    );

    this.hasPermissionToAdjust = this.usersService.hasCurrentUserPermission(
      AccessControlPermission.PowerLimitSchedule_Adjust,
    );
  }

  onChildRouteActivate() {
    this.singlePaneMode = false;
    this.showDetail = true;
  }

  onChildRouteDeactivate() {
    this.singlePaneMode = false;
    this.showDetail = false;
  }

  onFileUploadSuccess(scheduleItem: MonbatPowerLimitScheduleDTO) {
    this.monbatService.listNeedsUpdate$.next(scheduleItem.plantId);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.router.navigate([scheduleItem.id], { relativeTo: this.route });
  }
}
