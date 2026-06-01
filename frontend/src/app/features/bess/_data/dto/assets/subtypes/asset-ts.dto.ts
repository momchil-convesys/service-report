import { BESSAssetBaseDTO, BESSAssetType } from '../asset-base.dto';

export interface BESSTransformerStationDTO extends BESSAssetBaseDTO {
  type: BESSAssetType.TransformerStation;

  /**
   * TODO: TS specific properties
   */
}
