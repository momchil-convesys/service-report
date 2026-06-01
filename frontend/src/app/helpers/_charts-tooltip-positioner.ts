/**
 * TODO: reuse this function
 */
export const tooltipPositioner_LeftRight: Highcharts.TooltipPositionerCallbackFunction = function (
  labelWidth,
  labelHeight,
  point,
) {
  const chartWidth = this.chart.chartWidth;

  // If tooltip is too wide
  // allow it to be displayed over y axis labels.
  const mayOverlapYAxis =
    labelWidth > chartWidth * 0.3 && labelHeight > this.chart.chartHeight * 0.2;

  const leftAnchor = mayOverlapYAxis ? 5 : this.chart.plotLeft + 1;
  let x = leftAnchor;
  let y = 5;

  const anchor =
    this.chart.hoverPoint || (this.chart.hoverPoints && this.chart.hoverPoints[0]) || point;

  const plotX = anchor.plotX !== undefined ? anchor.plotX : point.plotX;

  // Show tooltip near left or right edge of the chart
  if (this.chart.plotLeft + plotX < chartWidth * 0.5) {
    const rightAnchor = mayOverlapYAxis
      ? chartWidth - 5
      : this.chart.plotLeft + this.chart.plotWidth;
    x = rightAnchor - labelWidth;
  }

  return { x, y };
};

/**
 * TODO: reuse this function
 */
export const tooltipPositioner_Top: Highcharts.TooltipPositionerCallbackFunction = function (
  labelWidth,
  labelHeight,
  point,
) {
  const chart = this.chart;

  return {
    x: point.plotX + chart.plotLeft - labelWidth / 2,
    y: chart.plotTop - labelHeight,
  };
};
