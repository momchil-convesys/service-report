import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CustomDashboardConfig, CustomDashboardsService } from '../custom-dashboards.service';

@Component({
  selector: 'app-custom-dashboards-side-nav',
  templateUrl: './custom-dashboards-side-nav.component.html',
  styleUrls: ['./custom-dashboards-side-nav.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CustomDashboardsSideNavComponent {
  dashboards$: Observable<CustomDashboardConfig[]>;

  constructor(
    private dashboardService: CustomDashboardsService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.dashboards$ = this.dashboardService.getCustomDashboards();
  }

  onCreateDashboard() {
    const id = new Date().toISOString();

    this.dashboardService.saveCustomDashboard({
      id,
      name: 'Db ' + id,
      widgets: [],
    });

    this.router.navigate([id], { relativeTo: this.route });
  }
}
