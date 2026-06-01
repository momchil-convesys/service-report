import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { permissionGuard } from '../../auth/auth.guard';
import { AccessControlPermission } from '../../constants';
import { ReactivePowerComponent } from './reactive-power.component';

const routes: Routes = [
  {
    path: '',
    component: ReactivePowerComponent,

    canActivate: [permissionGuard],
    canActivateChild: [permissionGuard],
    data: {
      permissions: [AccessControlPermission.ReactivePower_View],
    },
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes), ReactivePowerComponent],
  exports: [RouterModule],
})
export class ReactivePowerModule {}
