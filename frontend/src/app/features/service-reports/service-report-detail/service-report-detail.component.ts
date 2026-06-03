import { Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, combineLatest, map, merge, of, shareReplay, switchMap } from 'rxjs';
import { DataRequest } from '../../../constants';

import { ReportData } from '../_data/models/_service-report-list';
import { ServiceReportsApiService } from '../_data/service-reports-api.service';
import { ServiceReportsGlobalService } from '../_data/service-reports-global.service';
import { ReportService } from '../report.service';
interface QueryParams {
  reportId: string | null;
  plantId: string | null;
  deviceId: string | null;
}
@Component({
  selector: 'service-report-detail',
  templateUrl: './service-report-detail.component.html',
  styleUrls: ['./service-report-detail.component.less'],
  encapsulation: ViewEncapsulation.None,
  providers: [ReportService],
  standalone: false,
}) //
export class ServiceReportDetailComponent implements OnDestroy {
  //  @Input() params = {};

  selectedReportDataRequest$: Observable<DataRequest<ReportData> | null>;
  updatedReportDataRequest$ = new Subject<DataRequest<ReportData>>();
  saveSuccess$: Subject<boolean> = new Subject();
  isLoading = false;

  private _destroy$ = new Subject<void>();
  constructor(
    private serviceReportsGlobalService: ServiceReportsGlobalService,
    public reportService: ReportService,
    private api: ServiceReportsApiService,
    private activatedRoute: ActivatedRoute,
  ) {
    const queryParams$ = combineLatest([
      this.activatedRoute.paramMap,
      this.activatedRoute.parent?.paramMap || of(null),
    ]).pipe(
      map(
        ([params, parentParams]) =>
          <QueryParams>{
            reportId: params.get('reportId'),
            plantId: params.get('plantId') || parentParams?.get('plantId'),
            deviceId: params.get('deviceId') || parentParams?.get('deviceId'),
          },
      ),
    );

    this.selectedReportDataRequest$ = merge(
      this.updatedReportDataRequest$,
      queryParams$.pipe(
        switchMap((params: QueryParams) => {
          if (params.reportId) {
            return this.api.fetchServiceReport(params.reportId);
          }
          if (params.plantId) {
            return this.api.fetchServiceReportTemplate(params.plantId, params.deviceId);
          }
          return of(null);
        }),
      ),
    ).pipe(shareReplay(1));
  }

  ngOnDestroy(): void {
    this.serviceReportsGlobalService.setEditMode(false);
    this._destroy$.next();
  }
}
