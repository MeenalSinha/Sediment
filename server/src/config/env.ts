import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  webOrigin: process.env.WEB_ORIGIN ?? "http://localhost:5173",

  databaseUrl: process.env.DATABASE_URL ?? "postgresql://sediment:sediment@localhost:5432/sediment",
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",

  reddit: {
    clientId: process.env.REDDIT_CLIENT_ID ?? "",
    clientSecret: process.env.REDDIT_CLIENT_SECRET ?? "",
    redirectUri: process.env.REDDIT_REDIRECT_URI ?? "http://localhost:4000/api/auth/reddit/callback",
    userAgent: process.env.REDDIT_USER_AGENT ?? "web:sediment:v0.1.0",
  },

  session: {
    secret: process.env.SESSION_SECRET ?? "dev-only-secret-change-me",
    jwtSecret: process.env.JWT_SECRET ?? "dev-only-jwt-secret-change-me",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? "",
    model: process.env.OPENAI_MODEL ?? "gpt-5.5",
  },

  storage: {
    provider: (process.env.STORAGE_PROVIDER as "supabase" | "cloudinary") ?? "supabase",
    supabase: {
      url: process.env.SUPABASE_URL ?? "",
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
      bucket: process.env.SUPABASE_BUCKET ?? "sediment-artifacts",
    },
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
      apiKey: process.env.CLOUDINARY_API_KEY ?? "",
      apiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
    },
  },
};

export { required };
