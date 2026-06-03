import { query } from '../config/database';
import { initializeServiceReportDatabase } from '../database/service-report.schema';

export interface AdminPlantInput {
  id: string;
  name: string;
  type: string;
  country?: string | null;
  installedPowerMwp?: string | null;
}

export interface AdminDeviceInput {
  id: string;
  plantId: string;
  name: string;
  type: string;
  serialNumber?: string | null;
  installedPowerKw?: string | null;
}

export class AdminAssetModel {
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
}
