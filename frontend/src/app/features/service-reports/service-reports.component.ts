import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { DataRequest } from '../../constants';
import { DeviceTreeItem, Plant } from '../../data/models';
import { PlantsService } from '../../data/services/plants.service';
import { isSidebarOnMobile } from '../../pages/sidebar/helpers';
import { ResponsiveSidebarService } from '../../pages/sidebar/responsive-sidebar.service';
import { ServiceReportsGlobalService } from './_data/service-reports-global.service';

@Component({
  selector: 'app-service-reports',
  templateUrl: './service-reports.component.html',
  styleUrls: ['./service-reports.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ServiceReportsComponent {
  selectedItem: DeviceTreeItem | undefined;
  plants$: Observable<DataRequest<Plant[]>>;

  private _destroy$ = new Subject<void>();

  constructor(
    public serviceReportsGlobalService: ServiceReportsGlobalService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private data: PlantsService,
    public sidebarService: ResponsiveSidebarService,
  ) {
    this.plants$ = this.data.getPlants();
    this.activatedRoute.firstChild?.params.pipe(takeUntil(this._destroy$)).subscribe((p) => {
      this.selectedItem = {
        plantId: p['plantId'] as string,
        deviceId: p['deviceId'] as string,
      };
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  onRetry() {
    window.location.reload();
  }

  async onItemSelect(item: DeviceTreeItem) {
    this.selectedItem = item;

    const routeSegments = [item.plantId];
    if (item.deviceId) {
      routeSegments.push(item.deviceId);
    }

    console.log(this.constructor.name, this.onItemSelect.name, '| Navigating to ', [
      ...routeSegments,
    ]);
    const queryParams = { ...this.activatedRoute.snapshot.queryParams };

    // delete queryParams['pageIndex'];
    console.log('queryParams', queryParams);
    await this.router.navigate([...routeSegments], {
      relativeTo: this.activatedRoute,
      queryParamsHandling: 'merge',
      queryParams: { pageIndex: 1 },
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
