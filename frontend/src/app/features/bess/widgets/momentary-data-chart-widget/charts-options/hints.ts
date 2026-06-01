import { BESSAssetType } from '../../../_data/dto/assets/asset-base.dto';

export const preferredOptionsPerParameter: Record<
  string,
  { min?: number; max?: number; color?: string; negativeColor?: string }
> = {
  stateOfCharge: {
    min: 0,
    max: 100,
    // color: '#23BE73', // This is overwritten by the preferred colors per asset type
  },
  stateOfHealth: {
    min: 0,
    max: 100,
    color: '#99ACBD',
  },
  chargeDischargePower: {
    color: '#A7D32E',
    negativeColor: '#33B4F4',
  },
  highestPackTemperature: {
    color: '#ff9e13',
  },
  lowestPackTemperature: {
    color: '#9d80bf',
  },
  packOfHighestTemperature: {
    color: '#ff9e13',
  },
  packOfLowestTemperature: {
    color: '#9d80bf',
  },
};

export function getPreferredColors(parameterKey: string, assetType: string): string | undefined {
  switch (parameterKey) {
    case 'stateOfCharge': {
      switch (assetType) {
        case BESSAssetType.BatteryContainer:
          return '#14995D';
        case BESSAssetType.BatteryRack:
          return '#23BE73';
        case BESSAssetType.BatteryPack:
          return '#6CD99D';
        default:
          return undefined;
      }
    }

    default:
      return undefined;
  }
}
