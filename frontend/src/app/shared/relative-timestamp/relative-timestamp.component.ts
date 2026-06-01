import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { RelativeDatePipe } from '../pipes/relative-date.pipe';

@Component({
  selector: 'app-relative-timestamp[timestamp]',
  imports: [CommonModule, RelativeDatePipe],
  templateUrl: './relative-timestamp.component.html',
  styleUrls: ['./relative-timestamp.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelativeTimestampComponent {
  @Input({ required: true }) timestamp!: Date | string;

  @HostBinding('class.plain') @Input() plain = false;
}
