import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { map, shareReplay, switchMap } from 'rxjs';
import { BESSApiService } from '../_data/api.service';
import { BESSDataService } from '../_data/data.service';
import { BESSMomentaryDataService } from '../_data/momentary-data.service';

@Component({
  selector: 'app-bess-page',
  imports: [NzTabsModule, RouterModule, AsyncPipe, NzSpinModule, NzAlertModule],
  templateUrl: './bess-page.component.html',
  styleUrl: './bess-page.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [BESSApiService, BESSDataService, BESSMomentaryDataService],
})
export class BessPageComponent {
  private readonly dataService = inject(BESSDataService);
  private readonly route = inject(ActivatedRoute);

  private _bessMetadataRequest$ = this.route.paramMap.pipe(
    map((params) => params.get('bessId') || 'BESS_ID_MISSING_IN_URL'),
    switchMap((bessId) => this.dataService.getBESSMetadata(bessId)),
    shareReplay(1),
  );

  loading$ = this._bessMetadataRequest$.pipe(map((req) => req.isLoading));
  error$ = this._bessMetadataRequest$.pipe(map((req) => req.error));
  metadata$ = this._bessMetadataRequest$.pipe(map((req) => req.data));
}
