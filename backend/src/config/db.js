import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/shivakali_temple';
  await mongoose.connect(uri);
  logger.info('MongoDB connected');
}
