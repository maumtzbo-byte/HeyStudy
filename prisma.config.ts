import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Conexión directa (no pooled) — requerida por el CLI para migraciones.
    // Usamos process.env directo (no el helper `env()`) porque este archivo
    // se carga también para `prisma generate`, que no necesita conexión a la
    // base de datos y no debe fallar si DIRECT_URL todavía no está definida
    // (p. ej. en el primer build de un entorno nuevo como Vercel).
    url: process.env.DIRECT_URL,
  },
});
