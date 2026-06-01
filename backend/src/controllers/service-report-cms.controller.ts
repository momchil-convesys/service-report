import { Request, Response } from 'express';
import { ServiceReportCmsModel, ServiceReportDto } from '../models/service-report-cms.model';
import { ReportTemplateService } from '../services/service-reports/report-template.service';
import { ReportUpsertService } from '../services/service-reports/report-upsert.service';

export class ServiceReportCmsController {
  static list(req: Request, res: Response): void {
    const { plantId, deviceId } = req.params;
    const sort = typeof req.query._sort === 'string' ? req.query._sort : undefined;
    const order = typeof req.query._order === 'string' ? req.query._order : undefined;
    const page = typeof req.query._page === 'string' ? req.query._page : undefined;
    const limit = req.query._limit ? Number(req.query._limit) : undefined;
    const type = typeof req.query.type === 'string' ? req.query.type : undefined;

    const result = deviceId
      ? ReportTemplateService.getReportsByDeviceId(plantId, deviceId, sort, order, page, limit, type)
      : plantId
        ? ReportTemplateService.getReportsByPlantId(plantId, sort, order, page, limit, type)
        : ReportTemplateService.getAll(sort, order, page, limit, type);

    const reports = ServiceReportCmsController.filterReportsForUser(req, result.reports);

    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
    res.setHeader('X-Total-Count', reports.length.toString());
    res.json(reports);
  }

  static template(req: Request, res: Response): void {
    const plantId = typeof req.query.plantId === 'string' ? req.query.plantId : undefined;
    const deviceId = typeof req.query.deviceId === 'string' ? req.query.deviceId : undefined;
    const template = ReportTemplateService.loadReportTemplate(plantId, deviceId);

    if (!template) {
      res.status(404).json({ error: 'Report template not found' });
      return;
    }

    res.json(template);
  }

  static getByQuery(req: Request, res: Response): void {
    const reportId = typeof req.query.reportId === 'string' ? req.query.reportId : '';
    const report = ReportTemplateService.viewReport(reportId);

    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    if (!ServiceReportCmsController.canAccessReport(req, report)) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    res.json(report);
  }

  static create(req: Request, res: Response): void {
    const body = req.body as ServiceReportDto;
    const result = ReportUpsertService.createReport({
      ...body,
      userId: req.user?.id === 'superuser' ? 2 : 1,
      user: req.user
        ? {
            id: req.user.id === 'superuser' ? 2 : 1,
            username: req.user.username,
            firstName: req.user.displayName,
            lastName: '',
            email: req.user.email,
          }
        : body.user,
    });

    if (result.statusCode !== 201) {
      res.sendStatus(result.statusCode);
      return;
    }

    res.status(201).json(result.model);
  }

  static update(req: Request, res: Response): void {
    const body = req.body as ServiceReportDto;
    const existing = body.id ? ReportTemplateService.viewReport(String(body.id)) : undefined;

    if (!existing) {
      res.sendStatus(404);
      return;
    }

    if (!ServiceReportCmsController.canAccessReport(req, existing)) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const result = ReportUpsertService.updateReport(body);

    if (result.statusCode !== 200) {
      res.sendStatus(result.statusCode);
      return;
    }

    res.status(200).end();
  }

  static async preview(req: Request, res: Response): Promise<void> {
    const report = ReportTemplateService.viewReport(req.params.reportId);

    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    if (!ServiceReportCmsController.canAccessReport(req, report)) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const pdf = await ReportTemplateService.getReportPdf(req.params.reportId);

    if (!pdf) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="service-report-${req.params.reportId}.pdf"`);
    res.send(pdf);
  }

  static async download(req: Request, res: Response): Promise<void> {
    const report = ReportTemplateService.viewReport(req.params.reportId);

    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    if (!ServiceReportCmsController.canAccessReport(req, report)) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const pdf = await ReportTemplateService.getReportPdf(req.params.reportId);

    if (!pdf) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    res.json({
      name: `service-report-${req.params.reportId}`,
      content: pdf.toString('base64'),
    });
  }

  static schemas(req: Request, res: Response): void {
    res.json(ReportTemplateService.loadAllSchemas());
  }

  static schemaDownload(req: Request, res: Response): void {
    const svg = ReportTemplateService.getSchemaFile(req.params.schemaId);

    if (!svg) {
      res.status(404).json({ error: 'Schema not found' });
      return;
    }

    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  }

  static schemaDownloadBase64(req: Request, res: Response): void {
    const svg = ReportTemplateService.getSchemaFile(req.params.schemaId);

    if (!svg) {
      res.status(404).json({ error: 'Schema not found' });
      return;
    }

    res.json({
      name: 'schema.svg',
      content: svg.toString('base64'),
    });
  }

  static softDelete(req: Request, res: Response): void {
    const deleted = ServiceReportCmsModel.softDelete(req.params.reportId);

    if (!deleted) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    res.sendStatus(204);
  }

  private static filterReportsForUser(req: Request, reports: { userId?: number }[]): typeof reports {
    if (req.user?.role === 'superuser') {
      return reports;
    }

    return reports.filter((report) => report.userId === ServiceReportCmsController.authUserNumericId(req));
  }

  private static canAccessReport(req: Request, report: ServiceReportDto): boolean {
    return req.user?.role === 'superuser' || report.userId === ServiceReportCmsController.authUserNumericId(req);
  }

  private static authUserNumericId(req: Request): number {
    return req.user?.id === 'superuser' ? 2 : 1;
  }
}
