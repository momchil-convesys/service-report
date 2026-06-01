import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, filter, map, of, shareReplay } from 'rxjs';
import { AccessControlPermission, DataRequest } from '../../constants';
import { KEYCLOAK_DISABLED } from '../../auth/keycloak-constants';
import { handleAnyError } from '../../helpers';
import { UserAdapter } from '../adapters/_user-adapter';
import { ApiService } from '../api';
import { User } from '../models';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private _currentUser: User | undefined;
  private _currentUser$ = new BehaviorSubject<User | undefined>(undefined);

  constructor(private _api: ApiService) {}

  init(): Observable<boolean> {
    const request$: Observable<User | undefined> = this._api.fetchCurrentUser().pipe(
      filter((req) => req.isLoading === false),

      // TODO: temporary mock
      // map((userDto) => applyMockedPermissions(userDto)),

      map((req) => {
        if (req.error) {
          throw req.error;
        }

        if (!req.data) {
          throw 'Server returned invalid object.';
        }

        const user = UserAdapter.dtoToModel(req.data);

        this.setCurrentUser(user);

        return user;
      }),
      catchError((err) => {
        this.setCurrentUser(undefined);

        console.error('UsersService | Failed to fetch current user! ERROR: ', err);

        throw err;
      }),
    );

    return request$.pipe(map((user) => !!user));
  }

  get currentUser(): User | undefined {
    return this._currentUser;
  }

  get currentUser$(): Observable<User | undefined> {
    return this._currentUser$.asObservable();
  }

  setCurrentUser(user: User | undefined): void {
    this._currentUser = user;
    this._currentUser$.next(user);
  }

  hasCurrentUserPermission(permission: AccessControlPermission): boolean {
    if (!this._currentUser) {
      console.error('UsersService | Current user is undefined!');
      return false;
    }

    return this._currentUser.permissions.indexOf(permission) >= 0;
  }

  hasCurrentUserPermissions(permissions: AccessControlPermission[]): boolean {
    if (!this._currentUser) {
      console.error('UsersService | Current user is undefined!');
      return false;
    }

    for (let permission of permissions) {
      if (this._currentUser.permissions.indexOf(permission) < 0) {
        return false;
      }
    }

    return true;
  }

  //----------------------------------------------------------------------------
  // All users

  getAllUsers(): Observable<DataRequest<User[]>> {
    return this._api.fetchUsers().pipe(
      map((req) => {
        if (req.data) {
          return {
            ...req,
            data: req.data
              .map((userDTO) => UserAdapter.dtoToModel(userDTO))
              .sort((a, b) => a.displayName.localeCompare(b.displayName)),
          };
        }

        return {
          ...req,
          data: undefined,
        };
      }),
      catchError((error: string) =>
        of({ isLoading: false, error: handleAnyError(error, undefined) }),
      ),
      shareReplay(1),
    );
  }
}
