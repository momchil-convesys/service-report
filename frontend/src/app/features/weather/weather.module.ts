import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WeatherPageComponent } from './weather-page/weather-page.component';

const routes: Routes = [
  {
    path: '',
    component: WeatherPageComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class WeatherModule {}
