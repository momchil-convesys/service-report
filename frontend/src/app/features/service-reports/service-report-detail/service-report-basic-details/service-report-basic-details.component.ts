import { Component, OnInit } from '@angular/core';
import { ReportService } from '../../report.service';

@Component({
  selector: 'app-service-report-basic-details',
  templateUrl: './service-report-basic-details.component.html',
  styleUrls: ['./service-report-basic-details.component.less'],
  standalone: false,
})
export class ServiceReportBasicDetailsComponent implements OnInit {
  constructor(public reportService: ReportService) {}

  ngOnInit(): void {}
}
