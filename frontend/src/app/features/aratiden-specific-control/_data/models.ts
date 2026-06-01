export interface ControlLimitDTO {
  plantId: string;
  limitType: 'power' | 'energy' | null; // null means default limit type
  limitValue: number; // MW or MWh depending on limitType
  timestamp: string;
}

export interface ControlLimitUpdateRequestDTO {
  plantId: string;
  limitType: 'power' | 'energy' | null;
  limitValue: number | null; // null for reset to default, MW or MWh depending on limitType
  passcode: string; // Master control password
}
