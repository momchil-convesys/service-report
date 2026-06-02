// import { datetimeToDate, dateToDateTime } from '../common/helpers';
// import { Datetime } from '../common/models';

import { dateToDateTime } from '../../../common/helpers';
import { Datetime } from '../../../common/models';

export class WorkEntry {
  workName!: string;
  // timeWorkStartTimestamp!: string;
  // timeWorkEndTimestamp!: string;
  timeWorkStart!: {
    timestamp: string; // ISO formatted UTC timestamp "YYYY-MM-DDTHH:mm:ss.sssZ" ("2016-01-02T12:30:00.000Z")
  };

  timeWorkEnd!: {
    timestamp: string; // ISO formatted UTC timestamp "YYYY-MM-DDTHH:mm:ss.sssZ" ("2016-01-02T12:30:00.000Z")
  };
  // duration: number;
  personsWorkParticipated!: string[];

  static toFormValue(entry: WorkEntry): WorkEntryFormValue {
    console.log('entry toFormValue WorkEntry', entry);
    return {
      ...entry,
      timeWorkStartTimestamp: new Date(entry.timeWorkStart.timestamp),
      timeWorkEndTimestamp: new Date(entry.timeWorkEnd.timestamp),
      timeWorkStart: {
        datetime: dateToDateTime(new Date(entry.timeWorkStart.timestamp)),
      },
      timeWorkEnd: {
        datetime: dateToDateTime(new Date(entry.timeWorkEnd.timestamp)),
      },
      personsWorkParticipated: entry.personsWorkParticipated.join(', '),
    };
  }
}

export class WorkEntryFormValue {
  workName!: string;
  timeWorkStartTimestamp!: Date;
  timeWorkEndTimestamp!: Date;
  timeWorkStart!: {
    datetime: Datetime;
  };
  timeWorkEnd!: {
    datetime: Datetime;
  };

  personsWorkParticipated!: string;

  static toEntry(formValue: WorkEntryFormValue): WorkEntry {
    // const tzoffset = new Date().getTimezoneOffset() * 60000;
    // const starTime = new Date(
    //   datetimeToDate(formValue.timeWorkStart.datetime).getTime() - tzoffset
    // );
    // const endTime = new Date(datetimeToDate(formValue.timeWorkEnd.datetime).getTime() - tzoffset);

    const starTime = new Date(new Date(formValue.timeWorkStartTimestamp).getTime());
    const endTime = new Date(new Date(formValue.timeWorkEndTimestamp).getTime());

    return {
      ...formValue,

      workName: formValue.workName,

      timeWorkStart: {
        timestamp: starTime.toISOString(),
      },
      timeWorkEnd: {
        timestamp: endTime.toISOString(),
      },
      personsWorkParticipated: formValue.personsWorkParticipated
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p.length > 0),
    };
  }
}
