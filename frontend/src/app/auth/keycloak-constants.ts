import { environment } from '../../environments/environment';

export const KEYCLOAK_DISABLED =
  window.disableKeycloak && (environment.production === false || environment.electron === true);
export const KEYCLOAK_TOKEN_MOCK = 'KEYCLOAK_IS_DISABLED';
