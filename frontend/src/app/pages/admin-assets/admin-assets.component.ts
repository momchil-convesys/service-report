import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { finalize, map, Observable } from 'rxjs';
import { ApiService } from '../../data/api';
import { Plant } from '../../data/models';
import { PlantsService } from '../../data/services/plants.service';

interface PlantFormModel {
  id: string;
  name: string;
  type: string;
  country: string;
  installedPowerMwp: string;
}

interface DeviceFormModel {
  id: string;
  plantId: string;
  name: string;
  type: string;
  serialNumber: string;
  installedPowerKw: string;
}

@Component({
  selector: 'app-admin-assets',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NzAlertModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzTableModule,
  ],
  templateUrl: './admin-assets.component.html',
  styleUrl: './admin-assets.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAssetsComponent {
  plants$: Observable<Plant[]>;
  isSavingPlant = false;
  isSavingDevice = false;
  errorMessage = '';
  successMessage = '';
  searchText = '';

  plantModel: PlantFormModel = {
    id: '',
    name: '',
    type: 'solar',
    country: 'BG',
    installedPowerMwp: '',
  };

  deviceModel: DeviceFormModel = {
    id: '',
    plantId: '',
    name: '',
    type: 'inverter',
    serialNumber: '',
    installedPowerKw: '',
  };

  readonly plantTypes = ['solar', 'battery', 'wind', 'pump', 'other'];
  readonly deviceTypes = ['inverter', 'battery', 'meter', 'sensor', 'gateway', 'other'];

  constructor(
    private http: HttpClient,
    private api: ApiService,
    private plantsService: PlantsService,
  ) {
    this.plants$ = this.plantsService.getPlants().pipe(map((request) => request.data || []));
  }

  createPlant(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    this.isSavingPlant = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http
      .post(`${this.api.baseUrl}/admin/plants`, this.plantModel)
      .pipe(finalize(() => (this.isSavingPlant = false)))
      .subscribe({
        next: () => {
          this.successMessage = 'Plant created.';
          this.resetPlantForm(form);
          window.location.reload();
        },
        error: (error) => {
          this.errorMessage = error?.error?.error || 'Failed to create plant.';
        },
      });
  }

  createDevice(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    this.isSavingDevice = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http
      .post(`${this.api.baseUrl}/admin/devices`, this.deviceModel)
      .pipe(finalize(() => (this.isSavingDevice = false)))
      .subscribe({
        next: () => {
          this.successMessage = 'Device created.';
          this.resetDeviceForm(form);
          window.location.reload();
        },
        error: (error) => {
          this.errorMessage = error?.error?.error || 'Failed to create device.';
        },
      });
  }

  filterPlants(plants: Plant[]): Plant[] {
    const query = this.searchText.trim().toLowerCase();
    if (!query) {
      return plants;
    }

    return plants.filter((plant) => {
      const clientText = (plant.relatedClients || [])
        .map((client) => `${client.name} ${client.address}`)
        .join(' ');
      const deviceText = plant.devices
        .map((device) => `${device.id} ${device.name}`)
        .join(' ');
      const haystack = `${plant.id} ${plant.name} ${plant.type} ${clientText} ${deviceText}`.toLowerCase();

      return haystack.includes(query);
    });
  }

  private resetPlantForm(form: NgForm): void {
    form.resetForm({
      type: 'solar',
      country: 'BG',
    });
  }

  private resetDeviceForm(form: NgForm): void {
    form.resetForm({
      type: 'inverter',
    });
  }

}
