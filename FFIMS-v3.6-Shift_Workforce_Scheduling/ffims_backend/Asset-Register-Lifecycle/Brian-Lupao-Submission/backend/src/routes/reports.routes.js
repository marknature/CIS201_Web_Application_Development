import express from 'express';
import {
  getReportSummary,
  getMaintenanceCostReport,
  getAssetUtilizationReport,
  getAssetSummaryReport,
  getDepreciationReport,
  getTransferHistoryReport
} from '../controllers/reportController.js';
const router = express.Router();

router.get('/summary', getReportSummary);
router.get('/asset-summary', getAssetSummaryReport);
router.get('/depreciation', getDepreciationReport);
router.get('/maintenance', getMaintenanceCostReport);
router.get('/utilization', getAssetUtilizationReport);
router.get('/transfer-history', getTransferHistoryReport);

export default router;
