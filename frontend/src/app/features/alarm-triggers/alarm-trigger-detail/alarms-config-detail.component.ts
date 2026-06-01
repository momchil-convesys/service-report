import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Observable,
  Subject,
  filter,
  map,
  merge,
  of,
  shareReplay,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { AlarmTriggerType, DataRequest, alarmTriggerTypeStringValues } from '../../../constants';
import { DeviceSelectComponent } from '../../../shared/device-select/device-select.component';
import { AlarmTriggersService } from '../_data/data.service';
import { AlarmTrigger, TriggerDeleteAction } from '../_data/models';

interface QueryParams {
  triggerType: string | null;
  triggerId: string | null;
}

@Component({
  selector: 'app-alarms-config-detail',
  templateUrl: './alarms-config-detail.component.html',
  styleUrls: ['./alarms-config-detail.component.less'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class AlarmsConfigDetailComponent {
  selectedTriggerRequest$: Observable<DataRequest<AlarmTrigger> | null>;

  updatedTriggerRequest$ = new Subject<DataRequest<AlarmTrigger>>();

  @ViewChild('deviceSelect') deviceSelect: DeviceSelectComponent | undefined;

  isLoading = false;

  editMode = false;

  constructor(
    private alarmTriggersService: AlarmTriggersService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    const queryParams$ = this.route.paramMap.pipe(
      map(
        (params) =>
          <QueryParams>{
            triggerType: params.get('triggerType'),
            triggerId: params.get('triggerId'),
          },
      ),
      tap(
        (params) => (this.editMode = !params.triggerId), // When creating new trigger
      ),
    );

    this.selectedTriggerRequest$ = merge(
      this.updatedTriggerRequest$,
      queryParams$.pipe(
        switchMap((params: QueryParams) => {
          if (
            params.triggerId &&
            params.triggerType &&
            alarmTriggerTypeStringValues.indexOf(params.triggerType) >= 0
          ) {
            return this.alarmTriggersService.getAlarmTrigger(
              params.triggerId,
              <AlarmTriggerType>params.triggerType,
            );
          }

          return of(null);
        }),
      ),
    ).pipe(shareReplay(1), takeUntilDestroyed());
  }

  onEdit() {
    this.editMode = true;
  }

  onClose() {
    if (this.router.url.indexOf('new') >= 0) {
      void this.router.navigate(['../'], { relativeTo: this.route, queryParamsHandling: 'merge' });
    } else {
      void this.router.navigate(['../../'], {
        relativeTo: this.route,
        queryParamsHandling: 'merge',
      });
    }
  }

  onCancel() {
    // void this.router.navigate(['/alarm-triggers']);
    if (this.router.url.indexOf('new') >= 0) {
      void this.router.navigate(['../'], { relativeTo: this.route, queryParamsHandling: 'merge' });
    } else {
      // void this.router.navigate(['../../'], {
      //   relativeTo: this.route,
      //   queryParamsHandling: 'merge',
      // });

      this.editMode = false;
    }
  }

  onDelete(deleteAction: TriggerDeleteAction) {
    this.isLoading = true;

    this.alarmTriggersService
      .deleteAlarmTrigger(
        deleteAction.trigger.id || '',
        deleteAction.trigger.type,
        deleteAction.deleteRelatedEvents,
      )
      .pipe(
        filter((res) => !res.isLoading),
        take(1),
      )
      .subscribe((x) => {
        this.alarmTriggersService.reloadAlarmTriggers();
        this.isLoading = false;

        void this.router.navigate(['../../'], { relativeTo: this.route });
      });
  }

  onCreate(alarmTrigger: AlarmTrigger) {
    this.isLoading = true;

    this.alarmTriggersService
      .createAlarmTrigger(alarmTrigger)
      .pipe(
        filter((res) => !res.isLoading),
        take(1),
      )
      .subscribe((alarmTrigger) => {
        this.alarmTriggersService.reloadAlarmTriggers();
        this.isLoading = false;

        this.editMode = false;

        void this.router.navigate([
          'alarm-triggers',
          alarmTrigger.data?.type,
          alarmTrigger.data?.id,
        ]);
      });
  }

  onUpdate(alarmTrigger: AlarmTrigger) {
    this.isLoading = true;

    this.alarmTriggersService
      .updateAlarmTrigger(alarmTrigger)
      .pipe(
        filter((res) => !res.isLoading),
        take(1),
      )
      .subscribe((req) => {
        this.alarmTriggersService.reloadAlarmTriggers();
        this.isLoading = false;
        this.editMode = false;

        this.updatedTriggerRequest$.next(req);
      });
  }
}
