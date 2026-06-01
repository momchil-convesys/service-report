import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { MonbatActiveSchedule } from '../_data/dto';

@Component({
  selector: 'app-monbat-schedule-indicator',
  imports: [NzPopoverModule, NzIconModule, RouterLink, NzButtonModule],
  templateUrl: './monbat-schedule-indicator.component.html',
  styleUrl: './monbat-schedule-indicator.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonbatScheduleIndicatorComponent {
  @Input({ required: true }) activeSchedule: MonbatActiveSchedule | null = null;
  @Input({ required: true }) plantId: string | undefined;
  @Input({ required: true }) deviceId: string | undefined;
  @Input() mode: 'icon' | 'tag' = 'icon';

  linkToSchedule(): string | undefined {
    if (!this.activeSchedule || !this.activeSchedule.fileRefId || !this.plantId || !this.deviceId) {
      return undefined;
    }

    return `/home/${this.plantId}/devices/${this.deviceId}/monbat-schedule/${this.activeSchedule.fileRefId}`;
  }
}
