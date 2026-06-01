import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { CustomDataViewConfig } from './models';

const LOCAL_STORAGE_KEY_DATA_VIEWS = 'cmsCustomDataViews';

@Injectable()
export class CustomDataViewsDataService {
  private _dataViews$ = new BehaviorSubject<CustomDataViewConfig[]>([]);

  constructor() {
    this.getCustomDataViews();
  }

  getNewId(): string {
    return new Date().toISOString();
  }

  saveCustomDataView(dataView: CustomDataViewConfig) {
    const dataViews = this._dataViews$.getValue();

    let existingDataViewIndex: number = dataViews.findIndex((d) => d.id === dataView.id);

    if (existingDataViewIndex >= 0) {
      dataViews[existingDataViewIndex] = dataView;
    } else {
      dataViews.push(dataView);
    }

    localStorage.setItem(LOCAL_STORAGE_KEY_DATA_VIEWS, JSON.stringify(dataViews));

    this._dataViews$.next(dataViews);
  }

  deleteCustomDataView(dataViewId: string) {
    const dataViews = this._dataViews$.getValue().filter((d) => d.id !== dataViewId);

    localStorage.setItem(LOCAL_STORAGE_KEY_DATA_VIEWS, JSON.stringify(dataViews));

    this._dataViews$.next(dataViews);
  }

  getCustomDataViews(): Observable<CustomDataViewConfig[]> {
    let result: CustomDataViewConfig[] = [];

    const storedItem = localStorage.getItem(LOCAL_STORAGE_KEY_DATA_VIEWS);

    if (storedItem !== null) {
      result = JSON.parse(storedItem);
    }

    this._dataViews$.next(result);

    return this._dataViews$.asObservable();
  }

  getCustomDataViewById(dataViewId: string): Observable<CustomDataViewConfig | null> {
    return this._dataViews$.pipe(
      map((dataViews) => dataViews.find((dataView) => dataView.id === dataViewId) || null),
    );
  }
}
