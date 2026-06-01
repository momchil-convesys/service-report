export const seriesColor_PvPowerSetpoint = '#d9343a'; // @red-7
export const seriesColor_ScheduleTargetFill = '#ffdb8c66'; // @gold-3 + opacity

export const semanticColor_BatteryCharging = '#09BCD7'; // @cyan-6
export const semanticColor_BatteryDischarging = '#A7D32E'; // @green-fresh-6
export const semanticColor_BESSSetpointCharging = '#006E8A'; // @cyan-8
export const semanticColor_BESSSetpointDischarging = '#6e851c'; // @green-fresh-8
export const seriesColor_ScheduleTargetFillBessCharging = '#09bcd755';
export const seriesColor_ScheduleTargetFillBessDischarging = '#a7d32e55';

export const semanticColor_ChargeableEnergy = '#00a1f1'; // @blue-6
export const semanticColor_DischargeableEnergy = '#14995d'; // @green-7

export const semanticColor_GridOut = '#0063A6'; // @blue-8
export const semanticColor_GridIn = '#ff7773'; // @red-6
export const seriesColor_GridPowerSetpointExport = '#ff7773'; // @red-6 (semanticColor_GridIn)
export const seriesColor_GridPowerSetpointImport = '#0063A6'; // @blue-8 (semanticColor_GridOut)
export const seriesColor_ScheduleTargetFillGridExport = '#ff777333'; // @red-6 + opacity
export const seriesColor_ScheduleTargetFillGridImport = '#0063A633'; // @blue-8 + opacity

export const seriesColor_GridImportLoss = '#003059'; // @blue-10
export const seriesColor_GridExportLoss = '#8c1420'; // @red-9

// Base: "/" slant (main diagonal + tiny edge bleed)
export const patternPath1 = 'M 0 10 L 10 0 M 9 11 L 11 9 M -1 1 L 1 -1';

// Complement: same "/" slant, offset by half a tile (fills the gaps)
// Includes overflow strokes so it tiles cleanly with strokeWidth > 1
export const patternPath2 = 'M 0 5 L 5 0 M 5 10 L 10 5 M 5 0 L 10 -5 M 0 15 L 5 10 M 10 5 L 15 0';

export const slantedPattern: Highcharts.PatternOptionsObject = {
  path: {
    d: patternPath2,
    strokeWidth: 3,
  },
  width: 10,
  height: 10,
};
