import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Plant } from '../../data/models';
import { PageRoutingService } from '../../shared/page-routing.service';
import { GridExportSchedule_ForDay } from './_data/models/grid-export-schedule.model';
import { GridExportScheduleApiService } from './_data/services/api.service';
import { GridExportScheduleDataService } from './_data/services/data.service';
import { GridExportScheduleSettingsService } from './_data/services/settings.service';
import { GridExportScheduleSyncService } from './_data/services/sync.service';

@Component({
  selector: 'app-grid-export-schedule-page',
  templateUrl: './grid-export-schedule-page.component.html',
  styleUrls: ['./grid-export-schedule-page.component.less'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    GridExportScheduleSyncService,
    PageRoutingService,
    GridExportScheduleApiService,
    GridExportScheduleDataService,
    GridExportScheduleSettingsService,
  ],
  standalone: false,
})
export class GridExportSchedulePageComponent {
  showDetail = false;

  plant$: Observable<Plant>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public syncService: GridExportScheduleSyncService,
    pageRouting: PageRoutingService,
  ) {
    this.plant$ = pageRouting.getPlantFromQueryParams();
  }

  onChildRouteActivate() {
    this.showDetail = true;
  }

  onChildRouteDeactivate() {
    this.showDetail = false;
  }

  onFileUploadSuccess(scheduleItem: GridExportSchedule_ForDay) {
    this.syncService.listNeedsUpdate$.next(scheduleItem.plantId);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.router.navigate([scheduleItem.id], { relativeTo: this.route });
  }
}
