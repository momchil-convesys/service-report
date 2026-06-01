import { differenceInMilliseconds } from 'date-fns';
import { ONE_MINUTE } from '../../../../constants';

function isPointStale(timestamp: string): boolean {
  return differenceInMilliseconds(new Date(), new Date(timestamp)) > ONE_MINUTE * 2;
}

export function stalePointColorOpacityChange(timestamp: string): string {
  return isPointStale(timestamp) ? '77' : '';
}
