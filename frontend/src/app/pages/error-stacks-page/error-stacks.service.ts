import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataRequest, PredefinedTimeRange } from '../../constants';
import { PlantsService } from '../../data/services/plants.service';
import { ErrorStack } from './_data/error-stack.model';

@Injectable()
export class ErrorStacksService {
  deviceSide: string | undefined; // 'master' | 'slave' | undefined;

  pageSize = 10;
  pageIndex = 1;
  totalCount = 0;

  errorStacksRequest$!: Observable<DataRequest<ErrorStack[]>>;
  errorStacks$!: Observable<ErrorStack[]>;
  hasContent$!: Observable<boolean>;

  hasSlave = false;

  showCurrentFaultsOnly = true;

  timeRange: Date[] | PredefinedTimeRange | null = null;

  deviceId: string | undefined;

  timeZone: string | undefined;

  set plantId(value: string | undefined) {
    this.timeZone = this.plantsService.getCachedPlantById(value || '')?.timeZone;
  }

  constructor(private plantsService: PlantsService) {}
}
