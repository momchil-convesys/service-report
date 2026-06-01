import { Signal, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEvent, ReadyArgs, typeEventArgs } from 'keycloak-angular';
import Keycloak from 'keycloak-js';
import { Observable, filter, map, of, take } from 'rxjs';
import { KEYCLOAK_DISABLED } from './keycloak-constants';

export const initializeKeycloak = (): Observable<boolean> => {
  if (KEYCLOAK_DISABLED) {
    return of(true);
  }

  const keycloakEventSignal: Signal<KeycloakEvent> = inject(KEYCLOAK_EVENT_SIGNAL);
  const keycloakEvents$ = toObservable(keycloakEventSignal);

  const keycloak = inject(Keycloak);

  keycloakEvents$.subscribe((event) => {
    // console.log('Keycloak event: ', event);

    if (event.type === 'AuthRefreshError') {
      keycloak.login();
    }
  });

  return keycloakEvents$.pipe(
    filter((event) => event.type === 'Ready'),
    map((event) => typeEventArgs<ReadyArgs>(event.args)),
    map((authenticated) => {
      if (!authenticated) {
        throw new Error('Not authenticated');
      }

      return authenticated;
    }),
    take(1),
  );
};
