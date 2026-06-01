import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { DeviceStateModule } from '../../../shared/device-state/device-state.module';
import { DurationPipe } from '../../../shared/pipes/duration.pipe';
import { RelativeTimestampComponent } from '../../../shared/relative-timestamp/relative-timestamp.component';
import { DevicesAvailability } from '../_data/models';

@Component({
  selector: 'app-device-availability-timeline[data]',
  imports: [
    NzTimelineModule,
    DeviceStateModule,
    RelativeTimestampComponent,
    DurationPipe,
    NzSpinModule,
  ],
  templateUrl: './device-availability-timeline.component.html',
  styleUrls: ['./device-availability-timeline.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeviceAvailabilityTimelineComponent implements OnInit {
  @Input({ required: true }) data: DevicesAvailability | undefined;
  @Input({ required: true }) loading: boolean = false;

  constructor() {}

  ngOnInit(): void {}
}
