import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { AlarmTrigger, TriggerDeleteAction } from '../_data/models';

@Component({
  selector: 'app-alarm-trigger-delete-action[trigger]',
  templateUrl: './alarm-trigger-delete-action.component.html',
  styleUrls: ['./alarm-trigger-delete-action.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AlarmTriggerDeleteActionComponent {
  @Input({ required: true }) trigger!: AlarmTrigger;

  @Output() delete = new EventEmitter<TriggerDeleteAction>();

  isVisible = false;
  deleteRelatedEvents = false;

  handleOk(): void {
    this.isVisible = false;
    this.delete.emit({ trigger: this.trigger, deleteRelatedEvents: this.deleteRelatedEvents });
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  showModal(): void {
    this.isVisible = true;
  }
}
