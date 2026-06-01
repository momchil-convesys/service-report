export function getDashedLineLegendSymbolSVG(
  color: Highcharts.ColorType | undefined,
  flip: boolean,
) {
  const width = 12;

  const dashCount = 3;
  const dashW = 3;
  const gapW = (width - dashCount * dashW) / (dashCount - 1); // 1.5

  const y = flip ? 0 : 5;

  const dashes = Array.from({ length: dashCount }, (_, i) => {
    const x = i * (dashW + gapW); // 0, 4.5, 9
    return `<rect x="${x}" y="${y}" width="${dashW}" height="2" fill="${color}" />`;
  }).join('');

  return `
    <svg width="${width}" height="7" viewBox="0 0 ${width} 7">
      ${dashes}
    </svg>
  `;
}

export function getAreaLegendSymbolSVG(color: Highcharts.ColorType | undefined, flip: boolean) {
  const width = 12;

  if (flip) {
    return `
      <svg width="${width}" height="7" viewBox="0 0 ${width} 7">
        <rect x="0" y="0" width="${width}" height="2" fill="${color}" />
        <rect x="0" y="2" width="${width}" height="5" fill="${color}" opacity="0.3"/>
      </svg>
    `;
  } else {
    return `
      <svg width="${width}" height="7" viewBox="0 0 ${width} 7">
        <rect x="0" y="0" width="${width}" height="5" fill="${color}" opacity="0.3"/>
        <rect x="0" y="5" width="${width}" height="2" fill="${color}" />
      </svg>
    `;
  }
}

export function getLegendSymbolSVG(
  series: Highcharts.Series,
  flip: boolean,
  dashed: boolean = false,
) {
  if (series.type === 'area' || series.type === 'areaspline') {
    const color: Highcharts.ColorType | undefined = series.color;
    return dashed ? getDashedLineLegendSymbolSVG(color, flip) : getAreaLegendSymbolSVG(color, flip);
  }

  return '\u25CF';
}
