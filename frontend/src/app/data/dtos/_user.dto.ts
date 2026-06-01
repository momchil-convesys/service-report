/**
 * '1' = admin
 * '2' = not admin
 * '3' = system
 */

import { AccessControlPermissionValue } from '../../constants';

export enum UserRole {
  Admin = '1',
  PlainUser = '2',
  System = '3',
}

export type UserRole_DTO = `${UserRole}`;

export interface User_DTO {
  id: string;
  email: string;
  displayName: string;
  role: UserRole_DTO | string;
  permissions: AccessControlPermissionValue[] | null;
  relatedPlantIds?: string[] | null;
}
