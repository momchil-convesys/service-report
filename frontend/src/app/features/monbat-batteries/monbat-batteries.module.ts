import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MonbatBatteryPageComponent } from './monbat-battery-page/monbat-battery-page.component';
import { MonbatStringPageComponent } from './monbat-string-page/monbat-string-page.component';
import { MonbatStringsPageComponent } from './monbat-strings-page/monbat-strings-page.component';

const routes: Routes = [
  {
    path: '',
    component: MonbatStringsPageComponent,
    children: [
      {
        // Wse are using string index as route param (instead of ID)
        // to automatically redirect to 0 index (see empty path rule below)
        path: ':stringIndex',
        component: MonbatStringPageComponent,
        children: [
          {
            path: 'batteries/:batteryId',
            component: MonbatBatteryPageComponent,
          },
        ],
      },
      { path: '', redirectTo: '0', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
})
export class MonbatBatteriesModule {}
