import fs from 'fs';
import path from 'path';
import { inverterSchemas } from '../database/inverter-schemas';

export interface ServiceReportListItem {
  deviceId: string;
  deviceName: string;
  deviceSerial: string;
  endDate: string;
  id: number;
  plantId: string;
  plantName: string;
  serviceEngineer: string;
  startDate: string;
  statusRepair: string;
  statusReport: 'Done' | 'Draft';
  userId?: number;
  deletedAt?: string | null;
}

type ReportStatus = 'Done' | 'Draft';

interface StrippedDevice {
  id: string;
  name: string;
  plantId: string;
  type: string;
  serialNumber: string;
  installedPowerKw: string;
}

interface StrippedPlant {
  id: string;
  name: string;
  type: string;
  country: string;
  devices: StrippedDevice[];
  relatedClients: typeof relatedClients;
}

export interface ServiceReportDto {
  id?: number;
  plantId: string;
  deviceId: string;
  statusReport: ReportStatus;
  selectedRelatedClientId?: string | null;
  complaintNumber: string | null;
  otherEquipment: string | null;
  typeActivity: Record<string, boolean>;
  travelling: unknown[];
  works: unknown[];
  materials: unknown[];
  userId?: number;
  user?: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  plant?: StrippedPlant;
  device?: StrippedDevice;
  userPlants: StrippedPlant[];
  userClient: {
    id?: string;
    name: string;
    address: string;
  };
  [key: string]: unknown;
  deletedAt?: string | null;
}

const relatedClients = [
  {
    id: 'client-1',
    name: 'Client 1',
    address: 'Service address',
  },
];

function createPlantDevices(plantId: string, serialPrefix: string): StrippedDevice[] {
  return Array.from({ length: 5 }, (_, index) => {
    const ordinal = index + 1;

    return {
      id: `${plantId}-inverter-${ordinal}`,
      name: `Inverter ${ordinal}`,
      type: 'inverter',
      serialNumber: `${serialPrefix}-INV-${String(ordinal).padStart(3, '0')}`,
      installedPowerKw: '250',
      plantId,
    };
  });
}

const devices: StrippedDevice[] = [
  ...createPlantDevices('plant-1', 'P1'),
  ...createPlantDevices('plant-2', 'P2'),
  ...createPlantDevices('plant-3', 'P3'),
];

const userPlants: StrippedPlant[] = [
  {
    id: 'plant-1',
    name: 'Plant 1',
    type: 'solar',
    country: 'BG',
    devices: devices.filter((device) => device.plantId === 'plant-1'),
    relatedClients,
  },
  {
    id: 'plant-2',
    name: 'Plant 2',
    type: 'battery',
    country: 'BG',
    devices: devices.filter((device) => device.plantId === 'plant-2'),
    relatedClients,
  },
  {
    id: 'plant-3',
    name: 'Plant 3',
    type: 'wind',
    country: 'BG',
    devices: devices.filter((device) => device.plantId === 'plant-3'),
    relatedClients,
  },
];

const userClient = {
  id: 'client-1',
  name: 'Client 1',
  address: 'Service address',
};

const user = {
  id: 1,
  username: 'local.dev',
  firstName: 'Local',
  lastName: 'Dev User',
  email: 'local.dev@example.test',
};

function findPlant(plantId?: string): StrippedPlant {
  return userPlants.find((plant) => plant.id === plantId) || userPlants[0];
}

function findDevice(deviceId?: string, plantId?: string): StrippedDevice {
  return (
    devices.find((device) => device.id === deviceId) ||
    devices.find((device) => device.plantId === plantId) ||
    devices[0]
  );
}

function createReport(id: number, statusReport: ReportStatus): ServiceReportDto {
  const plant = findPlant('plant-1');
  const device = findDevice('plant-1-inverter-1', plant.id);

  return {
    id,
    plantId: plant.id,
    plant,
    deviceId: device.id,
    device,
    userId: user.id,
    user,
    statusReport,
    selectedRelatedClientId: userClient.id,
    complaintNumber: `SR-${id}`,
    otherEquipment: '',
    typeActivity: {
      maintenance: true,
    },
    travelling: [
      {
        origin: {
          location: 'Sofia',
          timestamp: '2026-05-26T09:00:00',
        },
        destination: {
          location: plant.name,
          timestamp: '2026-05-26T10:15:00',
        },
        duration: 75,
        vehiclesCount: 1,
        distance: 82,
        otherExpenses: '',
        personsParticipated: ['Local Dev User'],
      },
    ],
    works: [
      {
        timeWorkStart: {
          timestamp: '2026-05-26T10:30:00',
        },
        timeWorkEnd: {
          timestamp: '2026-05-26T13:30:00',
        },
        workName: 'Inspection and service report preparation.',
        personsWorkParticipated: ['Local Dev User'],
      },
    ],
    materials: [],
    userPlants,
    userClient,
    plantName: plant.name,
    country: plant.country,
    inverterType: device.type,
    inverterSerialNumber: device.serialNumber,
    deviceSerialNumber: device.serialNumber,
    warrantyStatus: 'Yes',
    installedPowerMwp: '1.2',
    installedPowerKw: device.installedPowerKw,
    contractNumber: 'CN-001',
  };
}

let reports: ServiceReportDto[] = [];

export interface InverterSchemaDto {
  id: number;
  name: string;
  description: string;
  version: string;
  status: string;
  dateModified: string;
  files: string[];
  materials: {
    id: number;
    name: string;
    schematicLabel: string;
    itemNumber: string | null;
  }[];
}

const schemaDirectories = [
  path.resolve(__dirname, '../../cms-api-win-x64-09-04-2025-01 (4)/res/schemas'),
  path.resolve(__dirname, '../../device-server-api-win-x64-09-04-2025-01/res/schemas'),
];

export class ServiceReportCmsModel {
  static findReports(plantId?: string, deviceId?: string, statusReport?: string): ServiceReportListItem[] {
    return reports
      .filter((report) => !report.deletedAt)
      .filter((report) => !plantId || report.plantId === plantId)
      .filter((report) => !deviceId || report.deviceId === deviceId)
      .filter((report) => !statusReport || report.statusReport === statusReport)
      .map((report) => this.toListItem(report))
      .sort((a, b) => b.id - a.id);
  }

  static getById(reportId: string): ServiceReportDto | undefined {
    return reports.find((report) => String(report.id) === String(reportId) && !report.deletedAt);
  }

  static createTemplate(plantId: string, deviceId?: string): ServiceReportDto {
    const plant = findPlant(plantId);
    const device = findDevice(deviceId, plant.id);

    return {
      ...createReport(0, 'Draft'),
      id: undefined,
      plantId: plant.id,
      plant,
      deviceId: device.id,
      device,
      complaintNumber: '',
      typeActivity: {},
      travelling: [],
      works: [],
      materials: [],
      userPlants,
      userClient,
      plantName: plant.name,
      country: plant.country,
      inverterType: device.type,
      inverterSerialNumber: device.serialNumber,
      deviceSerialNumber: device.serialNumber,
      installedPowerKw: device.installedPowerKw,
    };
  }

  static create(report: ServiceReportDto): ServiceReportDto {
    const nextId = Math.max(...reports.map((item) => Number(item.id) || 0), 1000) + 1;
    const created = this.normalizeReport({
      ...report,
      id: nextId,
    });
    reports = [created, ...reports];
    return created;
  }

  static update(report: ServiceReportDto): ServiceReportDto {
    const normalized = this.normalizeReport(report);
    reports = reports.map((item) => (String(item.id) === String(normalized.id) ? normalized : item));
    return normalized;
  }

  static softDelete(reportId: string): boolean {
    const existing = reports.find((report) => String(report.id) === String(reportId) && !report.deletedAt);

    if (!existing) {
      return false;
    }

    existing.deletedAt = new Date().toISOString();
    return true;
  }

  static getSchemas(): InverterSchemaDto[] {
    return inverterSchemas.slice(0, 3).map((schema) => ({
      ...schema,
      files: schema.files.map((file) => path.basename(file)),
    }));
  }

  static getSchemaSvg(schemaId?: string | number): string | undefined {
    const schema =
      this.getSchemas().find((item) => String(item.id) === String(schemaId)) || this.getSchemas()[0];
    const fileName = path.basename(schema?.files?.[0] || '');

    for (const directory of schemaDirectories) {
      const filePath = path.join(directory, fileName);
      if (fileName && fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf8');
      }
    }

    return undefined;
  }

  private static normalizeReport(report: ServiceReportDto): ServiceReportDto {
    return {
      ...report,
      statusReport: report.statusReport || 'Draft',
      plantId: report.plantId || 'plant-1',
      plant: findPlant(report.plantId),
      deviceId: report.deviceId || findDevice(undefined, report.plantId).id,
      device: findDevice(report.deviceId, report.plantId),
      userId: report.userId || user.id,
      user: report.user || user,
      selectedRelatedClientId: report.selectedRelatedClientId || userClient.id,
      userPlants: report.userPlants || userPlants,
      userClient: report.userClient || userClient,
      travelling: report.travelling || [],
      works: report.works || [],
      materials: report.materials || [],
      typeActivity: report.typeActivity || {},
    };
  }

  private static toListItem(report: ServiceReportDto): ServiceReportListItem {
    return {
      id: Number(report.id),
      plantId: report.plantId,
      plantName: findPlant(report.plantId).name,
      deviceId: report.deviceId,
      deviceName: findDevice(report.deviceId, report.plantId).name,
      deviceSerial: findDevice(report.deviceId, report.plantId).serialNumber,
      startDate: '2026-05-26T10:30:00',
      endDate: '2026-05-26T13:30:00',
      serviceEngineer: 'Local Dev User',
      statusRepair: 'Finished',
      statusReport: report.statusReport,
      userId: typeof report.userId === 'number' ? report.userId : undefined,
      deletedAt: report.deletedAt || null,
    };
  }
}
