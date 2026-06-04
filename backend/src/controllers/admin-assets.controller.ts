import { Request, Response } from 'express';
import { AdminAssetModel } from '../models/admin-asset.model';

function isValidId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-zA-Z0-9_-]+$/.test(value.trim());
}

export class AdminAssetsController {
  static async listClients(req: Request, res: Response): Promise<void> {
    try {
      res.json(await AdminAssetModel.findClients());
    } catch (error) {
      console.error('List admin clients error:', error);
      res.status(500).json({ error: 'Failed to fetch clients.' });
    }
  }

  static async createPlant(req: Request, res: Response): Promise<void> {
    try {
      const { id, name, type, country, installedPowerMwp, clientId } = req.body || {};

      if (!isValidId(id) || typeof name !== 'string' || !name.trim() || typeof type !== 'string' || !type.trim()) {
        res.status(400).json({ error: 'Plant id, name, and type are required.' });
        return;
      }

      const plant = await AdminAssetModel.createPlant({
        id: id.trim(),
        name: name.trim(),
        type: type.trim(),
        country: typeof country === 'string' ? country.trim() : '',
        installedPowerMwp: typeof installedPowerMwp === 'string' ? installedPowerMwp.trim() : null,
        clientId: typeof clientId === 'string' ? clientId.trim() : null,
      });

      res.status(201).json(plant);
    } catch (error: any) {
      if (error?.code === '23505') {
        res.status(409).json({ error: 'Plant id already exists.' });
        return;
      }

      if (error?.code === '23503') {
        res.status(400).json({ error: 'Client id does not exist.' });
        return;
      }

      console.error('Create admin plant error:', error);
      res.status(500).json({ error: 'Failed to create plant.' });
    }
  }

  static async createClient(req: Request, res: Response): Promise<void> {
    try {
      const { clientName, clientAddress } = req.body || {};

      if (typeof clientName !== 'string' || !clientName.trim()) {
        res.status(400).json({ error: 'Client name is required.' });
        return;
      }

      const client = await AdminAssetModel.createClient({
        clientName: clientName.trim(),
        clientAddress: typeof clientAddress === 'string' ? clientAddress.trim() : '',
      });

      res.status(201).json(client);
    } catch (error) {
      console.error('Create admin client error:', error);
      res.status(500).json({ error: 'Failed to create client.' });
    }
  }

  static async createDevice(req: Request, res: Response): Promise<void> {
    try {
      const { id, plantId, name, type, serialNumber, installedPowerKw } = req.body || {};

      if (
        !isValidId(id) ||
        !isValidId(plantId) ||
        typeof name !== 'string' ||
        !name.trim() ||
        typeof type !== 'string' ||
        !type.trim()
      ) {
        res.status(400).json({ error: 'Device id, plant id, name, and type are required.' });
        return;
      }

      const device = await AdminAssetModel.createDevice({
        id: id.trim(),
        plantId: plantId.trim(),
        name: name.trim(),
        type: type.trim(),
        serialNumber: typeof serialNumber === 'string' ? serialNumber.trim() : '',
        installedPowerKw: typeof installedPowerKw === 'string' ? installedPowerKw.trim() : null,
      });

      res.status(201).json(device);
    } catch (error: any) {
      if (error?.code === '23505') {
        res.status(409).json({ error: 'Device id already exists.' });
        return;
      }

      if (error?.code === '23503') {
        res.status(400).json({ error: 'Plant id does not exist.' });
        return;
      }

      console.error('Create admin device error:', error);
      res.status(500).json({ error: 'Failed to create device.' });
    }
  }

  static async deletePlant(req: Request, res: Response): Promise<void> {
    try {
      const { plantId } = req.params;

      if (!isValidId(plantId)) {
        res.status(400).json({ error: 'Plant id is required.' });
        return;
      }

      const deleted = await AdminAssetModel.softDeletePlant(plantId.trim());
      if (!deleted) {
        res.status(404).json({ error: 'Plant not found.' });
        return;
      }

      res.json({ message: 'Plant deleted.' });
    } catch (error) {
      console.error('Delete admin plant error:', error);
      res.status(500).json({ error: 'Failed to delete plant.' });
    }
  }

  static async deleteClient(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.params;

      if (!isValidId(clientId)) {
        res.status(400).json({ error: 'Client id is required.' });
        return;
      }

      const deleted = await AdminAssetModel.softDeleteClient(clientId.trim());
      if (!deleted) {
        res.status(404).json({ error: 'Client not found.' });
        return;
      }

      res.json({ message: 'Client deleted.' });
    } catch (error) {
      console.error('Delete admin client error:', error);
      res.status(500).json({ error: 'Failed to delete client.' });
    }
  }

  static async addClientToPlant(req: Request, res: Response): Promise<void> {
    try {
      const { plantId, clientId, clientName, clientAddress } = req.body || {};

      if (
        !isValidId(plantId) ||
        ((typeof clientId !== 'string' || !clientId.trim()) &&
          (typeof clientName !== 'string' || !clientName.trim()))
      ) {
        res.status(400).json({ error: 'Plant id and client are required.' });
        return;
      }

      const client = await AdminAssetModel.addClientToPlant({
        plantId: plantId.trim(),
        clientId: typeof clientId === 'string' ? clientId.trim() : null,
        clientName: typeof clientName === 'string' ? clientName.trim() : null,
        clientAddress: typeof clientAddress === 'string' ? clientAddress.trim() : '',
      });

      res.status(201).json(client);
    } catch (error: any) {
      if (error?.code === '23503') {
        res.status(400).json({ error: 'Plant id does not exist.' });
        return;
      }

      console.error('Add admin plant client error:', error);
      res.status(500).json({ error: 'Failed to add client to plant.' });
    }
  }
}
