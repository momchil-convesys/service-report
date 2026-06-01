import { Injectable } from '@angular/core';

import { distinctUntilChanged, Observable, ReplaySubject } from 'rxjs';
import {
  DatetimeRangeModel,
  isSameDatetimeRange,
} from '../../../shared/datetime-range-select/models';
import { PlantWeatherDataChartIdentifier } from '../_data/constants';
import { ChartSpecifics } from '../_data/interfaces';

@Injectable()
export class DatetimeRangeSyncService {
  targetRange_1$: ReplaySubject<DatetimeRangeModel> = new ReplaySubject(1);
  targetRange_2$: ReplaySubject<DatetimeRangeModel> = new ReplaySubject(1);
  targetRange_3$: ReplaySubject<DatetimeRangeModel> = new ReplaySubject(1);
  targetRange_4$: ReplaySubject<DatetimeRangeModel> = new ReplaySubject(1);

  onDatetimeRangeChange(value: DatetimeRangeModel, chartSpecifics: ChartSpecifics) {
    this._targetRangeSubjectForChartIdentifier(chartSpecifics).next(value);
  }

  getTargetRangeForChartIdentifier(chartSpecifics: ChartSpecifics): Observable<DatetimeRangeModel> {
    return this._targetRangeSubjectForChartIdentifier(chartSpecifics).pipe(
      distinctUntilChanged(isSameDatetimeRange),
    );
  }

  private _targetRangeSubjectForChartIdentifier(
    chartSpecifics: ChartSpecifics,
  ): ReplaySubject<DatetimeRangeModel> {
    switch (chartSpecifics.chartIdentifier) {
      case PlantWeatherDataChartIdentifier.PlantOverview:
        return this.targetRange_1$;

      case PlantWeatherDataChartIdentifier.CumulativePerTS:
        return this.targetRange_2$;

      case PlantWeatherDataChartIdentifier.MomentaryPerTS:
        if (chartSpecifics.parameterName === 'rain') {
          return this.targetRange_4$;
        }

        return this.targetRange_3$;
    }
  }
}
