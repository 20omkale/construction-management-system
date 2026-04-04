// src/config/database.js
import pkg from '../../generated/prisma/index.js';
const { PrismaClient } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// Create connection pool
// connectionTimeoutMillis is generous to allow Neon cold-start wake-up (~5–15s)
const pool = new pg.Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 60000,
  ssl: {
    rejectUnauthorized: false,
  },
});

// IMPORTANT: Must use .on('error') — NOT a constructor option.
// Without this, idle-client errors crash the entire Node process.
pool.on('error', (err) => {
  console.error('⚠️  PostgreSQL Pool background error (non-fatal):', err.message);
});

const adapter = new PrismaPg(pool);

// Create Prisma client
const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

/**
 * Tests DB connection with exponential backoff retry.
 * Neon free tier can take 2–15s to wake up from suspension.
 * Returns true on success, false if all retries exhausted.
 */
export const testDatabaseConnection = async (retries = 5, delayMs = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.warn(
        `⚠️  DB connection attempt ${attempt}/${retries} failed: ${error.message}`,
      );

      if (attempt < retries) {
        const wait = delayMs * attempt; // 3s, 6s, 9s, 12s, 15s
        console.log(`🔄 Retrying in ${wait / 1000}s... (Neon may be waking up)`);
        await new Promise((resolve) => setTimeout(resolve, wait));
      } else {
        console.error(
          '❌ Database connection failed after all retries.\n' +
          '👉  ACTION REQUIRED: Go to https://console.neon.tech and:\n' +
          '    1. Check your project still exists\n' +
          '    2. Copy the fresh connection string from "Connection Details"\n' +
          '    3. Update DATABASE_URL in your .env file',
        );
        return false;
      }
    }
  }
  return false;
};

// Graceful shutdown
export const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    await pool.end();
    console.log('Database connections closed');
  } catch (error) {
    console.error('Error closing database connections:', error);
  }
};

export default prisma;