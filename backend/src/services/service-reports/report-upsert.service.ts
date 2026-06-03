import { ServiceReportDto } from '../../models/service-report-cms.model';
import { ServiceReportPostgresStore } from './service-report-postgres.store';

export interface CreatedReportViewModel {
  id: number;
  statusReport?: string;
}

export interface ReportUpsertResult<T = undefined> {
  statusCode: number;
  model?: T;
}

export class ReportUpsertService {
  static async createReport(report: ServiceReportDto): Promise<ReportUpsertResult<CreatedReportViewModel>> {
    if (!report.deviceId) {
      return { statusCode: 422 };
    }

    if (!this.isValidStatus(report.statusReport)) {
      return { statusCode: 422 };
    }

    const created = await ServiceReportPostgresStore.create(report);

    return {
      statusCode: 201,
      model: {
        id: Number(created.id),
        statusReport: created.statusReport,
      },
    };
  }

  static async updateReport(report: ServiceReportDto): Promise<ReportUpsertResult> {
    if (!report.id || !(await ServiceReportPostgresStore.getById(String(report.id)))) {
      return { statusCode: 404 };
    }

    if (!this.isValidStatus(report.statusReport)) {
      return { statusCode: 422 };
    }

    await ServiceReportPostgresStore.update(report);
    return { statusCode: 200 };
  }

  private static isValidStatus(status: unknown): status is 'Done' | 'Draft' {
    return status === 'Done' || status === 'Draft';
  }
}
