import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { PostHogProvider } from "@/components/analytics/PostHogProvider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Plus Jakarta Sans en peso extra para titulares: geométrica, de bowls
// redondos y 'a' de doble piso, que es la voz del mockup — titulares que
// pesan y se aprietan, no editoriales. Inter se queda para interfaz/lectura.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://heystudy.app";
const DESCRIPTION = "Diagnóstico, plan de estudio y tutor IA personalizados para ti.";

// metadataBase es lo que permite que openGraph-image, canonical, etc. en
// cada page.tsx usen rutas relativas en vez de tener que repetir el
// dominio completo por página.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "HeyStudy",
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: "HeyStudy: Sabe qué estudiar, hoy",
    description: DESCRIPTION,
    url: "/",
    siteName: "HeyStudy",
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HeyStudy: Sabe qué estudiar, hoy",
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${inter.variable} ${jakarta.variable} h-full antialiased`}>
      <head>
        <link
          rel="stylesheet"
          href="https://db.onlinewebfonts.com/c/5ac3fe7c6abd2f62067f266d89671492?family=HelveticaNowDisplay-Medium"
        />
        <link
          rel="stylesheet"
          href="https://db.onlinewebfonts.com/c/1aa3377e489837a26d019bba501e779d?family=HelveticaNowDisplayW01-Rg"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster position="top-center" richColors />
        <Analytics />
        <PostHogProvider />
      </body>
    </html>
  );
}
