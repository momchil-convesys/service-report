import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { AlarmEventListComponent } from '../../shared/alarm-event-list/alarm-event-list.component';
import { AlarmTriggerLinkComponent } from '../../shared/alarm-trigger-link/alarm-trigger-link.component';
import { AlarmTypeComponent } from '../../shared/alarm-type/alarm-type.component';
import { DeviceLinkModule } from '../../shared/device-link/device-link.module';
import { DeviceParameterUnitDisplayComponent } from '../../shared/device-parameter-unit-display/device-parameter-unit-display.component';
import { DeviceSelectModule } from '../../shared/device-select/device-select.module';
import { DeviceStateModule } from '../../shared/device-state/device-state.module';
import { FilterByAlarmTypeComponent } from '../../shared/filter-by-alarm-type/filter-by-alarm-type.component';
import { DurationPipe } from '../../shared/pipes/duration.pipe';
import { AlarmEventDetailPageComponent } from './alarm-event-detail-page/alarm-event-detail-page.component';
import { AlarmEventListPageComponent } from './alarm-event-list-page/alarm-event-list-page.component';
import { AlarmEventsComponent } from './alarm-events.component';

const routes: Routes = [
  {
    path: '',
    component: AlarmEventsComponent,
    children: [
      {
        path: ':type/:eventId',
        component: AlarmEventDetailPageComponent,
      },
      {
        path: '',
        component: AlarmEventListPageComponent,
        children: [
          {
            path: 'detail/:type/:eventId',
            component: AlarmEventDetailPageComponent,
          },
        ],
      },
    ],
  },
];

@NgModule({
  declarations: [AlarmEventsComponent, AlarmEventDetailPageComponent, AlarmEventListPageComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NzDividerModule,
    DeviceLinkModule,
    NzTimelineModule,
    NzPaginationModule,
    NzIconModule,
    NzDescriptionsModule,
    DeviceSelectModule,
    AlarmTypeComponent,
    DeviceStateModule,
    AlarmEventListComponent,
    DeviceParameterUnitDisplayComponent,
    DurationPipe,
    NzAlertModule,
    NzButtonModule,
    NzSpinModule,
    AlarmTriggerLinkComponent,
    FilterByAlarmTypeComponent,
    NzDrawerModule,
  ],
  exports: [],
})
export class AlarmEventsModule {}
