import { MaterialEntry } from '../../service-report-detail/service-report-edit/service-report-materials/models';
import { TravellingEntry } from '../../service-report-detail/service-report-edit/service-report-travelling/models';
import { WorkEntry } from '../../service-report-detail/service-report-edit/service-report-work/models';

export interface ServiceRreportListData {
  deviceId: string;
  deviceName: string;
  deviceSerial: string;
  endDate: string;
  id: number;
  plantId: string;
  plantName: string;
  serviceEngineer: string;
  startDate: string;
  statusRepair: string;
  statusReport: string;

  // id: number;
  // serviceEngineer: string;
  // statusRepair: string;
  // startDate: string;
  // endDate: string;
  // device: string;
  // plant: string;
  // [serviceReportsList: string]: any[];
  // serviceReportDraftsList: any[];
}

export interface ReportData {
  materials: MaterialEntry[];
  travelling: TravellingEntry[];
  works: WorkEntry[];
  genericObj: any;
  [key: string]: any; // other props
}

// export interface ServiceRreportDetailData {
//   id: number;
//   description: string;
//   name: string;
//   version: string;
//   status: string;
//   dateModified: string;
//   materials: [
//     {
//       id: 1;
//       name: 'POWER SUPPLY - TRIO-PS/1AC/24DC/2,5';
//       schematicLabel: '25K1';
//       itemNumber: '2352';
//     }
//   ];
// }
