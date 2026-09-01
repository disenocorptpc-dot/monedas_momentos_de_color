"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Award,
  ShieldAlert,
  Vote,
  BarChart3,
  PlusCircle,
  Sparkles,
  ChevronRight,
  Users,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  CONVOCATORIA_ACTUAL,
  COORDINACIONES_INICIALES,
  PILARES_INICIALES,
  Nominacion,
  ComiteInhabilitacion,
} from "@/lib/supabase";
import {
  getStoredNominaciones,
  getStoredInhabilitaciones,
  getStoredVotos,
  getStoredComite,
} from "@/lib/local-store";
import { formatPilarBadgeColor } from "@/lib/utils";

export default function HomePage() {
  const [nominaciones, setNominaciones] = useState<Nominacion[]>([]);
  const [inhabilitaciones, setInhabilitaciones] = useState<ComiteInhabilitacion[]>([]);
  const [totalVotos, setTotalVotos] = useState(0);
  const [comiteTotal, setComiteTotal] = useState(6);

  useEffect(() => {
    setNominaciones(getStoredNominaciones());
    setInhabilitaciones(getStoredInhabilitaciones());
    setTotalVotos(getStoredVotos().length);
    setComiteTotal(getStoredComite().filter((c) => c.es_titular && c.activo).length);
  }, []);

  const votantesInhabilitados = inhabilitaciones.length;
  const quorumActual = comiteTotal - votantesInhabilitados;

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-b from-slate-900 via-slate-950 to-[#070A12] p-8 sm:p-12 shadow-2xl">
        <div className="absolute right-0 top-0 -mt-16 -mr-16 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            Programa de Reconocimiento al Talento Humano
          </div>
          <h1 className="font-serif text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Monedas · <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600 bg-clip-text text-transparent">Momentos de Color</span>
          </h1>
          <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
            Plataforma oficial de The Palace Company para visibilizar y celebrar la excelencia en el servicio, evaluada con arbitraje de Inteligencia Artificial y votación Borda del comité interdepartamental.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-4">
            <Link
              href="/nominar"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-amber-500 transition-all"
            >
              <PlusCircle className="h-4 w-4" />
              Postular Colaborador (Mesa Alta)
            </Link>
            <Link
              href="/votacion"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-all"
            >
              <Vote className="h-4 w-4 text-sky-400" />
              Mesa de Votación Comité
            </Link>
          </div>
        </div>
      </section>

      {/* Los 5 Pilares de Reconocimiento */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Los 5 Pilares de Excelencia
          </h2>
          <span className="text-xs text-slate-400">Selección múltiple (1 a 3 por nominación)</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {PILARES_INICIALES.map((pilar) => (
            <div
              key={pilar.clave}
              className="glass-card flex flex-col justify-between rounded-2xl p-4 border border-slate-800/80 hover:border-slate-700 transition-all group"
            >
              <div className="space-y-2">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] ${formatPilarBadgeColor(pilar.clave)}`}>
                  {pilar.nombre}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed group-hover:text-slate-100 transition-colors">
                  {pilar.descripcion}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Monitor de Estado del Ciclo Activo */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Nominaciones Recibidas</p>
            <p className="text-2xl font-black text-white">{nominaciones.length}</p>
            <p className="text-[11px] text-amber-400 font-medium">Ciclo: {CONVOCATORIA_ACTUAL.ciclo}</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Quórum del Comité</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white">
                {quorumActual} / {comiteTotal}
              </span>
              {quorumActual >= 4 ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Quórum Válido
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                  <AlertTriangle className="h-3.5 w-3.5" /> Requiere Suplente
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">Mínimo 4 integrantes requeridos</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Árbitro de Inteligencia Artificial</p>
            <p className="text-2xl font-black text-white">Activo</p>
            <p className="text-[11px] text-purple-300 font-medium">Auditoría semántica y anti-sesgo</p>
          </div>
        </div>
      </section>

      {/* Módulos Principales del Sistema */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">Accesos a las 5 Pantallas del Sistema</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Tarjeta 1: Nominación */}
          <Link
            href="/nominar"
            className="glass-card rounded-2xl p-6 border border-slate-800/80 hover:border-amber-500/40 hover:bg-slate-900/90 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <PlusCircle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                1. Formulario de Nominación
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Mesa Alta postula colaboradores con selección de 1 a 3 pilares, relato $\ge 80$ caracteres, compresión de fotos y análisis de IA en tiempo real.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-amber-400">
              Ir a Postulación <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          {/* Tarjeta 2: Dashboard Mesa Alta */}
          <Link
            href="/dashboard-mesa-alta"
            className="glass-card rounded-2xl p-6 border border-slate-800/80 hover:border-sky-500/40 hover:bg-slate-900/90 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                2. Cuotas de Coordinaciones
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Seguimiento de cuotas diferenciadas (Taller y Operaciones tienen 2 nominaciones; resto 1) y lista de postulaciones del ciclo.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-sky-400">
              Ver Cuotas <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          {/* Tarjeta 3: Inhabilitaciones & Comodines */}
          <Link
            href="/inhabilitaciones"
            className="glass-card rounded-2xl p-6 border border-slate-800/80 hover:border-rose-500/40 hover:bg-slate-900/90 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
                3. Comité, Inhabilitaciones & Comodines
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Detección automática de integrantes de comité nominados, asignación de Comodines de sustitución y monitor de quórum $\ge 4$.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-rose-400">
              Gestionar Sustitutos <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          {/* Tarjeta 4: Mesa de Votación */}
          <Link
            href="/votacion"
            className="glass-card rounded-2xl p-6 border border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-900/90 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Vote className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                4. Mesa de Votación Borda
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Cámara de votación con método Borda 3-2-1, cards de nominados con dictamen del Árbitro IA y validación contra votos duplicados.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-400">
              Emitir Votos <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          {/* Tarjeta 5: Resultados */}
          <Link
            href="/resultados"
            className="glass-card rounded-2xl p-6 border border-slate-800/80 hover:border-purple-500/40 hover:bg-slate-900/90 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                5. Cómputo & Resultados
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tabla de puntajes finales, anuncio del ganador, distribución de pilares reconocidos y exportador de reporte para Claude.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-purple-400">
              Ver Podio y Reportes <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
