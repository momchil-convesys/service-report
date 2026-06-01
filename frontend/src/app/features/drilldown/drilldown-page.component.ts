import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-drilldown-page',
  templateUrl: './drilldown-page.component.html',
  styleUrls: ['./drilldown-page.component.less'],
  standalone: true,
  imports: [RouterModule, NzTabsModule, NzButtonModule, AsyncPipe],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrilldownPageComponent {
  deviceId$: Observable<string | null>;

  constructor(route: ActivatedRoute) {
    this.deviceId$ = route.paramMap.pipe(map((params) => params.get('deviceId')));
  }
}
