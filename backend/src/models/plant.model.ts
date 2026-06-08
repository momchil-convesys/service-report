import { query } from '../config/database';
import { initializeServiceReportDatabase } from '../database/service-report.schema';
import { AppUser } from '../services/auth.service';

interface PlantRow {
  id: string;
  name: string;
  type: string;
  country: string | null;
  installed_power_mwp: string | null;
}

interface DeviceRow {
  id: string;
  plant_id: string;
  name: string;
  type: string;
  serial_number: string | null;
  installed_power_kw: string | null;
}

interface ClientRow {
  plant_id: string;
  id: string;
  name: string;
  address: string;
}

export interface RelatedClientDto {
  id: string;
  name: string;
  address: string;
}

export interface DeviceDto {
  id: string;
  name: string;
  plantId: string;
  state: string;
  intermediateStateCode: number | null;
  deviceMetadataId: string;
  type: string;
  assetType: string;
  currentFaults: null;
  serialNumber: string;
  installedPowerKw: string | null;
  powerLimit: null;
  deviceSpecificMetadata: Record<string, never>;
}

export interface PlantDto {
  id: string;
  name: string;
  type: string;
  assetType: string;
  country: string | null;
  installedPowerMwp: string | null;
  timeZone: string;
  deviceIds: string[];
  devices: DeviceDto[];
  relatedClients: RelatedClientDto[];
  activePowerLimitSchedule: null;
  activeBESSSchedule: null;
  plantSpecificMetadata: {
    hasPowerMeter: boolean;
    hasExtendedPlantMetrics: boolean;
    powerLimitTargetCoefficient: number;
    powerLimitType: 'energy';
    scheduleIntegrationPeriodMinutes: number;
    hasTsWithInverters: boolean;
    hasOnSiteSetup: boolean;
    thisSetup: null;
    hasFaultsTab: boolean;
  };
}

export class PlantModel {
  static async findForUser(user: AppUser): Promise<PlantDto[]> {
    await initializeServiceReportDatabase();
    await this.ensureDefaultPlants();

    const params: unknown[] = [];
    const where: string[] = ['p.deleted_at IS NULL'];

    // TODO: replace allow-all with persisted plant permissions when user/role management is added.
    const allowAllPlants = true;
    if (!allowAllPlants && user.role !== 'superuser') {
      if (user.relatedPlantIds.length === 0) {
        return [];
      }

      params.push(user.relatedPlantIds);
      where.push(`p.id = ANY($${params.length}::text[])`);
    }

    const plantsResult = await query(
      `
        SELECT p.id, p.name, p.type, p.country, p.installed_power_mwp
        FROM cms_plants p
        WHERE ${where.join(' AND ')}
        ORDER BY name ASC
      `,
      params,
    );

    const plants = plantsResult.rows as PlantRow[];
    if (plants.length === 0) {
      return [];
    }

    const plantIds = plants.map((plant) => plant.id);
    const devicesResult = await query(
      `
        SELECT id, plant_id, name, type, serial_number, installed_power_kw
        FROM cms_devices
        WHERE plant_id = ANY($1::text[])
          AND deleted_at IS NULL
        ORDER BY plant_id ASC, name ASC
      `,
      [plantIds],
    );

    const devicesByPlantId = (devicesResult.rows as DeviceRow[]).reduce<Record<string, DeviceDto[]>>(
      (acc, device) => {
        const plantDevices = acc[device.plant_id] || [];
        plantDevices.push(this.deviceRowToDto(device));
        acc[device.plant_id] = plantDevices;
        return acc;
      },
      {},
    );

    const clientsResult = await query(
      `
        SELECT pc.plant_id, c.id, c.name, c.address
        FROM cms_plant_clients pc
        JOIN cms_clients c ON c.id = pc.client_id
        WHERE pc.plant_id = ANY($1::text[])
          AND c.deleted_at IS NULL
        ORDER BY c.name ASC
      `,
      [plantIds],
    );

    const clientsByPlantId = (clientsResult.rows as ClientRow[]).reduce<Record<string, RelatedClientDto[]>>(
      (acc, client) => {
        const plantClients = acc[client.plant_id] || [];
        plantClients.push({
          id: client.id,
          name: client.name,
          address: client.address,
        });
        acc[client.plant_id] = plantClients;
        return acc;
      },
      {},
    );

    return plants.map((plant) =>
      this.plantRowToDto(
        plant,
        devicesByPlantId[plant.id] || [],
        clientsByPlantId[plant.id] || [],
      ),
    );
  }

  static async findByIdForUser(plantId: string, user: AppUser): Promise<PlantDto | null> {
    const plants = await this.findForUser(user);
    return plants.find((plant) => plant.id === plantId) || null;
  }

  private static plantRowToDto(
    plant: PlantRow,
    devices: DeviceDto[],
    relatedClients: RelatedClientDto[],
  ): PlantDto {
    const plantType = this.mapKnownType(plant.type);

    return {
      id: plant.id,
      name: plant.name,
      type: plantType,
      assetType: plant.type,
      country: plant.country || null,
      installedPowerMwp: plant.installed_power_mwp,
      timeZone: 'Europe/Sofia',
      deviceIds: devices.map((device) => device.id),
      devices,
      relatedClients,
      activePowerLimitSchedule: null,
      activeBESSSchedule: null,
      plantSpecificMetadata: {
        hasPowerMeter: false,
        hasExtendedPlantMetrics: plantType === 'solar',
        powerLimitTargetCoefficient: 1,
        powerLimitType: 'energy',
        scheduleIntegrationPeriodMinutes: 60,
        hasTsWithInverters: plantType === 'solar',
        hasOnSiteSetup: false,
        thisSetup: null,
        hasFaultsTab: true,
      },
    };
  }

  private static deviceRowToDto(device: DeviceRow): DeviceDto {
    const deviceType = this.mapKnownType(device.type);

    return {
      id: device.id,
      name: device.name,
      plantId: device.plant_id,
      state: 'on',
      intermediateStateCode: null,
      deviceMetadataId: 'inverter-metadata',
      type: deviceType,
      assetType: device.type,
      currentFaults: null,
      serialNumber: device.serial_number || '',
      installedPowerKw: device.installed_power_kw,
      powerLimit: null,
      deviceSpecificMetadata: {},
    };
  }

  private static mapKnownType(type: string): string {
    switch (type) {
      case 'solar':
      case 'battery':
      case 'wind':
      case 'pump':
        return type;
      case 'bess':
      case 'battery_system':
        return 'battery';
      case 'inverter':
      case 'solar_panel':
      case 'charge_controller':
        return 'solar';
      default:
        return 'solar';
    }
  }

  private static async ensureDefaultPlants(): Promise<void> {
    await query(`
      INSERT INTO cms_plants (id, name, type, country, installed_power_mwp)
      VALUES
        ('plant-1', 'Plant 1', 'solar', 'BG', '1.2'),
        ('plant-2', 'Plant 2', 'battery', 'BG', NULL),
        ('plant-3', 'Plant 3', 'wind', 'BG', '2.4')
      ON CONFLICT (id) DO UPDATE
      SET
        name = EXCLUDED.name,
        type = EXCLUDED.type,
        country = EXCLUDED.country,
        installed_power_mwp = EXCLUDED.installed_power_mwp,
        deleted_at = NULL,
        updated_at = now();

      INSERT INTO cms_clients (id, name, address)
      VALUES ('client-1', 'Client 1', 'Service address')
      ON CONFLICT (id) DO UPDATE
      SET
        name = EXCLUDED.name,
        address = EXCLUDED.address,
        deleted_at = NULL,
        updated_at = now();

      INSERT INTO cms_plant_clients (plant_id, client_id)
      VALUES
        ('plant-1', 'client-1'),
        ('plant-2', 'client-1'),
        ('plant-3', 'client-1')
      ON CONFLICT DO NOTHING;

      INSERT INTO cms_devices (id, plant_id, name, type, serial_number, installed_power_kw)
      VALUES
        ('plant-1-inverter-1', 'plant-1', 'Inverter 1', 'inverter', 'P1-INV-001', '250'),
        ('plant-1-inverter-2', 'plant-1', 'Inverter 2', 'inverter', 'P1-INV-002', '250'),
        ('plant-1-inverter-3', 'plant-1', 'Inverter 3', 'inverter', 'P1-INV-003', '250'),
        ('plant-1-inverter-4', 'plant-1', 'Inverter 4', 'inverter', 'P1-INV-004', '250'),
        ('plant-1-inverter-5', 'plant-1', 'Inverter 5', 'inverter', 'P1-INV-005', '250'),
        ('plant-2-inverter-1', 'plant-2', 'Inverter 1', 'inverter', 'P2-INV-001', '250'),
        ('plant-2-inverter-2', 'plant-2', 'Inverter 2', 'inverter', 'P2-INV-002', '250'),
        ('plant-2-inverter-3', 'plant-2', 'Inverter 3', 'inverter', 'P2-INV-003', '250'),
        ('plant-2-inverter-4', 'plant-2', 'Inverter 4', 'inverter', 'P2-INV-004', '250'),
        ('plant-2-inverter-5', 'plant-2', 'Inverter 5', 'inverter', 'P2-INV-005', '250'),
        ('plant-3-inverter-1', 'plant-3', 'Inverter 1', 'inverter', 'P3-INV-001', '250'),
        ('plant-3-inverter-2', 'plant-3', 'Inverter 2', 'inverter', 'P3-INV-002', '250'),
        ('plant-3-inverter-3', 'plant-3', 'Inverter 3', 'inverter', 'P3-INV-003', '250'),
        ('plant-3-inverter-4', 'plant-3', 'Inverter 4', 'inverter', 'P3-INV-004', '250'),
        ('plant-3-inverter-5', 'plant-3', 'Inverter 5', 'inverter', 'P3-INV-005', '250')
      ON CONFLICT (id) DO UPDATE
      SET
        plant_id = EXCLUDED.plant_id,
        name = EXCLUDED.name,
        type = EXCLUDED.type,
        serial_number = EXCLUDED.serial_number,
        installed_power_kw = EXCLUDED.installed_power_kw,
        deleted_at = NULL,
        updated_at = now();
    `);
  }
}
