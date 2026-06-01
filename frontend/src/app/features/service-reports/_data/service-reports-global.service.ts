import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class ServiceReportsGlobalService {
  private _editMode: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public editMode$: Observable<boolean> = this._editMode.asObservable();

  setEditMode(value: boolean): void {
    this._editMode.next(value);
  }
}
