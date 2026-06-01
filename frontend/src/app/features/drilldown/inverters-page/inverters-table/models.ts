import { Inverter_DTO } from '../../../../data/dtos';
import { InverterMetrics_DataPoint_DTO } from '../_data/dto';

export interface InverterMetricsTableItem {
  inverter: Inverter_DTO;
  data: InverterMetrics_DataPoint_DTO | undefined;
}
