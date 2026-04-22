import { body, param, query, validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

export const validateRequest = (validations) => async (req, res, next) => {
  await Promise.all(validations.map(validation => validation.run(req)));
  handleValidationErrors(req, res, next);
};

export const validateAssetCreate = [
  body('assetTag')
    .trim()
    .notEmpty().withMessage('Asset tag is required')
    .isString().withMessage('Asset tag must be a string'),
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isString().withMessage('Name must be a string')
    .isLength({ min: 2, max: 200 }).withMessage('Name must be between 2 and 200 characters'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isString().withMessage('Category must be a string'),
  body('description')
    .optional()
    .trim()
    .isString().withMessage('Description must be a string')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('serialNumber')
    .optional()
    .trim()
    .isString().withMessage('Serial number must be a string'),
  body('purchaseDate')
    .optional()
    .isISO8601().withMessage('Purchase date must be a valid date')
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error('Purchase date cannot be in the future');
      }
      return true;
    }),
  body('purchasePrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Purchase price must be a positive number'),
  body('location')
    .optional()
    .trim()
    .isString().withMessage('Location must be a string'),
  body('status')
    .optional()
    .isIn(['active', 'in repair', 'retired', 'disposed', 'lost']).withMessage('Invalid status value'),
  body('assignedTo')
    .optional()
    .isMongoId().withMessage('Assigned user must be a valid ID'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags && tags.some(tag => typeof tag !== 'string')) {
        throw new Error('All tags must be strings');
      }
      return true;
    }),
  handleValidationErrors
];

export const validateAssetUpdate = [
  param('id')
    .isMongoId().withMessage('Invalid asset ID'),
  body('name')
    .optional()
    .trim()
    .isString().withMessage('Name must be a string')
    .isLength({ min: 2, max: 200 }).withMessage('Name must be between 2 and 200 characters'),
  body('category')
    .optional()
    .trim()
    .isString().withMessage('Category must be a string'),
  body('description')
    .optional()
    .trim()
    .isString().withMessage('Description must be a string')
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('serialNumber')
    .optional()
    .trim()
    .isString().withMessage('Serial number must be a string'),
  body('purchaseDate')
    .optional()
    .isISO8601().withMessage('Purchase date must be a valid date')
    .custom((value) => {
      if (value && new Date(value) > new Date()) {
        throw new Error('Purchase date cannot be in the future');
      }
      return true;
    }),
  body('purchasePrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Purchase price must be a positive number'),
  body('location')
    .optional()
    .trim()
    .isString().withMessage('Location must be a string'),
  body('status')
    .optional()
    .isIn(['active', 'in repair', 'retired', 'disposed', 'lost']).withMessage('Invalid status value'),
  body('assignedTo')
    .optional()
    .isMongoId().withMessage('Assigned user must be a valid ID'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags && tags.some(tag => typeof tag !== 'string')) {
        throw new Error('All tags must be strings');
      }
      return true;
    }),
  handleValidationErrors
];

export const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isString().withMessage('Name must be a string')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'user']).withMessage('Invalid role'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

export const validateUpload = (options = {}) => {
  const {
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 
                     'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxSize = 10 * 1024 * 1024
  } = options;

  return [
    body('file')
      .custom((value, { req }) => {
        if (!req.file) {
          throw new Error('File is required');
        }
        return true;
      }),
    body('file.mimetype')
      .custom((value, { req }) => {
        if (!allowedTypes.includes(req.file?.mimetype)) {
          throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
        }
        return true;
      }),
    body('file.size')
      .custom((value, { req }) => {
        if (req.file?.size > maxSize) {
          throw new Error(`File size exceeds maximum limit of ${maxSize / 1024 / 1024}MB`);
        }
        return true;
      }),
    handleValidationErrors
  ];
};

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),
  query('sort')
    .optional()
    .isString().withMessage('Sort must be a string')
    .custom((value) => {
      if (value && !/^-?[a-zA-Z_]+$/.test(value)) {
        throw new Error('Sort must contain only letters and optional minus prefix');
      }
      return true;
    }),
  query('order')
    .optional()
    .isIn(['asc', 'desc', 'ascending', 'descending']).withMessage('Order must be asc or desc'),
  handleValidationErrors
];

export const validateMongoId = [
  param('id')
    .isMongoId().withMessage('Invalid ID format'),
  handleValidationErrors
];