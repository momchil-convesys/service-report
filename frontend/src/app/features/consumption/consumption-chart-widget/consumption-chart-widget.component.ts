import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map } from 'rxjs';
import { PredefinedTimeRange } from '../../../constants';
import { Device } from '../../../data/models';
import { convertPredefinedRange } from '../../../helpers';
import { PageRoutingService } from '../../../shared/page-routing.service';

@Component({
  selector: 'app-consumption-chart-widget',
  templateUrl: './consumption-chart-widget.component.html',
  styleUrls: ['./consumption-chart-widget.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PageRoutingService],
  standalone: false,
})
export class ConsumptionChartWidgetComponent {
  timeRange$: Observable<Date[] | PredefinedTimeRange>;
  timeRangeConverted$: Observable<Date[]>;
  devices$: Observable<Device[]>;

  constructor(
    private pageRouting: PageRoutingService,
    private router: Router,
  ) {
    this.timeRange$ = pageRouting
      .getTimeRangeFromQueryParams()
      .pipe(map((range) => range || PredefinedTimeRange.Last7Days));

    this.timeRangeConverted$ = this.timeRange$.pipe(map((range) => convertPredefinedRange(range)));

    this.devices$ = pageRouting.getDeviceFromQueryParams().pipe(
      map((device) => [device]),
      catchError(() => pageRouting.getPlantFromQueryParams().pipe(map((plant) => plant.devices))),
    );
  }

  onTimeRangeChange(range: Date[]) {
    void this.router.navigate([], {
      relativeTo: this.pageRouting.route,
      queryParams: { from: range[0].toISOString(), to: range[1].toISOString() },
      // queryParamsHandling: 'merge',
    });
  }

  onPredefinedTimeRangeChange(predefinedRange: PredefinedTimeRange) {
    void this.router.navigate([], {
      relativeTo: this.pageRouting.route,
      queryParams: { predefinedRange },
      // queryParamsHandling: 'merge',
    });
  }
}
