"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Award, ShieldAlert, Vote, BarChart3, PlusCircle, Sparkles, Key, Check } from "lucide-react";
import { CONVOCATORIA_ACTUAL } from "@/lib/supabase";

export function Navbar() {
  const pathname = usePathname();
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mmc_gemini_key") || "";
      setApiKey(saved);
    }
  }, []);

  const handleSaveKey = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mmc_gemini_key", apiKey.trim());
      setKeySaved(true);
      setTimeout(() => {
        setKeySaved(false);
        setShowKeyModal(false);
      }, 1200);
    }
  };

  const navItems = [
    { href: "/nominar", label: "Mesa Alta (Nominar)", icon: PlusCircle },
    { href: "/dashboard-mesa-alta", label: "Cuotas & Estado", icon: Award },
    { href: "/inhabilitaciones", label: "Comité & Comodines", icon: ShieldAlert },
    { href: "/votacion", label: "Votación (Borda)", icon: Vote },
    { href: "/resultados", label: "Resultados", icon: BarChart3 },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo & Marca */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 shadow-md shadow-amber-500/20">
              <span className="font-serif text-lg font-black text-slate-950">M</span>
              {/* 5 dots representing the 5 pillars */}
              <div className="absolute -bottom-1 flex gap-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E8903A]" title="Atención al Detalle" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#E8584A]" title="Hospitalidad Emocional" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#2A7D6F]" title="Anticipación" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#4A8BB5]" title="Trabajo en Equipo" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#7B6FA0]" title="Innovación" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors">
                  Monedas · Momentos de Color
                </span>
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/30">
                  {CONVOCATORIA_ACTUAL.ciclo}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">The Palace Company · Dirección de Diseño</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    isActive
                      ? "bg-slate-800 text-amber-300 shadow-inner border border-slate-700"
                      : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-amber-300 transition-colors"
              title="Configurar API Key del Árbitro IA"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Árbitro IA</span>
              {apiKey ? (
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-slate-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden overflow-x-auto px-4 py-2 border-t border-slate-800/50 bg-slate-950/60 gap-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
                  isActive
                    ? "bg-slate-800 text-amber-300 border border-slate-700"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Modal de Configuración de API Key para Árbitro IA */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Configuración del Árbitro IA</h3>
                <p className="text-xs text-slate-400">Google Gemini API / Cloudflare AI Key</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              El Árbitro IA audita automáticamente la alineación de las nominaciones contra los 5 pilares, analiza la evidencia y detecta posibles sesgos antes de la votación del comité.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Gemini API Key (Opcional — El sistema cuenta con motor local de respaldo):
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
                <Key className="absolute right-2.5 top-2.5 h-4 w-4 text-slate-500" />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="rounded-lg px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cerrar
              </button>
              <button
                onClick={handleSaveKey}
                className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
              >
                {keySaved ? (
                  <>
                    <Check className="h-4 w-4" /> Guardado
                  </>
                ) : (
                  "Guardar Key"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
