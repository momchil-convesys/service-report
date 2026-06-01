import { Component, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { NzMessageRef, NzMessageService } from 'ng-zorro-antd/message';
import {
  Observable,
  Subject,
  catchError,
  map,
  merge,
  of,
  shareReplay,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { DataRequest } from '../../../constants';
import { Plant } from '../../../data/models';
import { PlantsService } from '../../../data/services/plants.service';
import { GridExportSchedule_ForDay } from '../_data/models/grid-export-schedule.model';
import { GridExportScheduleDataService } from '../_data/services/data.service';
import { GridExportScheduleSettingsService } from '../_data/services/settings.service';
import { GridExportScheduleSyncService } from '../_data/services/sync.service';
import { calculatePositionInTimeRelativeToInterval } from '../helpers';

interface QueryParams {
  plantId: string;
  scheduleId: string;
}

@Component({
  selector: 'app-ges-detail-page',
  templateUrl: './ges-detail-page.component.html',
  styleUrls: ['./ges-detail-page.component.less'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class GesDetailPageComponent {
  scheduleRequest$: Observable<DataRequest<GridExportSchedule_ForDay>>;
  queryParams$: Observable<QueryParams>;

  schedule: GridExportSchedule_ForDay | undefined;
  activeMessage: NzMessageRef | undefined;

  priceSetting$: Observable<number | undefined>;

  private _updateStatusRequest$: Subject<DataRequest<GridExportSchedule_ForDay>> = new Subject();

  updateStatusRequest$: Observable<DataRequest<GridExportSchedule_ForDay>> =
    this._updateStatusRequest$.pipe(takeUntilDestroyed());

  constructor(
    route: ActivatedRoute,
    private plantsService: PlantsService,
    private msgService: NzMessageService,
    private dataService: GridExportScheduleDataService,
    settingsService: GridExportScheduleSettingsService,
    public syncService: GridExportScheduleSyncService,
  ) {
    this.queryParams$ = route.paramMap.pipe(
      map((params: ParamMap) => ({
        plantId: params.get('plantId') || 'INVALID_ROUTE_PARAMETER',
        scheduleId: params.get('scheduleId') || 'INVALID_ROUTE_PARAMETER',
      })),
      shareReplay(1),
    );

    this.priceSetting$ = this.queryParams$.pipe(
      switchMap((params) => settingsService.getSettings(params.plantId)),
      map((req) => req.data?.settings.minPriceToEnableExport),
    );

    const src1: Observable<DataRequest<GridExportSchedule_ForDay>> = this.queryParams$.pipe(
      switchMap((params: QueryParams) =>
        dataService.getGridExportSchedule(params.plantId, params.scheduleId),
      ),
      shareReplay(1),
    );

    const src2: Observable<DataRequest<GridExportSchedule_ForDay>> = this.updateStatusRequest$;

    this.scheduleRequest$ = merge(src1, src2).pipe(
      tap((request) => {
        if (request.isLoading === false) {
          if (request.error) {
            this.schedule = undefined;
          } else {
            this.schedule = request.data;
          }
        }
      }),
    );
  }

  isPast(item: GridExportSchedule_ForDay): boolean {
    return (
      calculatePositionInTimeRelativeToInterval(
        {
          start: new Date(item.applicableInterval.from),
          end: new Date(item.applicableInterval.to),
        },
        item.plantTimeZone,
      ) === 'past'
    );
  }

  onEnableSchedule() {
    const patch: Partial<GridExportSchedule_ForDay> = { status: 'enabled' };

    this.queryParams$
      .pipe(
        take(1),
        tap((params) => {
          const plant: Plant | undefined = this.plantsService.getCachedPlantById(params.plantId);

          if (!plant) {
            return;
          }
        }),
        switchMap((params) =>
          this.dataService.updateGridExportSchedule(params.plantId, params.scheduleId, patch),
        ),
        catchError((err) => {
          const result: DataRequest<GridExportSchedule_ForDay> = {
            isLoading: false,
            error: err,
            data: undefined,
          };
          return of(result);
        }),
        shareReplay(1),
      )
      .subscribe((res) => {
        this._updateStatusRequest$.next(res);

        if (res.data) {
          this.syncService.listNeedsUpdate$.next(res.data.plantId);

          this._showSuccessMessage('Request to ENABLE schedule was sent successfully.');
        }
      });
  }

  onDisableSchedule() {
    const patch: Partial<GridExportSchedule_ForDay> = { status: 'disabled' };

    this.queryParams$
      .pipe(
        take(1),
        switchMap((params) =>
          this.dataService.updateGridExportSchedule(params.plantId, params.scheduleId, patch),
        ),
        shareReplay(1),
      )
      .subscribe((res) => {
        this._updateStatusRequest$.next(res);

        if (res.data) {
          this.syncService.listNeedsUpdate$.next(res.data.plantId);

          this._showSuccessMessage('Request to DISABLE schedule was sent successfully.');
        }
      });
  }

  private _showSuccessMessage(text: string) {
    if (this.activeMessage) {
      this.msgService.remove(this.activeMessage.messageId);
    }

    this.activeMessage = this.msgService.success(text, {
      nzDuration: 8000,
    });
  }
}
