import { z } from 'zod';

export const backendEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  MONGODB_URI: z.string().url(),
  MONGODB_DB_NAME: z.string().min(1),
  REDIS_URL: z.string().url(),
  FRONTEND_URL: z.string().url(),
});

export type BackendEnv = z.infer<typeof backendEnvSchema>;

export const frontendEnvSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_WS_URL: z.string().url(),
});

export type FrontendEnv = z.infer<typeof frontendEnvSchema>;
