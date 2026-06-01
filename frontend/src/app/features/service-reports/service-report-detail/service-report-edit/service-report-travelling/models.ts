// TravellingEntryFormValue structure represents form value
// TravellingEntry structure is the format that needs to be sent to the backend

import { dateToDateTime } from '../../../common/helpers';
import { Datetime } from '../../../common/models';

// import { dateToDateTime, datetimeToDate } from '../common/helpers';
// import { Datetime } from '../common/models';

export class TravellingEntry {
  origin!: {
    location: string;
    timestamp: string; // ISO formatted UTC timestamp "YYYY-MM-DDTHH:mm:ss.sssZ" ("2016-01-02T12:30:00.000Z")
  };
  destination!: {
    location: string;
    timestamp: string;
  };
  distance!: number; // km
  duration!: number;
  vehiclesCount!: number;
  personsParticipated!: string[];
  otherExpenses!: string;

  static toFormValue(entry: TravellingEntry): TravellingEntryFormValue {
    return {
      ...entry,
      origin: {
        location: entry.origin.location,
        datetime: dateToDateTime(new Date(entry.origin.timestamp)),
        travelTimestamp: new Date(entry.origin.timestamp),
      },
      destination: {
        location: entry.destination.location,
        datetime: dateToDateTime(new Date(entry.destination.timestamp)),
        travelTimestamp: new Date(entry.destination.timestamp),
      },
      personsParticipated: entry.personsParticipated.join(', '),
      duration: {
        hours: Math.trunc(entry.duration / 60),
        minutes: entry.duration % 60,
      },
    };
  }
}

export class TravellingEntryFormValue {
  origin!: {
    location: string;
    datetime: Datetime;
    travelTimestamp: Date;
  };
  destination!: {
    location: string;
    datetime: Datetime;
    travelTimestamp: Date;
  };
  distance!: number; // km
  duration!: {
    hours: number;
    minutes: number;
  };
  vehiclesCount!: number;
  personsParticipated!: string;
  otherExpenses!: string;

  static toEntry(formValue: TravellingEntryFormValue): TravellingEntry {
    //const tzoffset = new Date().getTimezoneOffset() * 60000;
    // const originTime = new Date(datetimeToDate(formValue.origin.datetime).getTime() - tzoffset);
    // const destinationTime = new Date(
    //   datetimeToDate(formValue.destination.datetime).getTime() - tzoffset
    // );

    const originTime = new Date(formValue.origin.travelTimestamp.getTime());
    const destinationTime = new Date(formValue.destination.travelTimestamp.getTime());
    return {
      ...formValue,
      origin: {
        location: formValue.origin.location,
        timestamp: originTime.toISOString(),
      },
      destination: {
        location: formValue.destination.location,
        timestamp: destinationTime.toISOString(),
      },
      personsParticipated: formValue.personsParticipated.split(',').map((p) => p.trim()),
      duration: formValue.duration.hours * 60 + formValue.duration.minutes,
    };
  }
}

// export const formValueMock: TravellingEntryFormValue = {
//   origin: {
//     location: 'Vraca',
//     datetime: {
//       date: '2021-05-18',
//       time: '07:20',
//     },
//   },
//   destination: {
//     location: 'Shumen',
//     datetime: {
//       date: '2021-05-18',
//       time: '10:25',
//     },
//   },
//   distance: 200,
//   duration: { hours: 3, minutes: 5 },
//   vehiclesCount: 1,
//   personsParticipated: 'Razvigor Popov',
//   otherExpenses: '',
// };
