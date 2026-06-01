import { Component } from '@angular/core';
//import { EntryListBaseComponent } from '../common/entry-list-base.component';
import { EntryListBaseComponent } from '../../../common/entry-list-base.component';
import { WorkEntry, WorkEntryFormValue } from './models';

@Component({
  selector: 'app-service-report-work',
  templateUrl: './service-report-work.component.html',
  styleUrls: ['./service-report-work.component.less'],
  standalone: false,
})
export class ServiceReportWorkComponent extends EntryListBaseComponent<
  WorkEntry,
  WorkEntryFormValue
> {
  constructor() {
    super();
  }

  toFormValue(entry: WorkEntry): WorkEntryFormValue {
    return WorkEntry.toFormValue(entry);
  }

  toEntry(formValue: WorkEntryFormValue): WorkEntry {
    return WorkEntryFormValue.toEntry(formValue);
  }
}
