import express from 'express';
import {
  getLifecycle,
  getAssetHistory,
  createLifecycle,
  updateLifecycle,
  predictLifecycleActions,
  allocateAsset,
  transferAsset,
  disposeAsset,
  getRecentTransactions,
} from '../controllers/lifecycle.controller.js';

const router = express.Router();

router.get('/recent', getRecentTransactions);
router.post('/allocate', allocateAsset);
router.post('/transfer', transferAsset);
router.post('/dispose', disposeAsset);
router.get('/:assetId/history', getAssetHistory);
router.get('/:assetId/predict', predictLifecycleActions);
router.get('/:assetId', getLifecycle);
router.post('/', createLifecycle);
router.put('/:transactionId', updateLifecycle);

export default router;
