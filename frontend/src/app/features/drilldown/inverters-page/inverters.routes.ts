import { Routes } from '@angular/router';
import { InverterDetailPageComponent } from './inverter-detail-page/inverter-detail-page.component';
import { InvertersPageComponent } from './inverters-page.component';

export const ROUTES: Routes = [
  {
    path: '',
    component: InvertersPageComponent,

    children: [
      {
        path: ':contextTsId/:inverterId',
        component: InverterDetailPageComponent,
      },
    ],
  },
];
