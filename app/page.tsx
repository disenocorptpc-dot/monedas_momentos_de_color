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
      {/* Hero institucional */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[#EDECE4] to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#B88F69]/30 bg-[#B88F69]/10 px-3 py-1 text-xs font-semibold text-[#B88F69]">
            <Sparkles className="h-3.5 w-3.5" />
            Programa de Reconocimiento al Talento Humano
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Monedas · <span className="text-[#254D6E]">Momentos de Color</span>
          </h1>
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            Plataforma oficial de The Palace Company para visibilizar y celebrar la excelencia en el servicio, evaluada con arbitraje de Inteligencia Artificial y votación Borda del comité interdepartamental.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-4">
            <Link
              href="/nominar"
              className="inline-flex items-center gap-2 rounded-lg bg-[#254D6E] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1c3d59] transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              Postular Colaborador (Mesa Alta)
            </Link>
            <Link
              href="/votacion"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <Vote className="h-4 w-4 text-[#4A8BB5]" />
              Mesa de Votación Comité
            </Link>
          </div>
        </div>
      </section>

      {/* Los 5 Pilares de Reconocimiento */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#B88F69]" />
            Los 5 Pilares de Excelencia
          </h2>
          <span className="text-xs text-slate-500">Selección múltiple (1 a 3 por nominación)</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {PILARES_INICIALES.map((pilar) => (
            <div
              key={pilar.clave}
              className="content-card flex flex-col justify-between rounded-xl p-4 border border-slate-200"
            >
              <div className="space-y-2">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] ${formatPilarBadgeColor(pilar.clave)}`}>
                  {pilar.nombre}
                </span>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {pilar.descripcion}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Monitor de Estado del Ciclo Activo */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="panel-card rounded-xl p-5 border border-slate-200 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#B88F69]/10 border border-[#B88F69]/30 text-[#B88F69]">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Nominaciones Recibidas</p>
            <p className="text-2xl font-bold text-slate-900">{nominaciones.length}</p>
            <p className="text-[11px] text-[#B88F69] font-medium">Ciclo: {CONVOCATORIA_ACTUAL.ciclo}</p>
          </div>
        </div>

        <div className="panel-card rounded-xl p-5 border border-slate-200 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#4A8BB5]/10 border border-[#4A8BB5]/30 text-[#4A8BB5]">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Quórum del Comité</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {quorumActual} / {comiteTotal}
              </span>
              {quorumActual >= 4 ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Quórum Válido
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                  <AlertTriangle className="h-3.5 w-3.5" /> Requiere Suplente
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">Mínimo 4 integrantes requeridos</p>
          </div>
        </div>

        <div className="panel-card rounded-xl p-5 border border-slate-200 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#7B6FA0]/10 border border-[#7B6FA0]/30 text-[#7B6FA0]">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Árbitro de Inteligencia Artificial</p>
            <p className="text-2xl font-bold text-slate-900">Activo</p>
            <p className="text-[11px] text-[#7B6FA0] font-medium">Auditoría semántica y anti-sesgo</p>
          </div>
        </div>
      </section>

      {/* Módulos Principales del Sistema */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Accesos a las 5 Pantallas del Sistema</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Tarjeta 1: Nominación */}
          <Link
            href="/nominar"
            className="content-card rounded-xl p-6 border border-slate-200 hover:border-[#B88F69]/40 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#B88F69]/10 text-[#B88F69] border border-[#B88F69]/20">
                <PlusCircle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 group-hover:text-[#254D6E] transition-colors">
                1. Formulario de Nominación
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Mesa Alta postula colaboradores con selección de 1 a 3 pilares, relato de al menos 80 caracteres, compresión de fotos y análisis de IA en tiempo real.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#254D6E]">
              Ir a Postulación <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          {/* Tarjeta 2: Dashboard Mesa Alta */}
          <Link
            href="/dashboard-mesa-alta"
            className="content-card rounded-xl p-6 border border-slate-200 hover:border-[#4A8BB5]/40 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4A8BB5]/10 text-[#4A8BB5] border border-[#4A8BB5]/20">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 group-hover:text-[#254D6E] transition-colors">
                2. Cuotas de Coordinaciones
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Seguimiento de cuotas diferenciadas (Taller y Operaciones tienen 2 nominaciones; resto 1) y lista de postulaciones del ciclo.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#254D6E]">
              Ver Cuotas <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          {/* Tarjeta 3: Inhabilitaciones & Comodines */}
          <Link
            href="/inhabilitaciones"
            className="content-card rounded-xl p-6 border border-slate-200 hover:border-[#E8584A]/40 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8584A]/10 text-[#E8584A] border border-[#E8584A]/20">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 group-hover:text-[#254D6E] transition-colors">
                3. Comité, Inhabilitaciones & Comodines
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Detección automática de integrantes de comité nominados, asignación de Comodines de sustitución y monitor de quórum mayor o igual a 4.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#254D6E]">
              Gestionar Sustitutos <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          {/* Tarjeta 4: Mesa de Votación */}
          <Link
            href="/votacion"
            className="content-card rounded-xl p-6 border border-slate-200 hover:border-[#2A7D6F]/40 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2A7D6F]/10 text-[#2A7D6F] border border-[#2A7D6F]/20">
                <Vote className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 group-hover:text-[#254D6E] transition-colors">
                4. Mesa de Votación Borda
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cámara de votación con método Borda 3-2-1, cards de nominados con dictamen del Árbitro IA y validación contra votos duplicados.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#254D6E]">
              Emitir Votos <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          {/* Tarjeta 5: Resultados */}
          <Link
            href="/resultados"
            className="content-card rounded-xl p-6 border border-slate-200 hover:border-[#7B6FA0]/40 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7B6FA0]/10 text-[#7B6FA0] border border-[#7B6FA0]/20">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 group-hover:text-[#254D6E] transition-colors">
                5. Cómputo & Resultados
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tabla de puntajes finales, anuncio del ganador, distribución de pilares reconocidos y exportador de reporte para Claude.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#254D6E]">
              Ver Podio y Reportes <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
