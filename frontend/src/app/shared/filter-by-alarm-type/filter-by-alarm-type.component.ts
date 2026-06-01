import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCheckboxModule, NzCheckboxOption } from 'ng-zorro-antd/checkbox';
import { AlarmTriggerType, alarmConfigTitles } from '../../constants';

@Component({
  selector: 'app-filter-by-alarm-type',
  imports: [NzCheckboxModule, FormsModule],
  templateUrl: './filter-by-alarm-type.component.html',
  styleUrls: ['./filter-by-alarm-type.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterByAlarmTypeComponent {
  @Input() model: AlarmTriggerType[] = [];
  @Output() modelChange = new EventEmitter<AlarmTriggerType[]>();

  filterOptionsEventType: NzCheckboxOption[] = Object.values(AlarmTriggerType).map((value) => ({
    label: alarmConfigTitles[value],
    value,
  }));

  onEventTypeChange(model: AlarmTriggerType[]) {
    this.modelChange.emit(model);
  }
}
