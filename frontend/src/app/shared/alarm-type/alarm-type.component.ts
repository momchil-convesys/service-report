import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { alarmConfigShortLabels, alarmConfigTitles, AlarmTriggerType } from '../../constants';

@Component({
  selector: 'app-alarm-type',
  imports: [CommonModule, NzIconModule],
  templateUrl: './alarm-type.component.html',
  styleUrls: ['./alarm-type.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlarmTypeComponent implements OnInit {
  @Input() type: AlarmTriggerType | undefined;
  @Input() variant: 'full' | 'icon' | 'short' = 'short';

  AlarmTriggerType = AlarmTriggerType;

  cssClassesByType: { [t in AlarmTriggerType]: string } = {
    [AlarmTriggerType.DeviceStateChange]: 'sc',
    [AlarmTriggerType.FaultRecurrence]: 'fr',
    [AlarmTriggerType.ParameterBoundaries]: 'pb',
  };

  constructor() {}

  ngOnInit(): void {}

  labelForType(type: AlarmTriggerType): string {
    return this.variant === 'full' ? alarmConfigTitles[type] : alarmConfigShortLabels[type];
  }
}
