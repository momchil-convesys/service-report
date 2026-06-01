/**
 * on-site system option
 *
 * In plant model plantSpecificMetadata -> add properties
 *
 */

import { SystemSetupType } from './constants';

/**
 * GET /system-setup/control ? plantId = 123
 *
 * response: SystemSetupControlResponse_DTO
 */

export interface SystemSetupControlResponse_DTO {
  plantId: string;
  timestamp: string; // information is valid as of
  systemSetupInControl?: SystemSetupType | null;
  errorMessage?: string | null;
}

/**
 * PUT /system-setup/control ? plantId = 123
 *
 * request body: SystemSetupControlRequestBody_DTO
 *
 * response: SystemSetupControlResponse_DTO
 */

export interface SystemSetupControlRequestBody_DTO {
  plantId: string;
  systemSetupInControl: SystemSetupType;
  passcode: string;
}
