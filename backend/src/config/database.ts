import mongoose from 'mongoose';
import { config } from './index.js';

let connected = false;

export async function connectDatabase(): Promise<void> {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    connected = true;
    console.log('[database] MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    connected = false;
    console.error('[database] MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    connected = false;
    console.warn('[database] MongoDB disconnected');
  });

  try {
    await mongoose.connect(config.mongodbUri);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[database] Failed to connect to MongoDB:', message);
    throw new Error(`Database connection failed: ${message}`);
  }
}

export function isDatabaseConnected(): boolean {
  return connected;
}
