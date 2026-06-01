import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-value-display',
  templateUrl: './value-display.component.html',
  styleUrls: ['./value-display.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
})
export class ValueDisplayComponent {
  @Input() value: number | undefined | null = null;
  @Input() unit: string = '';
  @Input() format: string = '1.0-2';
  @Input() showPlusSignIfPositive = false;
  @Input() nullText = '—'; // &mdash;
  @Input() undefinedText = '?';
}
