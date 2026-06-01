export interface TransformerStation_DTO {
  // or just id
  deviceId: string; // transformer station ID

  plantId: string;

  inverters: Array<Inverter_DTO>;

  // Populated at front end

  displayName: string;
}

export interface Inverter_DTO {
  // or just id
  inverterId: string;

  displayIndex: number; // will be transformed to "Inverter {{ displayIndex }}"

  strings: Array<InverterString_DTO> | null;

  inverterSpecificMetadata?: {
    inverterMaxPower: number;
  };

  // Populated at front end

  context: {
    tsDisplayName: string | undefined;
    tsId: string;
  };
}

export interface InverterString_DTO {
  // or just id
  stringId: string;

  displayIndex: number; // will be transformed to "PV {{ displayIndex }}"
}
