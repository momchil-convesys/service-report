import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class MonbatService {
  listNeedsUpdate$ = new BehaviorSubject<string | undefined>(undefined); // plantId
  resetFileList$ = new BehaviorSubject<string | undefined>(undefined); // plantId
}
