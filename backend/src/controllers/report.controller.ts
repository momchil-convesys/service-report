import { Request, Response } from 'express';
import { ReportModel, ServiceReport } from '../models/report.model';

export class ReportController {
  static async getAll(req: Request, res: Response) {
    try {
      const { status, priority } = req.query;
      const filter = {
        status: status as string,
        priority: priority as string,
      };

      const reports = await ReportModel.findAll(filter);
      res.json({
        success: true,
        data: reports,
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching reports',
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const report = await ReportModel.findById(id);

      if (!report) {
        return res.status(404).json({
          success: false,
          error: 'Report not found',
        });
      }

      res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      console.error('Error fetching report:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching report',
      });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { title, description, service_name, status, priority, assigned_to, notes } = req.body;

      if (!title || !description || !service_name) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
        });
      }

      const report = await ReportModel.create({
        title,
        description,
        service_name,
        status,
        priority,
        assigned_to,
        notes,
      });

      res.status(201).json({
        success: true,
        data: report,
      });
    } catch (error) {
      console.error('Error creating report:', error);
      res.status(500).json({
        success: false,
        error: 'Error creating report',
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const report = await ReportModel.findById(id);
      if (!report) {
        return res.status(404).json({
          success: false,
          error: 'Report not found',
        });
      }

      const updatedReport = await ReportModel.update(id, updateData);

      res.json({
        success: true,
        data: updatedReport,
      });
    } catch (error) {
      console.error('Error updating report:', error);
      res.status(500).json({
        success: false,
        error: 'Error updating report',
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const report = await ReportModel.findById(id);
      if (!report) {
        return res.status(404).json({
          success: false,
          error: 'Report not found',
        });
      }

      await ReportModel.delete(id);

      res.json({
        success: true,
        message: 'Report deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting report:', error);
      res.status(500).json({
        success: false,
        error: 'Error deleting report',
      });
    }
  }

  static async search(req: Request, res: Response) {
    try {
      const { search } = req.query;

      if (!search) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required',
        });
      }

      const reports = await ReportModel.search(search as string);

      res.json({
        success: true,
        data: reports,
      });
    } catch (error) {
      console.error('Error searching reports:', error);
      res.status(500).json({
        success: false,
        error: 'Error searching reports',
      });
    }
  }

  static async getStats(req: Request, res: Response) {
    try {
      const stats = await ReportModel.getStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching stats',
      });
    }
  }
}
