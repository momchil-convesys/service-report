import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { DataRequest } from '../../../../constants';
import { ApiService } from '../../../../data/api';
import { Plant } from '../../../../data/models';
import { zonedTimeToUtcSafe } from '../../../../helpers';
import { PowerScheduleManualAdjustment_FormValue } from '../power-schedule-manual-adjustment-form/power-schedule-manual-adjustment-form.component';
import {
  PowerScheduleAdjustment_BESSPowerSetpoint_RequestBody_DTO,
  PowerScheduleAdjustment_PriorityMode_RequestBody_DTO,
  PowerScheduleAdjustment_PVPowerSetpoint_RequestBody_DTO,
} from './manual-adjustments.dto';

@Injectable()
export class PowerScheduleManualAdjustmentsDataService {
  constructor(private api: ApiService) {}

  adjustScheduleInterval(
    type: 'pv' | 'bess' | 'priorityMode',
    plant: Plant | undefined,
    interval: { start: Date; end: Date },
    formValue: PowerScheduleManualAdjustment_FormValue,
  ): Observable<DataRequest<void>> {
    switch (type) {
      case 'pv':
        return this._adjustPVPowerSetpoint(plant, interval, formValue);
      case 'bess':
        return this._adjustBESSPowerSetpoint(plant, interval, formValue);
      case 'priorityMode':
        return this._adjustPriorityMode(plant, interval, formValue);
      default:
        throw new Error(`Unknown adjustment type: ${type}`);
    }
  }

  private _adjustPVPowerSetpoint(
    plant: Plant | undefined,
    interval: { start: Date; end: Date },
    formValue: PowerScheduleManualAdjustment_FormValue,
  ): Observable<DataRequest<void>> {
    const body: PowerScheduleAdjustment_PVPowerSetpoint_RequestBody_DTO = {
      interval: this._formatInterval(interval, plant),
      pvPowerSetpoint: formValue.pvPowerSetpoint?.newValue ?? null,
      priorityMode: formValue.priorityMode
        ? { value: formValue.priorityMode?.newValue ?? null }
        : null,
      passcode: formValue.passcode,
    };

    return this._sendAdjustmentRequest('pv-power-setpoint', plant, body);
  }

  private _adjustBESSPowerSetpoint(
    plant: Plant | undefined,
    interval: { start: Date; end: Date },
    formValue: PowerScheduleManualAdjustment_FormValue,
  ): Observable<DataRequest<void>> {
    const body: PowerScheduleAdjustment_BESSPowerSetpoint_RequestBody_DTO = {
      interval: this._formatInterval(interval, plant),
      bessPowerSetpoint: formValue.bessPowerSetpoint?.newValue ?? null,
      priorityMode: formValue.priorityMode
        ? { value: formValue.priorityMode?.newValue ?? null }
        : null,
      passcode: formValue.passcode,
    };

    return this._sendAdjustmentRequest('bess-power-setpoint', plant, body);
  }

  private _adjustPriorityMode(
    plant: Plant | undefined,
    interval: { start: Date; end: Date },
    formValue: PowerScheduleManualAdjustment_FormValue,
  ): Observable<DataRequest<void>> {
    const body: PowerScheduleAdjustment_PriorityMode_RequestBody_DTO = {
      interval: this._formatInterval(interval, plant),
      priorityMode: {
        value: formValue.priorityMode?.newValue ?? null,
      },
      passcode: formValue.passcode,
    };

    return this._sendAdjustmentRequest('priority-mode', plant, body);
  }

  private _formatInterval(
    interval: { start: Date; end: Date },
    plant: Plant | undefined,
  ): { start: string; end: string } {
    return {
      start: zonedTimeToUtcSafe(new Date(interval.start), plant?.timeZone).toISOString(),
      end: zonedTimeToUtcSafe(new Date(interval.end), plant?.timeZone).toISOString(),
    };
  }

  private _sendAdjustmentRequest<
    T extends { interval: { start: string; end: string }; passcode: string },
  >(endpointSuffix: string, plant: Plant | undefined, body: T): Observable<DataRequest<void>> {
    const endpoint: string = `${this.api.baseUrl}/manual-power-schedule-adjustments/${endpointSuffix}?plantId=${plant?.id}`;

    return this.api.decorateRequest(
      this.api.http
        .post<any>(endpoint, body, {
          headers: this.api.defaultHttpHeaders,
        })
        .pipe(map((response) => ({ data: response }))),
    );
  }
}
