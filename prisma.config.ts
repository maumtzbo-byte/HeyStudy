import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Conexión directa (no pooled) — requerida por el CLI para migraciones.
    url: env("DIRECT_URL"),
  },
});
