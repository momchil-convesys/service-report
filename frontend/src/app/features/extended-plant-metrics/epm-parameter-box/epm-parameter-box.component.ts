import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { ValueDisplayComponent } from '../../../shared/value-display/value-display.component';
import { LevelOfMeasurementMetadata_DTO } from '../_data/dto';

export interface EpmParameterBoxInput {
  totalForPlant: number | null;
  valuesPerSubLevel: (number | null)[];

  unit: string | undefined;
  format: string;

  metadata: LevelOfMeasurementMetadata_DTO | undefined;
}

@Component({
  selector: 'app-epm-parameter-box',
  imports: [ValueDisplayComponent],
  templateUrl: './epm-parameter-box.component.html',
  styleUrl: './epm-parameter-box.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EpmParameterBoxComponent {
  @Input({ required: true }) data: EpmParameterBoxInput | undefined;
  @Input() label: string = $localize`Plant total`;
}
