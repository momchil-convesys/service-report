import { query } from '../config/database';
import { initializeServiceReportDatabase } from '../database/service-report.schema';

export interface AdminPlantInput {
  id: string;
  name: string;
  type: string;
  country?: string | null;
  installedPowerMwp?: string | null;
  clientName?: string | null;
  clientAddress?: string | null;
}

export interface AdminDeviceInput {
  id: string;
  plantId: string;
  name: string;
  type: string;
  serialNumber?: string | null;
  installedPowerKw?: string | null;
}

export interface AdminPlantClientInput {
  plantId: string;
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
       LEFT JOIN cms_plants p ON p.id = pc.plant_id
       GROUP BY c.id, c.name, c.address
       ORDER BY c.name ASC`,
    );

    return result.rows;
  }

  static async createPlant(input: AdminPlantInput): Promise<AdminPlantInput> {
    await initializeServiceReportDatabase();

    const result = await query(
      `INSERT INTO cms_plants (id, name, type, country, installed_power_mwp)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING
         id,
         name,
         type,
         country,
         installed_power_mwp AS "installedPowerMwp"`,
      [
        input.id,
        input.name,
        input.type,
        input.country || '',
        input.installedPowerMwp || null,
      ],
    );

    if (input.clientName?.trim()) {
      await this.addClientToPlant({
        plantId: input.id,
        clientName: input.clientName,
        clientAddress: input.clientAddress || '',
      });
    }

    return result.rows[0];
  }

  static async createDevice(input: AdminDeviceInput): Promise<AdminDeviceInput> {
    await initializeServiceReportDatabase();

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
        input.id,
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

    const clientId = this.slugify(input.clientName);
    const clientResult = await query(
      `INSERT INTO cms_clients (id, name, address)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         address = EXCLUDED.address,
         updated_at = now()
       RETURNING id, name, address`,
      [clientId, input.clientName, input.clientAddress || ''],
    );

    await query(
      `INSERT INTO cms_plant_clients (plant_id, client_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [input.plantId, clientId],
    );

    return {
      ...clientResult.rows[0],
      plantId: input.plantId,
    };
  }

  private static slugify(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
  }
}
