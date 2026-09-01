import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

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
    <html lang="es" className="dark">
      <body className="min-h-screen bg-[#070A12] text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="border-t border-slate-800/60 py-8 text-center text-xs text-slate-500">
          <p>© 2026 The Palace Company · Dirección de Diseño y Experiencia</p>
          <p className="mt-1 text-slate-600">
            Sistema impulsado con Next.js 14, Supabase y Árbitro de Inteligencia Artificial
          </p>
        </footer>
      </body>
    </html>
  );
}
