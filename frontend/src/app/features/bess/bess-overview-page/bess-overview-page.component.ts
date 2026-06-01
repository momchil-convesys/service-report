import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { BESSDataService } from '../_data/data.service';
import { BESSMetadataDTO } from '../_data/dto/bess.dto';
import { HistoricalDataChartWidgetComponent } from '../widgets/historical-data-chart-widget/historical-data-chart-widget.component';
import { MomentaryDataChartWidgetComponent } from '../widgets/momentary-data-chart-widget/momentary-data-chart-widget.component';
import { BessContainersBarsComponent } from './bess-containers-bars/bess-containers-bars.component';
import { BessSummaryComponent } from './bess-summary/bess-summary.component';

@Component({
  selector: 'app-bess-overview-page',
  standalone: true,
  imports: [
    BessContainersBarsComponent,
    BessSummaryComponent,
    MomentaryDataChartWidgetComponent,
    HistoricalDataChartWidgetComponent,
  ],
  templateUrl: './bess-overview-page.component.html',
  styleUrl: './bess-overview-page.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BessOverviewPageComponent {
  private dataService = inject(BESSDataService);

  private _bessMetadata = this.dataService.getBESSMetadataFromCache();
  metadata: BESSMetadataDTO | undefined = this._bessMetadata;
}
