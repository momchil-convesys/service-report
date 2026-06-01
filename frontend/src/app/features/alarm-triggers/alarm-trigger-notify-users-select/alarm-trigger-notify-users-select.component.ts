import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, filter, map } from 'rxjs';
import { TypedChange } from '../../../constants';
import { Plant, User } from '../../../data/models';
import { PlantsService } from '../../../data/services/plants.service';
import { UsersService } from '../../../data/services/users.service';

interface ComponentChanges extends SimpleChanges {
  model: TypedChange<User[]>;
  filterByMetadataId: TypedChange<string | null>;
}

interface UserRelPlant extends User {
  plantNames: string[];
}

@Component({
  selector: 'app-alarm-trigger-notify-users-select',
  templateUrl: './alarm-trigger-notify-users-select.component.html',
  styleUrls: ['./alarm-trigger-notify-users-select.component.less'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class AlarmTriggerNotifyUsersSelectComponent implements OnChanges {
  @Input() model: User[] = [];
  @Input() filterByMetadataId: string | null = null;

  allRelatedUsers$: Observable<UserRelPlant[]>;
  filterByMetadataId$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  selectedUsers: (User | UserRelPlant)[] = [];

  loading$: Observable<boolean>;
  error$: Observable<Error | HttpErrorResponse | undefined>;

  constructor(
    plantsService: PlantsService,
    private usersService: UsersService,
  ) {
    const plantsRequest$ = plantsService.getPlants();

    const plants$ = plantsRequest$.pipe(
      map((request) => request.data),
      filter((data): data is Plant[] => data !== undefined),
    );

    const plantsOfInterest$ = combineLatest([plants$, this.filterByMetadataId$]).pipe(
      map(([plants, metadataId]: [Plant[], string | null]) => {
        if (metadataId === null) {
          return plants;
        }

        return plants.filter((plant) => {
          const found = plant.devices.find((device) => device.deviceMetadataId === metadataId);
          return !!found;
        });
      }),
    );

    const usersRequest$ = usersService.getAllUsers();

    const users$ = usersRequest$.pipe(
      map((request) => request.data),
      filter((data): data is User[] => data !== undefined),
    );

    this.allRelatedUsers$ = combineLatest([users$, plantsOfInterest$]).pipe(
      map(([users, plants]) => {
        const filteredUsers = users.filter((user) =>
          user.relatedPlantIds.some((id) => plants.some((plant) => plant.id === id)),
        );

        return filteredUsers.map((user) => {
          const plantNames = plants
            .filter((plant) => user.relatedPlantIds.includes(plant.id))
            .map((plant) => plant.name);
          return { ...user, plantNames };
        });
      }),
    );

    this.loading$ = combineLatest([plantsRequest$, usersRequest$]).pipe(
      map(([plantsReq, usersReq]) => plantsReq.isLoading || usersReq.isLoading),
    );

    this.error$ = combineLatest([plantsRequest$, usersRequest$]).pipe(
      map(([plantsReq, usersReq]) => plantsReq.error || usersReq.error),
    );
  }

  ngOnChanges(changes: ComponentChanges): void {
    if (changes.filterByMetadataId) {
      // Available users will change depending on metadata ID,
      // so lets start with a fresh array of selected users.
      this.selectedUsers = [];
      this.filterByMetadataId$.next(changes.filterByMetadataId.currentValue);
    }

    if (changes.model) {
      this.selectedUsers = [...changes.model.currentValue];
    }
  }

  onChange(user: User, selected: boolean) {
    if (selected) {
      this.selectedUsers = [...this.selectedUsers, user];
    } else {
      this.selectedUsers = this.selectedUsers.filter((u) => u.id !== user.id);
    }
  }

  onSelectAll(users: UserRelPlant[]) {
    this.selectedUsers = [...users];
  }

  onDeselectAll() {
    this.selectedUsers = [];
  }

  isSelected(user: User): boolean {
    const found = this.selectedUsers.find((u) => u.id === user.id);
    return !!found;
  }

  getSelectedUsers(): User[] {
    // Discard related plants from used object
    return this.selectedUsers.map((u) => ({
      id: u.id,
      email: u.email,
      displayName: u.displayName,
      permissions: u.permissions,
      relatedPlantIds: u.relatedPlantIds,
    }));
  }
}
