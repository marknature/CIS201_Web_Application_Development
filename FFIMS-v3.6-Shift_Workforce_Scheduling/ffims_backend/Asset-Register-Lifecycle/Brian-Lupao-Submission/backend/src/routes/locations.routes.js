import express from 'express';
import { getLocations, createLocation, getLocationById, updateLocation, deleteLocation, getAssetsAtLocation, searchLocations } from '../controllers/locations.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { permit } from '../middleware/rbac.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/search', searchLocations);
router.get('/', getLocations);
router.post('/', permit('admin'), createLocation);
router.get('/:id', getLocationById);
router.put('/:id', permit('admin'), updateLocation);
router.delete('/:id', permit('admin'), deleteLocation);
router.get('/:id/assets', getAssetsAtLocation);

export default router;
