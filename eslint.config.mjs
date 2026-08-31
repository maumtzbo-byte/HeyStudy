import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Skills/plugins de terceros instalados vía `npx skills add` o
    // `claude plugin` — no son código de la app, no hace falta lintearlos.
    ".agents/**",
    ".claude/**",
  ]),
]);

export default eslintConfig;
