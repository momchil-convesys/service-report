import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServiceReportListComponent } from './service-report-list.component';

const routes: Routes = [
  {
    path: '',
    component: ServiceReportListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ServiceReportListModule {}
