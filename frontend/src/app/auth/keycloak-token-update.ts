import Keycloak from 'keycloak-js';
import { KEYCLOAK_DISABLED, KEYCLOAK_TOKEN_MOCK } from './keycloak-constants';

export const checkAuthToken = async (keycloak: Keycloak): Promise<string | null> => {
  if (KEYCLOAK_DISABLED) {
    return KEYCLOAK_TOKEN_MOCK;
  }

  const minValidity = 60;

  if (keycloak.isTokenExpired(minValidity)) {
    // console.log('Token is expired or will expire soon!');
    await keycloak.updateToken(minValidity);
  }

  return keycloak.token || null;
};
