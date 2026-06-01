import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  ParamMap,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import {
  BehaviorSubject,
  Observable,
  Subject,
  map,
  of,
  shareReplay,
  switchMap,
  takeUntil,
} from 'rxjs';
import { DataRequest } from '../../../constants';
import { Plant } from '../../../data/models';
import { PlantsService } from '../../../data/services/plants.service';
import { BatteriesApiService } from '../_data/api.service';
import { MonbatBatteryString } from '../_data/models';
import { MonbatBatteryStringDataService } from '../_data/monbat-battery-data.service';

interface Context {
  plantId: string;
  deviceId: string;
  stringId: string | null;
}

@Component({
  selector: 'app-monbat-strings-page',
  templateUrl: './monbat-strings-page.component.html',
  styleUrls: ['./monbat-strings-page.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MonbatBatteryStringDataService, BatteriesApiService],
  imports: [
    AsyncPipe,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    FormsModule,
    NzSpinModule,
    NzAlertModule,
    NzRadioModule,
    NzEmptyModule,
  ],
})
export class MonbatStringsPageComponent implements OnDestroy {
  plant$: Observable<Plant | undefined>;
  deviceId$: Observable<string | undefined>;

  batteryStringsRequest$: Observable<DataRequest<MonbatBatteryString[]>>;

  activeStringIndex$: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(
    undefined,
  );

  private _destroy$ = new Subject<void>();

  constructor(
    private batteryStringDataService: MonbatBatteryStringDataService,
    private route: ActivatedRoute,
    private plantsService: PlantsService,
  ) {
    const context$: Observable<Context> = this.route.paramMap.pipe(
      map((params: ParamMap) => {
        const plantId: string | null = params.get('plantId');
        const deviceId: string | null = params.get('deviceId');
        const stringId: string | null =
          this.route.firstChild?.snapshot.paramMap.get('stringId') || null;

        if (!plantId) {
          throw 'Missing context (string/device/plant ID).';
        }

        const context: Context = {
          plantId,
          deviceId: deviceId || '',
          stringId,
        };

        return context;
      }),
    );

    this.plant$ = context$.pipe(
      switchMap((context) => this.plantsService.getPlant(context.plantId)),
      map((req) => req.data),
    );

    this.deviceId$ = context$.pipe(map((context) => context.deviceId));

    this.batteryStringsRequest$ = context$.pipe(
      switchMap((context) => {
        if (!context.deviceId) {
          return of({
            isLoading: false,
            error: new Error('Missing device ID.'),
          });
        }

        return this.batteryStringDataService
          .getBatteryStringsForDevice(context.deviceId)
          .pipe(takeUntil(this._destroy$));
      }),
      shareReplay(1),
      takeUntil(this._destroy$),
    );
  }

  onStringIndexChange(stringIndex: string, active: boolean) {
    if (active) {
      this.activeStringIndex$.next(stringIndex);
    }
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
