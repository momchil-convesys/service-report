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
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { BehaviorSubject, finalize, Observable, shareReplay, startWith, switchMap } from 'rxjs';
import { ApiService } from '../../data/api';
import { Plant } from '../../data/models';

interface PlantFormModel {
  id: string;
  name: string;
  type: string;
  country: string;
  installedPowerMwp: string;
  clientId: string;
}

interface DeviceFormModel {
  id: string;
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
    NzInputModule,
    NzSelectModule,
    NzTabsModule,
    NzTableModule,
  ],
  templateUrl: './admin-assets.component.html',
  styleUrl: './admin-assets.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAssetsComponent {
  plants$: Observable<Plant[]>;
  clients$: Observable<AdminClient[]>;
  isSavingPlant = false;
  isSavingDevice = false;
  isSavingClient = false;
  errorMessage = '';
  successMessage = '';
  searchText = '';

  plantModel: PlantFormModel = {
    id: '',
    name: '',
    type: 'solar',
    country: 'BG',
    installedPowerMwp: '',
    clientId: '',
  };

  deviceModel: DeviceFormModel = {
    id: '',
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
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  constructor(
    private http: HttpClient,
    private api: ApiService,
  ) {
    this.plants$ = this.refresh$.pipe(
      startWith(undefined),
      switchMap(() => this.http.get<Plant[]>(`${this.api.baseUrl}/plants`)),
      shareReplay(1),
    );
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
      clientId: '',
    });
  }

  private resetDeviceForm(form: NgForm): void {
    form.resetForm({
      type: 'inverter',
    });
  }

  private resetClientForm(form: NgForm): void {
    form.resetForm({});
  }
}
