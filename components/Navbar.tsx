"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PlusCircle, Vote, User, LogOut } from "lucide-react";
import { CONVOCATORIA_ACTUAL } from "@/lib/supabase";
import { getUsuario, clearUsuario, type Usuario } from "@/lib/session";
import { getStoredNominaciones } from "@/lib/local-store";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [hayNominados, setHayNominados] = useState(false);

  useEffect(() => {
    setUsuario(getUsuario());
    setHayNominados(getStoredNominaciones().length > 0);
  }, [pathname]);

  const handleSalir = () => {
    clearUsuario();
    router.push("/");
  };

  const esMesaAlta = usuario?.rol === "mesa_alta";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">

        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-[#254D6E] shadow-sm">
            <span className="text-base font-bold text-white">M</span>
            <div className="absolute -bottom-1 flex gap-0.5">
              {["#E8903A","#E8584A","#2A7D6F","#4A8BB5","#7B6FA0"].map((c) => (
                <span key={c} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-slate-900 group-hover:text-[#254D6E] transition-colors">
                Monedas · Momentos de Color
              </span>
              <span className="rounded-full bg-[#B88F69]/10 px-2 py-0.5 text-[10px] font-medium text-[#B88F69] border border-[#B88F69]/30">
                {CONVOCATORIA_ACTUAL.ciclo}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">The Palace Company</p>
          </div>
        </Link>

        {/* Navegación y usuario */}
        <div className="flex items-center gap-2">
          {usuario ? (
            <>
              {/* Accesos según rol */}
              {esMesaAlta && (
                <Link
                  href="/nominar"
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    pathname === "/nominar"
                      ? "bg-[#B88F69]/10 text-[#B88F69] border border-[#B88F69]/30"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                  }`}
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Nominar
                </Link>
              )}

              <Link
                href={hayNominados ? "/votacion" : "#"}
                onClick={!hayNominados ? (e) => e.preventDefault() : undefined}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  !hayNominados
                    ? "text-slate-300 cursor-not-allowed border border-transparent"
                    : pathname === "/votacion"
                    ? "bg-[#2A7D6F]/10 text-[#2A7D6F] border border-[#2A7D6F]/30"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                }`}
                title={!hayNominados ? "Sin nominaciones aún" : ""}
              >
                <Vote className="h-3.5 w-3.5" />
                Votar
              </Link>

              {/* Chip de usuario */}
              <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span className="max-w-[120px] truncate text-xs font-medium text-slate-700">{usuario.nombre.split(" ")[0]}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                  esMesaAlta
                    ? "bg-[#B88F69]/15 text-[#B88F69]"
                    : "bg-[#4A8BB5]/15 text-[#4A8BB5]"
                }`}>
                  {esMesaAlta ? "MA" : "COM"}
                </span>
              </div>

              <button
                onClick={handleSalir}
                title="Cerrar sesión"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <Link
              href="/"
              className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              Ingresar
            </Link>
          )}
        </div>
      </div>

      {/* Mobile nav — solo si hay sesión */}
      {usuario && (
        <div className="flex sm:hidden items-center gap-2 overflow-x-auto px-4 py-2 border-t border-slate-100 bg-white">
          {esMesaAlta && (
            <Link
              href="/nominar"
              className={`flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
                pathname === "/nominar"
                  ? "bg-[#B88F69]/10 text-[#B88F69] border border-[#B88F69]/30"
                  : "text-slate-500 border border-slate-200"
              }`}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Nominar
            </Link>
          )}
          <Link
            href={hayNominados ? "/votacion" : "#"}
            onClick={!hayNominados ? (e) => e.preventDefault() : undefined}
            className={`flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
              !hayNominados
                ? "text-slate-300 border border-slate-100 cursor-not-allowed"
                : pathname === "/votacion"
                ? "bg-[#2A7D6F]/10 text-[#2A7D6F] border border-[#2A7D6F]/30"
                : "text-slate-500 border border-slate-200"
            }`}
          >
            <Vote className="h-3.5 w-3.5" />
            Votar
          </Link>
        </div>
      )}
    </header>
  );
}
