import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { Observable, ReplaySubject, exhaustMap } from 'rxjs';
import {
  AccessControlPermission,
  AlarmTriggerType,
  DataRequest,
  triggerStatusLabels,
} from '../../constants';
import { UsersService } from '../../data/services/users.service';
import { AlarmTriggersService } from '../../features/alarm-triggers/_data/data.service';
import { TriggerDetailsForDevice } from '../../features/alarm-triggers/_data/dto';
import { AlarmTrigger } from '../../features/alarm-triggers/_data/models';

@Component({
  selector: 'app-alarm-trigger-link[id][type]',
  imports: [CommonModule, RouterModule, NzButtonModule],
  templateUrl: './alarm-trigger-link.component.html',
  styleUrls: ['./alarm-trigger-link.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlarmTriggerLinkComponent implements OnChanges {
  @Input({ required: true }) id!: string;
  @Input({ required: true }) type!: AlarmTriggerType;
  @Input() deviceId: string | undefined;

  triggerRequest$: Observable<DataRequest<AlarmTrigger>>;

  triggerStatusLabels = triggerStatusLabels;

  userHasAccess: boolean;

  private inputChange$ = new ReplaySubject<{
    id: string;
    type: AlarmTriggerType;
  }>(1);

  constructor(
    private triggersService: AlarmTriggersService,
    usersService: UsersService,
  ) {
    this.triggerRequest$ = this.inputChange$.pipe(
      exhaustMap((input) => this.triggersService.getAlarmTrigger(input.id, input.type)),
    );

    this.userHasAccess = usersService.hasCurrentUserPermission(
      AccessControlPermission.AlarmTriggers_Manage,
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.inputChange$.next({
      id: this.id,
      type: this.type,
    });
  }

  getTriggerDetailsForDevice(
    trigger: AlarmTrigger,
    deviceId: string,
  ): TriggerDetailsForDevice | undefined {
    return trigger.affectedDevicesDetails?.find((details) => details.deviceId === deviceId);
  }
}
