import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'app-toggle-ges-button',
  templateUrl: './toggle-ges-button.component.html',
  styleUrl: './toggle-ges-button.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ToggleGesButtonComponent {
  @Input({ required: true }) type: 'enable' | 'disable' | undefined;

  @Input() loading: boolean | undefined;
  @Input() disabled: boolean | undefined;

  @Output() btnClick = new EventEmitter<void>();

  onClick() {
    this.btnClick.next();
  }
}
