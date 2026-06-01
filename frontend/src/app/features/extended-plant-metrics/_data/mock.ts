import { LevelOfMeasurement, PlantMetricsMetadata_DTO } from './dto';

export const mock_PlantMetricsMetadata: PlantMetricsMetadata_DTO = {
  plantId: '17',
  powerMetersLevel: {
    levelOfMeasurement: LevelOfMeasurement.PowerMeters,
    subLevels: [
      {
        subLevelId: '1',
        name: 'Power meter 1',
      },
      {
        subLevelId: '2',
        name: 'Power meter 2',
      },
    ],
  },
  highVoltageLevel: {
    levelOfMeasurement: LevelOfMeasurement.HighVoltage,
    subLevels: [
      {
        subLevelId: '1',
        name: 'HV Sub level 1',
      },
      {
        subLevelId: '2',
        name: 'HV Sub level 2',
      },
      {
        subLevelId: '3',
        name: 'HV Sub level 3',
      },
      {
        subLevelId: '4',
        name: 'HV Sub level 4',
      },
      {
        subLevelId: '5',
        name: 'HV Sub level 5',
      },
      {
        subLevelId: '6',
        name: 'HV Sub level 6',
      },
    ],
  },
  mediumVoltageLevel: {
    levelOfMeasurement: LevelOfMeasurement.MediumVoltage,
    subLevels: [
      {
        subLevelId: '1',
        name: 'Med. V Sub level 1',
      },
      {
        subLevelId: '2',
        name: 'Med. V Sub level 2',
      },
      {
        subLevelId: '3',
        name: 'Med. V Sub level 3',
      },
      {
        subLevelId: '4',
        name: 'Med. V Sub level 4',
      },
    ],
  },
  transformerStationsLevel: null,
};
