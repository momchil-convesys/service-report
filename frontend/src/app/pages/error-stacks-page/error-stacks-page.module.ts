import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { DatetimeRangeFilterModule } from '../../shared/datetime-range-filter/datetime-range-filter.module';
import { DeviceCurrentErrorsModule } from '../../shared/device-current-errors/device-current-errors.module';
import { DeviceLinkModule } from '../../shared/device-link/device-link.module';
import { ErrorStackIndexValueComponent } from '../../shared/error-stack-index-value/error-stack-index-value.component';
import { FaultsTableModule } from '../../shared/faults-table/faults-table.module';
import { RelativeDatePipe } from '../../shared/pipes/relative-date.pipe';
import { RelativeTimestampComponent } from '../../shared/relative-timestamp/relative-timestamp.component';
import { ErrorStackDetailPageComponent } from './error-stack-detail-page/error-stack-detail-page.component';
import { ErrorStackDetailComponent } from './error-stack-detail-page/error-stack-detail/error-stack-detail.component';
import { ErrorStackListComponent } from './error-stack-list/error-stack-list.component';
import { ErrorStacksPageComponent } from './error-stacks-page.component';
import { FaultsHistoryComponent } from './faults-history/faults-history.component';
import { FaultsPageNavSwitchComponent } from './faults-page-nav-switch/faults-page-nav-switch.component';

const routes: Routes = [
  {
    path: '',
    component: ErrorStacksPageComponent,
    children: [
      {
        path: 'faults-history',
        component: FaultsHistoryComponent,
      },
      {
        path: 'error-stacks',
        component: ErrorStackListComponent,
        children: [
          {
            path: 'detail/:stackDeviceId/:stackId',
            component: ErrorStackDetailPageComponent,
          },
        ],
      },
      {
        path: '',
        redirectTo: 'faults-history',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  declarations: [
    ErrorStacksPageComponent,
    ErrorStackDetailPageComponent,
    ErrorStackDetailComponent,
    ErrorStackListComponent,
    FaultsHistoryComponent,
    FaultsPageNavSwitchComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    DeviceLinkModule,
    NzIconModule,
    NzCardModule,
    FaultsTableModule,
    NzDividerModule,
    NzButtonModule,
    NzTableModule,
    NzTagModule,
    FormsModule,
    NzMenuModule,

    NzRadioModule,
    RelativeDatePipe,
    NzPaginationModule,
    NzResultModule,
    NzSpinModule,
    NzEmptyModule,
    NzSwitchModule,
    ErrorStackIndexValueComponent,
    DeviceCurrentErrorsModule,
    RelativeTimestampComponent,
    DatetimeRangeFilterModule,
  ],
  providers: [],
})
export class ErrorStacksPageModule {}
