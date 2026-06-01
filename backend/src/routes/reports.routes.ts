import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';

const router = Router();

router.get('/', ReportController.getAll);
router.get('/stats', ReportController.getStats);
router.get('/search', ReportController.search);
router.get('/:id', ReportController.getById);
router.post('/', ReportController.create);
router.put('/:id', ReportController.update);
router.delete('/:id', ReportController.delete);

export default router;
