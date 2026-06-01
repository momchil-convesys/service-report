//------------------------------------------------------------------------------------
// Available fauls
//
// Base definitions/descriptions of faults without specific values

export interface FaultDefinitionDTO {
  id: string; // E.g: '666.m.280.07' (constructed as: <fault-definitions-id>.<master/slave>.<group-code>.<fault-code>)
  name: string; // Display name E.g: "Error in Fault 3 group"
  code: string; // Display code, E.g: "07"
  isMajor?: boolean;
  // isWarning?: boolean; // Not used
}

export interface FaultDefinitionGroupDTO {
  id: string; // E.g: '666.m.280' (constructed as: <fault-definitions-id>.<master/slave>.<group-code>)
  name: string; // Display name, E.g: "Fault main"
  code: string; // Display code, E.g: "280"
  faults: FaultDefinitionDTO[];
}

export interface FaultsTemplateDTO {
  id: string; // ID referencing a particular version of faults definition
  master: FaultDefinitionGroupDTO[];
  slave?: FaultDefinitionGroupDTO[];

  hideFilteringOptions: boolean | undefined;
}
