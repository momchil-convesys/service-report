import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable()
export class ServiceReportsGlobalService {
  private _editMode: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public editMode$: Observable<boolean> = this._editMode.asObservable();
  private _reportsListRefresh = new Subject<void>();
  public reportsListRefresh$: Observable<void> = this._reportsListRefresh.asObservable();

  setEditMode(value: boolean): void {
    this._editMode.next(value);
  }

  refreshReportsList(): void {
    this._reportsListRefresh.next();
  }
}
