import { FlowChartParameters } from '../../../shared/flow-chart/models';
import { PriorityMode, priorityModes } from '../../power-schedule/_data/priority-modes.dto';

export interface SystemMode {
  id: PriorityMode;
  title: string;
  description: string;
  rules: string[];
  config: {
    battChargingHasPriorityOverPvSchedule?: boolean;
    battAllowChargingFromGrid?: boolean;
  };
  flowChartParameters: FlowChartParameters;
}

const flowChartParametersMap: Record<PriorityMode, FlowChartParameters> = {
  [PriorityMode.DEFAULT]: {
    pvOut: 15,
    gridIn: 10,
    gridOut: null,
    battIn: {
      total: 5,
      fromPv: 5,
      fromGrid: 0,
    },
    battOut: null,
    consIn: null,
  },
  [PriorityMode.BATT_PRIORITY]: {
    pvOut: 15,
    gridIn: 5,
    gridOut: null,
    battIn: {
      total: 10,
      fromPv: 10,
      fromGrid: 0,
    },
    battOut: null,
    consIn: null,
  },
  [PriorityMode.GRID_EXTRA]: {
    pvOut: 100,
    gridIn: 1,
    gridOut: null,
    battIn: {
      total: 99,
      fromPv: 99,
      fromGrid: 0,
    },
    battOut: null,
    consIn: null,
  },
  [PriorityMode.REGULATION]: {
    pvOut: null,
    gridIn: 100,
    gridOut: null,
    battIn: {
      total: 100,
      fromPv: 0,
      fromGrid: 100,
    },
    battOut: null,
    consIn: null,
  },
  [PriorityMode.GRID_TO_BATT]: {
    pvOut: null,
    gridIn: 100,
    gridOut: null,
    battIn: {
      total: 150,
      fromPv: 50,
      fromGrid: 100,
    },
    battOut: null,
    consIn: null,
  },
};

export const systemModes: SystemMode[] = priorityModes.map((mode) => ({
  ...mode,
  flowChartParameters: flowChartParametersMap[mode.id],
}));
