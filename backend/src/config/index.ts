import dotenv from 'dotenv';

dotenv.config();

const corsOrigins = Array.from(
  new Set(
    [
      ...(process.env.CORS_ORIGIN || '').split(','),
      'http://localhost:4200',
      'http://127.0.0.1:4200',
    ]
      .map((origin) => origin.trim())
      .filter(Boolean),
  ),
);

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    database: process.env.DATABASE_NAME || 'service_report',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production',
    expiry: process.env.JWT_EXPIRY || '7d',
  },
  cors: {
    origin: corsOrigins,
  },
};
