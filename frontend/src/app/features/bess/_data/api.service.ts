import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
// import { bess_mock } from '../../../../mock/bess';
// import { generateBESSAssetMetricsMock } from '../../../../mock/bess-inverters-data';
import { DataRequest } from '../../../constants';
import { ApiService } from '../../../data/api/_api.service';
import { BESSAssetMetrics_DataPoint_DTO } from './dto/asset-metrics.dto';
import { BESSAssetType } from './dto/assets/asset-base.dto';
import { BESSMetadataDTO } from './dto/bess.dto';

@Injectable()
export class BESSApiService {
  readonly useMockStream = false;

  private baseApi = inject(ApiService);

  get baseUrl(): string {
    return this.baseApi.baseUrl;
  }

  fetchBESSMetadata(bessId: string): Observable<DataRequest<BESSMetadataDTO>> {
    // if (this.useMockStream) {
    //   return of({ isLoading: false, data: bess_mock });
    // }
    return this.baseApi.fetchObject<BESSMetadataDTO, BESSMetadataDTO>(
      `/bess/${bessId}/metadata`,
      undefined,
    );
  }

  /**
   * Fetch metrics for specific assets in a BESS.
   *
   * @param bessId - The ID of the BESS to fetch metrics for.
   * @param verbose - If true, returns parameter keys; if false, returns parameter IDs. Defaults to false.
   * @returns An observable of a data request containing an array of BESS asset metrics data points.
   */
  fetchBESSInvertersMetricsLiveData(
    bessId: string,
    verbose: boolean = false,
  ): Observable<DataRequest<BESSAssetMetrics_DataPoint_DTO[]>> {
    return this.fetchBESSAssetMetricsLiveData(bessId, BESSAssetType.Inverter, verbose);
  }

  fetchBESSAssetMetricsLiveData(
    bessId: string,
    assetType: BESSAssetType,
    verbose: boolean = false,
  ): Observable<DataRequest<BESSAssetMetrics_DataPoint_DTO[]>> {
    // Generate fresh mock data each time (simulates live data updates)
   // const mockData = generateBESSAssetMetricsMock(assetType, verbose);
    return of({ isLoading: false, data: [] });
    // return this.baseApi.fetchObject<BESSAssetMetrics_DataPoint_DTO[], BESSAssetMetrics_DataPoint_DTO[]>(
    //   `/bess/${bessId}/assets/${assetType}/metrics`,
    //   undefined,
    // );
  }
}
