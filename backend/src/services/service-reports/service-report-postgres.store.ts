import { query } from '../../config/database';
import { initializeServiceReportDatabase } from '../../database/service-report.schema';
import {
  InverterSchemaDto,
  ServiceReportCmsModel,
  ServiceReportDto,
  ServiceReportListItem,
} from '../../models/service-report-cms.model';

let initialized = false;
let available = false;

function firstTimestamp(report: ServiceReportDto, kind: 'start' | 'end'): string | null {
  const travels = Array.isArray(report.travelling) ? report.travelling : [];
  const works = Array.isArray(report.works) ? report.works : [];
  const firstTravel = travels[0] as Record<string, any> | undefined;
  const firstWork = works[0] as Record<string, any> | undefined;

  if (kind === 'start') {
    return firstWork?.timeWorkStart?.timestamp || firstWork?.startDateTime || firstTravel?.origin?.timestamp || null;
  }

  return firstWork?.timeWorkEnd?.timestamp || firstWork?.endDateTime || firstTravel?.destination?.timestamp || null;
}

function toListItem(report: ServiceReportDto): ServiceReportListItem {
  return {
    id: Number(report.id),
    plantId: report.plantId,
    plantName: report.plant?.name || String(report.plantName || report.plantId),
    deviceId: report.deviceId,
    deviceName: report.device?.name || String(report.deviceName || report.deviceId),
    deviceSerial: report.device?.serialNumber || String(report.deviceSerial || ''),
    startDate: firstTimestamp(report, 'start') || String(report.startDate || ''),
    endDate: firstTimestamp(report, 'end') || String(report.endDate || ''),
    serviceEngineer: report.user ? `${report.user.firstName} ${report.user.lastName}` : 'Local Dev User',
    statusRepair: String(report.statusRepair || 'Finished'),
    statusReport: report.statusReport,
  };
}

export class ServiceReportPostgresStore {
  static async initialize(): Promise<boolean> {
    if (initialized) {
      return available;
    }

    initialized = true;

    try {
      await initializeServiceReportDatabase();
      await this.seedIfEmpty();
      available = true;
    } catch (error) {
      available = false;
      console.warn('PostgreSQL unavailable, using in-memory service-report data.', error);
    }

    return available;
  }

  static isAvailable(): boolean {
    return available;
  }

  static async findReports(plantId?: string, deviceId?: string, statusReport?: string): Promise<ServiceReportListItem[]> {
    if (!(await this.initialize())) {
      return ServiceReportCmsModel.findReports(plantId, deviceId, statusReport);
    }

    const where: string[] = [];
    const params: unknown[] = [];
    if (plantId) {
      params.push(plantId);
      where.push(`plant_id = $${params.length}`);
    }
    if (deviceId) {
      params.push(deviceId);
      where.push(`device_id = $${params.length}`);
    }
    if (statusReport) {
      params.push(statusReport);
      where.push(`status_report = $${params.length}`);
    }

    const result = await query(
      `SELECT payload FROM cms_service_reports ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY id DESC`,
      params,
    );

    return result.rows.map((row) => toListItem(row.payload as ServiceReportDto));
  }

  static async getById(reportId: string): Promise<ServiceReportDto | undefined> {
    if (!(await this.initialize())) {
      return ServiceReportCmsModel.getById(reportId);
    }

    const result = await query('SELECT payload FROM cms_service_reports WHERE id = $1', [Number(reportId)]);
    return result.rows[0]?.payload as ServiceReportDto | undefined;
  }

  static async create(report: ServiceReportDto): Promise<ServiceReportDto> {
    if (!(await this.initialize())) {
      return ServiceReportCmsModel.create(report);
    }

    await this.upsertRelatedData(report);
    const payload = { ...report, id: undefined };
    const result = await query(
      `INSERT INTO cms_service_reports
        (plant_id, device_id, user_id, client_id, status_report, complaint_number, start_date, end_date, payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
       RETURNING id`,
      [
        report.plantId,
        report.deviceId,
        report.userId || report.user?.id || null,
        report.selectedRelatedClientId || report.userClient?.id || null,
        report.statusReport,
        report.complaintNumber || null,
        firstTimestamp(report, 'start'),
        firstTimestamp(report, 'end'),
        JSON.stringify(payload),
      ],
    );

    const created = { ...report, id: Number(result.rows[0].id) };
    await query('UPDATE cms_service_reports SET payload = $2::jsonb WHERE id = $1', [created.id, JSON.stringify(created)]);
    return created;
  }

  static async update(report: ServiceReportDto): Promise<ServiceReportDto | undefined> {
    if (!(await this.initialize())) {
      return ServiceReportCmsModel.update(report);
    }

    if (!report.id) {
      return undefined;
    }

    await this.upsertRelatedData(report);
    const result = await query(
      `UPDATE cms_service_reports
       SET plant_id = $2,
           device_id = $3,
           user_id = $4,
           client_id = $5,
           status_report = $6,
           complaint_number = $7,
           start_date = $8,
           end_date = $9,
           payload = $10::jsonb,
           updated_at = now()
       WHERE id = $1
       RETURNING payload`,
      [
        report.id,
        report.plantId,
        report.deviceId,
        report.userId || report.user?.id || null,
        report.selectedRelatedClientId || report.userClient?.id || null,
        report.statusReport,
        report.complaintNumber || null,
        firstTimestamp(report, 'start'),
        firstTimestamp(report, 'end'),
        JSON.stringify(report),
      ],
    );

    return result.rows[0]?.payload as ServiceReportDto | undefined;
  }

  static async getSchemas(): Promise<InverterSchemaDto[]> {
    if (!(await this.initialize())) {
      return ServiceReportCmsModel.getSchemas();
    }

    const result = await query(
      `SELECT id, name, description, version, status, date_modified AS "dateModified", files, materials
       FROM inverter_schemas
       ORDER BY id`,
    );
    return result.rows as InverterSchemaDto[];
  }

  static async getSchemaSvg(schemaId: string): Promise<string | undefined> {
    if (!(await this.initialize())) {
      return ServiceReportCmsModel.getSchemas().find((schema) => String(schema.id) === String(schemaId))
        ? ServiceReportCmsModel.getSchemaSvg()
        : undefined;
    }

    const result = await query('SELECT svg FROM inverter_schemas WHERE id = $1', [Number(schemaId)]);
    return result.rows[0]?.svg || undefined;
  }

  private static async seedIfEmpty(): Promise<void> {
    const count = await query('SELECT COUNT(*)::int AS count FROM cms_service_reports');
    if (count.rows[0].count === 0) {
      const done = ServiceReportCmsModel.getById('1001');
      const draft = ServiceReportCmsModel.getById('1002');
      if (done) {
        await this.createWithFixedId(done);
      }
      if (draft) {
        await this.createWithFixedId(draft);
      }
    }

    const schemas = ServiceReportCmsModel.getSchemas();
    await query('DELETE FROM inverter_schemas WHERE NOT (id = ANY($1::int[]))', [
      schemas.map((schema) => schema.id),
    ]);

    for (const schema of schemas) {
      const svg = ServiceReportCmsModel.getSchemaSvg(schema.id);
      if (!svg) {
        continue;
      }

      await query(
        `INSERT INTO inverter_schemas (id, name, description, version, status, date_modified, files, materials, svg)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           version = EXCLUDED.version,
           status = EXCLUDED.status,
           date_modified = EXCLUDED.date_modified,
           files = EXCLUDED.files,
           materials = EXCLUDED.materials,
           svg = EXCLUDED.svg`,
        [
          schema.id,
          schema.name,
          schema.description,
          schema.version,
          schema.status,
          schema.dateModified,
          JSON.stringify(schema.files),
          JSON.stringify(schema.materials),
          svg,
        ],
      );
    }
  }

  private static async createWithFixedId(report: ServiceReportDto): Promise<void> {
    await this.upsertRelatedData(report);
    await query(
      `INSERT INTO cms_service_reports
        (id, plant_id, device_id, user_id, client_id, status_report, complaint_number, start_date, end_date, payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
       ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload`,
      [
        report.id,
        report.plantId,
        report.deviceId,
        report.userId || report.user?.id || null,
        report.selectedRelatedClientId || report.userClient?.id || null,
        report.statusReport,
        report.complaintNumber || null,
        firstTimestamp(report, 'start'),
        firstTimestamp(report, 'end'),
        JSON.stringify(report),
      ],
    );
    await query(`SELECT setval(pg_get_serial_sequence('cms_service_reports', 'id'), (SELECT MAX(id) FROM cms_service_reports))`);
  }

  private static async upsertRelatedData(report: ServiceReportDto): Promise<void> {
    if (report.user) {
      await query(
        `INSERT INTO cms_users (id, username, first_name, last_name, email)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET
           username = EXCLUDED.username,
           first_name = EXCLUDED.first_name,
           last_name = EXCLUDED.last_name,
           email = EXCLUDED.email,
           updated_at = now()`,
        [report.user.id, report.user.username, report.user.firstName, report.user.lastName, report.user.email],
      );
      await query(`SELECT setval(pg_get_serial_sequence('cms_users', 'id'), GREATEST((SELECT MAX(id) FROM cms_users), 1))`);
    }

    const clientId = report.userClient?.id || report.selectedRelatedClientId;
    if (clientId && report.userClient) {
      await query(
        `INSERT INTO cms_clients (id, name, address)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address, updated_at = now()`,
        [clientId, report.userClient.name, report.userClient.address || ''],
      );
    }

    const plant = report.plant;
    await query(
      `INSERT INTO cms_plants (id, name, type, country, installed_power_mwp)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         type = EXCLUDED.type,
         country = EXCLUDED.country,
         installed_power_mwp = EXCLUDED.installed_power_mwp,
         updated_at = now()`,
      [
        report.plantId,
        plant?.name || report.plantName || report.plantId,
        plant?.type || '',
        plant?.country || report.country || '',
        report.installedPowerMwp || null,
      ],
    );

    if (clientId) {
      await query(
        `INSERT INTO cms_plant_clients (plant_id, client_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [report.plantId, clientId],
      );
    }

    const device = report.device;
    await query(
      `INSERT INTO cms_devices (id, plant_id, name, type, serial_number, installed_power_kw)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         plant_id = EXCLUDED.plant_id,
         name = EXCLUDED.name,
         type = EXCLUDED.type,
         serial_number = EXCLUDED.serial_number,
         installed_power_kw = EXCLUDED.installed_power_kw,
         updated_at = now()`,
      [
        report.deviceId,
        report.plantId,
        device?.name || report.deviceName || report.deviceId,
        device?.type || report.inverterType || '',
        device?.serialNumber || report.inverterSerialNumber || '',
        device?.installedPowerKw || report.installedPowerKw || null,
      ],
    );
  }
}
