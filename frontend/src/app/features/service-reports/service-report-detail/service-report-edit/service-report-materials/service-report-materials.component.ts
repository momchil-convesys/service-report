import { Component, OnChanges } from '@angular/core';
//import { EntryListBaseComponent } from '../common/entry-list-base.component';
import { EntryListBaseComponent } from '../../../common/entry-list-base.component';
import { MaterialsService } from './materials.service';
import { MaterialEntry, MaterialEntryEntryFormValue } from './models';

@Component({
  selector: 'app-service-report-materials',
  templateUrl: './service-report-materials.component.html',
  styleUrls: ['./service-report-materials.component.less'],
  standalone: false,
})
export class ServiceReportMaterialsComponent
  extends EntryListBaseComponent<MaterialEntry, MaterialEntryEntryFormValue>
  implements OnChanges
{
  constructor(private materialsService: MaterialsService) {
    super();
  }

  ngOnChanges() {
    if (this.entries?.length > 0) {
      this.materialsService.setBoundSchema(this.entries[0].schemaID.toString());
    } else {
      this.materialsService.setBoundSchema(undefined);
    }
  }

  toFormValue(entry: MaterialEntry): MaterialEntryEntryFormValue {
    return MaterialEntry.toFormValue(entry);
  }

  toEntry(formValue: MaterialEntryEntryFormValue): MaterialEntry {
    return MaterialEntryEntryFormValue.toEntry(formValue);
  }
}
