import { IntegrationPeriod } from '../../../constants';
import {
  DataSeriesConfiguration_DTO,
  Interval_DTO,
  TimeRange_DTO,
} from '../../../data/definitions';

export interface PlantWeather_HistoricalTimelineData_DTO {
  plantId: string;
  timeRange: TimeRange_DTO;

  integrationPeriod: IntegrationPeriod;

  seriesConfigurations: DataSeriesConfiguration_DTO[];

  seriesData: {
    [seriesConfigurationId: string]: Array<{
      interval: Interval_DTO;
      value: null | number;
    }>;
  };
}

/**
 * Data replace/append example:
 * {
 *    seriesData: {
 *      [s1]: [{ timestamp, value }, { timestamp, value }, ...],
 *      [s2]: [{ timestamp, value }],
 *      [s3]: [{ timestamp, value }]
 *    }
 * }
 */
