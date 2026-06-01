export enum PriorityMode {
  DEFAULT = 'DEFAULT',
  CHARGE_BESS_FIRST = 'CHARGE_BESS_FIRST',
  GRID_EXTRA = 'GRID_EXTRA',
  GRID_STRICT = 'GRID_STRICT',
  REGULATION = 'REGULATION',
}

export const priorityModes: {
  id: PriorityMode;
  title: string;
  description: string;
  appLogic: string[];
  restrictions: string[];
}[] = [
  {
    id: PriorityMode.DEFAULT,
    title: `${PriorityMode.DEFAULT}`,
    description: $localize`DEFAULT is a combined control mode in which the photovoltaic plant and the battery are treated as a single aggregated energy source or load. The final power exchange with the grid is determined by the combined effect of PV and BESS.`,
    appLogic: [
      $localize`The system calculates the overall plant target as the sum of the PV setpoint and the BESS setpoint.`,
      $localize`PV and BESS are controlled so that, together, they achieve this overall target within the available capacities and operational limits.`,
      $localize`When the battery is discharging, it contributes to the total production.`,
      $localize`When the battery is charging, it reduces the net export or results in power import from the grid if required to meet the setpoint.`,
    ],
    restrictions: [$localize`[BESS setpoint ≠ NL] The BESS setpoint cannot be No Limit.`],
  },
  {
    id: PriorityMode.CHARGE_BESS_FIRST,
    title: `${PriorityMode.CHARGE_BESS_FIRST}`,
    description: $localize`A mode with priority given to battery charging, where increasing the battery state of charge is the primary objective.`,
    appLogic: [
      $localize`Available energy is first directed to the battery until the charging setpoint is fulfilled.`,
      $localize`After the BESS charging setpoint is satisfied, any remaining energy may be exported to the grid.`,
      $localize`The photovoltaic plant and the grid may be used as energy sources for charging, if operating conditions allow.`,
    ],
    restrictions: [
      $localize`[BESS setpoint < 0] The BESS setpoint must be negative.`,
      $localize`[BESS setpoint ≠ NL] The BESS setpoint cannot be No Limit.`,
    ],
  },
  {
    id: PriorityMode.GRID_EXTRA,
    title: `${PriorityMode.GRID_EXTRA} (charge only)`,
    description: $localize`A mode for strict compliance with a photovoltaic setpoint, in which the battery is used solely to absorb surplus energy.`,
    appLogic: [
      $localize`The photovoltaic plant follows its setpoint towards the grid.`,
      $localize`If actual production exceeds the setpoint, the surplus energy is directed to the battery.`,
      $localize`Charging the battery from the grid is not permitted.`,
    ],
    restrictions: [
      $localize`[PV setpoint ≠ NL] The PV setpoint cannot be No Limit.`,
      $localize`[BESS setpoint < 0] OR [BESS setpoint = NL] The BESS setpoint must be negative or No Limit.`,
    ],
  },
  {
    id: PriorityMode.GRID_STRICT,
    title: `${PriorityMode.GRID_STRICT} (discharge only)`,
    description: $localize`A mode for guaranteeing compliance with a photovoltaic schedule by compensating production shortfalls using the battery.`,
    appLogic: [
      $localize`The photovoltaic plant follows its setpoint.`,
      $localize`If actual production is below the setpoint, the battery discharges to compensate for the deficit.`,
      $localize`Export above the defined setpoint is not permitted.`,
    ],
    restrictions: [
      $localize`[PV setpoint ≠ NL] The PV setpoint cannot be No Limit.`,
      $localize`[PV setpoint > 0] The PV setpoint must be positive.`,
      $localize`[BESS setpoint > 0] OR [BESS setpoint = NL] The BESS setpoint must be positive or No Limit.`,
    ],
  },
  {
    id: PriorityMode.REGULATION,
    title: `${PriorityMode.REGULATION}`,
    description: $localize`A mode of operation without photovoltaic production, in which the battery is charged directly from the electrical grid.`,
    appLogic: [
      $localize`The photovoltaic plant is shut down.`,
      $localize`The battery draws power from the grid up to the defined setpoint, provided sufficient grid connection capacity is available and operating conditions allow it.`,
    ],
    restrictions: [
      $localize`[PV setpoint = 0] The PV setpoint must be equal to 0.`,
      $localize`[BESS setpoint < 0] The BESS setpoint must be negative.`,
      $localize`[BESS setpoint ≠ NL] The BESS setpoint cannot be No Limit.`,
    ],
  },
];
