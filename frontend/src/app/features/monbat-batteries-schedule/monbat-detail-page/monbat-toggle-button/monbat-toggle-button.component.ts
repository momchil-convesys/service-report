import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'app-monbat-toggle-button',
  templateUrl: './monbat-toggle-button.component.html',
  styleUrl: './monbat-toggle-button.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class MonbatToggleButtonComponent {
  @Input({ required: true }) type: 'enable' | 'disable' | undefined;

  @Input() loading: boolean | undefined;
  @Input() disabled: boolean | undefined;

  @Output() btnClick = new EventEmitter<void>();

  onClick() {
    this.btnClick.next();
  }
}
