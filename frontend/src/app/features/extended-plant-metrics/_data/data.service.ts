import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, shareReplay, Subject, takeUntil } from 'rxjs';
import { DataRequest } from '../../../constants';
import { Plant } from '../../../data/models';
import { PlantsService } from '../../../data/services/plants.service';
import { handleAnyError } from '../../../helpers';
import { DatetimeRangeModel } from '../../../shared/datetime-range-select/models';
import { adaptCumulativeData, adaptLiveDataData } from './adapter';
import { ExtendedPlantMetricsApiService } from './api.service';
import { LevelOfMeasurement, PlantMetricsMetadata_DTO } from './dto';
import { PlantMetricsCurrentValuesData, PowerMetersCumulativeData } from './models';

@Injectable()
export class ExtendedPlantMetricsDataService {
  private _destroy$ = new Subject<void>();

  private _cachedRequestByPlantId: {
    [plantId: string]: Observable<DataRequest<PlantMetricsMetadata_DTO>>;
  } = {};

  constructor(
    private api: ExtendedPlantMetricsApiService,
    private plantsService: PlantsService,
  ) {}

  ngOnDestroy() {
    this._destroy$.next();
  }

  getPlantMetricsMetadata(plantId: string): Observable<DataRequest<PlantMetricsMetadata_DTO>> {
    const fromCache = this._cachedRequestByPlantId[plantId];
    if (fromCache) {
      return fromCache;
    }

    const request = this.api.fetchMetadata(plantId).pipe(shareReplay(1), takeUntil(this._destroy$));
    this._cachedRequestByPlantId[plantId] = request;
    return request;
  }

  getLiveData(
    plant: Plant,
    levelOfMeasurement: LevelOfMeasurement,
  ): Observable<DataRequest<PlantMetricsCurrentValuesData>> {
    return this.api.fetchLiveData(plant, levelOfMeasurement).pipe(
      map((req) => ({
        ...req,
        data: req.data ? adaptLiveDataData(req.data, plant.timeZone) : undefined,
      })),
      catchError((error: string) =>
        of({ isLoading: false, error: handleAnyError(error, undefined) }),
      ),
      takeUntil(this._destroy$),
    );
  }

  getCumulativeData(
    plant: Plant,
    targetRange: DatetimeRangeModel,
    levelOfMeasurement: LevelOfMeasurement,
    subLevelId: string | null,
  ): Observable<DataRequest<PowerMetersCumulativeData>> {
    return this.api.fetchCumulativeData(plant, targetRange, levelOfMeasurement, subLevelId).pipe(
      map((req) => {
        if (!req.data) {
          return {
            ...req,
            data: undefined,
          };
        }

        const exportFileName = this.plantsService.generateFileNameForExport_New(
          $localize`Reactive Power Compensation`,
          plant.id,
          undefined,
          targetRange,
        );

        return {
          ...req,
          data: adaptCumulativeData(req.data, exportFileName, plant.timeZone),
        };
      }),
      catchError((error: string) =>
        of({ isLoading: false, error: handleAnyError(error, undefined) }),
      ),
      takeUntil(this._destroy$),
    );
  }
}
