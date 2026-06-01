import { formatNumber } from '@angular/common';
import { APP_LOCALE_ID } from '../../../app-locale';

export const dataLabels_TargetPowerLimit: Highcharts.DataLabelsOptions[] = [
  {
    enabled: false,
    formatter: function () {
      if (this.y === null || this.y === undefined) {
        return $localize`:@@noLimitShort:NL`;
      }

      return formatNumber(this.y, APP_LOCALE_ID, '1.3-3');
    },
  },
];
