import { BESSMomentaryDataValue } from '../_data/models';
import { BessState } from './bess-state-indicator/bess-state-indicator.component';

export function getBessState(data: BESSMomentaryDataValue | null): BessState | null {
  if (data?.value && data.value > 0) {
    return 'discharging';
  } else if (data?.value && data.value < 0) {
    return 'charging';
  } else if (data?.value === 0) {
    return 'idle';
  } else {
    return null;
  }
}
