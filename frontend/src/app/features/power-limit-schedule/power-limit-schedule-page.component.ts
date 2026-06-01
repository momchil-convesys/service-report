import { Component, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { ActivePowerLimitSchedule } from 'src/app/features/power-limit-schedule/_data/active-schedule';
import { AccessControlPermission } from '../../constants';
import { Plant } from '../../data/models';
import { UsersService } from '../../data/services/users.service';
import { PageRoutingService } from '../../shared/page-routing.service';
import { PowerLimitScheduleDTO } from './_data/dto';
import { PlsService } from './_data/pls-sync.service';

@Component({
  selector: 'app-power-limit-schedule-page',
  templateUrl: './power-limit-schedule-page.component.html',
  styleUrls: ['./power-limit-schedule-page.component.less'],
  encapsulation: ViewEncapsulation.None,
  providers: [PlsService],
  standalone: false,
})
export class PowerLimitSchedulePageComponent {
  showDetail = false;
  singlePaneMode = false;

  plant$: Observable<Plant>;

  currentSchedule$: Observable<ActivePowerLimitSchedule | null>;

  hasPermissionToUpload: boolean;
  hasPermissionToAdjust: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private plsService: PlsService,
    pageRouting: PageRoutingService,
    private usersService: UsersService,
  ) {
    this.plant$ = pageRouting.getPlantFromQueryParams();
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
    this.singlePaneMode =
      this.route.firstChild?.snapshot.url.find((segment) => segment.path === 'manual-adjust') !==
      undefined;
    this.showDetail = true;
  }

  onChildRouteDeactivate() {
    this.singlePaneMode = false;
    this.showDetail = false;
  }

  onFileUploadSuccess(scheduleItem: PowerLimitScheduleDTO) {
    this.plsService.listNeedsUpdate$.next(scheduleItem.plantId);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.router.navigate([scheduleItem.id], { relativeTo: this.route });
  }
}
