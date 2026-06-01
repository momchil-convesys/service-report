export interface FlowChartParameters {
  pvOut: number | null;

  gridIn: number | null;
  gridOut: number | null;

  battOut: number | null;

  battIn: null | {
    total: number | null;

    fromPv: number | null;
    fromGrid: number | null;
  };

  consIn: null | {
    total: number | null;

    fromGrid: number | null;
    fromBatteries: number | null;
    fromPv?: number | null;
  };
}
