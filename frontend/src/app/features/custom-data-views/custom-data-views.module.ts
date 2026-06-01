import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomDataViewsApiService } from './_data/api.service';
import { CustomDataViewsDataService } from './_data/data.service';
import { CustomDataViewLoaderComponent } from './custom-data-view-loader/custom-data-view-loader.component';
import { CustomDataViewsComponent } from './custom-data-views.component';

const routes: Routes = [
  {
    path: '',
    component: CustomDataViewsComponent,
    children: [
      {
        path: ':dataViewId',
        component: CustomDataViewLoaderComponent,
      },
      // { path: '', pathMatch: 'full', redirectTo: 'new' },
    ],
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  providers: [CustomDataViewsApiService, CustomDataViewsDataService],
})
export class CustomDataViewsModule {}
