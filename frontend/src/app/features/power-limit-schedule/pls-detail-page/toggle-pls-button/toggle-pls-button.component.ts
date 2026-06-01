import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'app-toggle-pls-button',
  templateUrl: './toggle-pls-button.component.html',
  styleUrl: './toggle-pls-button.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class TogglePlsButtonComponent {
  @Input({ required: true }) type: 'enable' | 'disable' | undefined;

  @Input() loading: boolean | undefined;
  @Input() disabled: boolean | undefined;

  @Output() btnClick = new EventEmitter<void>();

  onClick() {
    this.btnClick.next();
  }
}
