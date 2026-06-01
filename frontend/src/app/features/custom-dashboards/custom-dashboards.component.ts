import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-custom-dashboards',
  templateUrl: './custom-dashboards.component.html',
  styleUrls: ['./custom-dashboards.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CustomDashboardsComponent {}
