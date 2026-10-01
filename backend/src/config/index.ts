import dotenv from 'dotenv';

dotenv.config();

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '5000', 10),
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',

  mongodbUri: (process.env.NODE_ENV === 'test' && process.env.MONGODB_TEST_URI)
    ? process.env.MONGODB_TEST_URI
    : required('MONGODB_URI', 'mongodb://localhost:27017/mern_blog'),

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET', 'dev-access-secret-change-me'),
    refreshSecret: required('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-me'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10),
  },

  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      callbackUrl: process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:5000/api/v1/auth/google/callback',
    },
    facebook: {
      appId: process.env.FACEBOOK_APP_ID ?? '',
      appSecret: process.env.FACEBOOK_APP_SECRET ?? '',
      callbackUrl: process.env.FACEBOOK_CALLBACK_URL ?? 'http://localhost:5000/api/v1/auth/facebook/callback',
    },
  },

  isProduction: process.env.NODE_ENV === 'production',
} as const;
