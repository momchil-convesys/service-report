import { Component } from '@angular/core';
//import { EntryListBaseComponent } from '../common/entry-list-base.component';
import { EntryListBaseComponent } from '../../../common/entry-list-base.component';
import { TravellingEntry, TravellingEntryFormValue } from './models';

@Component({
  selector: 'app-service-report-travelling',
  templateUrl: './service-report-travelling.component.html',
  styleUrls: ['./service-report-travelling.component.less'],
  standalone: false,
})
export class ServiceReportTravellingComponent extends EntryListBaseComponent<
  TravellingEntry,
  TravellingEntryFormValue
> {
  constructor() {
    super();
  }

  toFormValue(entry: TravellingEntry): TravellingEntryFormValue {
    return TravellingEntry.toFormValue(entry);
  }

  toEntry(formValue: TravellingEntryFormValue): TravellingEntry {
    return TravellingEntryFormValue.toEntry(formValue);
  }
}
