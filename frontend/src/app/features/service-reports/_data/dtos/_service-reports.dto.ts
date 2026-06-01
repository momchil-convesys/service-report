export interface ServiceReportListDto {
  report: any[];
  draft: any[];
}
export interface ServiceReportDto {
  id: string;
  plant: any;
  device: any;
  reportId: string;
  materials: [];
  travelling: [];
  works: [];
  plantId: string;
  installedPowerMwp: string;
  country: string;
  statusReport: string;
  deviceId: string;
  stringBoxNumber: string;
  complaintNumber: string;
  inverterType: string;
  stringBoxType: string;
  contractNumber: string;
  inverterSerialNumber: string;
  stringBoxSerialNumber: string;
  warrantyStatus: string;
  otherEquipment: string;
  typeActivity: any;
  userPlants: any;
  userClient: any;
  [key: string]: any; // other props
}
export interface ServiceRreportSaveDto {
  id: string;
  statusReport: string;
  plantId: string;
  deviceId: string;
  typeActivity: any;
  complaintNumber: string;
  materials: [];
  travelling: [];
  works: [];
}
