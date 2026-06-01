import {
  LevelOfMeasurement,
  LevelOfMeasurementMetadata_DTO,
  PlantMetricsMetadata_DTO,
} from './dto';

export function getMetadataForLevelOfMeasurement(
  levelOfMeasurement: LevelOfMeasurement,
  metadata: PlantMetricsMetadata_DTO,
): LevelOfMeasurementMetadata_DTO | null {
  switch (levelOfMeasurement) {
    case LevelOfMeasurement.PowerMeters:
      return metadata.powerMetersLevel;
    case LevelOfMeasurement.HighVoltage:
      return metadata.highVoltageLevel;
    case LevelOfMeasurement.MediumVoltage:
      return metadata.mediumVoltageLevel;
    case LevelOfMeasurement.TransformerStations:
      return metadata.transformerStationsLevel;
    default:
      return null;
  }
}
