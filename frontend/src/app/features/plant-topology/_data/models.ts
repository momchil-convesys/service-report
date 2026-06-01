export interface Inverter_DTO {
  id: string;
  name: string;

  transformerStationId: string; // ID reference to the parent transformer station
}

export interface TransformerStation_DTO {
  id: string;
  name: string;

  inverters: Inverter_DTO[];

  plantId: string; // ID reference to the parent plant
}

export interface PlantTopology_DTO {
  id: string;
  name: string;

  transformerStations: TransformerStation_DTO[];
}
