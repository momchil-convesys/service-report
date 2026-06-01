import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, Observable } from 'rxjs';
import { DataRequest } from '../../../constants';
import { Plant } from '../../../data/models';
import { PageRoutingService } from '../../../shared/page-routing.service';
import { WeatherApiService } from '../_data/api.service';
import { PlantWeatherDataChartIdentifier } from '../_data/constants';
import { DatetimeRangeSyncService } from '../plant-weather-chart-widget/datetime-range-sync.service';
import { PlantWeatherChartWidgetComponent } from '../plant-weather-chart-widget/plant-weather-chart-widget.component';

@Component({
  selector: 'app-weather-page',
  imports: [PlantWeatherChartWidgetComponent, AsyncPipe, NgTemplateOutlet],
  templateUrl: './weather-page.component.html',
  styleUrl: './weather-page.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [WeatherApiService, PageRoutingService, DatetimeRangeSyncService],
})
export class WeatherPageComponent {
  chartIdentifiers = PlantWeatherDataChartIdentifier;
  activeTabIndex = 0;

  plant$: Observable<Plant | undefined>;

  constructor(pageRouting: PageRoutingService) {
    const plantRequest$: Observable<DataRequest<Plant>> = pageRouting
      .getPlantRequestFromQueryParams()
      .pipe(takeUntilDestroyed());

    this.plant$ = plantRequest$.pipe(map((req) => req.data));
  }

  onTabChange(index: number): void {
    this.activeTabIndex = index;
  }

  hasExtraCharts(plant: Plant | undefined): boolean {
    // TODO: do not check against HARDCODED plant ids!
    return plant?.id === '26';
  }
}
