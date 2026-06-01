import { inject } from '@angular/core';
import { NzConfig } from 'ng-zorro-antd/core/config';
import { NzI18nService } from 'ng-zorro-antd/i18n';

export const ngZorroConfig: NzConfig = {
  notification: { nzTop: 64 + 16 }, // @top-header-height
};

export function fixNgZorroMissingTranslations(appLocale: string) {
  const nzI18nService: NzI18nService = inject(NzI18nService);

  /**
   * Fixes warning for missing locale. ("ng-zorro-antd": "^19.0.0")
   * https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/components/i18n/languages/bg_BG.ts
   * TODO: Check if translations are added in more recent versions of the library.
   */
  if (appLocale === 'bg') {
    nzI18nService.getLocale().DatePicker.lang = {
      ...nzI18nService.getLocale().DatePicker.lang,
      yearPlaceholder: $localize`Select year`,
      monthPlaceholder: $localize`Select month`,
      quarterPlaceholder: $localize`Select quarter`,
      weekPlaceholder: $localize`Select week`,
      rangeYearPlaceholder: [$localize`Start year`, $localize`End year`],
      rangeQuarterPlaceholder: [$localize`Start quarter`, $localize`End quarter`],
      rangeMonthPlaceholder: [$localize`Start month`, $localize`End month`],
      rangeWeekPlaceholder: [$localize`Start week`, $localize`End week`],
    };
  }
}
