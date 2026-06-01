import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { APP_LOCALE_ID } from '../../../app-locale';
import { PlantMetricsCurrentValuesData } from '../../extended-plant-metrics/_data/models';
import {
  getParameterBoxInputFor_ActiveEnergy,
  getParameterBoxInputFor_ActivePower,
  getParameterBoxInputFor_PowerFactor,
  getParameterBoxInputFor_ReactiveEnergy,
  getParameterBoxInputFor_ReactivePower,
} from '../../extended-plant-metrics/epm-parameter-box/data-helpers';
import {
  EpmParameterBoxComponent,
  EpmParameterBoxInput,
} from '../../extended-plant-metrics/epm-parameter-box/epm-parameter-box.component';
import { LevelOfMeasurementMetadata_DTO } from '../_data/dto';

@Component({
  selector: 'app-epm-live-data',
  imports: [CommonModule, NzTabsModule, EpmParameterBoxComponent],
  templateUrl: './epm-live-data.component.html',
  styleUrl: './epm-live-data.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EpmLiveDataComponent {
  @Input({ required: true }) data: PlantMetricsCurrentValuesData | undefined;
  @Input({ required: true }) metadata: LevelOfMeasurementMetadata_DTO | undefined | undefined;

  @Input({ required: true }) activeTab:
    | 'current-values'
    | 'daily-totals'
    | 'all-time-totals'
    | null = null;

  /**
   * Force text for power factor to
   * break into two lines.
   */
  getLocaleSpecificWidth(): string {
    if (APP_LOCALE_ID === 'bg') {
      return '160px';
    } else if (APP_LOCALE_ID === 'en-GB') {
      return '80px';
    }

    return '100%';
  }

  //----------------------------------------------------------------------------
  // Power

  getParameterBoxInputFor_ActivePower(
    data: PlantMetricsCurrentValuesData,
    metadata: LevelOfMeasurementMetadata_DTO | undefined,
    key: 'activePower_Generated' | 'activePower_Consumed',
  ): EpmParameterBoxInput {
    return getParameterBoxInputFor_ActivePower(data, metadata, key);
  }

  getParameterBoxInputFor_ReactivePower(
    data: PlantMetricsCurrentValuesData,
    metadata: LevelOfMeasurementMetadata_DTO | undefined,
    key: 'reactivePower_Generated' | 'reactivePower_Consumed',
  ): EpmParameterBoxInput {
    return getParameterBoxInputFor_ReactivePower(data, metadata, key);
  }

  getParameterBoxInputFor_PowerFactor(
    data: PlantMetricsCurrentValuesData,
    metadata: LevelOfMeasurementMetadata_DTO | undefined,
  ): EpmParameterBoxInput {
    return getParameterBoxInputFor_PowerFactor(data, metadata);
  }

  //----------------------------------------------------------------------------
  // Energy (Counters)

  getParameterBoxInputFor_ActiveEnergy(
    data: PlantMetricsCurrentValuesData,
    metadata: LevelOfMeasurementMetadata_DTO | undefined,
    key: 'activeEnergy_Generated' | 'activeEnergy_Consumed',
    period: 'daily' | 'allTime',
  ): EpmParameterBoxInput {
    return getParameterBoxInputFor_ActiveEnergy(data, metadata, key, period);
  }

  getParameterBoxInputFor_ReactiveEnergy(
    data: PlantMetricsCurrentValuesData,
    metadata: LevelOfMeasurementMetadata_DTO | undefined,
    key: 'reactiveEnergy_Generated' | 'reactiveEnergy_Consumed',
    period: 'daily' | 'allTime',
  ): EpmParameterBoxInput {
    return getParameterBoxInputFor_ReactiveEnergy(data, metadata, key, period);
  }
}
