import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TypedChange } from '../../../../constants';
import { ReportService } from '../../report.service';

interface ComponentChanges extends SimpleChanges {
  parentForm: TypedChange<FormGroup>;
  title: TypedChange<string>;
  displayMode: TypedChange<string>;
}

@Component({
  selector: 'app-service-report-header',
  templateUrl: './service-report-header.component.html',
  styleUrls: ['./service-report-header.component.less'],
  standalone: false,
})
export class ServiceReportHeaderComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  @Input() title: string = 'r';
  @Input() displayMode: string = 'r';
  // buttonLst?: ButtonConfig[];
  reportId!: string | null;

  pageHeaderConfig: any;
  //  title = 'titletitletitle';
  // private buttonsState: ButtonsState;

  constructor(public reportService: ReportService) {}

  ngOnInit(): void {
    // this.title = this.reportService.manageTitle();
  }
  ngOnChanges(changes: ComponentChanges): void {
    if (changes) {
      this.title = this.reportService.manageTitle();
      // this.reportService.titleDataChange$.next(changes);
    }
  }
  formIsValid() {
    return this.parentForm && this.parentForm.valid;
  }
}
