import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, map, shareReplay, switchMap, tap } from 'rxjs';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { DataRequest } from '../../../constants';
import { Plant } from '../../../data/models';
import { ResponsiveSidebarService } from '../../../pages/sidebar/responsive-sidebar.service';
import { SidebarToggleButtonComponent } from '../../../pages/sidebar/sidebar-toggle-button/sidebar-toggle-button.component';
import { PageRoutingService } from '../../../shared/page-routing.service';
import { ServiceRreportListData } from '../_data/models/_service-report-list';
import { ServiceReportsApiService } from '../_data/service-reports-api.service';
import { ServiceReportsGlobalService } from '../_data/service-reports-global.service';
export interface Labels {
  [report: string]: string;
  draft: string;
}
interface QueryParams {
  // pageSize: number;
  reportStatusList: string;
  pageIndex: number;
  serviceReportId: number;
  plantId: string;
  deviceId: string;
}
@Component({
  selector: 'app-service-report-list',
  templateUrl: './service-report-list.component.html',
  styleUrls: ['./service-report-list.component.less'],
  encapsulation: ViewEncapsulation.None,
  //changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PageRoutingService],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NzRadioModule,
    NzSpinModule,
    NzAlertModule,
    NzPaginationModule,
    NzDividerModule,
    NzIconModule,
    NzButtonModule,
    NzTypographyModule,
    SidebarToggleButtonComponent,
  ],
})
export class ServiceReportListComponent {
  plant$: Observable<DataRequest<Plant>>;
  paginationChange$ = new BehaviorSubject<boolean>(true);
  reports$ = new Observable<DataRequest<ServiceRreportListData[]>>();

  pageSize = 5;
  pageIndex: number = 1;
  totalCount = 0;

  labels: Labels = {
    draft: $localize`Service Report Drafts`,
    report: $localize`Service Reports`,
  };
  reportStatusList: string = 'Done';

  constructor(
    public serviceReportsGlobalService: ServiceReportsGlobalService,
    private api: ServiceReportsApiService,
    public sidebarService: ResponsiveSidebarService,
    pageRouting: PageRoutingService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.plant$ = pageRouting.getPlantRequestFromQueryParams();
    this.reports$ = combineLatest([this.route.paramMap, this.route.queryParamMap]).pipe(
      map(
        ([params, queryParams]) =>
          <QueryParams>{
            serviceReportId: Number(queryParams.get('serviceReportId')),
            pageIndex: Number(queryParams.get('pageIndex') || 1),
            reportStatusList: queryParams.get('reportStatusList'),
            plantId: params.get('plantId'),
            deviceId: params.get('deviceId'),
          },
      ),
      switchMap((queryParams: QueryParams) => {
        this.pageIndex = queryParams.pageIndex ? queryParams.pageIndex : this.pageIndex;
        this.reportStatusList = queryParams.reportStatusList
          ? queryParams.reportStatusList
          : this.reportStatusList;
        const reqParams = `?_sort=id&_order=desc&_page=${this.pageIndex}&_limit=5&type=${this.reportStatusList}`;
        return this.api
          .fetchServiceReportsList(queryParams.plantId, queryParams.deviceId, reqParams)
          .pipe(
            tap((n) => {
              this.totalCount = (n.listMetadata && n.listMetadata.totalCount) || 0;
              //console.log('n', n);
            }),
          );
      }),
      shareReplay(1),
    );
  }

  onPageIndexChange(index: number) {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { pageIndex: index },
      queryParamsHandling: 'merge',
    });
  }

  onRadioChange(option: string) {
    // console.log('option', option);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { reportStatusList: option, pageIndex: 1 },
      queryParamsHandling: 'merge',
    });
  }

  translate() {
    return this.labels[this.reportStatusList];
  }
}
