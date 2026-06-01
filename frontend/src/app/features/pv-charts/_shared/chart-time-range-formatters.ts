import { IntegrationPeriod } from '../../../constants';
import { addIntegrationPeriod, subIntegrationPeriod } from '../../../helpers';

export function calculateApplicableRange(
  timestamp: Date,
  integrationPeriod: IntegrationPeriod | undefined,
  hasPowerMeter: boolean,
): Interval | undefined {
  let applicableRange: Interval | undefined;

  if (
    integrationPeriod === IntegrationPeriod.Hours ||
    integrationPeriod === IntegrationPeriod.QuaterOfAnHour
  ) {
    applicableRange = hasPowerMeter
      ? {
          start: subIntegrationPeriod(timestamp, integrationPeriod),
          end: timestamp,
        }
      : {
          start: timestamp,
          end: addIntegrationPeriod(timestamp, integrationPeriod),
        };
  }

  return applicableRange;
}
