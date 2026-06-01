// import { TravellingEntry } from '../service-report-travelling/models';
// import { WorkEntry } from '../service-report-work/models';
import { FormGroup } from '@angular/forms';
//import { WorkEntry } from '../service-report-detail/service-report-work/models';
import { Datetime } from './models';

export const datetimeToDate = (datetime: Datetime): Date => {
  return new Date(datetime.date + 'T' + datetime.time);
};

export const dateToDateTime = (dateObject: Date): Datetime => {
  return {
    // yyyy-MM-dd
    date: dateObject.toLocaleDateString('fr-ca'),
    // HH:mm
    time: dateObject.toLocaleTimeString('en-gb', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  };
};

export const getFormGroup = (entryForm: FormGroup, prop: string): FormGroup => {
  return entryForm.get(prop) as FormGroup;
};
export const getFormGroup1 = (res: FormGroup): FormGroup => {
  return res as FormGroup;
};
