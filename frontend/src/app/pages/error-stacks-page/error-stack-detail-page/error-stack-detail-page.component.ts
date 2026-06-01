import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  Observable,
  combineLatest,
  filter,
  map,
  of,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs';
import { DataRequest, DeviceSide } from '../../../constants';
import { Device, FaultDefinitionGroup, FaultsTemplate } from '../../../data/models';
import { FaultTemplatesService } from '../../../data/services/fault-templates.service';
import { PlantsService } from '../../../data/services/plants.service';
import { ErrorStacksDataService } from '../_data/data.service';
import { ErrorStackDetail } from '../_data/error-stack.model';

interface RouteParams {
  stackId: string;
  deviceId: string;
}

@Component({
  selector: 'app-error-stack-detail-page',
  templateUrl: './error-stack-detail-page.component.html',
  styleUrls: ['./error-stack-detail-page.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ErrorStackDetailPageComponent {
  errorStackDetailRequest$: Observable<DataRequest<ErrorStackDetail>>;
  errorStackDetail$: Observable<ErrorStackDetail | undefined>;
  faultGroups$: Observable<FaultDefinitionGroup[]> = of([]);
  faultsTemplate$: Observable<FaultsTemplate>;

  constructor(
    private route: ActivatedRoute,
    private faultTemplatesService: FaultTemplatesService,
    private data: ErrorStacksDataService,
    private plantsService: PlantsService,
  ) {
    const params$: Observable<RouteParams> = this.route.paramMap.pipe(
      map((params) => {
        const stackId = params.get('stackId');
        const deviceId = params.get('stackDeviceId');

        if (stackId && deviceId) {
          return <RouteParams>{
            stackId,
            deviceId,
          };
        }

        throw new Error($localize`Incorrect routing parameters!`);
      }),
    );

    this.errorStackDetailRequest$ = params$.pipe(
      switchMap(({ stackId, deviceId }) => this.data.getErrorStack(deviceId || '', stackId || '')),
      shareReplay(1),
      takeUntilDestroyed(),
    );

    this.errorStackDetail$ = this.errorStackDetailRequest$.pipe(
      filter((req) => req !== undefined),
      map((req) => req),
      filter((req) => req.data !== undefined),
      map((req) => req.data as ErrorStackDetail),
      startWith(undefined),
    );

    const device$ = params$.pipe(
      switchMap((routeParams) => {
        return this.plantsService.getDeviceById(routeParams.deviceId).pipe(
          filter((req) => req.data !== undefined),
          map((req) => req.data as Device),
        );
      }),
    );

    this.faultsTemplate$ = device$.pipe(
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

    this.faultGroups$ = combineLatest([this.errorStackDetail$, this.faultsTemplate$]).pipe(
      map(([stack, faults]) => {
        if (stack?.deviceSide === DeviceSide.Slave) {
          return faults.slave || [];
        }

        return faults.master;
      }),
    );
  }
}
