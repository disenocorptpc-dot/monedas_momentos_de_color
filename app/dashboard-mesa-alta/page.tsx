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
import { getStoredNominaciones, fetchNominaciones } from "@/lib/local-store";
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
    // Carga rápida inicial desde caché local
    setNominaciones(getStoredNominaciones());
    // Consulta en segundo plano y actualización desde la nube
    fetchNominaciones().then((data) => {
      if (Array.isArray(data)) {
        setNominaciones(data);
      }
    });
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#4A8BB5]/30 bg-[#4A8BB5]/10 px-3 py-1 text-xs font-semibold text-[#4A8BB5]">
            <Award className="h-3.5 w-3.5" />
            Mesa Alta · Control de Cuotas y Postulaciones
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Cuotas de Coordinaciones ({CONVOCATORIA_ACTUAL.ciclo})
          </h1>
          <p className="text-xs text-slate-500 sm:text-sm">
            Taller y Operaciones cuentan con cuota de 2 postulaciones; el resto de coordinaciones cuenta con 1.
          </p>
        </div>

        <Link
          href="/nominar"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#254D6E] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#1c3d59] transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          Nueva Nominación
        </Link>
      </div>

      {/* Tabla de Cuotas por Coordinación */}
      <div className="panel-card rounded-xl overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
            Resumen de Cuotas por Coordinación
          </h2>
          <span className="text-xs text-slate-500">
            Total Asignado: {COORDINACIONES_INICIALES.reduce((acc, c) => acc + c.cuota_mes, 0)} cupos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Coordinación</th>
                <th className="px-5 py-3">Titular Mesa Alta</th>
                <th className="px-5 py-3 text-center">Cuota / Mes</th>
                <th className="px-5 py-3 text-center">Usadas</th>
                <th className="px-5 py-3 text-center">Disponibles</th>
                <th className="px-5 py-3 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {COORDINACIONES_INICIALES.map((coord) => {
                const titular = COLABORADORES_INICIALES.find(
                  (c) => c.coordinacion_id === coord.id && c.titular_mesa_alta
                );
                const usadas = nominaciones.filter(
                  (n) => n.coordinacion_id === coord.id && n.estado !== "rechazada"
                ).length;
                const disponibles = Math.max(0, coord.cuota_mes - usadas);

                return (
                  <tr key={coord.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#4A8BB5]" />
                      {coord.nombre}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {titular?.nombre_completo || "Por confirmar"}
                    </td>
                    <td className="px-5 py-3.5 text-center font-semibold text-slate-900">
                      {coord.cuota_mes}
                    </td>
                    <td className="px-5 py-3.5 text-center font-semibold text-[#B88F69]">
                      {usadas}
                    </td>
                    <td className="px-5 py-3.5 text-center font-semibold text-emerald-600">
                      {disponibles}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {disponibles === 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500 border border-slate-200">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Cuota Completa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200">
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
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#B88F69]" />
          Postulaciones Registradas en el Ciclo ({nominaciones.length})
        </h2>

        {nominaciones.length === 0 ? (
          <div className="panel-card rounded-xl p-8 text-center border border-slate-200 space-y-3">
            <p className="text-xs text-slate-500">No hay postulaciones registradas en este ciclo aún.</p>
            <Link
              href="/nominar"
              className="inline-flex items-center gap-2 rounded-lg bg-[#254D6E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1c3d59]"
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
                  className="content-card rounded-xl p-5 border border-slate-200 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {coordinacion?.nombre || "Coordinación"}
                        </p>
                        <h3 className="text-base font-semibold text-slate-900">
                          {nominado?.nombre_completo || "Colaborador"}
                        </h3>
                      </div>
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
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
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      "{nom.descripcion_hecho}"
                    </p>

                    {nom.impacto && (
                      <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <strong className="text-slate-700 font-medium">Impacto:</strong> {nom.impacto}
                      </div>
                    )}
                  </div>

                  {/* Dictamen Árbitro IA */}
                  {nom.dictamen_ia && (
                    <div className="rounded-lg border border-[#7B6FA0]/20 bg-[#7B6FA0]/5 p-3 text-[11px] text-slate-600 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#7B6FA0] flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5" /> Dictamen Árbitro IA
                        </span>
                        <span className="font-mono text-[#B88F69] font-semibold">
                          Score: {nom.score_pilares || 90}/100
                        </span>
                      </div>
                      <p className="line-clamp-2 text-slate-600">{nom.dictamen_ia}</p>
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
