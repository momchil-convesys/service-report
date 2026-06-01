import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Observable,
  catchError,
  forkJoin,
  map,
  of,
  shareReplay,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import { DataRequest } from '../../constants';
import {
  Device,
  DeviceParameterDefinition,
  DeviceParametersTemplate,
  Plant,
} from '../../data/models';
import { ParameterTemplatesService } from '../../data/services/parameter-templates.service';
import { PageRoutingService } from '../../shared/page-routing.service';
import { DeviceMetricsService } from './_data/device-metrics.service';
import { Context, Scope } from './models';

@Component({
  selector: 'app-device-metrics-page',
  templateUrl: './device-metrics-page.component.html',
  styleUrls: ['./device-metrics-page.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DeviceMetricsService],
  standalone: false,
})
export class DeviceMetricsPageComponent {
  context$: Observable<Context>;
  error$: Observable<string | undefined>;

  constructor(
    pageRouting: PageRoutingService,
    parameterTemplatesService: ParameterTemplatesService,
  ) {
    const plant$: Observable<Plant> = pageRouting
      .getPlantFromQueryParams()
      .pipe(takeUntilDestroyed());

    const scope$: Observable<Scope> = plant$.pipe(
      withLatestFrom(pageRouting.getDeviceIdFromQueryParams()),
      map(([plant, deviceId]) => {
        if (!deviceId) {
          return { plant, device: null };
        }

        const device: Device | undefined = plant.devices.find((device) => device.id === deviceId);
        if (!device) {
          throw `Device with ID [${deviceId}] not found in plant [${plant.name}]`;
        }

        return { plant, device };
      }),
      shareReplay(1),
    );

    const parameters$ = scope$.pipe(
      map((scope) => {
        let allMetadataIds: string[];

        if (scope.device) {
          allMetadataIds = [scope.device.deviceMetadataId];
        } else {
          allMetadataIds = scope.plant.devices.map((device) => device.deviceMetadataId);
        }

        const metadataIds = Array.from(new Set(allMetadataIds)); // remove duplicates
        return metadataIds;
      }),
      switchMap((metadataIds) => {
        const templateRequestObservables: Observable<
          DataRequest<DeviceParametersTemplate | undefined>
        >[] = metadataIds.map((metadataId) =>
          parameterTemplatesService.getDeviceParametersTemplateForDeviceMetadataId(metadataId),
        );

        return forkJoin(templateRequestObservables);
      }),
      map((dataRequests: DataRequest<DeviceParametersTemplate | undefined>[]) =>
        dataRequests
          .map((dataRequests) => dataRequests.data)
          .map((parameterTemplate) => this._constructVisibleParameters(parameterTemplate))
          .flat(),
      ),
      map((allParameters) => Array.from(new Set(allParameters))), // remove duplicates
    );

    this.context$ = parameters$.pipe(
      withLatestFrom(scope$),
      map(([parameters, scope]) => ({ scope, parameters })),
      shareReplay(1),
      takeUntilDestroyed(),
    );

    this.error$ = this.context$.pipe(
      map(() => undefined),
      catchError((err) => of(err)),
    );
  }

  private _constructVisibleParameters(
    parametersTemplate: DeviceParametersTemplate | undefined,
  ): DeviceParameterDefinition[] {
    if (!parametersTemplate) {
      return [];
    }

    const result: DeviceParameterDefinition[] = [];

    parametersTemplate.parameterIdsVisibleInDeviceMetrics.forEach((parameterId) => {
      const paramDefinition = parametersTemplate.parameters.find(
        (parameter) => parameter.id === parameterId,
      );
      if (paramDefinition) {
        result.push(paramDefinition);
      }
    });

    return result;
  }
}
