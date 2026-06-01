import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import {
  Observable,
  ReplaySubject,
  Subject,
  combineLatest,
  map,
  shareReplay,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { DataRequest, DescriptiveError } from '../../../constants';
import { Plant } from '../../../data/models';
import { getDescriptionFromDataRequestError } from '../../../helpers';
import { PageRoutingService } from '../../../shared/page-routing.service';
import {
  GridExportSchedule_CurrentSettings_DTO,
  GridExportSchedule_SettingsHistory_DTO,
  GridExportSchedule_UpdateSettings_DTO,
} from '../_data/models/grid-export-schedule-settings.dto';
import { GridExportScheduleSettingsService } from '../_data/services/settings.service';
import { GesSettingsFormComponent } from '../settings-form/ges-settings-form.component';
import { GesSettingsHistoryComponent } from '../settings-history/ges-settings-history.component';

@Component({
  selector: 'app-ges-settings-page',
  templateUrl: './ges-settings-page.component.html',
  styleUrl: './ges-settings-page.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NzAlertModule,
    NzDividerModule,
    GesSettingsHistoryComponent,
    GesSettingsFormComponent,
  ],
})
export class GesSettingsPageComponent {
  error$: ReplaySubject<DescriptiveError | undefined> = new ReplaySubject(1);

  settingsHistoryUpdateTrigger$ = new Subject<void>();

  settingsHistoryRequest$: Observable<DataRequest<GridExportSchedule_SettingsHistory_DTO>>;

  currentSettingsValue$: ReplaySubject<GridExportSchedule_CurrentSettings_DTO> = new ReplaySubject(
    1,
  );
  currentSettingsLoading$: ReplaySubject<boolean | null> = new ReplaySubject(1);

  plant$: Observable<Plant>;

  constructor(
    private settingsService: GridExportScheduleSettingsService,
    pageRouting: PageRoutingService,
  ) {
    this.plant$ = pageRouting.getPlantFromQueryParams();

    const initialRequest: Observable<DataRequest<GridExportSchedule_CurrentSettings_DTO>> =
      this.plant$.pipe(
        tap(() => {
          this.currentSettingsLoading$.next(true);
          this.error$.next(undefined);
        }),
        switchMap((plant) => settingsService.getSettings(plant.id)),
      );

    initialRequest.pipe(takeUntilDestroyed()).subscribe((req) => this.handleRequestUpdate(req));

    this.settingsHistoryRequest$ = combineLatest([
      this.plant$,
      this.settingsHistoryUpdateTrigger$,
    ]).pipe(
      map(([plant, _]) => plant),
      switchMap((plant) => settingsService.getSettingsHistory(plant.id)),
      shareReplay(1),
      takeUntilDestroyed(),
    );
  }

  onSubmit(newSettings: GridExportSchedule_UpdateSettings_DTO) {
    this.currentSettingsLoading$.next(true);
    this.error$.next(undefined);

    const updateSettingsRequest = this.settingsService.updateSettings(
      newSettings.plantId,
      newSettings.settings,
    );
    updateSettingsRequest.pipe(take(2)).subscribe((req) => this.handleRequestUpdate(req));
  }

  private handleRequestUpdate(req: DataRequest<GridExportSchedule_CurrentSettings_DTO>) {
    this.currentSettingsLoading$.next(req.isLoading);

    if (req.error) {
      this.error$.next({
        title: 'Failed to complete request!',
        description: getDescriptionFromDataRequestError(req.error),
      });
    } else {
      this.error$.next(undefined);
    }

    if (!req.isLoading && !req.error && req.data) {
      this.currentSettingsValue$.next(req.data);
      this.settingsHistoryUpdateTrigger$.next();
    }
  }
}
