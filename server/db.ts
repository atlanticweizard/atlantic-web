import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "@shared/schema";

// Only initialize if DATABASE_URL is present
let dbInstance: ReturnType<typeof drizzle> | null = null;

if (process.env.DATABASE_URL) {
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  dbInstance = drizzle(pool, { schema });
} else {
  throw new Error("DATABASE_URL environment variable is required for database operations");
}

export const db = dbInstance;
