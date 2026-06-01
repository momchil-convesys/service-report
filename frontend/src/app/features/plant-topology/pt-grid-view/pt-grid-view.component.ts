import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { PlantTopology_DTO } from '../_data/models';

@Component({
  selector: 'app-pt-grid-view',
  imports: [],
  templateUrl: './pt-grid-view.component.html',
  styleUrl: './pt-grid-view.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PtGridViewComponent {
  @Input({ required: true }) plantTopology: PlantTopology_DTO | undefined;
}
