import { Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Observable,
  Subject,
  combineLatest,
  distinctUntilChanged,
  map,
  merge,
  of,
  shareReplay,
  switchMap,
  takeUntil,
} from 'rxjs';
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
  activeReportId: string | null = null;

  private _destroy$ = new Subject<void>();
  constructor(
    private serviceReportsGlobalService: ServiceReportsGlobalService,
    public reportService: ReportService,
    private api: ServiceReportsApiService,
    private activatedRoute: ActivatedRoute,
  ) {
    const routeParams$ = combineLatest(
      this.activatedRoute.pathFromRoot.map((route) => route.paramMap),
    ).pipe(
      map((paramMaps) => {
        const findParam = (key: string): string | null => {
          for (let index = paramMaps.length - 1; index >= 0; index -= 1) {
            const value = paramMaps[index].get(key);
            if (value) {
              return value;
            }
          }

          return null;
        };

        return <QueryParams>{
          reportId: findParam('reportId'),
          plantId: findParam('plantId'),
          deviceId: findParam('deviceId'),
        };
      }),
      shareReplay(1),
    );

    routeParams$
      .pipe(
        map((params) => params.reportId),
        distinctUntilChanged(),
        takeUntil(this._destroy$),
      )
      .subscribe((reportId) => {
        this.activeReportId = reportId;
        this.reportService.reportId = reportId;

        if (reportId) {
          this.reportService.reloadServiceReportPreview(
            this.api.composeServiceReportsPreviewUrl(reportId),
          );
        }
      });

    this.selectedReportDataRequest$ = merge(
      this.updatedReportDataRequest$,
      routeParams$.pipe(
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
