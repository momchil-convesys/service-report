import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlantTopologyComponent } from './plant-topology.component';

export const routes: Routes = [
  {
    path: '',
    component: PlantTopologyComponent,
    children: [],
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  providers: [],
})
export class PlantTopologyModule {}
