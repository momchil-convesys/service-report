import { inject, LOCALE_ID } from '@angular/core';
import { catchError, finalize, Observable, of, switchMap } from 'rxjs';
import { AppInitStateService } from './app-initialize.service';
import { appInitilizeLocale } from './app-locale';
import { initializeKeycloak } from './auth/keycloak-init';
import { KEYCLOAK_DISABLED } from './auth/keycloak-constants';
import { LocalAuthService } from './auth/local-auth.service';
import { DescriptiveError } from './constants';
import { UsersService } from './data/services/users.service';
import { parseAnyError } from './helpers';
import { fixNgZorroMissingTranslations } from './ng-zorro-global-config';

export const initializeApp = (): Observable<boolean> => {
  const localeId = inject(LOCALE_ID);
  appInitilizeLocale(localeId);

  fixNgZorroMissingTranslations(localeId);

  const appInitState = inject(AppInitStateService);
  const usersService: UsersService = inject(UsersService);
  const localAuth = inject(LocalAuthService);

  return initializeKeycloak().pipe(
    switchMap(() => {
      if (KEYCLOAK_DISABLED && !localAuth.isAuthenticated) {
        return of(true);
      }

      return usersService.init();
    }),
    catchError((err: any) => {
      const parsedError: DescriptiveError = parseAnyError(err);

      console.error('Failed to initialize app!', err, parsedError);

      appInitState.error$.next(new Error(parsedError.title + ' | ' + parsedError.description));

      return of(false);
    }),
    finalize(() => appInitState.appInitCompleted$.next(true)),
  );
};
