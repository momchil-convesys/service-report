import { ServiceReportCmsModel, ServiceReportDto } from '../../models/service-report-cms.model';

export interface CreatedReportViewModel {
  id: number;
  statusReport?: string;
}

export interface ReportUpsertResult<T = undefined> {
  statusCode: number;
  model?: T;
}

export class ReportUpsertService {
  static createReport(report: ServiceReportDto): ReportUpsertResult<CreatedReportViewModel> {
    if (!report.deviceId) {
      return { statusCode: 422 };
    }

    if (!this.isValidStatus(report.statusReport)) {
      return { statusCode: 422 };
    }

    const created = ServiceReportCmsModel.create(report);

    return {
      statusCode: 201,
      model: {
        id: Number(created.id),
        statusReport: created.statusReport,
      },
    };
  }

  static updateReport(report: ServiceReportDto): ReportUpsertResult {
    if (!report.id || !ServiceReportCmsModel.getById(String(report.id))) {
      return { statusCode: 404 };
    }

    if (!this.isValidStatus(report.statusReport)) {
      return { statusCode: 422 };
    }

    ServiceReportCmsModel.update(report);
    return { statusCode: 200 };
  }

  private static isValidStatus(status: unknown): status is 'Done' | 'Draft' {
    return status === 'Done' || status === 'Draft';
  }
}
