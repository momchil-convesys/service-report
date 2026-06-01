import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { map, Observable, of, switchMap } from 'rxjs';
import { AccessControlPermission, DeviceType } from './constants';
import { Plant } from './data/models';
import { PlantsService } from './data/services/plants.service';
import { UsersService } from './data/services/users.service';

@Injectable({ providedIn: 'root' })
export class CustomPreloadingStrategy implements PreloadingStrategy {
  constructor(
    private usersService: UsersService,
    private plantsService: PlantsService,
  ) {}

  preload(route: Route, load: () => Observable<any>): Observable<any> {
    return this.plantsService.getPlants().pipe(
      map((plants) => plants.data),
      switchMap((plants) => {
        const shouldPreload = this._shouldPreloadRoute(plants, route);

        if (shouldPreload) {
          return load();
        }

        return of(null);
      }),
    );
  }

  private _shouldPreloadRoute(plants: Plant[] | undefined, route: Route) {
    if (!plants) {
      return false;
    }

    /**
     * TODO: move permissions and guards to parent levels,
     * so they are checked by angular for preloading instead of manually.
     */
    const requiredPermissions: AccessControlPermission[] = route.data?.['permissions'] ?? [];
    const authorized = this.usersService.hasCurrentUserPermissions(requiredPermissions);
    if (!authorized) {
      return false;
    }

    switch (route.path) {
      case 'home':
      case 'alarm-events':
      case 'overview':
      case 'alarm-triggers':
        return true;

      case ':plantId/monbat-batteries-module':
      case 'monbat-schedule':
      case 'strings':
        return plants.some((plant) => plant.type === DeviceType.BatteryString);

      case 'reactive-power':
        return plants.some(
          (plant) => plant.type === DeviceType.Solar && plant.plantSpecificMetadata?.hasPowerMeter,
        );

      case 'plant-metrics':
      case 'weather':
        return plants.some(
          (plant) =>
            plant.type === DeviceType.Solar && plant.plantSpecificMetadata?.hasExtendedPlantMetrics,
        );

      case 'inverter-control':
        return plants.some(
          (plant) => plant.type === DeviceType.Solar || plant.type === DeviceType.BatteryString,
        );

      case 'device-metrics':
        return plants.some(
          (plant) => plant.type === DeviceType.Solar || plant.type === DeviceType.BatteryString,
        );

      case 'power-limit-schedule':
        return (
          plants.some((plant) => plant.type === DeviceType.Solar) &&
          // If there is at least one plant without a BESS, we can preload...
          plants.some((plant) => !plant.plantSpecificMetadata?.bessId)
        );

      case 'power-schedule':
      case 'pv-bess-overview':
        // TODO: BESS module is not fully implemented yet.
        // case 'bess/:bessId':
        // If there is at least one plant with a BESS, we can preload...
        return plants.some((plant) => plant.plantSpecificMetadata?.bessId);

      case 'drilldown':
      case 'inverters':
        return plants.some(
          (plant) =>
            plant.type === DeviceType.Solar && plant.plantSpecificMetadata?.hasTsWithInverters,
        );

      case 'faults':
        return plants.some((plant) => plant.plantSpecificMetadata?.hasFaultsTab);

      case 'fault-counters':
        return plants.some((plant) => plant.plantSpecificMetadata?.hasFaultsTab);

      default:
        return false;
    }
  }
}
