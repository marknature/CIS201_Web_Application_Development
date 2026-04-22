import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDb from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import chatRoutes from './routes/chat.routes.js';
import assetsRoutes from './routes/assets.routes.js';
import usersRoutes from './routes/users.routes.js';
import lifecycleRoutes from './routes/lifecycle.routes.js';
import depreciationRoutes from './routes/depreciation.routes.js';
import documentsRoutes from './routes/documents.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import auditLogsRoutes from './routes/audit-logs.routes.js';
import categoriesRoutes from './routes/categories.routes.js';
import locationsRoutes from './routes/locations.routes.js';
import { authMiddleware } from './middleware/auth.middleware.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();
const app = express();

const trustedVercelOriginPatterns = [
  /^https:\/\/(?:ffims-module-2-frontend|fleets-and-facility-asset-register)(?:-[a-z0-9-]+)?\.vercel\.app$/i,
];

const allowedOrigins = Array.from(new Set([
  ...(process.env.CORS_ORIGIN?.split(',') || []).map((origin) => origin.trim()),
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
])).filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    const matchesTrustedPreview = trustedVercelOriginPatterns.some((pattern) => pattern.test(origin));

    if (allowedOrigins.includes(origin) || matchesTrustedPreview) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/assets', authMiddleware, assetsRoutes);
app.use('/api/v1/lifecycle', authMiddleware, lifecycleRoutes);
app.use('/api/v1/depreciation', authMiddleware, depreciationRoutes);
app.use('/api/v1/documents', authMiddleware, documentsRoutes);
app.use('/api/v1/reports', authMiddleware, reportsRoutes);
app.use('/api/v1/audit-logs', authMiddleware, auditLogsRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/locations', locationsRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDb().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((err) => {
  console.error('Failed to connect DB', err);
});

