import { query } from '../config/database';

export interface Device {
  id: string;
  name: string;
  type: 'inverter' | 'battery' | 'solar_panel' | 'charge_controller' | 'generator' | 'other';
  manufacturer: string;
  model: string;
  serial_number: string;
  status: 'active' | 'inactive' | 'maintenance' | 'retired';
  power_rating?: number; // in kW
  installation_date: Date;
  location?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export class DeviceModel {
  static async create(device: Partial<Device>): Promise<Device> {
    const { v4: uuidv4 } = require('uuid');
    const id = uuidv4();
    const now = new Date();

    const text = `
      INSERT INTO devices (id, name, type, manufacturer, model, serial_number, status, power_rating, installation_date, location, notes, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const values = [
      id,
      device.name,
      device.type,
      device.manufacturer,
      device.model,
      device.serial_number,
      device.status || 'active',
      device.power_rating || null,
      device.installation_date,
      device.location || null,
      device.notes || null,
      now,
      now,
    ];

    const result = await query(text, values);
    return result.rows[0];
  }

  static async findAll(filter?: { type?: string; status?: string }): Promise<Device[]> {
    let text = 'SELECT * FROM devices WHERE 1=1';
    const values: any[] = [];
    let paramIndex = 1;

    if (filter?.type) {
      text += ` AND type = $${paramIndex}`;
      values.push(filter.type);
      paramIndex++;
    }

    if (filter?.status) {
      text += ` AND status = $${paramIndex}`;
      values.push(filter.status);
      paramIndex++;
    }

    text += ' ORDER BY created_at DESC';

    const result = await query(text, values);
    return result.rows;
  }

  static async findById(id: string): Promise<Device | null> {
    const text = 'SELECT * FROM devices WHERE id = $1';
    const result = await query(text, [id]);
    return result.rows[0] || null;
  }

  static async update(id: string, device: Partial<Device>): Promise<Device> {
    const now = new Date();
    const updates: string[] = [];
    const values: any[] = [id, now];
    let paramIndex = 3;

    if (device.name) {
      updates.push(`name = $${paramIndex}`);
      values.push(device.name);
      paramIndex++;
    }

    if (device.type) {
      updates.push(`type = $${paramIndex}`);
      values.push(device.type);
      paramIndex++;
    }

    if (device.status) {
      updates.push(`status = $${paramIndex}`);
      values.push(device.status);
      paramIndex++;
    }

    if (device.manufacturer) {
      updates.push(`manufacturer = $${paramIndex}`);
      values.push(device.manufacturer);
      paramIndex++;
    }

    if (device.model) {
      updates.push(`model = $${paramIndex}`);
      values.push(device.model);
      paramIndex++;
    }

    if (device.location) {
      updates.push(`location = $${paramIndex}`);
      values.push(device.location);
      paramIndex++;
    }

    if (device.notes !== undefined) {
      updates.push(`notes = $${paramIndex}`);
      values.push(device.notes);
      paramIndex++;
    }

    if (device.power_rating !== undefined) {
      updates.push(`power_rating = $${paramIndex}`);
      values.push(device.power_rating);
      paramIndex++;
    }

    updates.push(`updated_at = $2`);

    const text = `
      UPDATE devices
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const result = await query(text, values);
    return result.rows[0];
  }

  static async delete(id: string): Promise<boolean> {
    const text = 'DELETE FROM devices WHERE id = $1 RETURNING id';
    const result = await query(text, [id]);
    return result.rows.length > 0;
  }

  static async getStatistics(): Promise<any> {
    const text = `
      SELECT 
        type,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count
      FROM devices
      GROUP BY type
    `;
    const result = await query(text, []);
    return result.rows;
  }
}
