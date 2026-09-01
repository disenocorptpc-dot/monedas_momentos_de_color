"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  COORDINACIONES_INICIALES,
  COLABORADORES_INICIALES,
  PILARES_INICIALES,
  CONVOCATORIA_ACTUAL,
  Nominacion,
} from "@/lib/supabase";
import { getStoredNominaciones } from "@/lib/local-store";
import { formatPilarBadgeColor } from "@/lib/utils";
import {
  Award,
  PlusCircle,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

export default function DashboardMesaAltaPage() {
  const [nominaciones, setNominaciones] = useState<Nominacion[]>([]);

  useEffect(() => {
    setNominaciones(getStoredNominaciones());
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300">
            <Award className="h-3.5 w-3.5" />
            Mesa Alta · Control de Cuotas y Postulaciones
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Cuotas de Coordinaciones ({CONVOCATORIA_ACTUAL.ciclo})
          </h1>
          <p className="text-xs text-slate-400 sm:text-sm">
            Taller y Operaciones cuentan con cuota de 2 postulaciones; el resto de coordinaciones cuenta con 1.
          </p>
        </div>

        <Link
          href="/nominar"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-amber-500 transition-all"
        >
          <PlusCircle className="h-4 w-4" />
          Nueva Nominación
        </Link>
      </div>

      {/* Tabla de Cuotas por Coordinación */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Resumen de Cuotas por Coordinación
          </h2>
          <span className="text-xs text-slate-400">
            Total Asignado: {COORDINACIONES_INICIALES.reduce((acc, c) => acc + c.cuota_mes, 0)} cupos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">Coordinación</th>
                <th className="px-5 py-3">Titular Mesa Alta</th>
                <th className="px-5 py-3 text-center">Cuota / Mes</th>
                <th className="px-5 py-3 text-center">Usadas</th>
                <th className="px-5 py-3 text-center">Disponibles</th>
                <th className="px-5 py-3 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {COORDINACIONES_INICIALES.map((coord) => {
                const titular = COLABORADORES_INICIALES.find(
                  (c) => c.coordinacion_id === coord.id && c.titular_mesa_alta
                );
                const usadas = nominaciones.filter(
                  (n) => n.coordinacion_id === coord.id && n.estado !== "rechazada"
                ).length;
                const disponibles = Math.max(0, coord.cuota_mes - usadas);

                return (
                  <tr key={coord.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-white flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-sky-400" />
                      {coord.nombre}
                    </td>
                    <td className="px-5 py-3.5 text-slate-300">
                      {titular?.nombre_completo || "Por confirmar"}
                    </td>
                    <td className="px-5 py-3.5 text-center font-bold text-white">
                      {coord.cuota_mes}
                    </td>
                    <td className="px-5 py-3.5 text-center font-bold text-amber-400">
                      {usadas}
                    </td>
                    <td className="px-5 py-3.5 text-center font-bold text-emerald-400">
                      {disponibles}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {disponibles === 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-semibold text-slate-400 border border-slate-700">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Cuota Completa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
                          <Clock className="h-3 w-3" /> {disponibles} cupo(s) libre(s)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lista de Nominaciones Registradas */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-400" />
          Postulaciones Registradas en el Ciclo ({nominaciones.length})
        </h2>

        {nominaciones.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 text-center border border-slate-800 space-y-3">
            <p className="text-xs text-slate-400">No hay postulaciones registradas en este ciclo aún.</p>
            <Link
              href="/nominar"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
            >
              Registrar Primera Nominación
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {nominaciones.map((nom) => {
              const nominado = COLABORADORES_INICIALES.find((c) => c.id === nom.nominado_id);
              const nominador = COLABORADORES_INICIALES.find((c) => c.id === nom.nominador_id);
              const coordinacion = COORDINACIONES_INICIALES.find((c) => c.id === nom.coordinacion_id);

              return (
                <div
                  key={nom.id}
                  className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div>
                        <p className="text-[11px] text-slate-400 font-medium">
                          {coordinacion?.nombre || "Coordinación"}
                        </p>
                        <h3 className="text-base font-bold text-white">
                          {nominado?.nombre_completo || "Colaborador"}
                        </h3>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                        {nom.estado.toUpperCase()}
                      </span>
                    </div>

                    {/* Pilares */}
                    <div className="flex flex-wrap gap-1.5">
                      {nom.pilares.map((pKey) => {
                        const pilar = PILARES_INICIALES.find((p) => p.clave === pKey);
                        return (
                          <span
                            key={pKey}
                            className={`px-2 py-0.5 rounded-full text-[10px] ${formatPilarBadgeColor(
                              pKey
                            )}`}
                          >
                            {pilar?.nombre || pKey}
                          </span>
                        );
                      })}
                    </div>

                    {/* Relato del Hecho */}
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      "{nom.descripcion_hecho}"
                    </p>

                    {nom.impacto && (
                      <div className="text-[11px] text-slate-400 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/50">
                        <strong className="text-slate-300 font-medium">Impacto:</strong> {nom.impacto}
                      </div>
                    )}
                  </div>

                  {/* Dictamen Árbitro IA */}
                  {nom.dictamen_ia && (
                    <div className="rounded-xl border border-purple-500/20 bg-purple-950/10 p-3 text-[11px] text-purple-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-300 flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5" /> Dictamen Árbitro IA
                        </span>
                        <span className="font-mono text-amber-300 font-semibold">
                          Score: {nom.score_pilares || 90}/100
                        </span>
                      </div>
                      <p className="line-clamp-2 text-slate-300">{nom.dictamen_ia}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
