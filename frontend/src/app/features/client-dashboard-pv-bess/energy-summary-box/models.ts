export interface EnergySummaryBoxData {
  total: number | null;
  subPlant1: number | null;
  subPlant2: number | null;
}

export interface EnergySummaryBoxDataAll {
  pvProduction: EnergySummaryBoxData;

  charged: EnergySummaryBoxData;
  discharged: EnergySummaryBoxData;

  exportedMV: EnergySummaryBoxData;
  importedMV: EnergySummaryBoxData;

  exportedHV: EnergySummaryBoxData;
  importedHV: EnergySummaryBoxData;

  exportedEnergyLoss: EnergySummaryBoxData;
  importedEnergyLoss: EnergySummaryBoxData;
}
