import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { GridExportSchedule_DataRecord_DTO } from '../_data/models/grid-export-schedule.dto';
import { GridExportSchedule_ForDay } from '../_data/models/grid-export-schedule.model';
import { calculatePositionInTimeRelativeToInterval } from '../helpers';

@Component({
  selector: 'app-ges-preview-table',
  templateUrl: './ges-preview-table.component.html',
  styleUrls: ['./ges-preview-table.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class GesPreviewTableComponent {
  @Input() schedule: GridExportSchedule_ForDay | undefined;

  expandSet = new Set<number>();
  firstColumnWidth = 200;

  get data(): GridExportSchedule_DataRecord_DTO[] {
    return this.schedule?.dataRecords || [];
  }

  getRowClass(rowData: GridExportSchedule_DataRecord_DTO): string {
    return calculatePositionInTimeRelativeToInterval(
      { start: new Date(rowData.interval.from), end: new Date(rowData.interval.to) },
      this.schedule?.plantTimeZone,
    );
  }

  onExpandChange(id: number, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
  }

  onExpandAll(withEventsOnly: boolean) {
    this.schedule?.dataRecords.forEach((value, index) => {
      if ((withEventsOnly && value.events && value.events.length) || !withEventsOnly) {
        this.expandSet.add(index);
      }
    });
  }

  onCollapseAll() {
    this.schedule?.dataRecords.forEach((value, index) => {
      this.expandSet.delete(index);
    });
  }
}
