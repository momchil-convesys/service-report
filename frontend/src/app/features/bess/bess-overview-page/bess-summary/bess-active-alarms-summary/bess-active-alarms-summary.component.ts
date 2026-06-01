import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import Highcharts from '../../../../../highcharts-global-config';
import { ValueDisplayComponent } from '../../../../../shared/value-display/value-display.component';

type AlarmSeverityKey = 'major' | 'minor' | 'warning';

export interface BessActiveAlarmsSummary {
  major?: number | null | undefined;
  minor?: number | null | undefined;
  warning?: number | null | undefined;
}

interface SeverityConfig {
  key: AlarmSeverityKey;
  label: string;
}

@Component({
  selector: 'app-bess-active-alarms-summary',
  standalone: true,
  imports: [NzIconModule, ValueDisplayComponent],
  templateUrl: './bess-active-alarms-summary.component.html',
  styleUrl: './bess-active-alarms-summary.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BessActiveAlarmsSummaryComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() summary: BessActiveAlarmsSummary | null = null;
  @ViewChild('donutContainer')
  set donutContainer(value: ElementRef<HTMLDivElement> | undefined) {
    this.donutContainerRef = value;
    if (value) {
      queueMicrotask(() => this.renderChart());
    }
  }

  readonly severityOrder: SeverityConfig[] = [
    { key: 'major', label: $localize`Major` },
    { key: 'minor', label: $localize`Minor` },
    { key: 'warning', label: $localize`Warning` },
  ];

  private readonly severityColors: Record<AlarmSeverityKey, string> = {
    major: '#b3222c', // @red-8
    minor: '#ff7773', // @red-5
    warning: '#ff9e13', // @gold-6
  };

  private donutContainerRef?: ElementRef<HTMLDivElement>;
  private chart?: Highcharts.Chart;

  get totalActiveAlarms(): number | undefined | null {
    if (!this.summary) {
      return null;
    }

    const { major, minor, warning } = this.summary;

    if (major === undefined || minor === undefined || warning === undefined) {
      return undefined;
    }

    if (major === null || minor === null || warning === null) {
      return null;
    }

    return major + minor + warning;
  }

  hasCount(severity: AlarmSeverityKey): boolean {
    return (this.summary?.[severity] ?? 0) > 0;
  }

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['summary'] && !changes['summary'].firstChange) {
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }

  private renderChart(): void {
    const container = this.donutContainerRef?.nativeElement;
    if (!container) return;

    const options = this.buildChartOptions();

    if (this.chart) {
      this.chart.update(options, true, true);
      return;
    }

    this.chart = Highcharts.chart(container, options);
  }

  private buildChartOptions(): Highcharts.Options {
    const data = this.severityOrder.map((severity) => ({
      name: severity.label,
      y: this.summary?.[severity.key] ?? 0,
      color: this.severityColors[severity.key],
    }));

    const visibleData = data.filter((point) => point.y > 0);

    return {
      chart: {
        type: 'pie',
        backgroundColor: 'transparent',
        spacing: [0, 0, 0, 0],
      },
      title: undefined,
      tooltip: {
        headerFormat: '',
        pointFormatter: function () {
          return `<span style="color:${this.color}">\u25CF</span> ${this.name}: <b>${this.y}</b>`;
        },
      },
      plotOptions: {
        pie: {
          innerSize: '70%',
          borderWidth: 2,
          size: '100%',
          dataLabels: { enabled: false },
          borderRadius: 0,
        },
      },
      series: [
        {
          type: 'pie',
          name: $localize`Active alarms`,
          data: visibleData.length ? visibleData : data,
        },
      ],
    };
  }

  private destroyChart(): void {
    this.chart?.destroy();
    this.chart = undefined;
  }
}
