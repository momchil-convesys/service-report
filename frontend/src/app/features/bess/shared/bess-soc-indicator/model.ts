export interface BessSocIndicatorData {
  timestamp: string;
  soc: number | null;
  soh: number | null;
  maxChargeableEnergy: number | null;
  maxDischargeableEnergy: number | null;
}
