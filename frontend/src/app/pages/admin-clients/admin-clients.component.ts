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

interface ClientFormModel {
  plantId: string;
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
  selector: 'app-admin-clients',
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
  templateUrl: './admin-clients.component.html',
  styleUrl: './admin-clients.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminClientsComponent {
  plants$: Observable<Plant[]>;
  clients$: Observable<AdminClient[]>;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  searchText = '';

  clientModel: ClientFormModel = {
    plantId: '',
    clientName: '',
    clientAddress: '',
  };

  constructor(
    private http: HttpClient,
    private api: ApiService,
    private plantsService: PlantsService,
  ) {
    this.plants$ = this.plantsService.getPlants().pipe(map((request) => request.data || []));
    this.clients$ = this.fetchClients();
  }

  addClient(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http
      .post(`${this.api.baseUrl}/admin/plant-clients`, this.clientModel)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.successMessage = 'Client saved.';
          form.resetForm({});
          window.location.reload();
        },
        error: (error) => {
          this.errorMessage = error?.error?.error || 'Failed to save client.';
        },
      });
  }

  filterClients(clients: AdminClient[]): AdminClient[] {
    const query = this.searchText.trim().toLowerCase();
    if (!query) {
      return clients;
    }

    return clients.filter((client) => {
      const plantText = client.plants.map((plant) => `${plant.id} ${plant.name}`).join(' ');
      return `${client.id} ${client.name} ${client.address} ${plantText}`.toLowerCase().includes(query);
    });
  }

  private fetchClients(): Observable<AdminClient[]> {
    return this.http.get<AdminClient[]>(`${this.api.baseUrl}/admin/clients`);
  }
}
