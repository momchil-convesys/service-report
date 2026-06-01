import { Pool, PoolClient } from 'pg';
import { config } from './index';

const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const getClient = async (): Promise<PoolClient> => {
  return pool.connect();
};

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Database query error', { text, error });
    throw error;
  }
};

export default pool;
