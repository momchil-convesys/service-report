import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FaultCountersPageComponent } from './fault-counters-page.component';
import { FaultCountersModule } from './fault-counters/fault-counters.module';

const routes: Routes = [
  {
    path: '',
    component: FaultCountersPageComponent,
  },
];

@NgModule({
  declarations: [FaultCountersPageComponent],
  imports: [CommonModule, RouterModule.forChild(routes), FaultCountersModule],
})
export class FaultCountersPageModule {}
