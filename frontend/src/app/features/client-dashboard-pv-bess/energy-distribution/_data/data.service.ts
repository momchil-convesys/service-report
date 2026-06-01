import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EnergyDistributionSummary } from './model';

@Injectable()
export class EnergyDistributionDataService {
  private data$ = new BehaviorSubject<EnergyDistributionSummary | null | undefined>(undefined);
  private loading$ = new BehaviorSubject<boolean>(false);

  setLoading(loading: boolean): void {
    this.loading$.next(loading);
  }

  getLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  setData(data: EnergyDistributionSummary | null | undefined): void {
    this.data$.next(data);
  }

  getData(): Observable<EnergyDistributionSummary | null | undefined> {
    return this.data$.asObservable();
  }
}
