import { DatePipe, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import {
  ActivePowerLimitSchedule,
  ActivePowerLimitScheduleRecord,
} from 'src/app/features/power-limit-schedule/_data/active-schedule';
import { PowerLimitIconComponent } from 'src/app/shared/power-limit/power-limit-icon/power-limit-icon.component';
import { AccessControlPermission, externalControlWarningText } from '../../../constants';
import { UsersService } from '../../../data/services/users.service';
import { utcToZonedTimeSafe } from '../../../helpers';
import { PlsValueFormattedComponent } from '../pls-value-formatted/pls-value-formatted.component';

@Component({
  selector: 'app-power-limit-schedule-indicator',
  imports: [
    DatePipe,
    NgTemplateOutlet,
    RouterLink,
    NzButtonModule,
    NzPopoverModule,
    PowerLimitIconComponent,
    PlsValueFormattedComponent,
  ],
  templateUrl: './power-limit-schedule-indicator.component.html',
  styleUrl: './power-limit-schedule-indicator.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PowerLimitScheduleIndicatorComponent {
  @Input({ required: true }) currentSchedule: ActivePowerLimitSchedule | undefined;
  @Input() scheduleLink: string | undefined;
  @Input() fileLink: string | undefined;
  @Input() mode: 'icon-only' | 'full' | 'block' = 'full';

  @HostBinding('class.mode-block') get modeBlock() {
    return this.mode === 'block';
  }

  @HostBinding('class.mode-full') get modeFull() {
    return this.mode === 'full';
  }

  @HostBinding('class.mode-icon') get modeIcon() {
    return this.mode === 'icon-only';
  }

  @HostBinding('class.controlled-by-external-system') get controlledByExternalSystem(): null | {
    powerLimitMw: number | null;
  } {
    return this.currentSchedule?.controlledByExternalSystem || null;
  }

  get externalControlWarningText() {
    return externalControlWarningText;
  }

  allowNavigateToPowerLimitSchedule: boolean;

  constructor(private usersService: UsersService) {
    this.allowNavigateToPowerLimitSchedule = this.usersService.hasCurrentUserPermissions([
      AccessControlPermission.PowerLimitSchedule_View,
    ]);
  }

  getTargetIntervalForRow(record: ActivePowerLimitScheduleRecord): Interval | null {
    if (!record.interval || !record.interval.from || !record.interval.to) {
      return null;
    }

    return {
      start: this.convertTimestampToPlantTimeZone(record.interval.from),
      end: this.convertTimestampToPlantTimeZone(record.interval.to),
    };
  }

  getUnitForRow(record: ActivePowerLimitScheduleRecord): string {
    return record.powerLimitType === 'power' ? ' MW' : ' MWh';
  }

  convertTimestampToPlantTimeZone(timestamp: string): Date {
    return utcToZonedTimeSafe(timestamp, this.currentSchedule?.plantTimeZone);
  }
}
