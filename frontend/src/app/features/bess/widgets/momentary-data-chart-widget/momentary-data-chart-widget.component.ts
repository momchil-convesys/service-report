import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { BehaviorSubject } from 'rxjs';
import { BESSAssetType } from '../../_data/dto/assets/asset-base.dto';
import { BESSMetadataDTO } from '../../_data/dto/bess.dto';
import { BESSMomentaryDataService } from '../../_data/momentary-data.service';
import { BessParameterSelectorComponent } from '../../shared/bess-parameter-selector/bess-parameter-selector.component';
import { bessContainersChartOptions } from './charts-options/bess-containers-chart';
import { bessAllPacksChartOptions, bessPacksChartOptions } from './charts-options/bess-packs-chart';
import { bessRacksChartOptions } from './charts-options/bess-racks-chart';
import { bessRacksMinMaxChartOptions } from './charts-options/bess-racks-min-max-chart';
import { MomentaryDataChartRequest } from './momentary-data-chart/interfaces';
import { MomentaryDataChartComponent } from './momentary-data-chart/momentary-data-chart.component';

@Component({
  selector: 'app-momentary-data-chart-widget',
  imports: [
    MomentaryDataChartComponent,
    AsyncPipe,
    BessParameterSelectorComponent,
    NzRadioModule,
    FormsModule,
  ],
  templateUrl: './momentary-data-chart-widget.component.html',
  styleUrl: './momentary-data-chart-widget.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MomentaryDataChartWidgetComponent implements OnInit {
  @Input({ required: true }) bessMetadata: BESSMetadataDTO | null = null;

  private readonly liveData = inject(BESSMomentaryDataService);

  // Expose BESSAssetType for template
  readonly BESSAssetType = BESSAssetType;

  // Shared selected parameter for all charts
  selectedParameter: string = 'stateOfCharge';

  // Store the current rack ID for request3
  private currentRackId: string | null = null;

  request1$: BehaviorSubject<MomentaryDataChartRequest | null> =
    new BehaviorSubject<MomentaryDataChartRequest | null>(null);

  request2$: BehaviorSubject<MomentaryDataChartRequest | null> =
    new BehaviorSubject<MomentaryDataChartRequest | null>(null);

  request3$: BehaviorSubject<MomentaryDataChartRequest | null> =
    new BehaviorSubject<MomentaryDataChartRequest | null>(null);

  request4$: BehaviorSubject<MomentaryDataChartRequest | null> =
    new BehaviorSubject<MomentaryDataChartRequest | null>(null);

  request5$: BehaviorSubject<MomentaryDataChartRequest | null> =
    new BehaviorSubject<MomentaryDataChartRequest | null>(null);

  packExtremes$: BehaviorSubject<{ min: number; max: number } | null> = new BehaviorSubject<{
    min: number;
    max: number;
  } | null>(null);

  minMaxPacksParameterKey$: BehaviorSubject<'highestPackTemperature' | 'lowestPackTemperature'> =
    new BehaviorSubject<'highestPackTemperature' | 'lowestPackTemperature'>(
      'highestPackTemperature',
    );

  ngOnInit(): void {
    if (!this.bessMetadata) {
      return;
    }

    this.liveData.setBESS(this.bessMetadata.id);

    this._initializeRequest1(this.bessMetadata, this.selectedParameter);
    this._initializeRequest2(this.bessMetadata, this.selectedParameter);
    this._initializeRequest4(this.bessMetadata, this.minMaxPacksParameterKey$.value);
    this._initializeRequest5(this.bessMetadata, this.selectedParameter);
  }

  ngOnDestroy(): void {}

  onContainerColumnClick(event: { assetId: string }): void {
    console.log(event);
  }

  onRackColumnClick(event: { assetId: string }): void {
    if (!this.bessMetadata) {
      return;
    }

    this.currentRackId = event.assetId;
    this._initializeRequest3(this.bessMetadata, event.assetId, this.selectedParameter);

    const rack = this.bessMetadata.assets.find((a) => a.id === event.assetId);
    if (!rack) {
      return;
    }

    const rackPacksIds = this.bessMetadata.topology
      .filter((t) => t.fromAssetId === event.assetId)
      .map((t) => t.toAssetId);

    const firstPackId = rackPacksIds[0];

    const packIndex = this.bessMetadata.assets
      .filter((a) => a.type === BESSAssetType.BatteryPack)
      .findIndex((a) => a.id === firstPackId);

    if (packIndex !== -1) {
      this.packExtremes$.next({
        min: packIndex,
        max: packIndex + rackPacksIds.length - 1,
      });
    }
  }

  onParameterChange(parameterKey: string): void {
    if (!this.bessMetadata) {
      return;
    }
    this.selectedParameter = parameterKey;

    // Update all charts with the new parameter
    this._initializeRequest1(this.bessMetadata, parameterKey);
    this._initializeRequest2(this.bessMetadata, parameterKey);

    // Update request3 if it exists and we have a rack ID
    if (this.currentRackId) {
      this._initializeRequest3(this.bessMetadata, this.currentRackId, parameterKey);
    }

    this._initializeRequest5(this.bessMetadata, parameterKey);
  }

  onMinMaxPacksParameterKeyChange(
    parameterKey: 'highestPackTemperature' | 'lowestPackTemperature',
  ): void {
    this.minMaxPacksParameterKey$.next(parameterKey);
    if (!this.bessMetadata) {
      return;
    }
    this._initializeRequest4(this.bessMetadata, parameterKey);
  }

  private _initializeRequest1(bessMetadata: BESSMetadataDTO, parameterKey: string): void {
    this.request1$.next({
      bessId: bessMetadata.id,
      parameterKeys: [parameterKey],
      assetIds: bessMetadata.assets
        .filter((a) => a.type === BESSAssetType.BatteryContainer)
        .map((a) => a.id),
      chartConfiguration: bessContainersChartOptions(parameterKey),
    });
  }

  private _initializeRequest2(bessMetadata: BESSMetadataDTO, parameterKey: string): void {
    this.request2$.next({
      bessId: bessMetadata.id,
      parameterKeys: [parameterKey],
      assetIds: bessMetadata.assets
        .filter((a) => a.type === BESSAssetType.BatteryRack)
        .map((a) => a.id),
      columnClickHandler: (assetId: string) => this.onRackColumnClick({ assetId }),
      chartConfiguration: bessRacksChartOptions(parameterKey),
    });
  }

  private _initializeRequest3(
    bessMetadata: BESSMetadataDTO,
    rackId: string,
    parameterKey: string,
  ): void {
    const rack = bessMetadata.assets.find((a) => a.id === rackId);
    if (!rack) {
      return;
    }

    const rackChildrenIds = bessMetadata.topology
      .filter((t) => t.fromAssetId === rackId)
      .map((t) => t.toAssetId);
    const rackChildren = bessMetadata.assets.filter((a) => rackChildrenIds.includes(a.id));

    this.request3$.next({
      bessId: bessMetadata.id,
      parameterKeys: [parameterKey],
      assetIds: rackChildren.filter((a) => a.type === BESSAssetType.BatteryPack).map((a) => a.id),
      chartConfiguration: bessPacksChartOptions(rack.name, parameterKey),
    });
  }

  private _initializeRequest4(bessMetadata: BESSMetadataDTO, parameterKey: string): void {
    this.request4$.next({
      bessId: bessMetadata.id,
      parameterKeys: [parameterKey],
      assetIds: bessMetadata.assets
        .filter((a) => a.type === BESSAssetType.BatteryRack)
        .map((a) => a.id),
      chartConfiguration: bessRacksMinMaxChartOptions(parameterKey),
    });
  }

  private _initializeRequest5(bessMetadata: BESSMetadataDTO, parameterKey: string): void {
    this.request5$.next({
      bessId: bessMetadata.id,
      parameterKeys: [parameterKey],
      assetIds: bessMetadata.assets
        .filter((a) => a.type === BESSAssetType.BatteryPack)
        .map((a) => a.id),
      chartConfiguration: bessAllPacksChartOptions(parameterKey),
    });
  }
}
