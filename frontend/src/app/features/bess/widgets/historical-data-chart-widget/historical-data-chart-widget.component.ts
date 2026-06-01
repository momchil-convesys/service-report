import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import { DatetimeRangeSelectComponent } from '../../../../shared/datetime-range-select/datetime-range-select.component';
import { DatetimeRangeModel } from '../../../../shared/datetime-range-select/models';
import { BESSAssetType } from '../../_data/dto/assets/asset-base.dto';
import { BESSMetadataDTO } from '../../_data/dto/bess.dto';
import { BessParameterSelectorComponent } from '../../shared/bess-parameter-selector/bess-parameter-selector.component';
import { HistoricalDataChartComponent } from './historical-data-chart/historical-data-chart.component';
import { HistoricalDataChartRequest } from './historical-data-chart/interfaces';

@Component({
  selector: 'app-historical-data-chart-widget',
  standalone: true,
  imports: [
    BessParameterSelectorComponent,
    DatetimeRangeSelectComponent,
    HistoricalDataChartComponent,
  ],
  templateUrl: './historical-data-chart-widget.component.html',
  styleUrl: './historical-data-chart-widget.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoricalDataChartWidgetComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) bessMetadata: BESSMetadataDTO | null = null;

  readonly BESSAssetType = BESSAssetType;

  selectedParameterKey: string = 'chargeDischargePower';

  selectedDay: Date = new Date();

  selectedRange: DatetimeRangeModel | undefined;

  chartRequest: HistoricalDataChartRequest | null = null;

  ngOnChanges(): void {
    this._updateChartRequest();
  }

  ngOnDestroy(): void {
    this.chartRequest = null;
  }

  onParameterChange(parameterKey: string): void {
    this.selectedParameterKey = parameterKey;
    this._updateChartRequest();
  }

  onRangeChange(range: DatetimeRangeModel): void {
    this.selectedRange = range;
    this.selectedDay = new Date(range.from);
    this._updateChartRequest();
  }

  private _updateChartRequest(): void {
    if (!this.bessMetadata) {
      this.chartRequest = null;
      return;
    }

    const asset =
      this.bessMetadata.assets.find((a) => a.type === BESSAssetType.BESSItself) ??
      this.bessMetadata.assets[0];

    if (!asset) {
      this.chartRequest = null;
      return;
    }

    this.chartRequest = {
      bessMetadata: this.bessMetadata,
      assetId: asset.id,
      parameterKey: this.selectedParameterKey,
      day: this.selectedDay,
    };
  }
}
