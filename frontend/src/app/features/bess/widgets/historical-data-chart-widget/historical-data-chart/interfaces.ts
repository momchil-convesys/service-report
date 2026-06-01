import { BESSMetadataDTO } from '../../../_data/dto/bess.dto';

export interface HistoricalDataChartRequest {
  bessMetadata: BESSMetadataDTO;
  assetId: string;
  parameterKey: string;
  day: Date;
}
