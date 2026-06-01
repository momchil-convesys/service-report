import { Injectable, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { debounceTime, map, takeUntil } from 'rxjs/operators';

//import { BESS_MOMENTARY_DATA_MOCK } from '../../../../mock/bess-live-momentary-data';
import { SSE_DataRequest } from '../../../constants';
import { ServerSentEventsService } from '../../../data/api';
import { BESSDataService } from './data.service';
import {
  BESSLiveMomentaryDataMessageDTO,
  BESSLiveMomentaryDataRequestDTO,
} from './dto/live-momentary-data.dto';

@Injectable({
  providedIn: 'root',
})
export class BESSMomentaryDataService implements OnDestroy {
  private readonly sse = inject(ServerSentEventsService);
  private readonly dataService = inject(BESSDataService);

  // which BESS this service currently streams for (one per page/view)
  private bessId: string | null = null;

  // all registered watches per component
  private componentWatches = new Map<string, BESSLiveMomentaryDataRequestDTO['watches'][number]>();

  private currentRequest: BESSLiveMomentaryDataRequestDTO | null = null;

  // trigger to recompute + restart SSE
  private restart$ = new Subject<void>();

  // used to stop current SSE stream when service is destroyed
  private destroy$ = new Subject<void>();

  private currentSSESub?: Subscription;

  // last received message from SSE
  private liveMessageSubject = new BehaviorSubject<BESSLiveMomentaryDataMessageDTO | null>(null);
  /** Public stream for components to subscribe to */
  readonly liveMessage$ = this.liveMessageSubject.asObservable();

  constructor() {
    // debounce multiple register/unregister calls happening in a short time
    this.restart$
      .pipe(debounceTime(20), takeUntil(this.destroy$))
      .subscribe(() => this.rebuildSubscription());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopSSE();
  }

  /**
   * Set the currently active BESS.
   * Call this once when the page/route is initialized or when bessId changes.
   */
  setBESS(bessId: string): void {
    if (this.bessId === bessId) return;
    this.bessId = bessId;
    this.restart$.next();
  }

  /**
   * Register or update a watch for a given component.
   * `componentId` should be unique per component instance (e.g. component class name or a GUID).
   */
  registerWatch(
    componentId: string,
    watch: BESSLiveMomentaryDataRequestDTO['watches'][number],
  ): void {
    /* TODO: temporary for debugging purposes.
     * Will be removed in the future.
     */
    watch.logicalParameterKeys = watch.logicalParameterIds.map(
      (id) => this.dataService.getBESSParameterKeyById(id) ?? '',
    );
    this.componentWatches.set(componentId, watch);
    this.restart$.next();
  }

  /**
   * Unregister a previously registered watch when component is destroyed.
   */
  unregisterWatch(componentId: string): void {
    this.componentWatches.delete(componentId);
    this.restart$.next();
  }

  // ---------------------------------------------------------------------------
  // INTERNAL: merge watches + restart SSE only when necessary
  // ---------------------------------------------------------------------------

  private rebuildSubscription(): void {
    // No BESS or no watches: stop SSE
    if (!this.bessId || this.componentWatches.size === 0) {
      this.stopSSE();
      this.currentRequest = null;
      return;
    }

    const merged: BESSLiveMomentaryDataRequestDTO = {
      watches: [...this.componentWatches.values()],
      // verbose can be set if needed, default is false/undefined
      // verbose: false,
    };

    // Compare new merged request with previous
    const changed = JSON.stringify(merged) !== JSON.stringify(this.currentRequest);

    if (!changed) {
      return; // nothing new to ask from backend
    }

    this.currentRequest = merged;
    this.startSSE(merged);
  }

  private startSSE(request: BESSLiveMomentaryDataRequestDTO): void {
    if (!this.bessId) return;

    // cancel previous SSE if any
    this.stopSSE();

    // if (this.dataService.useMockStream) {
    //   this.currentSSESub = this.createMockStream(request)
    //     .pipe(takeUntil(this.destroy$))
    //     .subscribe({
    //       next: (message) => {
    //         this.liveMessageSubject.next(message ?? null);

    //         console.log('HERE: BESS mock SSE message', message);
    //       },
    //       error: (err) => {
    //         console.error('BESS mock SSE error', err);
    //       },
    //     });
    //   return;
    // }

    const url = `/bess/${this.bessId}/live-momentary-data`;

    this.currentSSESub = this.sse
      .fetch<BESSLiveMomentaryDataMessageDTO>(url, (_, next) => next, {
        method: 'POST',
        body: request,
      })
      .pipe(
        takeUntil(this.destroy$),
        map((wrapper: SSE_DataRequest<BESSLiveMomentaryDataMessageDTO>) => wrapper.data),
      )
      .subscribe({
        next: (message) => {
          this.liveMessageSubject.next(message ?? null);
        },
        error: (err) => {
          console.error('BESS SSE error', err);
        },
        complete: () => {
          console.log('HERE: BESS SSE completed');
        },
      });
  }

  private stopSSE(): void {
    this.currentSSESub?.unsubscribe();
    this.currentSSESub = undefined;
  }

  // private createMockStream(
  //   request: BESSLiveMomentaryDataRequestDTO,
  // ): Observable<BESSLiveMomentaryDataMessageDTO> {
  //   return interval(10000).pipe(
  //     startWith(0),
  //     map(
  //       () => BESS_MOMENTARY_DATA_MOCK,
  //       // generateBESSMomentaryDataMock({
  //       //   bessId: this.bessId ?? 'BESS-MOCK',
  //       //   request,
  //       // }),
  //     ),
  //   );
  // }
}
