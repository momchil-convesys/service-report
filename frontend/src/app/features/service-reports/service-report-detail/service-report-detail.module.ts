import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';
import { ServiceReportDetailComponent } from './service-report-detail.component';
const routes: Routes = [
  {
    path: '',
    component: ServiceReportDetailComponent,
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ServiceReportDetailModule {}
