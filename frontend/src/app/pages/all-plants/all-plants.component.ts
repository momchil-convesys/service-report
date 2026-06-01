import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { Observable, map } from 'rxjs';
import { Device, Plant } from '../../data/models';
import { PlantsService } from '../../data/services/plants.service';
import { DeviceCurrentErrorsModule } from '../../shared/device-current-errors/device-current-errors.module';
import { DeviceLinkModule } from '../../shared/device-link/device-link.module';

interface PlantItemData extends Plant {
  key: number;
  expand: boolean;
}

interface DeviceItemData extends Device {
  key: number;
}

@Component({
  selector: 'app-all-plants',

  imports: [CommonModule, NzTableModule, DeviceCurrentErrorsModule, DeviceLinkModule, NzCardModule],
  templateUrl: './all-plants.component.html',
  styleUrl: './all-plants.component.less',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllPlantsComponent {
  plants$: Observable<Plant[]>;

  listOfPlantData: PlantItemData[] = [];
  listOfDeviceData: DeviceItemData[] = [];

  constructor(private plantsService: PlantsService) {
    this.plants$ = plantsService.getPlants().pipe(map((req) => req.data || []));

    this.plants$.subscribe((plants) => {
      plants.forEach((plant, index) => {});
    });
  }
}
