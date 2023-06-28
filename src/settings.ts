export const ENV = {
  PORT: process.env.PORT || 5002,
  NODE_ENV: process.env.NODE_ENV || 'development',
  SENTRY_DSN: process.env.SENTRY_DSN,
  JWT_SECRET: process.env.JWT_SECRET,
  EMAIL_FROM: process.env.EMAIL_FROM,
  SMTP_HOST: process.env.SMTP_HOST,
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT),
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  FRONTEND_URL: process.env.FRONTEND_URL || `https://vital-educators.vercel.app`,
};

const cred = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};

export const S3Cred = {
  config: {
    region: process.env.AWS_REGION,
    credentials: cred,
  },
  S3: {
    ...cred,
    region: process.env.AWS_REGION,
  },
  bucket: process.env.AWS_S3_BUCKET_NAME,
  expires: 1000000,
};
