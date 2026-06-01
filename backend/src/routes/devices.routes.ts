import { Router } from 'express';
import { DeviceController } from '../controllers/device.controller';

const router = Router();

// Create a new device
router.post('/', DeviceController.createDevice);

// Get all devices with optional filters
router.get('/', DeviceController.getAllDevices);

// Get device statistics
router.get('/statistics/all', DeviceController.getDeviceStatistics);

// Get a specific device by ID
router.get('/:id', DeviceController.getDeviceById);

// Update a device
router.put('/:id', DeviceController.updateDevice);

// Delete a device
router.delete('/:id', DeviceController.deleteDevice);

export default router;
