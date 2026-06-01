import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'app-toggle-power-schedule-button',
  templateUrl: './toggle-power-schedule-button.component.html',
  styleUrl: './toggle-power-schedule-button.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class TogglePowerScheduleButtonComponent {
  @Input({ required: true }) type: 'enable' | 'disable' | undefined;

  @Input() loading: boolean | undefined;
  @Input() disabled: boolean | undefined;

  @Output() btnClick = new EventEmitter<void>();

  onClick() {
    this.btnClick.next();
  }
}

