import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map, shareReplay, switchMap } from 'rxjs';
import { CustomDashboardConfig, CustomDashboardsService } from '../custom-dashboards.service';

@Component({
  selector: 'app-custom-dashboard-loader',
  templateUrl: './custom-dashboard-loader.component.html',
  styleUrls: ['./custom-dashboard-loader.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CustomDashboardLoaderComponent {
  dashboard$: Observable<CustomDashboardConfig | null>;

  constructor(
    private dashboardsService: CustomDashboardsService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.dashboard$ = this.route.paramMap.pipe(
      map((params) => params.get('dashboardId')),
      switchMap((dashboardId) => this.dashboardsService.getCustomDashboardById(dashboardId || '')),
      shareReplay(1),
    );
  }

  onSave(dashboardConfig: CustomDashboardConfig) {
    this.dashboardsService.saveCustomDashboard(dashboardConfig);
  }

  onDeleteDashboard(dashboardId: string) {
    this.dashboardsService.deleteCustomDashboard(dashboardId);
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
