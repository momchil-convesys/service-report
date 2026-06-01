import { inject, Injectable } from '@angular/core';
import { concat, delay, Observable, of, Subject, takeUntil } from 'rxjs';
import { createMockControlState } from '../../../../mock/power-schedule-mock';
import { DataRequest } from '../../../constants';
import { ApiService, ServerSentEventsService } from '../../../data/api';
import { CurrentControlStateDTO } from './control-state.dto';

@Injectable()
export class ControlStateApiService {
  private baseApi = inject(ApiService);
  private sseApi = inject(ServerSentEventsService);

  private _destroy$ = new Subject<void>();

  ngOnDestroy() {
    this._destroy$.next();
  }

  /**
   * GET /power-schedule/current-control-state?plantId={plantId}
   * Returns the current control state for the specified plant
   *
   * TODO: Replace with real SSE request when backend is ready
   */
  fetchCurrentControlState(plantId: string): Observable<DataRequest<CurrentControlStateDTO>> {
    // Mock implementation - return mock data with loading simulation
    const firstValue = of({
      isLoading: true,
      data: undefined,
    } as DataRequest<CurrentControlStateDTO>);

    const mockData = createMockControlState(plantId);
    const secondValue = of({
      isLoading: false,
      data: mockData,
    } as DataRequest<CurrentControlStateDTO>).pipe(delay(500)); // Simulate network delay

    return concat(firstValue, secondValue).pipe(takeUntil(this._destroy$));

    // Real SSE implementation (commented out until backend is ready):
    // return this.sseApi
    //   .fetch<CurrentControlStateDTO>(
    //     `/power-schedule/current-control-state?plantId=${plantId}`,
    //     (prev, next) => next,
    //   )
    //   .pipe(takeUntil(this._destroy$));
  }
}
