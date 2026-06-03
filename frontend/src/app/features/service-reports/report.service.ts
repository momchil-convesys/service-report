import { Injectable } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import Keycloak from 'keycloak-js';
import { PDFSource } from 'ng2-pdf-viewer';
import { Subject, combineLatest, of } from 'rxjs';
import { checkAuthToken } from '../../auth/keycloak-token-update';
import { ReportData } from './_data/models/_service-report-list';
import { ServiceReportsApiService } from './_data/service-reports-api.service';
import { ServiceReportsGlobalService } from './_data/service-reports-global.service';
import {
  ButtonConfig,
  ButtonContext,
} from './service-report-detail/service-report-header/buttonConfig';

// This service manages data related to a specific report

@Injectable()
export class ReportService {
  title = 'Service Report begin';
  editMode: boolean = false;
  displayMode: 'c' | 'r' | 'u' = 'r';
  buttonLst: ButtonConfig[] = [];
  saveSuccess$: Subject<boolean> = new Subject();
  reportId: string | null = null;
  statusReport: string | null = null;
  reportStatusList: string | null = null;
  // configs: any = [];

  reportData: ReportData = {
    genericObj: {},
    materials: [],
    travelling: [],
    works: [],
  };
  reportDataModified!: ReportData;
  // }; // Modified by edit forms
  // titleDataChange$ = new BehaviorSubject<any>({
  //   displayMode: this.displayMode,
  //   reportId: this.reportId,
  // });

  formGroup: FormGroup;
  private _destroy$ = new Subject<void>();
  pdfObject!: PDFSource;

  //  entryFormInitialValue: any;

  //url: string;

  constructor(
    private serviceReportsGlobalService: ServiceReportsGlobalService,
    private keycloak: Keycloak,
    private api: ServiceReportsApiService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
  ) {
    this.formGroup = this.fb.group(
      {
        id: [{ value: '0', disabled: true }],
        plantName: [{ value: '', disabled: true }],
        plantId: [{ value: '0', disabled: false }, { validators: [Validators.required] }],
        installedPowerKw: [{ value: '0', disabled: true }],
        country: [{ value: '', disabled: true }],
        statusReport: [{ value: '', disabled: false }, { validators: [Validators.required] }],
        deviceId: [{ value: '0', disabled: false }, { validators: [Validators.required] }],
        stringBoxNumber: [{ value: '0', disabled: true }],
        complaintNumber: [{ value: '', disabled: false }],
        inverterType: [{ value: '', disabled: true }],
        stringBoxType: [{ value: '', disabled: true }],
        contractNumber: [{ value: '0', disabled: true }],
        inverterSerialNumber: [{ value: '0', disabled: true }],
        deviceSerialNumber: [{ value: '0', disabled: true }],
        warrantyStatus: [{ value: '0', disabled: true }],
        otherEquipment: [{ value: '', disabled: false }],
        stringBoxSerialNumber: [{ value: '0', disabled: true }],
        typeActivity: [
          { value: [], disabled: false },
          { validators: [ReportService.requiredCheckboxGroup()] },
        ],
      },
      { updateOn: 'change' },
    );

    ///
    combineLatest([
      this.activatedRoute.paramMap,
      this.activatedRoute.parent?.paramMap || of(null),
      this.activatedRoute.queryParamMap,
    ]).subscribe(([params, parentParams, queryParams]) => {
        //console.log('params ', params);
        // console.log('queryParams ', queryParams);
        this.statusReport = params.get('statusReport') || parentParams?.get('statusReport');
        // console.log('this.statusReport ', this.statusReport);
        this.reportStatusList = queryParams.get('reportStatusList');
        this.reportId = params.get('reportId') || parentParams?.get('reportId');
        const url = this.router.routerState.snapshot.url;
        if (this.reportId) {
          const pdfUrl = this.api.composeServiceReportsPreviewUrl(this.reportId);
          this.reloadServiceReportPreview(pdfUrl);
          this.editMode = false;
          this.serviceReportsGlobalService.setEditMode(false);
        }

        if (url.indexOf('new') >= 0) {
          this.displayMode = 'c';
          this.editMode = true;
          this.serviceReportsGlobalService.setEditMode(true);
        } else {
          this.displayMode = 'r';
          this.editMode = false;
          this.serviceReportsGlobalService.setEditMode(false);
        }
        this.manageTitle();
        this.initPageHeader();
      });
  }
  ngOnDestroy(): void {
    this._destroy$.next();
  }

  goCreateMode() {
    this.displayMode = 'c';
    this.editMode = true;
    this.serviceReportsGlobalService.setEditMode(true);
  }

  createLike() {
    this.reportId = null;
    //  console.log('this.reportData createLike', this.reportData);
    this.goCreateMode();
  }
  goUpdateMode() {
    // console.log('this.reportId', this.reportId);
    this.displayMode = 'u';
    this.editMode = true;
    this.serviceReportsGlobalService.setEditMode(true);
  }

  downloadReport() {
    this.api
      .downloadReport(`/service-reports/download/${this.reportId}`)
      .subscribe((reportData) => {});
  }

  manageTitle() {
    if (this.reportData && this.statusReport && this.reportId) {
      switch (this.statusReport) {
        case 'Draft':
          if (this.isReadMode()) {
            this.title = $localize`Draft Service Report` + ` (ID: ${this.reportId})`;
          } else {
            this.title = $localize`Edit Draft Report` + ` (ID: ${this.reportId})`;
          }
          break;
        case 'Done':
          if (this.isReadMode()) {
            this.title = $localize`Service Report` + ` (ID: ${this.reportId})`;
          } else {
            this.title = $localize`Edit Service Report` + ` (ID: ${this.reportId})`;
          }
          break;
      }
    } else {
      if (this.displayMode === 'c') {
        this.title = $localize`New Service Report`;
      }
    }
    return this.title;
  }

  onCancel() {
    if (this.router.url.indexOf('new') >= 0) {
      this.editMode = false;
      this.serviceReportsGlobalService.setEditMode(false);
      void this.router.navigate(['../'], {
        relativeTo: this.activatedRoute,
        queryParamsHandling: 'merge',
      });
    } else {
      console.log('this.reportData', this.reportData);

      if (this.editMode === false) {
        this.router.navigate(['../../../'], {
          relativeTo: this.activatedRoute,
          queryParamsHandling: 'merge',
        });
      } else {
        this.reportId = this.reportData['id'];
        this.editMode = false;
        this.serviceReportsGlobalService.setEditMode(false);
        this.displayMode = 'r';
      }
    }
  }

  onSave() {
    this.reportData = { ...this.reportData, ...this.reportDataModified };
    if (this.reportData && this.reportId) {
      this.api.updateReport('/service-reports/update', this.reportData).subscribe(
        (_res) => {
          this.saveSuccess$.next(true);
          this.serviceReportsGlobalService.refreshReportsList();
          const plantId = `/${this.reportData.genericObj['plantId']}`;
          const deviceId = `/${this.reportData.genericObj['deviceId']}`;
          const statusReport = this.reportData.genericObj['statusReport'];
          // let currentUrl = this.router.url;
          // console.log('currentUrl create', currentUrl);
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(
              [
                `/service-reports${plantId}${deviceId}/detail/${this.reportId}/${statusReport}`,
              ],
              {
                queryParams: { reportStatusList: statusReport, pageIndex: 1 },
                queryParamsHandling: 'merge',
              },
            );
          });
          // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          //   this.router.navigate([currentUrl]);
          // });
        },
        (error) => {
          console.log(error);
        },
      );
    } else if (this.reportData && !this.reportId) {
      this.api.createReport('/service-reports/create', this.reportData).subscribe(
        (createReport) => {
          if (createReport.data && createReport.data.id) {
            console.log('createReport create', createReport.data.id);

            this.saveSuccess$.next(true);
            this.serviceReportsGlobalService.refreshReportsList();
            const plantId = `/${this.reportData.genericObj['plantId']}`;
            const deviceId = `/${this.reportData.genericObj['deviceId']}`;
            const statusReport = this.reportData.genericObj['statusReport'];
            console.log('plantId create', plantId);
            console.log('deviceId create', deviceId);
            console.log('this.reportData create', this.reportData);
            console.log('createReport.data.id create', createReport.data.id);
            console.log(
              'url create',
              `/service-reports${plantId}${deviceId}/detail/${createReport.data.id}/${this.reportData.genericObj['statusReport']}`,
            );
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(
                [
                  `/service-reports${plantId}${deviceId}/detail/${createReport.data.id}/${statusReport}`,
                ],
                {
                  queryParams: { reportStatusList: statusReport, pageIndex: 1 },
                  queryParamsHandling: 'merge',
                },
              );
            });
          }
        },
        (error) => {
          console.log(error);
        },
      );
    } else {
      console.log('No DATA for save.');
      //   }
      //  } else {
      //   this.markAllAsDirty(this.formGroup);
    }
  }

  private initPageHeader() {
    this.buttonLst = [
      {
        buttonId: 'downloadReport',
        label: $localize`Download`,
        context: ButtonContext.SUCCESS,
        isDisabled: () => false,
        isVisible: () => this.isReadMode(),
        onClick: () => this.downloadReport(),
      },

      {
        buttonId: 'createLike',
        label: $localize`Duplicate`,
        context: ButtonContext.SUCCESS,
        isDisabled: () => false,
        isVisible: () => this.isReadMode(),
        onClick: () => this.createLike(),
      },
      {
        buttonId: 'edit',
        label: $localize`Edit`,
        context: ButtonContext.SUCCESS,
        isDisabled: () => false,
        isVisible: () => this.isReadMode(),
        onClick: () => this.goUpdateMode(), ////
      },

      {
        buttonId: 'save',
        label: $localize`Save`,
        context: ButtonContext.SUCCESS,
        isDisabled: () => {
          return !(
            this.formGroup.valid ||
            (this.reportData &&
              this.formGroup.get('statusReport')?.value === 'Draft' &&
              this.formGroup.get('deviceId')?.value)
          );
        },
        isVisible: () => !this.isReadMode(),
        onClick: () => this.onSave(),
      },
      {
        buttonId: 'cancel',
        label: $localize`Cancel`,
        context: ButtonContext.DANGER,
        isDisabled: () => false,
        isVisible: () => true,
        onClick: () => this.onCancel(),
      },
    ];
  }

  private isReadMode(): boolean {
    return this.displayMode === 'r';
  }
  private markAllAsDirty(formGroup: FormGroup): void {
    (Object as any).values(formGroup.controls).forEach((control: any) => {
      control.markAsDirty();
      if (control.controls) {
        this.markAllAsDirty(control);
      }
    });
  }

  static requiredCheckboxGroup(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (ReportService.isCheckboxGroupValid(control)) {
        return { valid: false };
      } else {
        return null;
      }
    };
  }

  private static isCheckboxGroupValid(control: AbstractControl) {
    const isFalse = (currentValue: boolean) => currentValue === false;
    return Object.values(control.value)
      .map((el: any) => el['checked'])
      .every(isFalse);
  }

  reloadServiceReportPreview(pdfUrl: string) {
    checkAuthToken(this.keycloak).then((token) => {
      this.pdfObject = {
        url: pdfUrl,
        httpHeaders: { Authorization: `Bearer ${token}` },
      };
    });
  }
}
