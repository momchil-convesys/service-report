import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Observable, map } from 'rxjs';
import { PredefinedTimeRange } from '../../constants';

import { Device } from '../../data/models';
import { PageRoutingService } from '../../shared/page-routing.service';

@Component({
  selector: 'app-fault-counters-page',
  templateUrl: './fault-counters-page.component.html',
  styleUrls: ['./fault-counters-page.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PageRoutingService],
  standalone: false,
})
export class FaultCountersPageComponent {
  timeRange$: Observable<Date[] | PredefinedTimeRange>;
  device$: Observable<Device>;

  constructor(pageRouting: PageRoutingService) {
    this.timeRange$ = pageRouting
      .getTimeRangeFromQueryParams()
      .pipe(map((range) => range || PredefinedTimeRange.Last7Days));
    this.device$ = pageRouting.getDeviceFromQueryParams();
  }
}
