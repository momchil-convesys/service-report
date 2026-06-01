import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, Subject, takeUntil, tap } from 'rxjs';
// { bess_metadata_mock } from '../../../../mock/bess';
import { DataRequest } from '../../../constants';
import { handleAnyError } from '../../../helpers';
import { BESSApiService } from './api.service';
import { BESSAssetType } from './dto/assets/asset-base.dto';
import { BESSMetadataDTO } from './dto/bess.dto';

@Injectable()
export class BESSDataService {
  private _destroy$ = new Subject<void>();

  private apiService = inject(BESSApiService);

  private _bessMetadataCache$: BehaviorSubject<BESSMetadataDTO | undefined> = new BehaviorSubject<
    BESSMetadataDTO | undefined
  >(undefined);

  get bessMetadataCache(): BESSMetadataDTO | undefined {
    return this._bessMetadataCache$.value;
  }

  get useMockStream(): boolean {
    return this.apiService.useMockStream;
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  getBESSMetadata(bessId: string): Observable<DataRequest<BESSMetadataDTO>> {
    // if (this.useMockStream) {
    //   return of({ isLoading: false, data: bess_metadata_mock }).pipe(
    //     tap((request) => this._bessMetadataCache$.next(request.data)),
    //   );
    // }

    return this.apiService.fetchBESSMetadata(bessId).pipe(
      tap((request) => this._bessMetadataCache$.next(request.data)),
      catchError((error: unknown) =>
        of({ isLoading: false, error: handleAnyError(error, undefined) }),
      ),
      takeUntil(this._destroy$),
    );
  }

  getBESSMetadataFromCache(): BESSMetadataDTO | undefined {
    return this.bessMetadataCache;
  }

  getBESSParameterIdByKey(key: string): string | undefined {
    return this.bessMetadataCache?.parameterDefinitions.find((p) => p.key === key)?.id;
  }

  getBESSParameterKeyById(id: string): string | undefined {
    return this.bessMetadataCache?.parameterDefinitions.find((p) => p.id === id)?.key;
  }

  getBESSAssetIdsByType(assetType: BESSAssetType): string[] {
    return (
      this.bessMetadataCache?.assets
        .filter((asset) => asset.type === assetType)
        .map((asset) => asset.id) ?? []
    );
  }

  getBESSAssetName(assetId: string): string | undefined {
    return this.bessMetadataCache?.assets.find((asset) => asset.id === assetId)?.name;
  }
}
