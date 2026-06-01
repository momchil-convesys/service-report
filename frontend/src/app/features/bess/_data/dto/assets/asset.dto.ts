import { BESSBatteryContainerDTO } from './subtypes/asset-bc.dto';
import { BESSItselfDTO } from './subtypes/asset-bess.dto';
import { BESSBatteryCellDTO } from './subtypes/asset-cell.dto';
import { BESSInverterDTO } from './subtypes/asset-inverter.dto';
import { BESSBatteryPackDTO } from './subtypes/asset-pack.dto';
import { BESSBatteryRackDTO } from './subtypes/asset-rack.dto';
import { BESSTransformerStationDTO } from './subtypes/asset-ts.dto';

export type BESSAssetDTO =
  | BESSItselfDTO
  | BESSTransformerStationDTO
  | BESSInverterDTO
  | BESSBatteryContainerDTO
  | BESSBatteryRackDTO
  | BESSBatteryPackDTO
  | BESSBatteryCellDTO;
