import { Inverter_DTO } from '../../../../../data/dtos';
import { Device, Plant } from '../../../../../data/models';

export interface InverterPowerChartContext {
  plant: Plant;
  device: Device;
  inverter: Inverter_DTO;
}
