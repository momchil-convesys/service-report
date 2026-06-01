//------------------------------------------------------------------------------------
// Error stacks
//

import { ErrorStackIndexValue } from '../../../constants';

// export enum ErrorStackIndexValue {
//   NotAvailable = 0,
//   Ok = 1,
//   Warning = 2,
//   Error = 3,
// }

export interface ErrorStackDTO {
  id: string;
  deviceId: string;
  plantId: string;
  timestamp: string;
  deviceSide: string; // "master" | "slave";
  summary: {
    faultId: string;
    errorStackValue: ErrorStackIndexValue;
  }[];
  details?: {
    stackSize: number; // ususally 4 or 8
    currentIndex: number;
    values: {
      [faultId: string]: ErrorStackIndexValue[]; // Array of last N values for each fault, where N = stackSize
    };
  };
  isCurrent: boolean;
}
