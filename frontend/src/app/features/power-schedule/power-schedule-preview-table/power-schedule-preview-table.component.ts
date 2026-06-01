import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { map, Observable } from 'rxjs';
import { ClockService } from '../../../data/services/clock.service';
import { calcScheduleAdjustmentPercentageFormatted } from '../../../helpers/_schedule-adjustment-coefficient';
import { PowerSchedule, PowerScheduleParsedTableRow } from '../_data/models';

@Component({
  selector: 'app-power-schedule-preview-table',
  templateUrl: './power-schedule-preview-table.component.html',
  styleUrls: ['./power-schedule-preview-table.component.less'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PowerSchedulePreviewTableComponent {
  @Input() data: PowerSchedule | undefined;

  /**
   * Flag to control visibility of energy equivalent columns.
   * Set to true to show energy equivalent columns, false to hide them.
   * Can be toggled later via UI control.
   */
  showEnergyEquivalentColumns = false;

  private _clock = inject(ClockService);

  private _tick$ = this._clock.tick$;

  get tableData(): PowerScheduleParsedTableRow[] {
    return this.data?.parsedScheduleTable || [];
  }

  getRowClass(row: PowerScheduleParsedTableRow): Observable<string> {
    return this._tick$.pipe(
      map(() =>
        this._clock.getZonedPositionInTimeForInterval(row.zonedInterval, this.data?.plantTimeZone),
      ),
    );
  }

  getPvPowerSetpointAdjusted(row: PowerScheduleParsedTableRow): number | null {
    return row.pvPowerSetpointAdjusted;
  }

  getBessPowerSetpointAdjusted(row: PowerScheduleParsedTableRow): number | null {
    return row.bessPowerSetpointAdjusted;
  }

  shouldShowPvAdjustedValue(row: PowerScheduleParsedTableRow): boolean {
    const adjusted = this.getPvPowerSetpointAdjusted(row);

    return adjusted !== null && row.pvPowerSetpoint !== null && adjusted !== row.pvPowerSetpoint;
  }

  shouldShowBessAdjustedValue(row: PowerScheduleParsedTableRow): boolean {
    const adjusted = this.getBessPowerSetpointAdjusted(row);
    return (
      adjusted !== null && row.bessPowerSetpoint !== null && adjusted !== row.bessPowerSetpoint
    );
  }

  get pvAdjustmentPercentageFormatted(): string | null {
    return calcScheduleAdjustmentPercentageFormatted(this.data?.coefficientForPvPowerSetpoint ?? 1);
  }

  get bessAdjustmentPercentageFormatted(): string | null {
    return calcScheduleAdjustmentPercentageFormatted(
      this.data?.coefficientForBessPowerSetpoint ?? 1,
    );
  }

  /**
   * Calculate energy equivalent for PV power setpoint
   * Energy (kWh) = Power (kW) * intervalHours
   * Uses adjusted value if available
   */
  getPvEnergyEquivalent(row: PowerScheduleParsedTableRow): number | null {
    const powerValue = this.getPvPowerSetpointAdjusted(row) ?? row.pvPowerSetpoint;

    if (powerValue === null) {
      return null;
    }

    const intervalHours =
      (row.interval.end.getTime() - row.interval.start.getTime()) / (1000 * 60 * 60);
    const energyKWh = powerValue * intervalHours;

    return energyKWh > 0 ? energyKWh : null;
  }

  /**
   * Calculate energy equivalent for BESS power setpoint
   * Energy (kWh) = Power (kW) * intervalHours
   * Uses adjusted value if available
   */
  getBessEnergyEquivalent(row: PowerScheduleParsedTableRow): number | null {
    const powerValue = this.getBessPowerSetpointAdjusted(row) ?? row.bessPowerSetpoint;

    if (powerValue === null) {
      return null;
    }

    const intervalHours =
      (row.interval.end.getTime() - row.interval.start.getTime()) / (1000 * 60 * 60);
    const energyKWh = Math.abs(powerValue) * intervalHours;

    return energyKWh > 0 ? energyKWh : null;
  }

  /**
   * Get grid export power (gridPowerSetpoint when > 0)
   * Returns null if gridPowerSetpoint is null or <= 0
   */
  getGridExportPower(row: PowerScheduleParsedTableRow): number | null {
    if (row.gridPowerSetpoint === null) {
      return null;
    }

    if (row.gridPowerSetpoint < 0) {
      return 0;
    }

    return row.gridPowerSetpoint;
  }

  /**
   * Get grid import power (gridPowerSetpoint when < 0, keeping negative sign)
   * Returns null if gridPowerSetpoint is null or >= 0
   */
  getGridImportPower(row: PowerScheduleParsedTableRow): number | null {
    if (row.gridPowerSetpoint === null) {
      return null;
    }

    if (row.gridPowerSetpoint > 0) {
      return 0;
    }

    return row.gridPowerSetpoint;
  }
}
