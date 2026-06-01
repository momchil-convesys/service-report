import {
  ChangeDetectionStrategy,
  Component,
  Input,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { differenceInCalendarDays, isSameDay } from 'date-fns';
import {
  BehaviorSubject,
  Observable,
  ReplaySubject,
  combineLatest,
  distinctUntilChanged,
  filter,
  shareReplay,
  switchMap,
} from 'rxjs';
import { DataRequest } from '../../constants';
import { ApiService } from '../../data/api';
import { WTCombinedChartData, WTPowerData } from '../../data/models';

@Component({
  selector: 'app-wt-power-chart-widget',
  templateUrl: './wt-power-chart-widget.component.html',
  styleUrls: ['./wt-power-chart-widget.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class WtPowerChartWidgetComponent {
  combinedChart = $localize`Combined chart`;
  @Input() deviceIds: string[] | null = [];

  private _targetDate$: BehaviorSubject<Date> = new BehaviorSubject(
    // new Date('2023-06-02T00:00:00.000Z') // TODO
    new Date(), // TODO
  );
  targetDate$ = this._targetDate$.pipe(
    filter((date) => date !== null),
    distinctUntilChanged((d1, d2) => isSameDay(d1, d2)),
  );

  private _deviceIds$: ReplaySubject<string[]> = new ReplaySubject<string[]>(1);
  deviceIds$: Observable<string[]> = this._deviceIds$.asObservable().pipe();

  chartDataRequest_GS$: Observable<DataRequest<WTPowerData>>;
  chartDataRequest_LS$: Observable<DataRequest<WTPowerData>>;
  chartDataRequest$: Observable<DataRequest<WTCombinedChartData>>;

  constructor(private api: ApiService) {
    this.chartDataRequest_GS$ = combineLatest([this.deviceIds$, this.targetDate$]).pipe(
      switchMap(([deviceIds, targetDate]) => api.fetchWTGeneratorSideData(deviceIds, targetDate)),
      shareReplay(1),
    );

    this.chartDataRequest_LS$ = combineLatest([this.deviceIds$, this.targetDate$]).pipe(
      switchMap(([deviceIds, targetDate]) => api.fetchWTLineSideData(deviceIds, targetDate)),
      shareReplay(1),
    );

    this.chartDataRequest$ = combineLatest([this.deviceIds$, this.targetDate$]).pipe(
      switchMap(([deviceIds, targetDate]) => api.fetchWTCombinedChartData(deviceIds, targetDate)),
      shareReplay(1),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    this._deviceIds$.next(this.deviceIds || []);
  }

  disabledDate = (current: Date): boolean =>
    // Can not select days before today and today
    differenceInCalendarDays(current, new Date()) > 0;

  onDateChange(date: Date) {
    this._targetDate$.next(date);
  }
}
