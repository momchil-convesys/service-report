import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientDashboardPvBessPageComponent } from './client-dashboard-pv-bess-page.component';

const routes: Routes = [
  {
    path: '',
    component: ClientDashboardPvBessPageComponent,

    // canActivate: [canActivatePvBessOverview],
    // canActivateChild: [canActivatePvBessOverview],
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes), ClientDashboardPvBessPageComponent],
})
export class ClientDashboardPvBessModule {}
