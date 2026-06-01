import { Component, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Observable, switchMap } from 'rxjs';
import { AccessControlPermission } from '../../constants';
import { Plant } from '../../data/models';
import { UsersService } from '../../data/services/users.service';
import { PageRoutingService } from '../../shared/page-routing.service';
import { PowerScheduleSyncService } from './_data/power-schedule-sync.service';
import { PowerScheduleDTO } from './_data/power-schedule.dto';

@Component({
  selector: 'app-power-schedule-page',
  templateUrl: './power-schedule-page.component.html',
  styleUrls: ['./power-schedule-page.component.less'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
  providers: [PowerScheduleSyncService],
})
export class PowerSchedulePageComponent {
  showDetail = false;
  singlePaneMode = false;

  plant$: Observable<Plant>;

  hasPermissionToUpload: boolean;
  hasPermissionToAdjust: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private powerScheduleSyncService: PowerScheduleSyncService,
    pageRouting: PageRoutingService,
    private usersService: UsersService,
  ) {
    this.plant$ = pageRouting.getPlantFromQueryParams();

    this.hasPermissionToUpload = this.usersService.hasCurrentUserPermission(
      AccessControlPermission.PowerSchedule_Upload,
    );

    this.hasPermissionToAdjust = this.usersService.hasCurrentUserPermission(
      AccessControlPermission.PowerSchedule_Adjust,
    );

    const pvActiveSchedule$ = this.plant$.pipe(
      switchMap((plant) => plant.activePowerLimitSchedule$),
      takeUntilDestroyed(),
    );

    const bessActiveSchedule$ = this.plant$.pipe(
      switchMap((plant) => plant.activeBESSSchedule$),
      takeUntilDestroyed(),
    );

    combineLatest([pvActiveSchedule$, bessActiveSchedule$]).subscribe(() => {
      this.powerScheduleSyncService.broadcastThatScheduleStatusMayHaveChanged();
    });
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

  onFileUploadSuccess(scheduleItem: PowerScheduleDTO) {
    this.powerScheduleSyncService.listNeedsUpdate$.next(scheduleItem.plantId);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.router.navigate([scheduleItem.id], { relativeTo: this.route });
  }
}
