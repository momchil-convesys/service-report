import { Router } from 'express';
import { PlantController } from '../controllers/plant.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, PlantController.getPlants);
router.get('/:id', requireAuth, PlantController.getPlantById);

export default router;
