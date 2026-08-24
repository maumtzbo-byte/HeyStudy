import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://heystudy.app";

// El dashboard, onboarding y las rutas de auth/API son privadas por
// definición (requieren sesión) — no tiene caso que un buscador las indexe,
// y evita que aparezcan resultados vacíos o de "inicia sesión" en Google.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/onboarding", "/api", "/auth", "/verificar-correo"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
