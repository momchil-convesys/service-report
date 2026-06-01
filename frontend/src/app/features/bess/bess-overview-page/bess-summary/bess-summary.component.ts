import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import { ReplaySubject, Subscription } from 'rxjs';
import { BESSDataService } from '../../_data/data.service';
import { BESSAssetType } from '../../_data/dto/assets/asset-base.dto';
import { BESSMomentaryDataValue } from '../../_data/models';
import { BESSMomentaryDataService } from '../../_data/momentary-data.service';
import { BessStateIndicatorComponent } from '../../shared/bess-state-indicator/bess-state-indicator.component';
import {
  BessActiveAlarmsSummary,
  BessActiveAlarmsSummaryComponent,
} from './bess-active-alarms-summary/bess-active-alarms-summary.component';
@Component({
  selector: 'app-bess-summary',
  standalone: true,
  imports: [BessStateIndicatorComponent, BessActiveAlarmsSummaryComponent],
  templateUrl: './bess-summary.component.html',
  styleUrl: './bess-summary.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BessSummaryComponent {
  private readonly live = inject(BESSMomentaryDataService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly dataService = inject(BESSDataService);

  private sub?: Subscription;
  private bessAssetId: string | null = null;

  // displayed values
  bessSoc: BESSMomentaryDataValue | null = null;
  bessSoh: BESSMomentaryDataValue | null = null;
  bessActivePower: BESSMomentaryDataValue | null = null;
  activeAlarmsSummary: BessActiveAlarmsSummary | null = null;

  private readonly componentId = 'BessSummaryComponent';

  appErrors$: ReplaySubject<string[]> = new ReplaySubject(1);

  ngOnInit(): void {
    const bessId = this.dataService.getBESSMetadataFromCache()?.id;
    if (!bessId) {
      throw new Error('Bess ID is not set. Please set the BESS ID in the URL.');
    }

    this.live.setBESS(bessId);

    const socId = this.dataService.getBESSParameterIdByKey('stateOfCharge');
    const sohId = this.dataService.getBESSParameterIdByKey('stateOfHealth');
    const apId = this.dataService.getBESSParameterIdByKey('activePower');
    const majorAlarmsId = this.dataService.getBESSParameterIdByKey('quantityOfMajorAlarms');
    const minorAlarmsId = this.dataService.getBESSParameterIdByKey('quantityOfMinorAlarms');
    const warningAlarmsId = this.dataService.getBESSParameterIdByKey('quantityOfWarnings');

    const bessAssetId = this.dataService.getBESSAssetIdsByType(BESSAssetType.BESSItself)[0];

    if (
      !socId ||
      !sohId ||
      !apId ||
      !majorAlarmsId ||
      !minorAlarmsId ||
      !warningAlarmsId ||
      !bessAssetId
    ) {
      let errorMessages: string[] = [];

      if (!socId) {
        errorMessages.push($localize`State of Charge parameter ID not found!`);
      }
      if (!sohId) {
        errorMessages.push($localize`State of Health parameter ID not found!`);
      }
      if (!apId) {
        errorMessages.push($localize`Active Power parameter ID not found!`);
      }
      if (!majorAlarmsId) {
        errorMessages.push($localize`Quantity of Major Alarms parameter ID not found!`);
      }
      if (!minorAlarmsId) {
        errorMessages.push($localize`Quantity of Minor Alarms parameter ID not found!`);
      }
      if (!warningAlarmsId) {
        errorMessages.push($localize`Quantity of Warnings parameter ID not found!`);
      }
      if (!bessAssetId) {
        errorMessages.push($localize`BESS asset ID not found!`);
      }

      this.appErrors$.next(errorMessages);

      return;
    }

    this.bessAssetId = bessAssetId;

    this.live.registerWatch(this.componentId, {
      assetFilter: { assetType: BESSAssetType.BESSItself },
      logicalParameterIds: [socId, sohId, apId, majorAlarmsId, minorAlarmsId, warningAlarmsId],
    });

    this.sub = this.live.liveMessage$.subscribe((message) => {
      if (!message) return;

      const bessAsset = message.assets.find((a) => a.assetId === this.bessAssetId);
      if (!bessAsset) return;

      this.bessSoc = {
        value: bessAsset.values[socId ?? '']?.[1],
        unixTimestamp: bessAsset.values[socId ?? '']?.[0],
      };
      this.bessSoh = {
        value: bessAsset.values[sohId ?? '']?.[1],
        unixTimestamp: bessAsset.values[sohId ?? '']?.[0],
      };
      this.bessActivePower = {
        value: bessAsset.values[apId ?? '']?.[1],
        unixTimestamp: bessAsset.values[apId ?? '']?.[0],
      };

      this.activeAlarmsSummary = {
        major: this.getParameterCount(bessAsset.values[majorAlarmsId]),
        minor: this.getParameterCount(bessAsset.values[minorAlarmsId]),
        warning: this.getParameterCount(bessAsset.values[warningAlarmsId]),
      };

      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.live.unregisterWatch(this.componentId);
    this.sub?.unsubscribe();
  }

  private getParameterCount(value: [number, number | null] | undefined): number | null | undefined {
    return value?.[1];
  }
}
