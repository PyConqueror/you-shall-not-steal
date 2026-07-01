import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().trim().min(1).default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(3001),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  CORS_ORIGIN: z.string().trim().min(1).default("http://localhost:5173"),
  MONGODB_URI: z.string().trim().min(1, "MONGODB_URI is required."),
  MONGODB_DB_NAME: z.string().trim().min(1, "MONGODB_DB_NAME is required."),
  MONGODB_SERVER_SELECTION_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(5000),
  JWT_SECRET: z
    .string()
    .trim()
    .min(32, "JWT_SECRET must be at least 32 characters long."),
  AGENT_JWT_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  RESEND_API_KEY: z
    .string()
    .trim()
    .min(1, "RESEND_API_KEY cannot be empty.")
    .optional(),
  RESEND_FROM_EMAIL: z
    .string()
    .trim()
    .email("RESEND_FROM_EMAIL must be a valid email address.")
    .optional(),
});

export type Env = z.infer<typeof envSchema>;

async function resolveEnv(rawEnv: NodeJS.ProcessEnv = process.env): Promise<Env> {
  return envSchema.parse(rawEnv);
}

export async function loadEnv(rawEnv: NodeJS.ProcessEnv = process.env): Promise<Env> {
  return resolveEnv(rawEnv);
}
