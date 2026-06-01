import { Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, ReplaySubject, map, shareReplay, switchMap } from 'rxjs';
import { DeviceParameterDefinition } from '../../../data/models';
import { UserSettingsService } from '../../../data/services/user-settings.service';
import { DeviceMetrics } from '../_data/device-metrics.model';
import { DeviceMetricsService } from '../_data/device-metrics.service';
import { Context } from '../models';

@Component({
  selector: 'app-device-metrics[context]',
  templateUrl: './device-metrics.component.html',
  styleUrls: ['./device-metrics.component.less'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class DeviceMetricsComponent implements OnChanges {
  @Input({ required: true }) context: Context | undefined;

  private contextChange$ = new ReplaySubject<Context>(1);

  selectedView: 'charts' | 'table' = 'table';

  metricsLiveData$: Observable<DeviceMetrics[]>;
  isLoading$: Observable<boolean>;
  error$: Observable<Error | undefined>;

  parameters$: Observable<DeviceParameterDefinition[]> | undefined;

  constructor(
    private metricsService: DeviceMetricsService,
    private userSettings: UserSettingsService,
  ) {
    this.parameters$ = this.contextChange$.pipe(map((context) => context.parameters));

    const metricsRequest$ = this.contextChange$.pipe(map((context) => context.scope)).pipe(
      switchMap((scope) => this.metricsService.getDeviceMetricsForScope(scope)),
      shareReplay(1),
      takeUntilDestroyed(),
    );

    this.isLoading$ = metricsRequest$.pipe(map((req) => req.isLoading));
    this.metricsLiveData$ = metricsRequest$.pipe(map((req) => req.data || []));
    this.error$ = metricsRequest$.pipe(map((req) => req.error));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.context) {
      this.contextChange$.next(this.context);
    }
  }

  isSingleDevice() {
    return this.context?.scope.device !== null;
  }

  getVisibleParameterIdsForCharts(): string[] {
    return (
      this.userSettings.getCurrentUserSettings().parameterIdsVisibleInDeviceMetricsChartsByPlant[
        this.context?.scope.plant.id || ''
      ] || []
    );
  }

  onChartVisibleParametsChange(parameterIds: string[]) {
    if (this.context) {
      this.userSettings.updateCurrentUserSettings({
        parameterIdsVisibleInDeviceMetricsChartsByPlant: {
          [this.context.scope.plant.id]: parameterIds,
        },
      });
    }
  }
}
