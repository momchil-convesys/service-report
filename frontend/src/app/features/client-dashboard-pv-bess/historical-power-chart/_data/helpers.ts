import { combineLatest, map, Observable, startWith } from "rxjs";
import { DataRequest } from "../../../../constants";

export function getErrorsStream(
  req1$: Observable<DataRequest<any>>,
  req2$: Observable<DataRequest<any>>,
): Observable<Error | undefined> {
  return combineLatest([
    req1$.pipe(startWith({ error: undefined }), map((req) => req.error)),
    req2$.pipe(startWith({ error: undefined }), map((req) => req.error)),
  ]).pipe(map(([plantRequestError, chartDataRequestError]) => plantRequestError || chartDataRequestError));
}

export function getLoadingStream(
  req1$: Observable<DataRequest<any>>,
  req2$: Observable<DataRequest<any>>,
): Observable<boolean> {
  return combineLatest([
    req1$.pipe(startWith({ isLoading: false }), map((req) => req.isLoading)),
    req2$.pipe(startWith({ isLoading: false }), map((req) => req.isLoading)),
  ]).pipe(map(([plantRequestLoading, chartDataRequestLoading]) => plantRequestLoading || chartDataRequestLoading));
}