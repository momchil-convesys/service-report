import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { IconName } from '../../../../shared/flow-chart/icons/icon-names';
import { IconsComponent } from '../../../../shared/flow-chart/icons/icons.component';
import { ValueDisplayComponent } from '../../../../shared/value-display/value-display.component';

export interface LiveMetricsParameterBoxInput {
  total: number | null;
  perSubPlant: (number | null)[];
  unit: string | undefined;
  format: string;
  subPlantLabels?: string[];
}

@Component({
  selector: 'app-live-metrics-parameter-box',
  imports: [ValueDisplayComponent, IconsComponent],
  templateUrl: './live-metrics-parameter-box.component.html',
  styleUrl: './live-metrics-parameter-box.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiveMetricsParameterBoxComponent {
  @Input({ required: true }) data: LiveMetricsParameterBoxInput | undefined;
  @Input() label: string = $localize`Plant total`;
  @Input() showSubPlantValues = true;
  @Input() emphasizeTotal = false;
  @Input() titleIcon?: IconName;
  @Input() titleArrowIcon?: IconName;
  readonly subPlantFallbackLabelPrefix = $localize`Sub plant `;
}
