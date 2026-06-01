import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { RelativeTimestampComponent } from '../../../shared/relative-timestamp/relative-timestamp.component';
import { GridExportSchedule_SettingsHistory_DTO } from '../_data/models/grid-export-schedule-settings.dto';

@Component({
  selector: 'app-ges-settings-history',
  imports: [NzTimelineModule, NzDividerModule, RelativeTimestampComponent],
  templateUrl: './ges-settings-history.component.html',
  styleUrl: './ges-settings-history.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GesSettingsHistoryComponent {
  @Input({ required: true }) data: GridExportSchedule_SettingsHistory_DTO | undefined;
  @Input({ required: true }) isLoading: boolean | undefined;
}
