import { Router } from 'express';
import { ServiceReportCmsController } from '../controllers/service-report-cms.controller';
import { requireAuth, requirePermission } from '../middleware/auth.middleware';

const router = Router();

router.use(requireAuth);

router.get('/list/:plantId/:deviceId', requirePermission('service-reports:view'), ServiceReportCmsController.list);
router.get('/list/:plantId', requirePermission('service-reports:view'), ServiceReportCmsController.list);
router.get('/list', requirePermission('service-reports:view'), ServiceReportCmsController.list);
router.get('/template', requirePermission('service-reports:manage'), ServiceReportCmsController.template);
router.get('/preview/:reportId', requirePermission('service-reports:view'), ServiceReportCmsController.preview);
router.get('/download/:reportId', requirePermission('service-reports:view'), ServiceReportCmsController.download);
router.get('/schemas/download-base64/:schemaId', requirePermission('service-reports:view'), ServiceReportCmsController.schemaDownloadBase64);
router.get('/schemas/download/:schemaId', requirePermission('service-reports:view'), ServiceReportCmsController.schemaDownload);
router.get('/schemas', requirePermission('service-reports:view'), ServiceReportCmsController.schemas);
router.post('/create', requirePermission('service-reports:manage'), ServiceReportCmsController.create);
router.put('/update', requirePermission('service-reports:manage'), ServiceReportCmsController.update);
router.delete('/:reportId', requirePermission('service-reports:delete'), ServiceReportCmsController.softDelete);
router.get('/', requirePermission('service-reports:view'), ServiceReportCmsController.getByQuery);

export default router;
