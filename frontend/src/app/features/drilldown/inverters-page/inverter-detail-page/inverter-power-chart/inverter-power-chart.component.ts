import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCardModule } from 'ng-zorro-antd/card';
import {
  Observable,
  ReplaySubject,
  combineLatest,
  distinctUntilChanged,
  map,
  shareReplay,
  switchMap,
} from 'rxjs';
import { PVPowerDataForDevice_NEW } from 'src/app/features/pv-charts/pv-power/_data/pv-power';
import { DataRequest } from '../../../../../constants';
import { BaseChartContext } from '../../../../../shared/base-chart-component/base-chart-component.component';
import { DatetimeRangeSelectComponent } from '../../../../../shared/datetime-range-select/datetime-range-select.component';
import {
  DatetimeRangeModel,
  isSameDatetimeRange,
} from '../../../../../shared/datetime-range-select/models';
import { HighchartsExportOptionComponent } from '../../../../../shared/highcharts-export-option/highcharts-export-option.component';
import { PvChartsModule } from '../../../../pv-charts/pv-charts.module';
import { PVPowerApiService } from '../../../../pv-charts/pv-power/_data/api.service';
import { PVPowerDataService } from '../../../../pv-charts/pv-power/_data/pv-power.service';
import { InverterPowerChartContext } from '../_data/models';

@Component({
  selector: 'app-inverter-power-chart',
  templateUrl: './inverter-power-chart.component.html',
  styleUrls: ['./inverter-power-chart.component.less'],
  standalone: true,
  imports: [
    PvChartsModule,
    AsyncPipe,
    DatetimeRangeSelectComponent,
    NzCardModule,
    HighchartsExportOptionComponent,
    NzAlertModule,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PVPowerApiService, PVPowerDataService],
})
export class InverterPowerChartComponent {
  @Input({ required: true }) context: InverterPowerChartContext | undefined;

  private _targetRange$: ReplaySubject<DatetimeRangeModel> = new ReplaySubject(1);

  chartContext$: Observable<BaseChartContext>;
  chartDataRequest$: Observable<DataRequest<PVPowerDataForDevice_NEW>>;
  componentInput$: ReplaySubject<InverterPowerChartContext> = new ReplaySubject(1);

  get timeZone$(): Observable<string | undefined> {
    return this.componentInput$.pipe(map((context) => context.plant.timeZone));
  }

  constructor(data: PVPowerDataService) {
    this.chartContext$ = combineLatest([
      this._targetRange$.pipe(distinctUntilChanged(isSameDatetimeRange)),
      this.componentInput$,
    ]).pipe(
      map(([targetRange, componentInput]) => ({
        plant: componentInput.plant,
        deviceId: componentInput.device.id,
        targetRange,
      })),
      shareReplay(1),
      takeUntilDestroyed(),
    );

    this.chartDataRequest$ = combineLatest([this.componentInput$, this._targetRange$]).pipe(
      switchMap(([context, targetRange]) =>
        data.getPVPowerDataForDevice(context.device, targetRange, context.inverter),
      ),
      shareReplay(1),
      takeUntilDestroyed(),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['context'] && this.context) {
      this.componentInput$.next(this.context);
    }
  }

  onDatetimeRangeChange(value: DatetimeRangeModel) {
    this._targetRange$.next(value);
  }
}
