import { APP_LOCALE_ID } from './app-locale';

export const highchartsLangOptions: Highcharts.LangOptions & { locale: string } = {
  exitFullscreen: $localize`Exit fullscreen`,
  viewFullscreen: $localize`View in fullscreen`,
  resetZoom: $localize`Reset zoom`,

  loading: $localize`:@@loading:Loading...`,
  noData: $localize`No data`,

  locale: APP_LOCALE_ID,

  /**
   * Since Highcharts 12.0.0
   * the following properties are no longer needed
   * and will be automatically set by Highcharts
   * according to the `lang.locale` setting.
   */

  // decimalPoint: '.',
  // thousandsSep: ',',

  months: [
    $localize`January`,
    $localize`February`,
    $localize`March`,
    $localize`April`,
    $localize`May`,
    $localize`June`,
    $localize`July`,
    $localize`August`,
    $localize`September`,
    $localize`October`,
    $localize`November`,
    $localize`December`,
  ],
  shortMonths: [
    $localize`Jan`,
    $localize`Feb`,
    $localize`Mar`,
    $localize`Apr`,
    $localize`May`,
    $localize`Jun`,
    $localize`Jul`,
    $localize`Aug`,
    $localize`Sep`,
    $localize`Oct`,
    $localize`Nov`,
    $localize`Dec`,
  ],

  weekdays: [
    $localize`Monday`,
    $localize`Tuesday`,
    $localize`Wednesday`,
    $localize`Thursday`,
    $localize`Friday`,
    $localize`Saturday`,
    $localize`Sunday`,
  ],
  shortWeekdays: [
    $localize`Mon`,
    $localize`Tue`,
    $localize`Wed`,
    $localize`Thu`,
    $localize`Fri`,
    $localize`Sat`,
    $localize`Sun`,
  ],
};
