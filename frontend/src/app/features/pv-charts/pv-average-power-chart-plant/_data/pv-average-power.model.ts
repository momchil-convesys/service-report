import { IntegrationPeriod } from '../../../../constants';
import { GenericDataPoint } from '../../../inverter-temperature-sensors/_data/models';

/**
 * Relevant for plant only.
 */
export interface PVAveragePowerData {
  from: Date;
  to: Date;

  plantId: string;

  /**
   * The requirement is for 15 min intervals,
   * but the implementation is more generic.
   */
  integrationPeriod: IntegrationPeriod;

  dataPoints: GenericDataPoint[];

  // Populated at front end

  exportFileName?: string;
}
