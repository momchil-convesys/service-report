import { CurrentControlStateDTO } from '../app/features/power-schedule/_data/control-state.dto';
import { PowerScheduleDTO } from '../app/features/power-schedule/_data/power-schedule.dto';

function isoAt(offsetMinutes: number): string {
  return new Date(Date.now() + offsetMinutes * 60_000).toISOString();
}

export function createMockPowerSchedule(plantId: string): PowerScheduleDTO {
  const start = isoAt(-60);
  const end = isoAt(8 * 60);

  return {
    id: 'mock-power-schedule',
    plantId,
    applicableRange: { from: start, to: end },
    file: {
      name: 'MockPowerSchedule.xlsx',
      url: '',
      uploadedTimestamp: isoAt(-90),
      uploadedByUserDisplayName: 'Demo User',
    },
    parsedScheduleTable: Array.from({ length: 8 }, (_, index) => ({
      interval: {
        start: isoAt(index * 60),
        end: isoAt((index + 1) * 60),
      },
      pvPowerSetpoint: 1200 + index * 75,
      bessPowerSetpoint: index % 2 === 0 ? 250 : -150,
    })),
    status: 'enabled',
    statusHistory: [
      {
        statusChangedTo: 'enabled',
        byUserDisplayName: 'Demo User',
        timestamp: isoAt(-45),
      },
    ],
  };
}

export function createMockControlState(plantId: string): CurrentControlStateDTO {
  const now = new Date().toISOString();

  return {
    id: `${plantId}-mock-control-state`,
    timestamp: now,
    requestedSetpoints: {
      pvPower: 1200,
      bessPower: 250,
    },
    appliedSetpoints: {
      pvPower: 1180,
      bessPower: 240,
    },
    measured: {
      timestamp: now,
      pvPower: 1165,
      bessPower: 238,
    },
    controlMechanism: {
      type: 'DailySchedule',
      scheduleId: 'mock-power-schedule',
      interval: {
        start: isoAt(-15),
        end: isoAt(45),
      },
    },
  };
}
