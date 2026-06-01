import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-pls-historical-data-page',
  templateUrl: './pls-historical-data-page.component.html',
  styleUrl: './pls-historical-data-page.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PlsHistoricalDataPageComponent {}
