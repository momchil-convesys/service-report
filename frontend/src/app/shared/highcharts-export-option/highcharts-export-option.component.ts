import { Component, Input, ViewEncapsulation } from '@angular/core';

import { NzButtonModule, NzButtonSize } from 'ng-zorro-antd/button';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';

import Highcharts from '../../highcharts-global-config';
import { ExportableChart } from '../base-chart-component/exportable-chart';

type ImageType = 'png' | 'jpeg' | 'svg' | 'pdf';

const dataTypes: { [k in ImageType]: Highcharts.ExportingMimeTypeValue } = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  svg: 'image/svg+xml',
  pdf: 'application/pdf',
};

@Component({
  selector: 'app-highcharts-export-option',
  imports: [NzButtonModule, NzDropdownModule, NzIconModule],
  templateUrl: './highcharts-export-option.component.html',
  styleUrl: './highcharts-export-option.component.less',
  encapsulation: ViewEncapsulation.None,
})
export class HighchartsExportOptionComponent {
  @Input({ required: true }) chartComponent: ExportableChart | undefined;
  @Input({ required: true }) disabled: boolean = false;
  @Input({ required: true }) filename: string | undefined;
  @Input() size: NzButtonSize = 'default';

  /**
   * Wheather to show only CSV and XLSX options.
   * Used for combined complex charts where
   * one chart is dedicated to contain all data for export
   */
  @Input() limitedOptions = false;

  private _customExitFullScreenBtn: Highcharts.SVGElement | undefined;

  onViewFullScreen() {
    const chart: Highcharts.Chart | undefined = this.chartComponent?.getChartInstance();

    if (!chart) {
      return;
    }

    if (!this._customExitFullScreenBtn) {
      this._customExitFullScreenBtn = chart.renderer
        .button($localize`Exit fullscreen`, 0, 28, () => {
          chart.fullscreen.close();
        })
        .attr({
          zIndex: 100,
          visibility: 'hidden',
        })
        .add();

      Highcharts.addEvent(chart, 'fullscreenClose', () => {
        this._customExitFullScreenBtn?.attr({
          visibility: 'hidden',
        });
      });

      Highcharts.addEvent(chart, 'fullscreenOpen', () => {
        // Wait for chart layout to settle
        setTimeout(() => {
          this._customExitFullScreenBtn?.attr({
            // Align button on the left of "Reset zoom"
            x: chart.plotLeft + chart.plotWidth - 210,
            visibility: 'visible',
          });
        }, 1000);
      });
    }

    chart?.fullscreen.open();
  }

  onDownloadImage(type: ImageType) {
    const chart: Highcharts.Chart | undefined = this.chartComponent?.getChartInstance();

    chart?.update({ exporting: { filename: this.filename } }, false);

    let dataType = dataTypes[type];

    chart?.exportChartLocal({
      type: dataType,
    });
  }

  onDownloadXLS() {
    this._downloadXlsxOrCsv(true);
  }

  onDownloadCSV() {
    this._downloadXlsxOrCsv(false);
  }

  /**
   * TODO: get inspiration from the original Highcharts export module
   * https://github.highcharts.com/master/stock/modules/export-data.js
   */
  private _downloadXlsxOrCsv(xlsx: boolean) {
    const chart: Highcharts.Chart | undefined = this.chartComponent?.getChartInstance();

    if (!chart) {
      console.error("Chart isn't initialized!");
      return;
    }

    chart.showLoading(chart.langFormat('exportInProgress', chart));

    chart.update({ exporting: { filename: this.filename } }, false);

    /**
     * Give time to the gropdown to hide
     */
    setTimeout(() => {
      // This calls the original Highcharts export module
      // xlsx ? (chart as any).exporting.downloadXLS() : (chart as any).exporting.downloadCSV();
      xlsx ? chart.downloadXLS() : chart.downloadCSV();

      chart.hideLoading();
    }, 500);
  }
}
