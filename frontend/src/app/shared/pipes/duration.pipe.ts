import { Pipe, PipeTransform } from '@angular/core';
import { formatDuration } from 'date-fns';
import { DurationUnit, durationUnitLabels } from '../../constants';

@Pipe({
  name: 'duration',
})
export class DurationPipe implements PipeTransform {
  transform(value: Duration, ...args: unknown[]): string {
    const result = formatDuration(value, {
      format: [
        durationUnitLabels[DurationUnit.Years],
        durationUnitLabels[DurationUnit.Months],
        durationUnitLabels[DurationUnit.Days],
        durationUnitLabels[DurationUnit.Hours],
        durationUnitLabels[DurationUnit.Minutes],
        durationUnitLabels[DurationUnit.Seconds],
      ],
      delimiter: ', ',
    });

    return result;
  }
}
