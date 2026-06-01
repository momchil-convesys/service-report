import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataRequest } from '../../../../constants';
import { InverterAlarmHistoricalItem_DTO } from './dto';

@Injectable()
export class ActiveAlarmsDataService {
  alarmsRequest$: Observable<DataRequest<InverterAlarmHistoricalItem_DTO[]>> | undefined;

  alarms$: Observable<InverterAlarmHistoricalItem_DTO[]> | undefined;
  loading$: Observable<boolean> | undefined;
  error$: Observable<Error | undefined> | undefined;
}
