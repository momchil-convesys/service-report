import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable()
export class PlsService {
  listNeedsUpdate$ = new BehaviorSubject<string | undefined>(undefined); // plantId
  resetFileList$ = new Subject<string>(); // plantId
}
