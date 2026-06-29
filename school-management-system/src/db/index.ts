import * as dotenv from 'dotenv';
dotenv.config();

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

// Function to create a new connection pool.
export const createPool = () => {
  let dbUrl = process.env.SUPABASE_POSTGRES_URL || process.env.DATABASE_URL;
  if (dbUrl) {
    // Strip leading and trailing single/double quotes if present
    dbUrl = dbUrl.trim().replace(/^['"]|['"]$/g, '');
  }
  
  if (dbUrl && (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://'))) {
    console.log('Database running in external URL mode (e.g. Supabase)');
    return new Pool({
      connectionString: dbUrl,
      connectionTimeoutMillis: 15000,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  
  console.log(`Database running in Cloud SQL mode with user: ${process.env.SQL_USER || 'none'}`);
  return new Pool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    connectionTimeoutMillis: 15000,
    ssl: false,
  });
};

// Create a pool instance.
const pool = createPool();

// Prevent unhandled pool-level errors from crashing the application
pool.on('error', (err) => {
  console.error('Unexpected error on idle SQL pool client:', err);
});

// Initialize Drizzle with the pool and schema.
export const db = drizzle(pool, { schema });
export { schema };
