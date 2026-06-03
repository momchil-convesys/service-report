import {
  InverterSchemaDto,
  ServiceReportDto,
  ServiceReportListItem,
} from '../../models/service-report-cms.model';
import { ServiceReportCmsModel } from '../../models/service-report-cms.model';
import { ServiceReportPdfExporterService } from './service-report-pdf-exporter.service';
import { ServiceReportPostgresStore } from './service-report-postgres.store';

export interface FilteredReportsSummaryListModel {
  reports: ServiceReportListItem[];
  allReportsCount: number;
}

type SortKey = 'id' | 'startDate' | 'endDate' | '';
type SortOrder = 'asc' | 'desc' | '';

export class ReportTemplateService {
  static getAll(
    sort?: string,
    order?: string,
    page?: string,
    limit?: number,
    type?: string,
  ): Promise<FilteredReportsSummaryListModel> {
    return this.getReportSummaries(undefined, undefined, sort, order, page, limit, type);
  }

  static getReportsByPlantId(
    plantId: string,
    sort?: string,
    order?: string,
    page?: string,
    limit?: number,
    type?: string,
  ): Promise<FilteredReportsSummaryListModel> {
    return this.getReportSummaries(plantId, undefined, sort, order, page, limit, type);
  }

  static getReportsByDeviceId(
    plantId: string | undefined,
    deviceId: string,
    sort?: string,
    order?: string,
    page?: string,
    limit?: number,
    type?: string,
  ): Promise<FilteredReportsSummaryListModel> {
    return this.getReportSummaries(plantId, deviceId, sort, order, page, limit, type);
  }

  static async viewReport(reportId: string): Promise<ServiceReportDto | undefined> {
    return ServiceReportPostgresStore.getById(reportId);
  }

  static async getReportPdf(reportId: string): Promise<Buffer | undefined> {
    const report = await this.viewReport(reportId);
    return report ? ServiceReportPdfExporterService.exportReport(report) : undefined;
  }

  static async getSchemaFile(schemaId: string): Promise<Buffer | undefined> {
    const schemas = await ServiceReportPostgresStore.getSchemas();
    const schema = schemas.find((item) => String(item.id) === String(schemaId));
    const svg = schema ? await ServiceReportPostgresStore.getSchemaSvg(schemaId) : undefined;
    return svg ? Buffer.from(svg, 'utf8') : undefined;
  }

  static loadAllSchemas(): Promise<InverterSchemaDto[]> {
    return ServiceReportPostgresStore.getSchemas();
  }

  static loadReportTemplate(plantId?: string, deviceId?: string): ServiceReportDto | undefined {
    if (!plantId && !deviceId) {
      return undefined;
    }

    return ServiceReportCmsModel.createTemplate(plantId || 'mock-plant-1', deviceId);
  }

  private static async getReportSummaries(
    plantId?: string,
    deviceId?: string,
    sort?: string,
    order?: string,
    page?: string,
    limit?: number,
    type?: string,
  ): Promise<FilteredReportsSummaryListModel> {
    const reportType = this.parseReportType(type);
    const allReports = await ServiceReportPostgresStore.findReports(plantId, deviceId, reportType);
    const sortedReports = this.sortReports(allReports, this.parseSortType(sort), this.parseSortOrder(order));
    const reports = this.getReportsForPage(sortedReports, page, limit);

    return {
      reports,
      allReportsCount: allReports.length,
    };
  }

  private static sortReports(
    reports: ServiceReportListItem[],
    sort: SortKey,
    order: SortOrder,
  ): ServiceReportListItem[] {
    const direction = order === 'asc' ? 1 : -1;
    const copy = [...reports];

    switch (sort) {
      case 'id':
        return copy.sort((a, b) => (a.id - b.id) * direction);
      case 'startDate':
        return copy.sort((a, b) => (Date.parse(a.startDate) - Date.parse(b.startDate)) * direction);
      case 'endDate':
        return copy.sort((a, b) => (Date.parse(a.endDate) - Date.parse(b.endDate)) * direction);
      default:
        return copy;
    }
  }

  private static getReportsForPage(
    reports: ServiceReportListItem[],
    page?: string,
    limit?: number,
  ): ServiceReportListItem[] {
    if (!page || !limit) {
      return reports;
    }

    const pageNumber = Number(page);
    if (!Number.isFinite(pageNumber) || pageNumber < 1) {
      return reports;
    }

    const offset = (pageNumber - 1) * limit;
    return reports.slice(offset, offset + limit);
  }

  private static parseReportType(value?: string): 'Done' | 'Draft' | undefined {
    return value?.toLowerCase() === 'draft' ? 'Draft' : 'Done';
  }

  private static parseSortType(value?: string): SortKey {
    const normalized = value?.toLowerCase();
    if (normalized === 'id') {
      return 'id';
    }
    if (normalized === 'startdate') {
      return 'startDate';
    }
    if (normalized === 'enddate') {
      return 'endDate';
    }
    return '';
  }

  private static parseSortOrder(value?: string): SortOrder {
    const normalized = value?.toLowerCase();
    if (normalized === 'asc') {
      return 'asc';
    }
    if (normalized === 'desc') {
      return 'desc';
    }
    return '';
  }
}
