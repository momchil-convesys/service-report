import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppInitStateService {
  appInitCompleted$ = new BehaviorSubject(false);
  error$ = new BehaviorSubject<Error | undefined>(undefined);
}
