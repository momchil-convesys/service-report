export interface EnergyDistributionSummary {
  zonedUpdatedAt: Date;

  from: Date;
  to: Date;

  // Exported to grid (MV)
  exportedToGridMV: {
    subPlant1: number | null;
    subPlant2: number | null;
    total: number | null;
  };

  // Imported from grid (MV)
  importedFromGridMV: {
    subPlant1: number | null;
    subPlant2: number | null;
    total: number | null;
  };

  // Exported to grid (HV)
  exportedToGridHV: {
    subPlant1: number | null;
    subPlant2: number | null;
    total: number | null;
  };

  // Imported from grid (HV)
  importedFromGridHV: {
    subPlant1: number | null;
    subPlant2: number | null;
    total: number | null;
  };

  // Charged to batteries
  chargedToBatteries: {
    subPlant1: number | null;
    subPlant2: number | null;
    total: number | null;
  };

  // Discharged from batteries
  dischargedFromBatteries: {
    subPlant1: number | null;
    subPlant2: number | null;
    total: number | null;
  };

  // PV Production
  pvProduction: {
    subPlant1: number | null;
    subPlant2: number | null;
    total: number | null;
  };

  // Exported energy loss
  exportedEnergyLoss: {
    subPlant1: number | null;
    subPlant2: number | null;
    total: number | null;
  };

  // Imported energy loss
  importedEnergyLoss: {
    subPlant1: number | null;
    subPlant2: number | null;
    total: number | null;
  };
}
