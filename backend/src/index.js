import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';
import authRoutes from './routes/auth.js';
import publicRoutes from './routes/public.js';
import bookingRoutes from './routes/bookings.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';
import offlineRoutes from './routes/offline.js';
import auditRoutes from './routes/audit.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:4200',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/offline', offlineRoutes);
app.use('/api/audit', auditRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }));

app.use(errorHandler);

const PORT = process.env.PORT || 5002;
connectDB().then(() => {
  app.listen(PORT, () => logger.info(`Shivakali Temple API running on port ${PORT}`));
});
