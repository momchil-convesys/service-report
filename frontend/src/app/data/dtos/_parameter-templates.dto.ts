export interface ParameterDefinitionDTO {
  id: string;

  name: string;

  type: 'number' | 'string';
  unit: string | null; // E.g.: kWh, V, A, °C; if type is string, then unit is set to null
}

// GET /parameters-templates
// Returns a list of ParametersTemplateDTO
//
// GET /parameters-templates/:id
// Get single template by ID

// Collection of parameters applicable for certain device metadata (software/hardware version)
export interface ParametersTemplateDTO {
  id: string;

  // list of parameter ids that will be shown in device metrics table
  parameterIdsVisibleInDeviceMetrics: string[];

  // list of parameter ids that will be shown in inverter detail page
  // this is applicable onlly for plants with transformer stations
  parameterIdsVisibleInInverterMetrics: string[];

  // list of parameter definitions
  parameters: ParameterDefinitionDTO[];
}
