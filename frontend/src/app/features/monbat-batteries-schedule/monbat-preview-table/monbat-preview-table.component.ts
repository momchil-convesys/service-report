import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { MonbatSchedule } from '../_data/models';

@Component({
  selector: 'app-monbat-preview-table',
  templateUrl: './monbat-preview-table.component.html',
  styleUrls: ['./monbat-preview-table.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class MonbatPreviewTableComponent {
  @Input() data: MonbatSchedule | undefined;

  colorForCellAtIndex(cellIndex: number): string {
    const semanticColor = this.data?.scheduleTableColumns[cellIndex].semanticColor;

    if (semanticColor === 'charge') {
      return '#D1F4DE';
    } else if (semanticColor === 'discharge') {
      return '#FFE6E0';
    }

    return 'white';
  }

  cellAlignmentForCellValue(cellValue: string): string {
    return cellValue === '1' ? 'center' : 'right';
  }
}
