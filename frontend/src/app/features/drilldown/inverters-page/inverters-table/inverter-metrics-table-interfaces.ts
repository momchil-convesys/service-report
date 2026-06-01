import { Inverter_DTO } from '../../../../data/dtos';
import { InverterMetrics_DataPoint_DTO } from '../_data/dto';

export interface TreeNodeInterface {
  key: string;
  name: string;

  level?: number;
  expand?: boolean;

  children?: TreeNodeInterface[];
  parent?: TreeNodeInterface;

  rowData: TableRow;
}

export interface TableRow {
  data: InverterMetrics_DataPoint_DTO | undefined;
  metadata: Inverter_DTO | undefined;
}
