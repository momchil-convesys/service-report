import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class DmChartsService {
  syncedColumnHover$ = new Subject<undefined | PointerEvent>();
}
