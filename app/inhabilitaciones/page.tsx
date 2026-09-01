"use client";

import { useEffect, useState } from "react";
import {
  COORDINACIONES_INICIALES,
  COLABORADORES_INICIALES,
  CONVOCATORIA_ACTUAL,
  ComiteInhabilitacion,
  ComiteIntegrante,
  Nominacion,
} from "@/lib/supabase";
import {
  getStoredComite,
  getStoredInhabilitaciones,
  getStoredNominaciones,
  saveInhabilitacion,
} from "@/lib/local-store";
import {
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  UserPlus,
  Users,
  CheckCircle2,
  Info,
  Clock,
} from "lucide-react";

export default function InhabilitacionesPage() {
  const [comite, setComite] = useState<ComiteIntegrante[]>([]);
  const [inhabilitaciones, setInhabilitaciones] = useState<ComiteInhabilitacion[]>([]);
  const [nominaciones, setNominaciones] = useState<Nominacion[]>([]);
  const [designandoPara, setDesignandoPara] = useState<string | null>(null);
  const [comodinSeleccionado, setComodinSeleccionado] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  useEffect(() => {
    const comiteData = getStoredComite();
    const inhabData = getStoredInhabilitaciones();
    const nomData = getStoredNominaciones();

    setComite(comiteData);
    setInhabilitaciones(inhabData);
    setNominaciones(nomData);

    // Auto-detectar inhabilitaciones por nominaciones activas
    comiteData
      .filter((c) => c.es_titular && c.activo)
      .forEach((miembro) => {
        const estaNominado = nomData.some(
          (nom) => nom.nominado_id === miembro.colaborador_id && nom.estado === "aceptada"
        );
        const yaRegistrado = inhabData.some((i) => i.integrante_id === miembro.id);

        if (estaNominado && !yaRegistrado) {
          const nuevaInhab: ComiteInhabilitacion = {
            id: `inhab-${Date.now()}-${miembro.id}`,
            convocatoria_id: CONVOCATORIA_ACTUAL.id,
            integrante_id: miembro.id,
            motivo: "Nominado en el ciclo activo (Conflicto de interés)",
            designado_por: "Sistema Automático / Pendiente de Asignar Comodín",
          };
          const updated = saveInhabilitacion(nuevaInhab);
          setInhabilitaciones(updated);
        }
      });
  }, []);

  // Lista de comodines y suplentes disponibles
  const comodinesDisponibles = comite.filter((c) => c.es_comodin && c.activo);
  const suplentesInternos = COLABORADORES_INICIALES.filter(
    (c) => c.activo && !comite.some((item) => item.colaborador_id === c.id)
  );

  // Calcular Quórum
  const titulares = comite.filter((c) => c.es_titular && c.activo);
  let votantesActivos = 0;
  titulares.forEach((t) => {
    const inhab = inhabilitaciones.find((i) => i.integrante_id === t.id);
    if (!inhab || inhab.suplente_id) {
      votantesActivos += 1;
    }
  });

  const quorumValido = votantesActivos >= CONVOCATORIA_ACTUAL.quorum_minimo;

  const handleAsignarComodin = (integranteId: string) => {
    if (!comodinSeleccionado) return;

    const inhabExistente = inhabilitaciones.find((i) => i.integrante_id === integranteId);
    const updatedInhab: ComiteInhabilitacion = {
      id: inhabExistente?.id || `inhab-${Date.now()}`,
      convocatoria_id: CONVOCATORIA_ACTUAL.id,
      integrante_id: integranteId,
      motivo: inhabExistente?.motivo || "Sustitución por Comodín",
      suplente_id: comodinSeleccionado,
      designado_por: "Ale (Gerencia de Cultura)",
    };

    const updated = saveInhabilitacion(updatedInhab);
    setInhabilitaciones(updated);
    setDesignandoPara(null);
    setComodinSeleccionado("");
    setMensajeExito("¡Comodín sustituto asignado exitosamente! El asiento de votación está activo.");
    setTimeout(() => setMensajeExito(""), 4000);
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Encabezado */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#E8584A]/30 bg-[#E8584A]/10 px-3 py-1 text-xs font-semibold text-[#E8584A]">
          <ShieldAlert className="h-3.5 w-3.5" />
          Mesa Comité · Auditoría de Inhabilitaciones & Comodines
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Inhabilitaciones & Asignación de Comodines
        </h1>
        <p className="text-xs text-slate-500 sm:text-sm">
          Si un miembro del comité es postulado en el ciclo, se inhabilita para prevenir conflicto de interés. Gerencia puede asignar un Comodín suplente para garantizar el quórum.
        </p>
      </div>

      {mensajeExito && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {mensajeExito}
        </div>
      )}

      {/* Monitor de Quórum */}
      <div className="panel-card rounded-xl p-6 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Estado de Quórum para Votación
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-slate-900">
              {votantesActivos} / {titulares.length}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                quorumValido
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {quorumValido ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Quórum Alcanzado (≥ {CONVOCATORIA_ACTUAL.quorum_minimo})
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" /> Requiere Asignar Comodín
                </>
              )}
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-500 max-w-sm">
          Se requiere un mínimo de <strong className="text-slate-700">4 votantes válidos</strong>. Con comodines asignados, la representatividad se mantiene equilibrada.
        </div>
      </div>

      {/* Lista de Integrantes del Comité */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <Users className="h-4 w-4 text-[#4A8BB5]" />
          Los 6 Integrantes Titulares del Comité
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {titulares.map((miembro) => {
            const colab = COLABORADORES_INICIALES.find((c) => c.id === miembro.colaborador_id);
            const coord = COORDINACIONES_INICIALES.find((c) => c.id === miembro.coordinacion_id);
            const estaInhabilitado = inhabilitaciones.some((i) => i.integrante_id === miembro.id);
            const inhabilitacion = inhabilitaciones.find((i) => i.integrante_id === miembro.id);

            const suplenteColab = COLABORADORES_INICIALES.find((c) => {
              const comodin = comite.find((item) => item.id === inhabilitacion?.suplente_id);
              return c.id === comodin?.colaborador_id || c.id === inhabilitacion?.suplente_id;
            });

            return (
              <div
                key={miembro.id}
                className={`content-card rounded-xl p-5 border transition-all ${
                  estaInhabilitado && !inhabilitacion?.suplente_id
                    ? "border-rose-200 bg-rose-50/40"
                    : estaInhabilitado && inhabilitacion?.suplente_id
                    ? "border-[#B88F69]/40 bg-[#B88F69]/5"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[11px] font-medium text-slate-500">
                      Coordinación: {coord?.nombre || "General"}
                    </span>
                    <h3 className="text-base font-semibold text-slate-900">
                      {colab?.nombre_completo || "Integrante"}
                    </h3>
                  </div>

                  {!estaInhabilitado ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                      <ShieldCheck className="h-3 w-3" /> Habilitado
                    </span>
                  ) : inhabilitacion?.suplente_id ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#B88F69]/10 border border-[#B88F69]/30 px-2.5 py-0.5 text-[10px] font-semibold text-[#8a6a4c]">
                      <UserCheck className="h-3 w-3" /> Comodín Asignado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[10px] font-semibold text-rose-700">
                      <ShieldAlert className="h-3 w-3" /> Inhabilitado
                    </span>
                  )}
                </div>

                {/* Detalle si está inhabilitado */}
                {estaInhabilitado && (
                  <div className="rounded-lg bg-slate-50 p-3 text-xs border border-slate-100 space-y-2 mb-3">
                    <div className="text-[11px] text-rose-600 flex items-center gap-1.5">
                      <Info className="h-3.5 w-3.5 shrink-0" />
                      <span>{inhabilitacion?.motivo}</span>
                    </div>

                    {inhabilitacion?.suplente_id ? (
                      <div className="text-[11px] text-[#8a6a4c] border-t border-slate-200 pt-2 flex items-center justify-between">
                        <span>
                          <strong>Sustituto activo:</strong> {suplenteColab?.nombre_completo || "Comodín"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setDesignandoPara(miembro.id)}
                          className="text-[10px] text-[#B88F69] underline hover:text-[#8a6a4c]"
                        >
                          Cambiar
                        </button>
                      </div>
                    ) : (
                      <div className="border-t border-slate-200 pt-2">
                        <button
                          type="button"
                          onClick={() => setDesignandoPara(miembro.id)}
                          className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#B88F69]/10 border border-[#B88F69]/40 px-3 py-1.5 text-xs font-semibold text-[#8a6a4c] hover:bg-[#B88F69]/20 transition-all"
                        >
                          <UserPlus className="h-3.5 w-3.5" /> Asignar Comodín Sustituto
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Selector modal inline de Comodines */}
                {designandoPara === miembro.id && (
                  <div className="rounded-lg bg-white border border-[#B88F69]/40 p-3.5 space-y-3 mt-2 shadow-sm">
                    <p className="text-xs font-semibold text-[#8a6a4c]">
                      Seleccionar Comodín para suplir a {colab?.nombre_completo}:
                    </p>

                    <select
                      value={comodinSeleccionado}
                      onChange={(e) => setComodinSeleccionado(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-900 focus:border-[#254D6E] focus:outline-none"
                    >
                      <option value="">-- Elige un Comodín o Suplente --</option>
                      <optgroup label="Comodines Institucionales">
                        {comodinesDisponibles.map((com) => {
                          const cColab = COLABORADORES_INICIALES.find(
                            (c) => c.id === com.colaborador_id
                          );
                          return (
                            <option key={com.id} value={com.id}>
                              ★ {cColab?.nombre_completo} (Comodín)
                            </option>
                          );
                        })}
                      </optgroup>
                      <optgroup label="Colaboradores del Padrón">
                        {suplentesInternos.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre_completo}
                          </option>
                        ))}
                      </optgroup>
                    </select>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setDesignandoPara(null)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAsignarComodin(miembro.id)}
                        disabled={!comodinSeleccionado}
                        className="rounded-lg bg-[#254D6E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1c3d59] disabled:opacity-50"
                      >
                        Confirmar Designación
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit Log de Inhabilitaciones */}
      {inhabilitaciones.length > 0 && (
        <div className="panel-card rounded-xl p-6 border border-slate-200 space-y-3">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-400" /> Registro de Auditoría (Audit Log)
          </h3>
          <div className="divide-y divide-slate-100 text-xs">
            {inhabilitaciones.map((inhab) => {
              const titular = comite.find((c) => c.id === inhab.integrante_id);
              const titularColab = COLABORADORES_INICIALES.find(
                (c) => c.id === titular?.colaborador_id
              );
              const suplenteColab = COLABORADORES_INICIALES.find((c) => {
                const comodin = comite.find((item) => item.id === inhab.suplente_id);
                return c.id === comodin?.colaborador_id || c.id === inhab.suplente_id;
              });

              return (
                <div key={inhab.id} className="py-2.5 flex flex-wrap items-center justify-between gap-2 text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-900">{titularColab?.nombre_completo}</span>
                    <span className="text-slate-500"> — Motivo: {inhab.motivo}</span>
                  </div>
                  <div className="text-[11px] text-[#B88F69] font-medium">
                    Sustituido por: {suplenteColab?.nombre_completo || "Pendiente"} ({inhab.designado_por})
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
