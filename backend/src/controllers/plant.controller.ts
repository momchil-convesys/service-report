import { Request, Response } from 'express';
import { PlantModel } from '../models/plant.model';

export class PlantController {
  static async getPlants(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authorization token is required' });
        return;
      }

      const plants = await PlantModel.findForUser(req.user);
      res.json(plants);
    } catch (error) {
      console.error('Get plants error:', error);
      res.status(500).json({ error: 'Failed to fetch plants' });
    }
  }

  static async getPlantById(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authorization token is required' });
        return;
      }

      const plant = await PlantModel.findByIdForUser(req.params.id, req.user);
      if (!plant) {
        res.status(404).json({ error: 'Plant not found' });
        return;
      }

      res.json(plant);
    } catch (error) {
      console.error('Get plant by ID error:', error);
      res.status(500).json({ error: 'Failed to fetch plant' });
    }
  }
}
