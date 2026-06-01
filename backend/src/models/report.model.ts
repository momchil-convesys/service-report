import { query } from '../config/database';

export interface ServiceReport {
  id: string;
  title: string;
  description: string;
  service_name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to?: string;
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
  notes?: string;
}

export class ReportModel {
  static async create(report: Partial<ServiceReport>): Promise<ServiceReport> {
    const { v4: uuidv4 } = require('uuid');
    const id = uuidv4();
    const now = new Date();

    const text = `
      INSERT INTO reports (id, title, description, service_name, status, priority, assigned_to, notes, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      id,
      report.title,
      report.description,
      report.service_name,
      report.status || 'pending',
      report.priority || 'medium',
      report.assigned_to || null,
      report.notes || null,
      now,
      now,
    ];

    const result = await query(text, values);
    return result.rows[0];
  }

  static async findAll(filter?: { status?: string; priority?: string }): Promise<ServiceReport[]> {
    let text = 'SELECT * FROM reports WHERE 1=1';
    const values: any[] = [];
    let paramIndex = 1;

    if (filter?.status) {
      text += ` AND status = $${paramIndex}`;
      values.push(filter.status);
      paramIndex++;
    }

    if (filter?.priority) {
      text += ` AND priority = $${paramIndex}`;
      values.push(filter.priority);
      paramIndex++;
    }

    text += ' ORDER BY created_at DESC';

    const result = await query(text, values);
    return result.rows;
  }

  static async findById(id: string): Promise<ServiceReport | null> {
    const text = 'SELECT * FROM reports WHERE id = $1';
    const result = await query(text, [id]);
    return result.rows[0] || null;
  }

  static async update(id: string, report: Partial<ServiceReport>): Promise<ServiceReport> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (report.title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      values.push(report.title);
      paramIndex++;
    }

    if (report.description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(report.description);
      paramIndex++;
    }

    if (report.status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      values.push(report.status);
      paramIndex++;
    }

    if (report.priority !== undefined) {
      updates.push(`priority = $${paramIndex}`);
      values.push(report.priority);
      paramIndex++;
    }

    if (report.assigned_to !== undefined) {
      updates.push(`assigned_to = $${paramIndex}`);
      values.push(report.assigned_to);
      paramIndex++;
    }

    if (report.notes !== undefined) {
      updates.push(`notes = $${paramIndex}`);
      values.push(report.notes);
      paramIndex++;
    }

    updates.push(`updated_at = $${paramIndex}`);
    values.push(new Date());
    paramIndex++;

    values.push(id);

    const text = `UPDATE reports SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await query(text, values);
    return result.rows[0];
  }

  static async delete(id: string): Promise<boolean> {
    const text = 'DELETE FROM reports WHERE id = $1';
    const result = await query(text, [id]);
    return result.rowCount! > 0;
  }

  static async search(query_text: string): Promise<ServiceReport[]> {
    const text = `
      SELECT * FROM reports 
      WHERE title ILIKE $1 OR description ILIKE $1 OR service_name ILIKE $1
      ORDER BY created_at DESC
    `;
    const searchTerm = `%${query_text}%`;
    const result = await query(text, [searchTerm]);
    return result.rows;
  }

  static async getStats(): Promise<any> {
    const text = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as "inProgress",
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed
      FROM reports
    `;
    const result = await query(text);
    return result.rows[0];
  }
}
