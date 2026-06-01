import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { DatetimeRangeFilterComponent } from './datetime-range-filter.component';

@NgModule({
  declarations: [DatetimeRangeFilterComponent],
  imports: [CommonModule, FormsModule, NzDatePickerModule, NzRadioModule],
  exports: [DatetimeRangeFilterComponent],
})
export class DatetimeRangeFilterModule {}
