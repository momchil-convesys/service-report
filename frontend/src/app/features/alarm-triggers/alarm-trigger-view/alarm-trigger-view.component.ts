import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { AlarmTrigger } from '../_data/models';

@Component({
  selector: 'app-alarm-trigger-view[selectedTrigger]',
  templateUrl: './alarm-trigger-view.component.html',
  styleUrls: ['./alarm-trigger-view.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AlarmTriggerViewComponent {
  @Input({ required: true }) selectedTrigger!: AlarmTrigger;

  @Output() edit = new EventEmitter();

  onEdit() {
    this.edit.emit();
  }
}
