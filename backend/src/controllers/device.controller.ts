import { Request, Response } from 'express';
import { DeviceModel, Device } from '../models/device.model';

export class DeviceController {
  static async createDevice(req: Request, res: Response): Promise<void> {
    try {
      const {
        name,
        type,
        manufacturer,
        model,
        serial_number,
        status,
        power_rating,
        installation_date,
        location,
        notes,
      } = req.body;

      if (!name || !type || !manufacturer || !model || !serial_number) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: name, type, manufacturer, model, serial_number',
        });
        return;
      }

      const device = await DeviceModel.create({
        name,
        type,
        manufacturer,
        model,
        serial_number,
        status,
        power_rating,
        installation_date: new Date(installation_date),
        location,
        notes,
      });

      res.status(201).json({
        success: true,
        data: device,
        message: 'Device created successfully',
      });
    } catch (error) {
      console.error('Create device error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create device',
      });
    }
  }

  static async getAllDevices(req: Request, res: Response): Promise<void> {
    try {
      const { type, status } = req.query;

      const devices = await DeviceModel.findAll({
        type: type as string,
        status: status as string,
      });

      res.json({
        success: true,
        data: devices,
      });
    } catch (error) {
      console.error('Get all devices error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch devices',
      });
    }
  }

  static async getDeviceById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const device = await DeviceModel.findById(id);

      if (!device) {
        res.status(404).json({
          success: false,
          error: 'Device not found',
        });
        return;
      }

      res.json({
        success: true,
        data: device,
      });
    } catch (error) {
      console.error('Get device by ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch device',
      });
    }
  }

  static async updateDevice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const device = await DeviceModel.findById(id);
      if (!device) {
        res.status(404).json({
          success: false,
          error: 'Device not found',
        });
        return;
      }

      const updatedDevice = await DeviceModel.update(id, updates);

      res.json({
        success: true,
        data: updatedDevice,
        message: 'Device updated successfully',
      });
    } catch (error) {
      console.error('Update device error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update device',
      });
    }
  }

  static async deleteDevice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const device = await DeviceModel.findById(id);
      if (!device) {
        res.status(404).json({
          success: false,
          error: 'Device not found',
        });
        return;
      }

      const deleted = await DeviceModel.delete(id);

      if (deleted) {
        res.json({
          success: true,
          message: 'Device deleted successfully',
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to delete device',
        });
      }
    } catch (error) {
      console.error('Delete device error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete device',
      });
    }
  }

  static async getDeviceStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics = await DeviceModel.getStatistics();

      res.json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      console.error('Get device statistics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch device statistics',
      });
    }
  }
}
