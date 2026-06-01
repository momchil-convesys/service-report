import { DataRequestWithContext } from './interfaces';
import { PVBESSHistoricalEnergyData } from './models';

export function patchData_mutate(
  prev: undefined | DataRequestWithContext<PVBESSHistoricalEnergyData>,
  next: undefined | DataRequestWithContext<PVBESSHistoricalEnergyData>,
) {
  throw new Error('Not implemented yet');
}

export function appendData_mutate(
  prev: undefined | DataRequestWithContext<PVBESSHistoricalEnergyData>,
  next: undefined | DataRequestWithContext<PVBESSHistoricalEnergyData>,
) {
  const prevData: undefined | PVBESSHistoricalEnergyData = prev?.dataRequest.data;
  const nextData: undefined | PVBESSHistoricalEnergyData = next?.dataRequest.data;

  if (!prev || !prevData || !next || !nextData) {
    return;
  }
  const nextDataPoints = nextData.dataPoints;

  if (!prevData.dataPoints) {
    prevData.dataPoints = [];
  }

  prevData.dataPoints.push(...nextDataPoints);
}

export function replaceData_mutate(
  prev: undefined | DataRequestWithContext<PVBESSHistoricalEnergyData>,
  next: undefined | DataRequestWithContext<PVBESSHistoricalEnergyData>,
) {
  const prevData: undefined | PVBESSHistoricalEnergyData = prev?.dataRequest.data;
  const nextData: undefined | PVBESSHistoricalEnergyData = next?.dataRequest.data;

  if (!prev || !prevData || !next || !nextData) {
    return;
  }

  prevData.dataPoints = nextData.dataPoints;
}
