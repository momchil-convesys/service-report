import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { Observable, Subject, filter, map, takeUntil } from 'rxjs';
import { DataRequest, DeviceType } from '../../constants';
import { DeviceTreeItem, Plant } from '../../data/models';
import { PlantsService } from '../../data/services/plants.service';
import { isSidebarOnMobile } from '../sidebar/helpers';
import { ResponsiveSidebarService } from '../sidebar/responsive-sidebar.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class HomeComponent implements OnInit, OnDestroy {
  selectedItem: DeviceTreeItem | undefined;
  plants$: Observable<DataRequest<Plant[]>>;

  private _destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private data: PlantsService,
    public sidebarService: ResponsiveSidebarService,
  ) {
    this.plants$ = this.data.getPlants();
  }

  ngOnInit() {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        map(() => this.activatedRoute.firstChild?.snapshot.params),
        takeUntil(this._destroy$),
      )
      .subscribe((p: Params | undefined) => {
        const newItem =
          p && Object.keys(p).length > 0
            ? {
                plantId: p['plantId'] as string,
                deviceId: p['deviceId'] as string,
              }
            : undefined;

        if (newItem === undefined) {
          this.selectedItem = undefined;
        } else if (
          this.selectedItem?.plantId !== newItem.plantId ||
          this.selectedItem?.deviceId !== newItem.deviceId
        ) {
          this.selectedItem = newItem;
        }
      });

    this.activatedRoute.firstChild?.params
      .pipe(takeUntil(this._destroy$))
      .subscribe((p: Params) => {
        this.selectedItem =
          p && Object.keys(p).length > 0
            ? {
                plantId: p['plantId'] as string,
                deviceId: p['deviceId'] as string,
              }
            : undefined;
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  onRetry() {
    window.location.reload();
  }

  async onItemSelect(item: DeviceTreeItem, plants: Plant[]) {
    const url = this.router.routerState.snapshot.url;

    const deviceTypeChanged = this.selectedItem?.deviceType !== item.deviceType;
    const plantChanged = this.selectedItem?.plantId !== item.plantId;

    const plant = plants.find((p) => p.id === item.plantId);
    const isPlant = !item.deviceId;

    const routeSegments = [item.plantId];

    let selectedTab = plant?.plantSpecificMetadata?.bessId ? 'pv-bess-overview' : 'overview';

    let subrouteSegments: string[] = [];

    if (url.indexOf('faults') >= 0) {
      selectedTab = 'faults';
    } else if (url.indexOf('fault-counters') >= 0) {
      selectedTab = 'fault-counters';
    } else if (url.indexOf('device-metrics') >= 0) {
      selectedTab = 'device-metrics';
    } else if (url.indexOf('power-limit-schedule') >= 0) {
      selectedTab = 'power-limit-schedule';
    } else if (url.indexOf('power-schedule') >= 0 && plant?.plantSpecificMetadata?.bessId) {
      selectedTab = 'power-schedule';
    } else if (url.indexOf('pv-bess-overview') >= 0 && plant?.plantSpecificMetadata?.bessId) {
      selectedTab = 'pv-bess-overview';
    } else if (url.indexOf('inverter-control') >= 0) {
      selectedTab = 'inverter-control';
    } else if (url.indexOf('temperature-sensors') >= 0) {
      selectedTab = 'temperature-sensors';
    } else if (url.indexOf('strings') >= 0 && item.deviceType === DeviceType.BatteryString) {
      selectedTab = 'strings';
    } else if (
      url.indexOf('monbat-schedule') >= 0 &&
      item.deviceType === DeviceType.BatteryString
    ) {
      selectedTab = 'monbat-schedule';
    } else if (url.indexOf('drilldown') >= 0 && item.deviceType === DeviceType.Solar) {
      selectedTab = 'drilldown';
    }

    if (item.deviceId) {
      routeSegments.push('devices', item.deviceId);
      if (
        selectedTab !== 'faults' &&
        selectedTab !== 'fault-counters' &&
        selectedTab !== 'inverter-control' &&
        selectedTab !== 'strings' &&
        selectedTab !== 'device-metrics' &&
        selectedTab !== 'monbat-schedule' &&
        (selectedTab !== 'drilldown' || plantChanged)
      ) {
        selectedTab = 'overview';

        // Do not keep this tab selected as it depends on the particular device
        if (selectedTab === 'temperature-sensors') {
          selectedTab = 'overview';
        }
      }
    } else {
      if (
        selectedTab !== 'faults' &&
        selectedTab !== 'device-metrics' &&
        // selectedTab !== 'power-limit-schedule' &&
        selectedTab !== 'power-schedule' &&
        selectedTab !== 'pv-bess-overview' &&
        selectedTab !== 'inverter-control' &&
        (selectedTab !== 'drilldown' || plantChanged)
      ) {
        // Determine default tab based on plant configuration
        selectedTab = plant?.plantSpecificMetadata?.bessId ? 'pv-bess-overview' : 'overview';
      }
    }

    // keep sub route
    if (
      (item.deviceType === DeviceType.Solar ||
        item.deviceType === DeviceType.Pump ||
        (item.deviceType === DeviceType.BatteryString && !isPlant)) &&
      selectedTab === 'faults'
    ) {
      if (url.indexOf('faults-history') >= 0) {
        subrouteSegments.push('faults-history');
      } else if (url.indexOf('error-stacks') >= 0 && item.deviceType !== DeviceType.BatteryString) {
        subrouteSegments.push('error-stacks');
      }
    }

    // keep sub route
    if (item.deviceType === DeviceType.Solar && selectedTab === 'inverter-control') {
      if (url.indexOf('control-panel') >= 0) {
        subrouteSegments.push('control-panel');
      } else if (url.indexOf('history') >= 0) {
        subrouteSegments.push('history');
      }
    }

    if (item.deviceType === DeviceType.Wind) {
      selectedTab = 'device-metrics';
      subrouteSegments = [];

      if (item.deviceId) {
        selectedTab = 'overview';
        subrouteSegments = [];
      }
    }

    if (item.deviceType === DeviceType.BatteryString) {
      if (isPlant) {
        selectedTab = 'monbat-batteries-module';
        subrouteSegments = [];
      } else {
        // Keeping the selected tab when switching between devices improves user experience
        // but is more bug prone, so thorough testing is needed.
        const availableTabs: string[] = [
          'overview',
          'faults',
          'device-metrics',
          'strings',
          'inverter-control',
          'monbat-schedule',
        ];

        if (availableTabs.indexOf(selectedTab) < 0) {
          selectedTab = 'overview';
          subrouteSegments = [];
        }
      }
    }

    const queryParams = { ...this.activatedRoute.snapshot.queryParams };
    delete queryParams['pageIndex'];

    if (deviceTypeChanged) {
      delete queryParams['predefinedRange'];
      delete queryParams['from'];
      delete queryParams['to'];
    }

    if (item.openInNewTab) {
      const url = this.router.serializeUrl(
        this.router.createUrlTree(
          [this.activatedRoute.snapshot.url, ...routeSegments, selectedTab, ...subrouteSegments],
          {
            queryParams,
          },
        ),
      );
      window.open(url, '_blank');

      return;
    }

    await this.router.navigate([...routeSegments, selectedTab, ...subrouteSegments], {
      relativeTo: this.activatedRoute,
      queryParamsHandling: 'merge',
      queryParams,
      preserveFragment: true,
      skipLocationChange: false,
    });

    /**
     * Hide sidebar on click (on mobile screens only).
     */
    if (isSidebarOnMobile()) {
      this.sidebarService.hideSideBar();
    }
  }
}
