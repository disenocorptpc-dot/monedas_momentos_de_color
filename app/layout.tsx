import type { Metadata } from "next";
import localFont from "next/font/local";
import { Navbar } from "@/components/Navbar";
import { AutoSyncRescue } from "@/components/AutoSyncRescue";
import "./globals.css";

/* ════════════════════════════════════════════════════════════════
   TIPOGRAFÍA OFICIAL THE PALACE COMPANY
   Archivos en app/fonts (woff2 generados desde los OTF de marca;
   los OTF originales quedan en design_system/fuentes_otf).

   Freight Text     → titulares, diplomas, editorial   (font-serif)
   Freight Sans Pro → datos, tablas, interfaz          (font-sans)
   ════════════════════════════════════════════════════════════════ */
const fontDisplay = localFont({
  variable: "--font-display",
  display: "swap",
  src: [
    { path: "./fonts/FreightText-Light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/FreightText-LightItalic.woff2", weight: "300", style: "italic" },
    { path: "./fonts/FreightText-Book.woff2", weight: "400", style: "normal" },
    { path: "./fonts/FreightText-BookItalic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/FreightText-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/FreightText-MediumItalic.woff2", weight: "500", style: "italic" },
    { path: "./fonts/FreightText-Bold.woff2", weight: "700", style: "normal" },
  ],
});

const fontSans = localFont({
  variable: "--font-sans",
  display: "swap",
  src: [
    { path: "./fonts/FreightSansPro-Book.woff2", weight: "400", style: "normal" },
    { path: "./fonts/FreightSansPro-BookItalic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/FreightSansPro-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/FreightSansPro-Semibold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/FreightSansPro-Bold.woff2", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://monedas-momentos-de-color.pages.dev"),
  title: {
    default: "Monedas · Momentos de Color — The Palace Company",
    template: "%s | Monedas · Momentos de Color",
  },
  description:
    "Programa de Reconocimiento al Talento Humano · Dirección de Diseño y Experiencia. Sistema oficial de votación, resultados y diplomas conmemorativos.",
  applicationName: "Monedas Momentos de Color",
  authors: [{ name: "The Palace Company" }],
  creator: "The Palace Company · Dirección de Diseño y Experiencia",
  publisher: "The Palace Company",
  keywords: [
    "The Palace Company",
    "Momentos de Color",
    "Monedas",
    "Reconocimiento",
    "Talento Humano",
    "Premios Borda",
    "Diplomas",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "https://monedas-momentos-de-color.pages.dev",
    siteName: "Monedas · Momentos de Color",
    title: "Monedas · Momentos de Color — The Palace Company",
    description:
      "Programa de Reconocimiento al Talento Humano · Dirección de Diseño y Experiencia. Votaciones, escrutinio y diplomas oficiales de excelencia.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Monedas · Momentos de Color — The Palace Company",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Monedas · Momentos de Color — The Palace Company",
    description:
      "Programa de Reconocimiento al Talento Humano · Dirección de Diseño y Experiencia. Sistema oficial de reconocimiento y diplomas condecorativos.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${fontDisplay.variable} ${fontSans.variable}`}>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-[#B88F69]/25 selection:text-slate-900">
        <Navbar />
        <AutoSyncRescue />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-400">
          <p className="font-medium text-slate-500">© 2026 The Palace Company · Dirección de Diseño y Experiencia</p>
          <p className="mt-1 text-slate-400">
            Sistema impulsado con Next.js 14, Supabase y Árbitro de Inteligencia Artificial
          </p>
        </footer>
      </body>
    </html>
  );
}
