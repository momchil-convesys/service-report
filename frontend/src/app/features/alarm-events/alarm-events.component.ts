import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-alarm-events',
  templateUrl: './alarm-events.component.html',
  styleUrls: ['./alarm-events.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AlarmEventsComponent {}
