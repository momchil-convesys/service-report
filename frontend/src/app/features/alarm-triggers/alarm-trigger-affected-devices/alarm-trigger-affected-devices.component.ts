import { Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Observable, Subject, exhaustMap, share, tap } from 'rxjs';
import { AlarmTriggerType, DataRequest, triggerStatusLabels } from '../../../constants';
import { AlarmTriggersApiService } from '../_data/api.service';
import { TriggerDetailsForDevice } from '../_data/dto';
import { AlarmTrigger } from '../_data/models';

@Component({
  selector: 'app-alarm-trigger-affected-devices',
  templateUrl: './alarm-trigger-affected-devices.component.html',
  styleUrls: ['./alarm-trigger-affected-devices.component.less'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class AlarmTriggerAffectedDevicesComponent implements OnChanges {
  @Input() trigger: AlarmTrigger | undefined;

  affectedDevicesDetails: TriggerDetailsForDevice[] = [];

  actionClick$ = new Subject<{
    triggerId: string;
    triggerType: AlarmTriggerType;
    deviceIds: string[];
    action: 'enable' | 'unmute' | 'disable';
  }>();

  actionRequest$: Observable<DataRequest<TriggerDetailsForDevice[]>> | undefined;

  triggerStatusLabels = triggerStatusLabels;

  constructor(private api: AlarmTriggersApiService) {
    this.actionRequest$ = this.actionClick$.pipe(
      exhaustMap(({ triggerId, triggerType, deviceIds, action }) =>
        this.api.alterTriggerStateForDevices(triggerId, triggerType, deviceIds, action),
      ),
      tap((request) => {
        if (!request.isLoading && !request.error) {
          this.affectedDevicesDetails = request.data || [];
        }
      }),
      share(),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.affectedDevicesDetails = this.trigger?.affectedDevicesDetails || [];
  }

  onSwitchModelChange(deviceId: string, model: boolean) {
    this.onAlterTriggerStateForDevices(deviceId, model ? 'enable' : 'disable');
  }

  onAlterTriggerStateForDevices(
    deviceId: string | undefined,
    action: 'enable' | 'unmute' | 'disable',
  ) {
    if (!this.trigger) {
      return;
    }

    const deviceIds = deviceId
      ? [deviceId]
      : this.affectedDevicesDetails.map((item) => item.deviceId);

    this.actionClick$.next({
      triggerId: this.trigger.id!,
      triggerType: this.trigger.type,
      deviceIds,
      action,
    });
  }

  trackByFn(index: number, item: TriggerDetailsForDevice): any {
    return item.deviceId;
  }
}
