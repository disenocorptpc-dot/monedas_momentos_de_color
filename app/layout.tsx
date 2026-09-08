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
  title: "Monedas · Momentos de Color — The Palace Company",
  description: "Programa de Reconocimiento al Talento Humano · Dirección de Diseño y Experiencia",
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
