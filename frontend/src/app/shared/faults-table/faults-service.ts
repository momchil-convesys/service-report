import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class FaultsService {
  private _selectedFaultIds$ = new BehaviorSubject<Set<string>>(new Set([]));
  selectedFaultIds$: Observable<Set<string>> = this._selectedFaultIds$.asObservable();

  get selectedFaultIds() {
    return this._selectedFaultIds$.getValue();
  }

  setSelectedFaultIds(faultIds: string[]) {
    this._selectedFaultIds$.next(new Set(faultIds));
  }

  toggleFaultSelection(faultId: string, select?: boolean) {
    const value = this.selectedFaultIds;

    let shouldBeSelected = select;

    if (select === undefined) {
      shouldBeSelected = !value.has(faultId);
    }

    if (shouldBeSelected) {
      value.add(faultId);
    } else {
      value.delete(faultId);
    }

    this._selectedFaultIds$.next(new Set(value));
  }

  clearSelectedFaults() {
    this._selectedFaultIds$.next(new Set([]));
  }
}
