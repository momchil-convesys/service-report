import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export enum MockUserRole {
  Client = 'client',
  Admin = 'admin',
  ServiceCoordinator = 'srvc-coord',
  ServiceTechnician = 'srvc-tech',
}

export interface MockUser {
  id: string;
  role: MockUserRole;
  displayName: string;
}

const users: MockUser[] = [
  {
    id: '1',
    role: MockUserRole.Admin,
    displayName: 'Господин Админ',
  },
  {
    id: '2',
    role: MockUserRole.Client,
    displayName: 'Петър Пиперков',
  },
  {
    id: '3',
    role: MockUserRole.ServiceCoordinator,
    displayName: 'Серж Кординант',
  },
  {
    id: '4',
    role: MockUserRole.ServiceTechnician,
    displayName: 'Бай Иван',
  },
];

@Injectable({
  providedIn: 'root',
})
export class MockUsersService {
  private _currentUser = new BehaviorSubject(users[0]);
  currentUser: Observable<MockUser> = this._currentUser.asObservable();

  simulateLoginAs(userId: string) {
    const user = this.getAllUsers().find((user) => user.id === userId);
    if (user) {
      this._currentUser.next(user);
    }
  }

  getAllUsers(): MockUser[] {
    return users;
  }

  getUserById(userId: string): MockUser | undefined {
    return this.getAllUsers().find((user) => user.id === userId);
  }

  getUserDisplayString(userId: string | null): string | null {
    if (userId) {
      const user = this.getUserById(userId);
      if (user) {
        return `${user.displayName} (${this.getDisplayNameForMockUserRole(user.role)})`;
      } else {
        return 'Unknown user ???';
      }
    }

    return null;
  }

  getDisplayNameForMockUserRole(role: MockUserRole) {
    switch (role) {
      case MockUserRole.Admin:
        return 'Администратор';
      case MockUserRole.Client:
        return 'Клиент';
      case MockUserRole.ServiceCoordinator:
        return 'Сервизен координатор';
      case MockUserRole.ServiceTechnician:
        return 'Сервизен техник';
      default:
        return 'Неизвестна роля';
    }
  }
}
