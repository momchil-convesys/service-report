import { IconName } from '../flow-chart/icons/icon-names';

export interface PercentageSummaryViewItem {
  text: string;
  value: number;
  unit: string;
  color: string;
  icon?: IconName; // SVG symbol ID (e.g., 'grid-icon')
  arrowIcon?: IconName; // SVG symbol ID (e.g., 'arrow-left')
}

export interface PercentageSummaryViewData {
  total: PercentageSummaryViewItem;
  parts: PercentageSummaryViewItem[];
}

/**
 * Example:
 *
 * title: {
 *   text: 'Consumed by appliances',
 *   value: 54.04, // total value (100%)
 *   unit: 'kWh'
 * }
 *
 * parts: [
 *   {
 *     text: 'From PV',
 *     value: 4.63, // percentage will be calculated automatically (8.56%)
 *     unit: 'kWh',
 *     color: '#000000'
 *   },
 *   {
 *     text: 'From grid',
 *     value: 49.46, // percentage will be calculated automatically (91.44%)
 *     unit: 'kWh',
 *     color: '#000000'
 *   }
 * ]
 */
