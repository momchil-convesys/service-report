import { Injectable } from '@angular/core';
import { concat, delay, Observable, of, Subject, takeUntil } from 'rxjs';
import { DataRequest } from '../../../constants';
import { plantTopology_mock } from './mock-topology';
import { PlantTopology_DTO } from './models';

@Injectable()
export class PlantTopologyApiService {
  private destroy$ = new Subject<void>();

  constructor() {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getPlantTopology(): Observable<DataRequest<PlantTopology_DTO>> {
    const firstValue = of({
      isLoading: true,
      data: undefined,
    });

    const secondValue = of({
      isLoading: false,
      data: plantTopology_mock,
    }).pipe(delay(1000));

    const result = concat(firstValue, secondValue);

    return result.pipe(takeUntil(this.destroy$));
  }
}
