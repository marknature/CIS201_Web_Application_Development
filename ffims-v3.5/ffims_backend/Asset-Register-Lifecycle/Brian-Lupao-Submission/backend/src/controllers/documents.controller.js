import AssetDocument from '../models/AssetDocument.js';
import AuditLog from '../models/AuditLog.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = 'uploads';

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/png', 'image/jpeg'];
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE }
});

const VALID_DOCUMENT_TYPES = ['invoice', 'contract', 'report', 'manual', 'warranty', 'certificate', 'general'];

export const uploadDocument = [
  upload.single('document'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const { assetId, documentType, description } = req.body;

      if (!assetId) {
        return res.status(400).json({ success: false, message: 'Asset ID is required' });
      }

      const normalizedDocumentType = VALID_DOCUMENT_TYPES.includes(documentType) ? documentType : 'general';

      const document = await AssetDocument.create({
        assetId,
        documentType: normalizedDocumentType,
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: path.join(UPLOADS_DIR, req.file.filename),
        size: req.file.size,
        mimeType: req.file.mimetype,
        description: description || ''
      });

      await AuditLog.create({
        action: 'DOCUMENT_UPLOADED',
        entityType: 'AssetDocument',
        entityId: document._id,
        userId: req.user?.id || 'system',
        changes: { filename: req.file.originalname, documentType, assetId }
      });

      res.status(201).json({ success: true, data: document });
    } catch (error) {
      if (req.file) {
        const filePath = path.join(UPLOADS_DIR, req.file.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      next(error);
    }
  }
];

export const getDocuments = async (req, res, next) => {
  try {
    const { assetId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    if (!assetId) {
      return res.status(400).json({ success: false, message: 'Asset ID is required' });
    }

    const documents = await AssetDocument.find({ assetId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await AssetDocument.countDocuments({ assetId });

    res.json({
      success: true,
      data: {
        documents,
        pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getDocumentById = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const document = await AssetDocument.findById(documentId);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
};

export const updateDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { documentType, description } = req.body;

    const document = await AssetDocument.findById(documentId);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const oldValues = { documentType: document.documentType, description: document.description };
    const changes = {};

    if (documentType && documentType !== document.documentType) {
      if (!VALID_DOCUMENT_TYPES.includes(documentType)) {
        return res.status(400).json({ success: false, message: `Invalid document type. Valid types: ${VALID_DOCUMENT_TYPES.join(', ')}` });
      }
      changes.documentType = { old: document.documentType, new: documentType };
      document.documentType = documentType;
    }

    if (description !== undefined && description !== document.description) {
      changes.description = { old: document.description, new: description };
      document.description = description;
    }

    await document.save();

    if (Object.keys(changes).length > 0) {
      await AuditLog.create({
        action: 'DOCUMENT_UPDATED',
        entityType: 'AssetDocument',
        entityId: document._id,
        userId: req.user?.id || 'system',
        changes
      });
    }

    res.json({ success: true, data: document });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const document = await AssetDocument.findById(documentId);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const filePath = document.path;
    await AssetDocument.findByIdAndDelete(documentId);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await AuditLog.create({
      action: 'DOCUMENT_DELETED',
      entityType: 'AssetDocument',
      entityId: documentId,
      userId: req.user?.id || 'system',
      changes: { deletedFile: document.originalName }
    });

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const downloadDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const document = await AssetDocument.findById(documentId);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const filePath = path.resolve(document.path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server' });
    }

    await AuditLog.create({
      action: 'DOCUMENT_DOWNLOADED',
      entityType: 'AssetDocument',
      entityId: document._id,
      userId: req.user?.id || 'system',
      changes: { filename: document.originalName }
    });

    res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Length', document.size);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (err) => {
      next(err);
    });
  } catch (error) {
    next(error);
  }
};

export const getAllDocuments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [documents, total] = await Promise.all([
      AssetDocument.find()
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('assetId', 'name assetTag'),
      AssetDocument.countDocuments()
    ]);

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const searchDocuments = async (req, res, next) => {
  try {
    const { q, type, page = 1, limit = 20 } = req.query;

    const query = {};

    if (q) {
      query.$or = [
        { originalName: { $regex: q, $options: 'i' } },
        { filename: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    if (type && VALID_DOCUMENT_TYPES.includes(type)) {
      query.documentType = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [documents, total] = await Promise.all([
      AssetDocument.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('assetId', 'name assetTag'),
      AssetDocument.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const uploadMiddleware = upload;