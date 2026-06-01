import { seriesById } from '../../../../helpers';
import {
  powerLimitSeriesColor,
  seriesId_PowerLimit,
  seriesId_ScheduledPowerLimitMasterGw_ForDevice,
  seriesId_ScheduledPowerLimitMasterGw_ForPlant,
} from '../chart-constants';

export function renderPowerLimitIndicators(chart: Highcharts.Chart) {
  let powerLimitIndicatorElements: Highcharts.SVGElement[] = [];

  (chart as any).indicatorElements?.forEach((x: Highcharts.SVGElement) => x.destroy());

  const powerLimitSeries = seriesById(chart, seriesId_PowerLimit);
  if (powerLimitSeries) {
    const elements = constructPowerLimitIndicatorsForSeries(chart, powerLimitSeries, false);
    powerLimitIndicatorElements.push(...elements);
  }

  const scheduledPowerLimitMasterGwSeries_ForDevice = seriesById(
    chart,
    seriesId_ScheduledPowerLimitMasterGw_ForDevice,
  );
  if (scheduledPowerLimitMasterGwSeries_ForDevice) {
    const elements = constructPowerLimitIndicatorsForSeries(
      chart,
      scheduledPowerLimitMasterGwSeries_ForDevice,
      true,
    );
    powerLimitIndicatorElements.push(...elements);
  }

  const scheduledPowerLimitMasterGwSeries_ForPlant = seriesById(
    chart,
    seriesId_ScheduledPowerLimitMasterGw_ForPlant,
  );
  if (scheduledPowerLimitMasterGwSeries_ForPlant) {
    const elements = constructPowerLimitIndicatorsForSeries(
      chart,
      scheduledPowerLimitMasterGwSeries_ForPlant,
      true,
    );
    powerLimitIndicatorElements.push(...elements);
  }

  (chart as any).indicatorElements = powerLimitIndicatorElements;
}

function constructPowerLimitIndicatorsForSeries(
  chart: Highcharts.Chart,
  series: Highcharts.Series,
  isScheduledLimit: boolean,
): Highcharts.SVGElement[] {
  let indicatorElements: Highcharts.SVGElement[] = [];

  series.points?.forEach(function (point: any) {
    const isVisible = series.visible && !point.isNull;
    const topBarLine: Highcharts.SVGElement = constructTopBarLineElement(
      chart,
      point,
      isScheduledLimit ? 1 : 2,
      isVisible,
    );

    indicatorElements.push(topBarLine);

    const fillColor = point.custom?.controlledByExternalSystem
      ? '#00000011'
      : isScheduledLimit
        ? '#ffdb8c33'
        : powerLimitSeriesColor + '11';

    const topBarFill: Highcharts.SVGElement = constructTopBarFillElement(
      chart,
      point,
      fillColor,
      isVisible,
    );

    indicatorElements.push(topBarFill);
  });

  return indicatorElements;
}

function constructTopBarLineElement(
  chart: Highcharts.Chart,
  point: any,
  lineThinkness: number,
  visible: boolean,
): Highcharts.SVGElement {
  const x = chart.plotLeft + point.barX;
  const y = point.isNull ? 0 : chart.plotTop + point.plotY - lineThinkness;
  const width = point.isNull ? 0 : point.pointWidth;
  const height = point.isNull ? 0 : lineThinkness;

  const fillColor = point.custom?.controlledByExternalSystem ? '#000000' : powerLimitSeriesColor;

  const topBarLine: Highcharts.SVGElement = chart.renderer
    .rect(x, y, width, height)
    .attr({
      fill: fillColor,
      zIndex: 4,
    })
    .add();

  if (visible) {
    topBarLine.attr({ x, y, width, height });
  } else {
    topBarLine.attr({ width: 0 });
  }

  return topBarLine;
}

function constructTopBarFillElement(
  chart: Highcharts.Chart,
  point: any,
  fillColor: string,
  visible: boolean,
): Highcharts.SVGElement {
  const x = chart.plotLeft + point.barX;
  const y = point.isNull ? 0 : chart.plotTop;
  const width = point.isNull ? 0 : point.pointWidth;
  const height = point.isNull ? 0 : chart.plotTop + point.plotY - 18;

  const topBarFill: Highcharts.SVGElement = chart.renderer
    .rect(x, y, width, height)
    .attr({
      fill: fillColor,
      zIndex: 4,
    })
    .add();

  if (visible) {
    topBarFill.attr({ x, y, width, height });
  } else {
    topBarFill.attr({ width: 0 });
  }

  return topBarFill;
}
