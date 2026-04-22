import express from 'express';
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  downloadDocument,
  getAllDocuments,
  searchDocuments,
} from '../controllers/documents.controller.js';

const router = express.Router();

router.post('/upload', uploadDocument);
router.get('/search', searchDocuments);
router.get('/all', getAllDocuments);
router.get('/:documentId/id', getDocumentById);
router.put('/:documentId', updateDocument);
router.delete('/:documentId', deleteDocument);
router.get('/:documentId/download', downloadDocument);
router.get('/:assetId', getDocuments);

export default router;
