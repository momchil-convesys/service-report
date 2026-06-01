import {
  AutoRefreshTokenService,
  provideKeycloak,
  UserActivityService,
  withAutoRefreshToken,
} from 'keycloak-angular';
import { environment } from '../../environments/environment';
import { KEYCLOAK_DISABLED } from './keycloak-constants';

export const provideKeycloakAngular = () => {
  if (KEYCLOAK_DISABLED) {
    /**
     * With this configuration Keycloak will not initiate requests to the Keycloak server.
     */
    return provideKeycloak({
      config: {
        url: 'mock-url',
        realm: 'mock-realm',
        clientId: 'mock-client-id',
      },
      initOptions: {
        checkLoginIframe: false,
      },
      features: [],
      providers: [],
    });
  }

  return provideKeycloak({
    config: {
      url: window.keycloakUrl,
      realm: window.keycloakRealm,
      clientId: window.keycloakClientId,
    },
    initOptions: {
      checkLoginIframe: false,
      onLoad: 'login-required',
      messageReceiveTimeout: 10000,
      ...(environment.electron
        ? {
            redirectUri: 'http://localhost/keycloak-redirect',
            responseMode: 'query',
          }
        : {}),
    },
    features: [
      withAutoRefreshToken({
        onInactivityTimeout: 'none',
        sessionTimeout: 60000,
      }),
    ],
    providers: [AutoRefreshTokenService, UserActivityService],
  });
};
