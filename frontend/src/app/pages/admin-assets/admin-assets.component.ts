import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { BehaviorSubject, finalize, map, Observable, shareReplay, startWith, switchMap } from 'rxjs';
import { ApiService } from '../../data/api';
import { Device, Plant } from '../../data/models';
import { PlantsService } from '../../data/services/plants.service';

interface PlantFormModel {
  name: string;
  type: string;
  country: string;
  installedPowerMwp: string;
  clientId: string;
}

interface DeviceFormModel {
  plantId: string;
  name: string;
  type: string;
  serialNumber: string;
  installedPowerKw: string;
}

interface ClientFormModel {
  clientName: string;
  clientAddress: string;
}

interface AdminClient {
  id: string;
  name: string;
  address: string;
  plants: { id: string; name: string }[];
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
    NzIconModule,
    NzInputModule,
    NzPopconfirmModule,
    NzSelectModule,
    NzTabsModule,
    NzTableModule,
  ],
  templateUrl: './admin-assets.component.html',
  styleUrl: './admin-assets.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAssetsComponent {
  @ViewChild('assetTabsHost', { read: ElementRef }) assetTabsHost?: ElementRef<HTMLElement>;

  plants$: Observable<Plant[]>;
  clients$: Observable<AdminClient[]>;
  isSavingPlant = false;
  isSavingDevice = false;
  isSavingClient = false;
  deletingPlantId = '';
  deletingClientId = '';
  deletingDeviceId = '';
  editingPlantId = '';
  editingDeviceId = '';
  editingClientId = '';
  selectedPlantId = '';
  errorMessage = '';
  successMessage = '';
  searchText = '';

  plantModel: PlantFormModel = {
    name: '',
    type: 'solar',
    country: 'BG',
    installedPowerMwp: '',
    clientId: '',
  };

  deviceModel: DeviceFormModel = {
    plantId: '',
    name: '',
    type: 'inverter',
    serialNumber: '',
    installedPowerKw: '',
  };

  clientModel: ClientFormModel = {
    clientName: '',
    clientAddress: '',
  };

  readonly plantTypes = ['solar', 'battery', 'wind', 'pump', 'other'];
  readonly deviceTypes = ['inverter', 'battery', 'meter', 'sensor', 'gateway', 'other'];
  readonly deviceTypeIcon: Record<string, string> = {
    inverter: 'thunderbolt',
    battery: 'battery',
    meter: 'dashboard',
    sensor: 'radar-chart',
    gateway: 'apartment',
    other: 'appstore',
  };
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  constructor(
    private http: HttpClient,
    private api: ApiService,
    private plantsService: PlantsService,
  ) {
    this.plants$ = this.plantsService.getPlants().pipe(map((request) => request.data || []));
    this.clients$ = this.refresh$.pipe(
      startWith(undefined),
      switchMap(() => this.http.get<AdminClient[]>(`${this.api.baseUrl}/admin/clients`)),
      shareReplay(1),
    );
  }

  createPlant(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    if (this.editingPlantId) {
      this.updatePlant(form);
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
          this.plantsService.refreshPlants();
          this.refresh$.next();
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

    if (this.editingDeviceId) {
      this.updateDevice(form);
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
          this.plantsService.refreshPlants();
          this.refresh$.next();
        },
        error: (error) => {
          this.errorMessage = error?.error?.error || 'Failed to create device.';
        },
      });
  }

  createClient(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    if (this.editingClientId) {
      this.updateClient(form);
      return;
    }

    this.isSavingClient = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http
      .post(`${this.api.baseUrl}/admin/clients`, this.clientModel)
      .pipe(finalize(() => (this.isSavingClient = false)))
      .subscribe({
        next: () => {
          this.successMessage = 'Client created.';
          this.resetClientForm(form);
          this.refresh$.next();
        },
        error: (error) => {
          this.errorMessage = error?.error?.error || 'Failed to create client.';
        },
      });
  }

  deletePlant(plantId: string): void {
    this.deletingPlantId = plantId;
    this.errorMessage = '';
    this.successMessage = '';

    this.http
      .delete(`${this.api.baseUrl}/admin/plants/${encodeURIComponent(plantId)}`)
      .pipe(finalize(() => (this.deletingPlantId = '')))
      .subscribe({
        next: () => {
          this.successMessage = 'Plant deleted.';
          if (this.selectedPlantId === plantId) {
            this.selectedPlantId = '';
          }
          this.plantsService.refreshPlants();
          this.refresh$.next();
        },
        error: (error) => {
          this.errorMessage = error?.error?.error || 'Failed to delete plant.';
        },
      });
  }

  editPlant(plant: Plant): void {
    this.editingPlantId = plant.id;
    this.plantModel = {
      name: plant.name,
      type: plant.assetType || plant.type,
      country: plant.country || '',
      installedPowerMwp: plant.installedPowerMwp || '',
      clientId: plant.relatedClients?.[0]?.id || '',
    };
  }

  cancelPlantEdit(form: NgForm): void {
    this.editingPlantId = '';
    this.resetPlantForm(form);
  }

  private updatePlant(form: NgForm): void {
    this.isSavingPlant = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http
      .patch(`${this.api.baseUrl}/admin/plants/${encodeURIComponent(this.editingPlantId)}`, this.plantModel)
      .pipe(finalize(() => (this.isSavingPlant = false)))
      .subscribe({
        next: () => {
          this.successMessage = 'Plant updated.';
          this.editingPlantId = '';
          this.resetPlantForm(form);
          this.plantsService.refreshPlants();
          this.refresh$.next();
        },
        error: (error) => {
          this.errorMessage = error?.error?.error || 'Failed to update plant.';
        },
      });
  }

  deleteClient(clientId: string): void {
    this.deletingClientId = clientId;
    this.errorMessage = '';
    this.successMessage = '';

    this.http
      .delete(`${this.api.baseUrl}/admin/clients/${encodeURIComponent(clientId)}`)
      .pipe(finalize(() => (this.deletingClientId = '')))
      .subscribe({
        next: () => {
          this.successMessage = 'Client deleted.';
          this.plantsService.refreshPlants();
          this.refresh$.next();
        },
        error: (error) => {
          this.errorMessage = error?.error?.error || 'Failed to delete client.';
        },
      });
  }

  editClient(client: AdminClient): void {
    this.editingClientId = client.id;
    this.clientModel = {
      clientName: client.name,
      clientAddress: client.address || '',
    };
  }

  cancelClientEdit(form: NgForm): void {
    this.editingClientId = '';
    this.resetClientForm(form);
  }

  private updateClient(form: NgForm): void {
    this.isSavingClient = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http
      .patch(`${this.api.baseUrl}/admin/clients/${encodeURIComponent(this.editingClientId)}`, this.clientModel)
      .pipe(finalize(() => (this.isSavingClient = false)))
      .subscribe({
        next: () => {
          this.successMessage = 'Client updated.';
          this.editingClientId = '';
          this.resetClientForm(form);
          this.plantsService.refreshPlants();
          this.refresh$.next();
        },
        error: (error) => {
          this.errorMessage = error?.error?.error || 'Failed to update client.';
        },
      });
  }

  deleteDevice(deviceId: string): void {
    this.deletingDeviceId = deviceId;
    this.errorMessage = '';
    this.successMessage = '';

    this.http
      .delete(`${this.api.baseUrl}/admin/devices/${encodeURIComponent(deviceId)}`)
      .pipe(finalize(() => (this.deletingDeviceId = '')))
      .subscribe({
        next: () => {
          this.successMessage = 'Device deleted.';
          this.plantsService.refreshPlants();
          this.refresh$.next();
        },
        error: (error) => {
          this.errorMessage = error?.error?.error || 'Failed to delete device.';
        },
      });
  }

  editDevice(device: Device): void {
    this.editingDeviceId = device.id;
    this.selectedPlantId = device.plantId;
    this.deviceModel = {
      plantId: device.plantId,
      name: device.name,
      type: device.assetType || device.type,
      serialNumber: device.serialNumber || '',
      installedPowerKw: device.installedPowerKw || '',
    };
  }

  cancelDeviceEdit(form: NgForm): void {
    this.editingDeviceId = '';
    this.resetDeviceForm(form);
  }

  private updateDevice(form: NgForm): void {
    this.isSavingDevice = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http
      .patch(`${this.api.baseUrl}/admin/devices/${encodeURIComponent(this.editingDeviceId)}`, this.deviceModel)
      .pipe(finalize(() => (this.isSavingDevice = false)))
      .subscribe({
        next: () => {
          this.successMessage = 'Device updated.';
          this.editingDeviceId = '';
          this.resetDeviceForm(form);
          this.plantsService.refreshPlants();
          this.refresh$.next();
        },
        error: (error) => {
          this.errorMessage = error?.error?.error || 'Failed to update device.';
        },
      });
  }

  selectPlant(plant: Plant): void {
    this.selectedPlantId = plant.id;
    this.deviceModel.plantId = plant.id;
    setTimeout(() => this.assetTabsHost?.nativeElement.scrollIntoView({ block: 'start', behavior: 'smooth' }));
  }

  showPlantsTable(): void {
    this.selectedPlantId = '';
  }

  getSelectedPlant(plants: Plant[]): Plant | undefined {
    return plants.find((plant) => plant.id === this.selectedPlantId);
  }

  getDevicesForSelectedPlant(plants: Plant[]): Device[] {
    return this.getSelectedPlant(plants)?.devices || [];
  }

  getAssetType(value: { assetType?: string; type: string }): string {
    return value.assetType || value.type;
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
        .map((device) => `${device.id} ${device.name} ${device.assetType || device.type}`)
        .join(' ');
      const haystack =
        `${plant.id} ${plant.name} ${plant.assetType || plant.type} ${clientText} ${deviceText}`.toLowerCase();

      return haystack.includes(query);
    });
  }

  private resetPlantForm(form: NgForm): void {
    form.resetForm({
      type: 'solar',
      country: 'BG',
      clientId: '',
    });
  }

  private resetDeviceForm(form: NgForm): void {
    form.resetForm({
      type: 'inverter',
      plantId: this.selectedPlantId || '',
    });
  }

  private resetClientForm(form: NgForm): void {
    form.resetForm({});
  }
}
