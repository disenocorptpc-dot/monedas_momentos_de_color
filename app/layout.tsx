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
    <html lang="es">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-[#B88F69]/25 selection:text-slate-900">
        <Navbar />
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
