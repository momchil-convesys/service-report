export interface ServiceReportMaterialsEntry {
  schemaId: string;
  name: string;
  quantity: number;
  dismantledSerialNumber: string;
  installedSerialNumber: string;
  schematicLabel: string;
  itemNumber?: string;
}

export interface ServiceReportTravellingEntry {}

export interface ServiceReportWorkEntry {}

export interface ServiceReport {
  id: string | undefined;

  materials: ServiceReportMaterialsEntry[];
  travelling: ServiceReportTravellingEntry[];
  work: ServiceReportWorkEntry[];
}

export interface SchematicElement {
  id: string;
  label: string;
}

export interface MaterialsInventoryItemBase {
  id: number;
  name: string;
  schematicLabel: string;
  itemNumber: string | null;
}
