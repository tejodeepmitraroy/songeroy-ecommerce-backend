export default () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8000', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',

  database: {
    url: process.env.DATABASE_URL,
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    admin: {
      accessSecret: process.env.ADMIN_JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET,
      accessExpiresIn:
        process.env.ADMIN_JWT_ACCESS_EXPIRES_IN || process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      refreshSecret: process.env.ADMIN_JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET,
      refreshExpiresIn:
        process.env.ADMIN_JWT_REFRESH_EXPIRES_IN || process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      audience: process.env.ADMIN_JWT_AUDIENCE || 'admin-api',
      issuer: process.env.ADMIN_JWT_ISSUER || 'songeroy-backend',
    },
    store: {
      accessSecret: process.env.STORE_JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET,
      accessExpiresIn:
        process.env.STORE_JWT_ACCESS_EXPIRES_IN || process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      refreshSecret: process.env.STORE_JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET,
      refreshExpiresIn:
        process.env.STORE_JWT_REFRESH_EXPIRES_IN || process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      audience: process.env.STORE_JWT_AUDIENCE || 'store-api',
      issuer: process.env.STORE_JWT_ISSUER || 'songeroy-backend',
    },
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },

  cors: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    adminUrl: process.env.ADMIN_URL || 'http://localhost:3001',
  },

  payment: {
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID,
      keySecret: process.env.RAZORPAY_KEY_SECRET,
      webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
    },
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    },
  },

  storage: {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucket: process.env.AWS_S3_BUCKET,
  },

  mail: {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    user: process.env.MAIL_USER,
    password: process.env.MAIL_PASSWORD,
    from: process.env.MAIL_FROM,
  },
});
