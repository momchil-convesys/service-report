import { PlantWeather_HistoricalTimelineData_DTO } from './dto';
import { DataRequestWithContext } from './interfaces';

export function patchData_mutate(
  prev: undefined | DataRequestWithContext<PlantWeather_HistoricalTimelineData_DTO>,
  next: undefined | DataRequestWithContext<PlantWeather_HistoricalTimelineData_DTO>,
) {
  const prevData: undefined | PlantWeather_HistoricalTimelineData_DTO = prev?.dataRequest.data;
  const nextData: undefined | PlantWeather_HistoricalTimelineData_DTO = next?.dataRequest.data;

  if (!prev || !prevData || !next || !nextData) {
    return;
  }

  Object.keys(nextData.seriesData).forEach((seriesId) => {
    const prevDataPoints = prevData.seriesData[seriesId] || [];
    const nextDataPoints = nextData.seriesData[seriesId] || [];

    nextDataPoints.forEach((nextPoint) => {
      const prevPoint = prevDataPoints.find((p) => p.interval.start === nextPoint.interval.start);
      if (prevPoint && prevPoint.value !== nextPoint.value) {
        prevPoint.value = nextPoint.value;
      }
    });
  });
}

export function appendData_mutate(
  prev: undefined | DataRequestWithContext<PlantWeather_HistoricalTimelineData_DTO>,
  next: undefined | DataRequestWithContext<PlantWeather_HistoricalTimelineData_DTO>,
) {
  const prevData: undefined | PlantWeather_HistoricalTimelineData_DTO = prev?.dataRequest.data;
  const nextData: undefined | PlantWeather_HistoricalTimelineData_DTO = next?.dataRequest.data;

  if (!prev || !prevData || !next || !nextData) {
    return;
  }

  Object.keys(nextData.seriesData).forEach((seriesId) => {
    const nextDataPoints = nextData.seriesData[seriesId] || [];

    if (!prevData.seriesData[seriesId]) {
      prevData.seriesData[seriesId] = [];
    }

    prevData.seriesData[seriesId].push(...nextDataPoints);
  });
}

export function replaceData_mutate(
  prev: undefined | DataRequestWithContext<PlantWeather_HistoricalTimelineData_DTO>,
  next: undefined | DataRequestWithContext<PlantWeather_HistoricalTimelineData_DTO>,
) {
  const prevData: undefined | PlantWeather_HistoricalTimelineData_DTO = prev?.dataRequest.data;
  const nextData: undefined | PlantWeather_HistoricalTimelineData_DTO = next?.dataRequest.data;

  if (!prev || !prevData || !next || !nextData) {
    return;
  }

  prevData.seriesData = nextData.seriesData;
}
