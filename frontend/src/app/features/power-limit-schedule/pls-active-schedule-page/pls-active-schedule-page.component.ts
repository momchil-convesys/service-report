import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, map, shareReplay, switchMap } from 'rxjs';
import { BaseChartContext } from '../../../shared/base-chart-component/base-chart-component.component';
import { PageRoutingService } from '../../../shared/page-routing.service';
import { ActivePowerLimitSchedule } from '../_data/active-schedule';

@Component({
  selector: 'app-pls-active-schedule-page',
  templateUrl: './pls-active-schedule-page.component.html',
  styleUrl: './pls-active-schedule-page.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PlsActiveSchedulePageComponent {
  activeSchedule$: Observable<ActivePowerLimitSchedule | null>;

  chartContext$: Observable<BaseChartContext>;

  constructor(pageRouting: PageRoutingService) {
    const plant$ = pageRouting.getPlantFromQueryParams();

    this.chartContext$ = plant$.pipe(
      map((plant) => ({
        plant,
        deviceId: null,
      })),
    );

    this.activeSchedule$ = plant$.pipe(
      switchMap((plant) => plant.activePowerLimitSchedule$),
      shareReplay(1),
      takeUntilDestroyed(),
    );
  }
}
