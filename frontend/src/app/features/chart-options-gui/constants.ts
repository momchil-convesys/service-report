export type SectionType = 'yAxis' | 'xAxis' | 'series' | 'plotOptions' | undefined;

export interface ActionContext {
  section: SectionType;
  objectId: string | undefined;
}

export const yAxisOptionsDefault: Highcharts.YAxisOptions = {
  title: {
    text: 'New Y axis',
  },
};

export const xAxisOptionsDefault: Highcharts.XAxisOptions = {
  title: {
    text: 'New X axis',
  },
};

// export const seriesOptionsDefault: Highcharts.SeriesOptions = {
//   type: 'line',
// };

export function toArray<T>(value: T | T[] | undefined): T[] {
  if (Array.isArray(value)) {
    return value;
  } else if (value) {
    return [value];
  }

  return [];
}
