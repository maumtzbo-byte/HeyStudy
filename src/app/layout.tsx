import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { PostHogProvider } from "@/components/analytics/PostHogProvider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

// Bricolage Grotesque para display. Tres razones, en orden de peso:
//
// 1. Licencia y entrega. Sustituye a Helvetica Now, que se cargaba desde un
//    CDN que redistribuye tipografías comerciales sin licencia del fundidor
//    y además bloqueaba el render de la única página pública. next/font la
//    autoaloja en build: cero terceros en runtime, cero CLS.
// 2. Español. Variable con subset latin-ext, así que acentos, ñ y los
//    signos invertidos ¿ ¡ están dibujados, no parcheados. El copy de este
//    producto es 100% español mexicano.
// 3. Carácter. Sus terminaciones y su contraste irregular la separan de la
//    grotesca neutra por default, que es justo lo que hace que un producto
//    de IA se vea igual a los demás.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "latin-ext"],
  display: "swap",
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
    <html lang="es" className={`${inter.variable} ${bricolage.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster position="top-center" richColors />
        <Analytics />
        <PostHogProvider />
      </body>
    </html>
  );
}
