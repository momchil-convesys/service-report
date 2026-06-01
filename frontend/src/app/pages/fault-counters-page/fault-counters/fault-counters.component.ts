import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, filter, map, mergeMap, of, shareReplay, switchMap } from 'rxjs';
import {
  DataRequest,
  DeviceSide,
  DeviceType,
  PredefinedTimeRange,
  TypedChange,
} from '../../../constants';
import { Device, FaultCountersData, FaultDefinition, FaultsTemplate } from '../../../data/models';
import { FaultTemplatesService } from '../../../data/services/fault-templates.service';
import { convertPredefinedRange } from '../../../helpers';
import { FaultsService } from '../../../shared/faults-table/faults-service';
import { FaultCountersService } from './fault-counters.service';

interface ComponentInputChanges extends SimpleChanges {
  timeRange: TypedChange<Date[] | PredefinedTimeRange | undefined>;
  device: TypedChange<Device | undefined>;
}

@Component({
  selector: 'app-fault-counters[device][timeRange]',
  templateUrl: './fault-counters.component.html',
  styleUrls: ['./fault-counters.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class FaultCountersComponent implements OnChanges {
  @Input({ required: true }) device: Device | undefined;
  @Input({ required: true }) timeRange: Date[] | PredefinedTimeRange | undefined;

  DeviceSide = DeviceSide;

  selectedFaultIds$: Observable<Set<string>>;
  selectedFaults$: Observable<Array<FaultDefinition>>;

  faultCountersData$: Observable<FaultCountersData | undefined> | undefined;
  faultCountersDataLoading$: Observable<boolean> | undefined;

  faultsTemplate$: Observable<FaultsTemplate | undefined> = of(undefined);

  convertedTimeRange: Date[] | undefined; // Temporary here for column chart

  constructor(
    private _faultCountersService: FaultCountersService,
    private _faultsService: FaultsService,
    private faultTemplatesService: FaultTemplatesService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.selectedFaultIds$ = this._faultsService.selectedFaultIds$;

    this.selectedFaults$ = this.selectedFaultIds$.pipe(
      map((faultIdsSet) =>
        Array.from(faultIdsSet).map((faultId) =>
          this.faultTemplatesService.getFaultDefinitionById(faultId),
        ),
      ),
      mergeMap((requestsArray: Observable<FaultDefinition | undefined>[]) =>
        requestsArray.length > 0 ? combineLatest([...requestsArray]) : of([]),
      ),
      map((faultsArray) => faultsArray.filter((fault) => fault !== undefined) as FaultDefinition[]),
    );
  }

  ngOnChanges(changes: ComponentInputChanges): void {
    if (!this.device || !this.timeRange) {
      console.warn(this.constructor.name + '| Component received invalid input!');
      return;
    }

    if (
      changes.device &&
      changes.device.currentValue?.deviceMetadataId !==
        changes.device.previousValue?.deviceMetadataId
    ) {
      this.clearSelectedFaults();
    }

    const device: Device = this.device;
    const timeRange: Date[] | PredefinedTimeRange = this.timeRange;

    const convertedTimeRange = convertPredefinedRange(timeRange);
    this.convertedTimeRange = convertedTimeRange;

    this.faultsTemplate$ = of(this.device).pipe(
      switchMap((device) =>
        this.faultTemplatesService
          .getFaultsTemplateForDeviceMetadataId(device.deviceMetadataId)
          .pipe(
            filter((req) => req.data !== undefined),
            map((req) => req.data as FaultsTemplate),
          ),
      ),
      shareReplay(1),
    );

    const request$: Observable<DataRequest<FaultCountersData>> = this._faultCountersService
      .getFaultCountersData(device.id, convertedTimeRange)
      .pipe(shareReplay());

    this.faultCountersDataLoading$ = request$.pipe(map((request) => request.isLoading));
    this.faultCountersData$ = request$.pipe(map((request) => request.data));
  }

  hasSlave(device: Device): boolean {
    return device.type === DeviceType.Wind;
  }

  clearSelectedFaults() {
    this._faultsService.clearSelectedFaults();
  }

  onTimeRangeChange(range: Date[]) {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { from: range[0].toISOString(), to: range[1].toISOString() },
      // queryParamsHandling: 'merge',
    });
  }

  onPredefinedTimeRangeChange(predefinedRange: PredefinedTimeRange) {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { predefinedRange },
      // queryParamsHandling: 'merge',
    });
  }
}
