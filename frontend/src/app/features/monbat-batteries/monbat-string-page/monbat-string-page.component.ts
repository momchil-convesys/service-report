import { AsyncPipe, DatePipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {
  ActivatedRoute,
  ParamMap,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Observable, map, shareReplay, switchMap } from 'rxjs';
import { LiveDataIndicatorComponent } from '../../../shared/live-data-indicator/live-data-indicator.component';
import { RelativeDatePipe } from '../../../shared/pipes/relative-date.pipe';
import { ValueDisplayComponent } from '../../../shared/value-display/value-display.component';
import { MinMax, MonbatBattery, MonbatBatteryString } from '../_data/models';
import { MonbatBatteryStringDataService } from '../_data/monbat-battery-data.service';
import { calcMinMax } from '../helpers';
import { MonbatBatteryTableViewComponent } from '../monbat-battery-table-view/monbat-battery-table-view.component';

interface Context {
  deviceId: string;
  stringIndex: string;
}

@Component({
  selector: 'app-monbat-string-page',
  templateUrl: './monbat-string-page.component.html',
  styleUrls: ['./monbat-string-page.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ValueDisplayComponent,
    MonbatBatteryTableViewComponent,
    NgTemplateOutlet,
    DatePipe,
    AsyncPipe,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    LiveDataIndicatorComponent,
    RelativeDatePipe,
    NzButtonModule,
    NzIconModule,
  ],
})
export class MonbatStringPageComponent {
  batteryString$: Observable<MonbatBatteryString | undefined>;

  minMax$: Observable<MinMax | undefined>;

  constructor(
    private route: ActivatedRoute,
    private batteryStringDataService: MonbatBatteryStringDataService,
  ) {
    const context$: Observable<Context> = this.route.paramMap.pipe(
      map((params: ParamMap) => {
        const deviceId: string | null = params.get('deviceId');
        const stringIndex: string | null = params.get('stringIndex');

        if (!deviceId || !stringIndex) {
          throw 'Missing context (string/device ID).';
        }

        const context: Context = {
          deviceId,
          stringIndex,
        };

        return context;
      }),
    );

    this.batteryString$ = context$.pipe(
      switchMap((context: Context) =>
        this.batteryStringDataService.getBatteryStringByIndex(
          context.stringIndex,
          context.deviceId,
        ),
      ),
      shareReplay(1),
    );

    this.minMax$ = this.batteryString$.pipe(map((batteryString) => calcMinMax(batteryString)));
  }

  onClick(battery: MonbatBattery | undefined) {
    if (!battery) {
      return;
    }

    const element = document.getElementById(`battery-anchor-${battery.id}`);
    if (element != undefined) {
      element.scrollIntoView({ behavior: 'instant', block: 'center' });
      element.classList.add('highlight');
      setTimeout(() => {
        element.classList.remove('highlight');
      }, 1000);
    }
  }
}
