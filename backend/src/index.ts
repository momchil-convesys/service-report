import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { config } from './config';
import authRoutes from './routes/auth.routes';
import reportsRoutes from './routes/reports.routes';
import devicesRoutes from './routes/devices.routes';
import plantsRoutes from './routes/plants.routes';
import serviceReportsCmsRoutes from './routes/service-reports-cms.routes';
import { errorHandler, notFound } from './middleware/error.middleware';

const app: Express = express();

// Middleware
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const schemaAssetsPath = path.resolve(__dirname, '../cms-api-win-x64-09-04-2025-01 (4)/res/schemas');
if (fs.existsSync(schemaAssetsPath)) {
  app.use('/res/schemas', express.static(schemaAssetsPath));
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Service Report API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', authRoutes);
app.use('/api/plants', plantsRoutes);
app.use('/api/devices', devicesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/service-reports', serviceReportsCmsRoutes);

const frontendDistPath = path.resolve(__dirname, '../../frontend/dist/service-report-frontend');
if (fs.existsSync(frontendDistPath)) {
  app.use(
    express.static(frontendDistPath, {
      etag: false,
      index: false,
      maxAge: 0,
      setHeaders: (res) => {
        res.setHeader('Cache-Control', 'no-store');
      },
    }),
  );
  app.get('*', (req: Request, res: Response, next) => {
    if (req.path.startsWith('/api/')) {
      next();
      return;
    }

    res.setHeader('Cache-Control', 'no-store');
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Database: ${config.database.database}@${config.database.host}:${config.database.port}`);
});

const shouldServeFrontendOnDevPort = process.env.SERVE_FRONTEND_ON_DEV_PORT === 'true';
const FRONTEND_PORT = 4200;
const frontendServer =
  shouldServeFrontendOnDevPort && fs.existsSync(frontendDistPath) && PORT !== FRONTEND_PORT
    ? app.listen(FRONTEND_PORT, '127.0.0.1', () => {
        console.log(`Frontend is running on http://127.0.0.1:${FRONTEND_PORT}`);
      })
    : undefined;

process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => {
    frontendServer?.close(() => process.exit(1));
    if (!frontendServer) {
      process.exit(1);
    }
  });
});

export default app;
