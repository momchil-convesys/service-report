import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { PDFSource } from 'ng2-pdf-viewer';
import { GlobalWorkerOptions } from 'pdfjs-dist';

GlobalWorkerOptions.workerSrc = 'assets/pdfjs/pdf.worker.min.mjs';

@Component({
  selector: 'app-service-report-form',
  templateUrl: './service-report-form.component.html',
  styleUrls: ['./service-report-form.component.less'],
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class ServiceReportFormComponent implements OnChanges {
  @Input() reportId: string = '';
  @Input() pdfObject!: PDFSource;
  isLoading: boolean = false;

  constructor() {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pdfObject']) {
      this.isLoading = true;
      //   console.log('this.pdfUrl', this.pdfUrl);
    }
  }

  afterLoadComplete(event: any) {
    console.log('event afterLoadComplete', event);
    this.isLoading = false;
  }

  onError(event: any) {
    console.log('event onError', event);
    this.isLoading = false;
  }
}
