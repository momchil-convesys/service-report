import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { DatetimeRangeFilterModule } from '../../../shared/datetime-range-filter/datetime-range-filter.module';
import { FaultsTableModule } from '../../../shared/faults-table/faults-table.module';
import { FaultCountersBarChartComponent } from './fault-counters-bar-chart/fault-counters-bar-chart.component';
import { FaultCountersColumnChartLoaderComponent } from './fault-counters-column-chart-loader/fault-counters-column-chart-loader.component';
import { FaultCountersColumnChartComponent } from './fault-counters-column-chart/fault-counters-column-chart.component';
import { FaultCountersTableComponent } from './fault-counters-table/fault-counters-table.component';
import { FaultCountersComponent } from './fault-counters.component';
import { FaultCountersService } from './fault-counters.service';

@NgModule({
  declarations: [
    FaultCountersComponent,
    FaultCountersTableComponent,
    FaultCountersBarChartComponent,
    FaultCountersColumnChartComponent,
    FaultCountersColumnChartLoaderComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NzSelectModule,
    NzSwitchModule,
    NzTableModule,
    NzDividerModule,
    NzButtonModule,
    NzSpaceModule,
    NzInputModule,
    NzIconModule,
    NzTabsModule,
    NzSpinModule,
    DatetimeRangeFilterModule,
    FaultsTableModule,
    NzCheckboxModule,
  ],
  exports: [FaultCountersComponent],
  providers: [FaultCountersService],
})
export class FaultCountersModule {}
