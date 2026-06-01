import { ALARM_SEVERITY_ORDER, AlarmSeverity } from './dto';

export function getMostSignificantAlarm<T extends { severity: AlarmSeverity }>(
  alarms: Array<T>,
): T | undefined {
  if (!alarms.length) {
    return undefined;
  }

  return alarms.sort((a, b) => {
    const aIndex = ALARM_SEVERITY_ORDER.indexOf(a.severity);
    const bIndex = ALARM_SEVERITY_ORDER.indexOf(b.severity);

    return aIndex - bIndex;
  })[0];
}
