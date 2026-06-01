import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { FaultsTableModule } from '../faults-table/faults-table.module';
import { FaultsSelectComponent } from './faults-select.component';

@NgModule({
  declarations: [FaultsSelectComponent],
  imports: [
    CommonModule,
    FormsModule,
    NzCheckboxModule,
    NzButtonModule,
    FaultsTableModule,
    NzTabsModule,
    NzTableModule,
  ],
  exports: [FaultsSelectComponent],
})
export class FaultsSelectModule {}
