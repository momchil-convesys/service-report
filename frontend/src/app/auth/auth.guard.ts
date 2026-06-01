import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthGuardData, createAuthGuard } from 'keycloak-angular';
import { AccessControlPermission } from '../constants';
import { UsersService } from '../data/services/users.service';

import Keycloak from 'keycloak-js';
import { environment } from '../../environments/environment';
import { KEYCLOAK_DISABLED } from './keycloak-constants';
import { LocalAuthService } from './local-auth.service';

const _loginGuard = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  authData: AuthGuardData,
): Promise<boolean | UrlTree> => {
  if (KEYCLOAK_DISABLED) {
    const auth = inject(LocalAuthService);
    const users = inject(UsersService);
    const router = inject(Router);

    if (!auth.isAuthenticated) {
      return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }

    if (!users.currentUser) {
      await users.init().toPromise();
    }

    return true;
  }

  // const { authenticated, grantedRoles } = authData;

  const keycloak = inject(Keycloak);

  if (!keycloak.authenticated) {
    await keycloak.login({
      redirectUri: environment.electron
        ? 'http://localhost/keycloak-redirect'
        : window.location.origin + state.url,
    });
    return false;
  }

  return keycloak.authenticated;
};

export const loginGuard = createAuthGuard<CanActivateFn>(_loginGuard);

export async function permissionGuard(
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): Promise<boolean> {
  if (KEYCLOAK_DISABLED) {
    const users = inject(UsersService);
    const router = inject(Router);

    if (!users.currentUser) {
      await users.init().toPromise();
    }

    const requiredPermissions: AccessControlPermission[] = route.data['permissions'] || [];
    const authorized = users.hasCurrentUserPermissions(requiredPermissions);

    if (!authorized) {
      router.navigate(['/403'], { skipLocationChange: false });
      return false;
    }

    return true;
  }

  const users = inject(UsersService);
  const router = inject(Router);

  const requiredPermissions: AccessControlPermission[] = route.data['permissions'];

  const authorized = users.hasCurrentUserPermissions(requiredPermissions);

  if (!authorized) {
    router.navigate(['/403'], { skipLocationChange: false });
    return false;
  }

  return true;
}
