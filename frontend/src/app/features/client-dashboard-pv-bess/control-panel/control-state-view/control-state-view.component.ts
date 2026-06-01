import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { BehaviorSubject, Observable } from 'rxjs';
import { ValueDisplayComponent } from '../../../../shared/value-display/value-display.component';
import { CurrentControlStateDTO } from '../../../power-schedule/_data/control-state.dto';

@Component({
  selector: 'app-control-state-view',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    NzCardModule,
    NzTypographyModule,
    NzSkeletonModule,
    ValueDisplayComponent,
  ],
  templateUrl: './control-state-view.component.html',
  styleUrl: './control-state-view.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlStateViewComponent {
  @Input() controlState$: Observable<CurrentControlStateDTO | null> | null = null;
  @Input() controlStateLoading$: Observable<boolean> | BehaviorSubject<boolean> | null = null;

  getControlMechanismType(state: CurrentControlStateDTO): string {
    return state.controlMechanism.type;
  }

  getControlMechanismDetails(state: CurrentControlStateDTO): string {
    const mechanism = state.controlMechanism;
    switch (mechanism.type) {
      case 'DailySchedule':
        return `Schedule ID: ${mechanism.scheduleId}`;
      case 'ManualScheduleAdjustment':
        return `Adjusted by ${mechanism.userDisplayName} at ${new Date(mechanism.timestamp).toLocaleString()}`;
      case 'ManualControl':
        return `Controlled by ${mechanism.userDisplayName} at ${new Date(mechanism.timestamp).toLocaleString()}`;
      case 'ExternalSystemControl':
        return `External control since ${new Date(mechanism.timestamp).toLocaleString()}`;
      default:
        return 'Unknown';
    }
  }
}
