import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { FaultsService } from './faults-service';
import { FaultsTableComponent } from './faults-table.component';

@NgModule({
  declarations: [FaultsTableComponent],
  imports: [CommonModule, FormsModule, NzSwitchModule, NzInputModule, NzIconModule, NzTableModule],
  exports: [FaultsTableComponent],
  providers: [FaultsService],
})
export class FaultsTableModule {}
