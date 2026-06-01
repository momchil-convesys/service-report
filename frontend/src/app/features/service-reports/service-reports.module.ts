import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { DevicesTreeModule } from '../../shared/devices-tree/devices-tree.module';
import { DatetimePickerComponent } from './common/datetime-picker/datetime-picker.component';
import { ListDetailsLayoutComponent } from './common/list-details-layout/list-details-layout.component';
//import { MaterialsPickerComponent } from './materials/materials-picker/materials-picker.component';
//import { MaterialsSchemaViewComponent } from './materials/materials-picker/schema-view/materials-schema-view.component';
//import { MaterialsService } from './materials/materials.service';
//import { MaterialItemFormComponent } from './materials/selected-materials-list/material-item-form/material-item-form.component';
//import { SelectedMaterialsListComponent } from './materials/selected-materials-list/selected-materials-list.component';
//import { MaterialItemFormComponent } from './materials/selected-materials-list/material-item-form/material-item-form.component';
//import { SelectedMaterialsListComponent } from './materials/selected-materials-list/selected-materials-list.component';

import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { permissionGuard } from '../../auth/auth.guard';
import { AccessControlPermission } from '../../constants';
import { SidebarToggleButtonComponent } from '../../pages/sidebar/sidebar-toggle-button/sidebar-toggle-button.component';
import { ServiceReportsApiService } from './_data/service-reports-api.service';
import { ServiceReportsGlobalService } from './_data/service-reports-global.service';
import { MaterialsPickerComponent_Duplicate } from './materials/materials-picker/materials-picker.component';
import { MaterialItemFormComponent } from './materials/selected-materials-list/material-item-form/material-item-form.component';
import { SelectedMaterialsListComponent } from './materials/selected-materials-list/selected-materials-list.component';
import { ServiceReportBasicDetailsComponent } from './service-report-detail/service-report-basic-details/service-report-basic-details.component';
import { ServiceReportDetailComponent } from './service-report-detail/service-report-detail.component';
import { ServiceReportEditComponent } from './service-report-detail/service-report-edit/service-report-edit.component';
import { ServiceReportGenericComponent } from './service-report-detail/service-report-edit/service-report-generic/service-report-generic.component';
import { MaterialsEntryFormFieldsComponent } from './service-report-detail/service-report-edit/service-report-materials/entry-form/materials-entry-form-fields.component';
import { MaterialsEntryFormComponent } from './service-report-detail/service-report-edit/service-report-materials/entry-form/materials-entry-form.component';
import { MaterialsEntryViewComponent } from './service-report-detail/service-report-edit/service-report-materials/entry-view/materials-entry-view.component';
import { MaterialsService } from './service-report-detail/service-report-edit/service-report-materials/materials.service';
import { MaterialsPickerComponent } from './service-report-detail/service-report-edit/service-report-materials/picker-page/materials-picker.component';
import { MaterialsSchemaSelectComponent } from './service-report-detail/service-report-edit/service-report-materials/schema-select/materials-schema-select.component';
import { MaterialsSchemaViewComponent } from './service-report-detail/service-report-edit/service-report-materials/schema-view/materials-schema-view.component';
import { ServiceReportMaterialsComponent } from './service-report-detail/service-report-edit/service-report-materials/service-report-materials.component';
import { TravellingEntryFormComponent } from './service-report-detail/service-report-edit/service-report-travelling/entry-form/travelling-entry-form.component';
import { TravellingEntryViewComponent } from './service-report-detail/service-report-edit/service-report-travelling/entry-view/travelling-entry-view.component';
import { ServiceReportTravellingComponent } from './service-report-detail/service-report-edit/service-report-travelling/service-report-travelling.component';
import { WorkEntryFormComponent } from './service-report-detail/service-report-edit/service-report-work/entry-form/work-entry-form.component';
import { WorkEntryViewComponent } from './service-report-detail/service-report-edit/service-report-work/entry-view/work-entry-view.component';
import { ServiceReportWorkComponent } from './service-report-detail/service-report-edit/service-report-work/service-report-work.component';
import { ServiceReportFormComponent } from './service-report-detail/service-report-form/service-report-form.component';
import { ServiceReportHeaderComponent } from './service-report-detail/service-report-header/service-report-header.component';
import { ServiceReportListComponent } from './service-report-list/service-report-list.component';
import { ServiceReportsComponent } from './service-reports.component';
const routes: Routes = [
  {
    path: '',
    component: ServiceReportsComponent,

    canActivate: [permissionGuard],
    canActivateChild: [permissionGuard],
    data: {
      /**
       * TODO: Implement fine grained permissions (view / edit)
       */
      permissions: [
        AccessControlPermission.ServiceReports_View,
        AccessControlPermission.ServiceReports_Manage,
      ],
    },

    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'mock-plant-1',
      },
      {
        path: ':plantId',
        component: ServiceReportListComponent,
        children: [
          {
            path: 'detail/:reportId/:statusReport',
            component: ServiceReportDetailComponent,
          },
          {
            path: 'new',
            component: ServiceReportDetailComponent,
          },
        ],
      },
      {
        path: ':plantId/:deviceId',
        component: ServiceReportListComponent,
        children: [
          {
            // path: 'detail/:reportId',
            path: 'detail/:reportId/:statusReport',
            loadChildren: () =>
              import('./service-report-detail/service-report-detail.module').then(
                (m) => m.ServiceReportDetailModule,
              ),
          },
          {
            path: 'new',
            // component: ServiceReportDetailComponent,
            loadChildren: () =>
              import('./service-report-detail/service-report-detail.module').then(
                (m) => m.ServiceReportDetailModule,
              ),
          },
        ],
      },
    ],
  },
];

@NgModule({
  declarations: [
    ServiceReportsComponent,
    ServiceReportDetailComponent,
    ServiceReportEditComponent,
    ServiceReportFormComponent,
    MaterialsSchemaViewComponent,
    MaterialsPickerComponent,
    SelectedMaterialsListComponent,
    MaterialItemFormComponent,
    ListDetailsLayoutComponent,
    ServiceReportTravellingComponent,
    TravellingEntryViewComponent,
    TravellingEntryFormComponent,
    ServiceReportMaterialsComponent,
    MaterialsEntryViewComponent,
    MaterialsSchemaSelectComponent,
    MaterialsEntryFormFieldsComponent,
    DatetimePickerComponent,
    MaterialsEntryFormComponent,
    WorkEntryFormComponent,
    WorkEntryViewComponent,
    ServiceReportWorkComponent,
    ServiceReportGenericComponent,
    ServiceReportBasicDetailsComponent,
    ServiceReportHeaderComponent,
    MaterialsPickerComponent_Duplicate,
  ],
  imports: [
    NzModalModule,
    NzDrawerModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    DevicesTreeModule,
    NzSpaceModule,
    NzSpinModule,
    NzResultModule,
    NzButtonModule,
    NzInputModule,
    NzSelectModule,
    NzFormModule,
    NzAutocompleteModule,
    PdfViewerModule,
    NzDividerModule,
    NzIconModule,
    NzPaginationModule,
    NzRadioModule,
    FormsModule,
    NzAlertModule,
    NzTabsModule,
    NzInputNumberModule,
    NzDatePickerModule,
    NzCheckboxModule,
    SidebarToggleButtonComponent,
  ],

  providers: [MaterialsService, ServiceReportsApiService, ServiceReportsGlobalService],
})
export class ServiceReportsModule {}
