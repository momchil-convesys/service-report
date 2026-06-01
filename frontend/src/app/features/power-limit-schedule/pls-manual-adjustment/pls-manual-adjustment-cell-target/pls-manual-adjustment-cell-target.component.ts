import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { PlsValueFormattedComponent } from '../../../../shared/power-limit/pls-value-formatted/pls-value-formatted.component';
import { TableRow } from '../pls-manual-adjustment-table/_data-helpers';

@Component({
  selector: 'app-pls-manual-adjustment-cell-target',
  imports: [PlsValueFormattedComponent, NzIconModule, NzPopoverModule, DatePipe],
  templateUrl: './pls-manual-adjustment-cell-target.component.html',
  styleUrl: './pls-manual-adjustment-cell-target.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlsManualAdjustmentCellTargetComponent {
  @Input({ required: true }) data: TableRow | undefined;
  @Input({ required: true }) unitSuffixFormatted: string = '';
}
