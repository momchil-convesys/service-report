export interface FaultDefinition {
  id: string;
  name: string;
  code: string;
  isMajor: boolean;
}

export interface FaultDefinitionGroup {
  id: string;
  name: string;
  code: string;
  faults: FaultDefinition[];
}

export interface FaultsTemplate {
  id: string;
  master: FaultDefinitionGroup[];
  slave?: FaultDefinitionGroup[];

  hideFilteringOptions: boolean | undefined;
}
