import { Router } from 'express';
import { AdminAssetsController } from '../controllers/admin-assets.controller';
import { requireAuth, requirePermission } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);
router.use(requirePermission('admin:manage'));

router.post('/plants', AdminAssetsController.createPlant);
router.delete('/plants/:plantId', AdminAssetsController.deletePlant);
router.post('/devices', AdminAssetsController.createDevice);
router.get('/clients', AdminAssetsController.listClients);
router.post('/clients', AdminAssetsController.createClient);
router.delete('/clients/:clientId', AdminAssetsController.deleteClient);
router.post('/plant-clients', AdminAssetsController.addClientToPlant);

export default router;
