import { BESSAssetBaseDTO, BESSAssetType } from '../asset-base.dto';

export interface BESSBatteryCellDTO extends BESSAssetBaseDTO {
  type: BESSAssetType.BatteryCell;

  /**
   * TODO: Battery cell specific properties
   *
   * E.g:
   *  - cell position
   *  - cell voltage
   *  - cell temperature
   *  - cell state of charge
   *  - etc.
   */
}
