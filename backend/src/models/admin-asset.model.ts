import { query } from '../config/database';
import { initializeServiceReportDatabase } from '../database/service-report.schema';

export interface AdminPlantInput {
  id?: string | null;
  name: string;
  type: string;
  country?: string | null;
  installedPowerMwp?: string | null;
  clientId?: string | null;
}

export interface AdminDeviceInput {
  id?: string | null;
  plantId: string;
  name: string;
  type: string;
  serialNumber?: string | null;
  installedPowerKw?: string | null;
}

export interface AdminPlantClientInput {
  plantId: string;
  clientId?: string | null;
  clientName?: string | null;
  clientAddress?: string | null;
}

export interface AdminClientInput {
  clientName: string;
  clientAddress?: string | null;
}

export class AdminAssetModel {
  static async findClients(): Promise<
    {
      id: string;
      name: string;
      address: string;
      plants: { id: string; name: string }[];
    }[]
  > {
    await initializeServiceReportDatabase();

    const result = await query(
      `SELECT
         c.id,
         c.name,
         c.address,
         COALESCE(
           json_agg(
             json_build_object('id', p.id, 'name', p.name)
             ORDER BY p.name
           ) FILTER (WHERE p.id IS NOT NULL),
           '[]'::json
         ) AS plants
       FROM cms_clients c
       LEFT JOIN cms_plant_clients pc ON pc.client_id = c.id
       LEFT JOIN cms_plants p ON p.id = pc.plant_id AND p.deleted_at IS NULL
       WHERE c.deleted_at IS NULL
       GROUP BY c.id, c.name, c.address
       ORDER BY c.name ASC`,
    );

    return result.rows;
  }

  static async createPlant(input: AdminPlantInput): Promise<AdminPlantInput> {
    await initializeServiceReportDatabase();

    const plantId = input.id?.trim() || await this.createUniqueId('cms_plants', input.name);
    const result = await query(
      `INSERT INTO cms_plants (id, name, type, country, installed_power_mwp)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         type = EXCLUDED.type,
         country = EXCLUDED.country,
         installed_power_mwp = EXCLUDED.installed_power_mwp,
         deleted_at = NULL,
         updated_at = now()
       WHERE cms_plants.deleted_at IS NOT NULL
       RETURNING
         id,
         name,
         type,
         country,
         installed_power_mwp AS "installedPowerMwp"`,
      [
        plantId,
        input.name,
        input.type,
        input.country || '',
        input.installedPowerMwp || null,
      ],
    );

    if (!result.rows[0]) {
      throw Object.assign(new Error('Plant id already exists.'), { code: '23505' });
    }

    if (input.clientId?.trim()) {
      await this.linkClientToPlant(plantId, input.clientId.trim());
    }

    return result.rows[0];
  }

  static async createClient(input: AdminClientInput): Promise<{
    id: string;
    name: string;
    address: string;
  }> {
    await initializeServiceReportDatabase();

    const clientId = this.slugify(input.clientName);
    const result = await query(
      `INSERT INTO cms_clients (id, name, address)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         address = EXCLUDED.address,
         deleted_at = NULL,
         updated_at = now()
       RETURNING id, name, address`,
      [clientId, input.clientName, input.clientAddress || ''],
    );

    return result.rows[0];
  }

  static async createDevice(input: AdminDeviceInput): Promise<AdminDeviceInput> {
    await initializeServiceReportDatabase();

    const plantResult = await query(
      `SELECT id FROM cms_plants WHERE id = $1 AND deleted_at IS NULL`,
      [input.plantId],
    );

    if (!plantResult.rows[0]) {
      throw Object.assign(new Error('Plant id does not exist.'), { code: '23503' });
    }

    const deviceId = input.id?.trim() || await this.createUniqueId(
      'cms_devices',
      `${input.plantId}-${input.name}`,
    );
    const result = await query(
      `INSERT INTO cms_devices (id, plant_id, name, type, serial_number, installed_power_kw)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING
         id,
         plant_id AS "plantId",
         name,
         type,
         serial_number AS "serialNumber",
         installed_power_kw AS "installedPowerKw"`,
      [
        deviceId,
        input.plantId,
        input.name,
        input.type,
        input.serialNumber || '',
        input.installedPowerKw || null,
      ],
    );

    return result.rows[0];
  }

  static async addClientToPlant(input: AdminPlantClientInput): Promise<{
    id: string;
    name: string;
    address: string;
    plantId: string;
  }> {
    await initializeServiceReportDatabase();

    const clientResult = input.clientId
      ? await query(`SELECT id, name, address FROM cms_clients WHERE id = $1 AND deleted_at IS NULL`, [input.clientId])
      : { rows: [await this.createClient({ clientName: input.clientName || '', clientAddress: input.clientAddress })] };

    if (!clientResult.rows[0]) {
      throw Object.assign(new Error('Client id does not exist.'), { code: '23503' });
    }

    const clientId = clientResult.rows[0].id;

    await this.linkClientToPlant(input.plantId, clientId);

    return {
      ...clientResult.rows[0],
      plantId: input.plantId,
    };
  }

  private static async linkClientToPlant(plantId: string, clientId: string): Promise<void> {
    const plantResult = await query(
      `SELECT id FROM cms_plants WHERE id = $1 AND deleted_at IS NULL`,
      [plantId],
    );

    if (!plantResult.rows[0]) {
      throw Object.assign(new Error('Plant id does not exist.'), { code: '23503' });
    }

    await query(
      `INSERT INTO cms_plant_clients (plant_id, client_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [plantId, clientId],
    );
  }

  static async softDeletePlant(plantId: string): Promise<boolean> {
    await initializeServiceReportDatabase();

    const result = await query(
      `UPDATE cms_plants
       SET deleted_at = now(), updated_at = now()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [plantId],
    );

    return (result.rowCount || 0) > 0;
  }

  static async softDeleteClient(clientId: string): Promise<boolean> {
    await initializeServiceReportDatabase();

    const result = await query(
      `UPDATE cms_clients
       SET deleted_at = now(), updated_at = now()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [clientId],
    );

    return (result.rowCount || 0) > 0;
  }

  static async softDeleteDevice(deviceId: string): Promise<boolean> {
    await initializeServiceReportDatabase();

    const result = await query(
      `UPDATE cms_devices
       SET deleted_at = now(), updated_at = now()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [deviceId],
    );

    return (result.rowCount || 0) > 0;
  }

  private static slugify(value: string): string {
    const slug = value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);

    return slug || 'item';
  }

  private static async createUniqueId(tableName: 'cms_plants' | 'cms_devices', source: string): Promise<string> {
    const baseId = this.slugify(source);
    let candidate = baseId;
    let suffix = 2;

    while (await this.idExists(tableName, candidate)) {
      const suffixText = `-${suffix}`;
      candidate = `${baseId.slice(0, 80 - suffixText.length)}${suffixText}`;
      suffix += 1;
    }

    return candidate;
  }

  private static async idExists(tableName: 'cms_plants' | 'cms_devices', id: string): Promise<boolean> {
    const result = await query(`SELECT 1 FROM ${tableName} WHERE id = $1 LIMIT 1`, [id]);
    return Boolean(result.rows[0]);
  }
}
