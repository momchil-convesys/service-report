// import { MaterialEntry } from '../service-report-materials/models';
// import { TravellingEntry } from '../service-report-travelling/models';
// import { WorkEntry } from '../service-report-work/models';

import { MaterialEntry } from '../service-report-detail/service-report-edit/service-report-materials/models';
import { TravellingEntry } from '../service-report-detail/service-report-edit/service-report-travelling/models';
import { WorkEntry } from '../service-report-detail/service-report-edit/service-report-work/models';

export interface Datetime {
  date: string; // "2021-05-18"
  time: string; // "19:20"
}

export interface ReportData {
  materials: MaterialEntry[];
  travelling: TravellingEntry[];
  works: WorkEntry[];
  [key: string]: any; // pther props
}
