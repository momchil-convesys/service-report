import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { ValueDisplayComponent } from '../../../../shared/value-display/value-display.component';

@Component({
  selector: 'app-production-value',
  imports: [ValueDisplayComponent],
  templateUrl: './production-value.component.html',
  styleUrl: './production-value.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductionValueComponent {
  @Input({ required: true }) productionValue: number | null | undefined;
}
