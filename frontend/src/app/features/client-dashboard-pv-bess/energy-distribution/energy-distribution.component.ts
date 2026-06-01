import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Observable } from 'rxjs';
import { PvBessViewMode } from '../constants';
import { EnergySummaryBoxComponent } from '../energy-summary-box/energy-summary-box.component';
import { EnergySummaryBoxDataAll } from '../energy-summary-box/models';
import { EnergyDistributionDataService } from './_data/data.service';
import { EnergyDistributionSummary } from './_data/model';

@Component({
  selector: 'app-energy-distribution',
  standalone: true,
  imports: [CommonModule, FormsModule, EnergySummaryBoxComponent, NzRadioModule, NzSpinModule],
  templateUrl: './energy-distribution.component.html',
  styleUrl: './energy-distribution.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnergyDistributionComponent {
  @Input() viewMode: PvBessViewMode = 'default';

  energyDistributionDataService = inject(EnergyDistributionDataService);

  energyDistributionData$: Observable<EnergyDistributionSummary | null | undefined> =
    this.energyDistributionDataService.getData();
  loading$: Observable<boolean> = this.energyDistributionDataService.getLoading();

  getTitle(direction: 'export' | 'import', voltageLevel: 'MV' | 'HV'): string {
    const suffix = voltageLevel === 'HV' ? $localize` (HV)` : $localize` (MV)`;
    return direction === 'export'
      ? $localize`Exported to Grid` + suffix
      : $localize`Imported from Grid` + suffix;
  }

  convertToEnergySummaryBoxData(
    data: EnergyDistributionSummary | null | undefined,
  ): null | EnergySummaryBoxDataAll {
    if (!data) {
      return null;
    }
    return {
      exportedMV: {
        total: data.exportedToGridMV.total,
        subPlant1: data.exportedToGridMV.subPlant1,
        subPlant2: data.exportedToGridMV.subPlant2,
      },
      importedMV: {
        total: data.importedFromGridMV.total,
        subPlant1: data.importedFromGridMV.subPlant1,
        subPlant2: data.importedFromGridMV.subPlant2,
      },
      exportedHV: {
        total: data.exportedToGridHV.total,
        subPlant1: data.exportedToGridHV.subPlant1,
        subPlant2: data.exportedToGridHV.subPlant2,
      },
      importedHV: {
        total: data.importedFromGridHV.total,
        subPlant1: data.importedFromGridHV.subPlant1,
        subPlant2: data.importedFromGridHV.subPlant2,
      },
      charged: {
        total: data.chargedToBatteries.total,
        subPlant1: data.chargedToBatteries.subPlant1,
        subPlant2: data.chargedToBatteries.subPlant2,
      },
      discharged: {
        total: data.dischargedFromBatteries.total,
        subPlant1: data.dischargedFromBatteries.subPlant1,
        subPlant2: data.dischargedFromBatteries.subPlant2,
      },
      pvProduction: {
        total: data.pvProduction.total,
        subPlant1: data.pvProduction.subPlant1,
        subPlant2: data.pvProduction.subPlant2,
      },
      exportedEnergyLoss: {
        total: data.exportedEnergyLoss.total,
        subPlant1: data.exportedEnergyLoss.subPlant1,
        subPlant2: data.exportedEnergyLoss.subPlant2,
      },
      importedEnergyLoss: {
        total: data.importedEnergyLoss.total,
        subPlant1: data.importedEnergyLoss.subPlant1,
        subPlant2: data.importedEnergyLoss.subPlant2,
      },
    };
  }
}
