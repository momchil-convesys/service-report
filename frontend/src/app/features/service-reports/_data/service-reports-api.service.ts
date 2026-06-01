import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { saveAs } from 'file-saver';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiService } from 'src/app/data/api';
import { DataRequest } from '../../../constants';
import { ServiceReportAdapter } from './adapters/_service-report-adapter';
import { ServiceReportListAdapter } from './adapters/_service-report-list-adapter';
import { ReportData, ServiceRreportListData } from './models/_service-report-list';

@Injectable()
export class ServiceReportsApiService {
  constructor(public http: HttpClient) {}
  private baseApi = inject(ApiService);

  get baseUrl(): string {
    return this.baseApi.baseUrl;
  }

  //===============================================================================================

  fetchServiceReportsList(
    plantId: string,
    deviceId: string,
    params: string,
  ): Observable<DataRequest<ServiceRreportListData[]>> {
    if (plantId && deviceId) {
      //  console.log('request=', `/service-reports/list/${plantId}/${deviceId}${params}`);
      return this.baseApi.fetchList(
        `/service-reports/list/${plantId}/${deviceId}${params}`,
        ServiceReportListAdapter,
      );
    } else if (plantId) {
      // console.log('request=', `/service-reports/list/${plantId}${params}`);
      return this.baseApi.fetchList(
        `/service-reports/list/${plantId}${params}`,
        ServiceReportListAdapter,
      );
    } else {
      // console.log('request=', `/service-reports/list/${params}`);
      return this.baseApi.fetchList(`/service-reports/list/${params}`, ServiceReportListAdapter);
    }
  }
  // get selected template on plant/device for service report
  fetchServiceReportTemplate(
    plantId: string,
    deviceId: string | null,
  ): Observable<DataRequest<ReportData>> {
    //http://localhost:5555/service-reports/template?plantId=1&deviceId=dbe8eb1beaccd6
    let params: string;
    if (plantId && deviceId) {
      params = `?plantId=${plantId}&deviceId=${deviceId}`;
    } else {
      params = `?plantId=${plantId}`;
    }

    // console.log('request=', `/service-reports/template${params}`);
    return this.baseApi.fetchObject(`/service-reports/template${params}`, ServiceReportAdapter); //todo template
  }
  // http://localhost:5555/service-reports?reportId=757
  fetchServiceReport(reportId: string): Observable<DataRequest<ReportData>> {
    console.log('request=', `/service-reports?reportId=${reportId}`);
    return this.baseApi.fetchObject(`/service-reports?reportId=${reportId}`, ServiceReportAdapter);
  }

  downloadReport(requestUrl: string) {
    //const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    //const options = { headers, params };
    // console.log('url', `${baseUrl}${requestUrl}`);
    return this.http.get(`${this.baseUrl}${requestUrl}`, { observe: 'response' }).pipe(
      map((res) => {
        const objectDataKey = 'content';
        const objectNameKey = 'name';
        const data: any = res.body || {};
        // console.log('res', res.body && data.content);
        if (data.content) {
          const byteArray = new Uint8Array(
            atob(data.content)
              .split('')
              .map((char) => char.charCodeAt(0)),
          );
          const myBlob: Blob = new Blob([byteArray], { type: 'application/pdf' });
          saveAs(myBlob, `${data.name}.pdf`);
        }
      }),
      catchError((error: unknown) => of({ error: this.baseApi.handleError(error) })),
    );
  }

  composeServiceReportsPreviewUrl(reportId: string): string {
    return `${this.baseUrl}/service-reports/preview/${reportId}`;
  }

  updateReport(requestUrl: string, reportData: ReportData): Observable<DataRequest<any>> {
    return this.baseApi.updateItem1(requestUrl, ServiceReportAdapter, reportData);
  }

  createReport(requestUrl: string, reportData: ReportData): Observable<DataRequest<any>> {
    return this.baseApi.createItem(requestUrl, ServiceReportAdapter, reportData);
  }
}
