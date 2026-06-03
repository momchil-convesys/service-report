import { Router } from 'express';
import { AdminAssetsController } from '../controllers/admin-assets.controller';
import { requireAuth, requirePermission } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);
router.use(requirePermission('admin:manage'));

router.post('/plants', AdminAssetsController.createPlant);
router.post('/devices', AdminAssetsController.createDevice);
router.post('/plant-clients', AdminAssetsController.addClientToPlant);

export default router;
