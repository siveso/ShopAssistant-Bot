import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.warn("⚠️  DATABASE_URL not found. Please provision a database through the Replit Database tab.");
  console.warn("⚠️  The application will continue running but database features will be disabled.");
  // Set a placeholder URL to prevent crashes during development
  process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/placeholder";
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });