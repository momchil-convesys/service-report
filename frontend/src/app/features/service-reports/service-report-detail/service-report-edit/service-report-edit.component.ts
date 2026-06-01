import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

//import { GenericEntryFormValue } from 'src/app/features/service-reports/service-report-detail/service-report-edit/service-report-generic/models';
import { ReportService } from '../../report.service';

import { ActivatedRoute, ParamMap } from '@angular/router';
import { ReportData } from '../../_data/models/_service-report-list';
import { MaterialEntry } from './service-report-materials/models';
import { TravellingEntry } from './service-report-travelling/models';
import { WorkEntry } from './service-report-work/models';
//

// import { MaterialEntry } from '../service-report-materials/models';
// import { TravellingEntry } from '../service-report-travelling/models';
// import { WorkEntry } from '../service-report-work/models';

@Component({
  selector: 'app-service-report-edit',
  templateUrl: './service-report-edit.component.html',
  styleUrls: ['./service-report-edit.component.less'],
  standalone: false,
})
export class ServiceReportEditComponent implements OnInit, OnDestroy, OnChanges {
  titleGeneric = $localize`Generic`;
  titleTravel = $localize`Travel`;
  titleWork = $localize`Work`;
  titleMaterials = $localize`Materials`;
  // @Input() selectedReport: ReportData | undefined;
  @Input() reportData!: ReportData;
  // @Output() create = new EventEmitter<ReportData>();
  // @Output() update = new EventEmitter<ReportData>();
  // @Output() cancel = new EventEmitter<void>();

  private destroyed$ = new Subject<void>();

  // selectedReportDataRequest$: Observable<DataRequest<ReportData> | null>;
  // updatedReportDataRequest$ = new Subject<DataRequest<ReportData>>();
  // plants$: Observable<DataRequest<Plant[]>>;
  // keep track of tab data changes
  genericDataDirty = false;
  travellingDataDirty = false;
  materialsDataDirty = false;
  worksDataDirty = false;
  reportStatusList = 'Done';
  reportDataCopy!: ReportData;

  saveSuccess$: Subject<boolean> = new Subject();

  constructor(
    public reportService: ReportService,
    private activatedRoute: ActivatedRoute,
  ) {
    this.activatedRoute.queryParamMap.subscribe((queryParams: ParamMap) => {
      this.reportStatusList = queryParams.get('reportStatusList') || 'Done';
      // console.log('this.reportStatusList', this.reportStatusList);
    });
  }

  ngOnInit() {
    this.saveSuccess$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.reportService.formGroup.markAsPristine();
      this.travellingDataDirty = false;
      this.materialsDataDirty = false;
      this.worksDataDirty = false;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.reportData) {
      if (this.reportService.displayMode === 'c') {
        this.reportData.genericObj = {
          ...this.reportData.genericObj,
          ...{ statusReport: this.reportStatusList },
        };
      }
      console.log('this.reportData', this.reportData);
      this.reportService.reportData = this.reportData;
      this.reportDataCopy = {
        genericObj: this.reportData.genericObj,
        travelling: [...this.reportData.travelling],
        works: [...this.reportData.works],
        materials: [...this.reportData.materials],
      };
    }
  }

  ngOnDestroy() {
    this.destroyed$.next();
  }

  onGenericDataUpdated(entries: ReportData) {
    this.genericDataDirty = true;
    this.reportDataCopy.genericObj = entries;

    this.reportService.reportDataModified = this.reportDataCopy;
  }

  onTravellingDataUpdated(entries: TravellingEntry[]) {
    this.travellingDataDirty = true;
    this.reportDataCopy.travelling = entries;
    this.reportService.reportDataModified = this.reportDataCopy;
  }

  onWorksDataUpdated(entries: WorkEntry[]) {
    this.worksDataDirty = true;
    this.reportDataCopy.works = entries;
    this.reportService.reportDataModified = this.reportDataCopy;
  }

  onMaterialsDataUpdated(entries: MaterialEntry[]) {
    this.materialsDataDirty = true;
    this.reportDataCopy.materials = entries;
    this.reportService.reportDataModified = this.reportDataCopy;
  }
}
