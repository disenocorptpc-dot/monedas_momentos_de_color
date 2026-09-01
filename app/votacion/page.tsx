"use client";

import { useEffect, useState } from "react";
import {
  COORDINACIONES_INICIALES,
  COLABORADORES_INICIALES,
  PILARES_INICIALES,
  CONVOCATORIA_ACTUAL,
  ComiteInhabilitacion,
  ComiteIntegrante,
  ComiteVoto,
  Nominacion,
} from "@/lib/supabase";
import {
  getStoredComite,
  getStoredInhabilitaciones,
  getStoredNominaciones,
  getStoredVotos,
  saveStoredVotos,
} from "@/lib/local-store";
import { formatPilarBadgeColor } from "@/lib/utils";
import { validarBoletaBorda } from "@/lib/borda";
import {
  Vote,
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Send,
  UserCheck,
} from "lucide-react";

export default function VotacionPage() {
  const [comite, setComite] = useState<ComiteIntegrante[]>([]);
  const [inhabilitaciones, setInhabilitaciones] = useState<ComiteInhabilitacion[]>([]);
  const [nominaciones, setNominaciones] = useState<Nominacion[]>([]);
  const [votosRegistrados, setVotosRegistrados] = useState<ComiteVoto[]>([]);

  const [votanteActualId, setVotanteActualId] = useState("");
  // Estado de asignación de puntos { [nominacionId]: 1 | 2 | 3 }
  const [puntosAsignados, setPuntosAsignados] = useState<Record<string, 1 | 2 | 3>>({});
  const [errorMsg, setErrorMsg] = useState("");
  const [exitoMsg, setExitoMsg] = useState("");

  useEffect(() => {
    const com = getStoredComite();
    const inhab = getStoredInhabilitaciones();
    const nom = getStoredNominaciones().filter((n) => n.estado === "aceptada");
    const vot = getStoredVotos();

    setComite(com);
    setInhabilitaciones(inhab);
    setNominaciones(nom);
    setVotosRegistrados(vot);

    // Seleccionar primer votante habilitado
    const primerHabilitado = com.find((m) => {
      const isTitular = m.es_titular && m.activo;
      const isComodin = m.es_comodin && m.activo;
      const isInhab = inhab.some((i) => i.integrante_id === m.id && !i.suplente_id);
      return (isTitular || isComodin) && !isInhab;
    });

    if (primerHabilitado) {
      setVotanteActualId(primerHabilitado.id);
    }
  }, []);

  // Cargar votos previos si el votante ya había votado
  useEffect(() => {
    if (!votanteActualId) return;
    const votosPrevios = votosRegistrados.filter(
      (v) => v.integrante_id === votanteActualId && v.convocatoria_id === CONVOCATORIA_ACTUAL.id
    );

    const map: Record<string, 1 | 2 | 3> = {};
    votosPrevios.forEach((v) => {
      map[v.nominacion_id] = v.puntos;
    });
    setPuntosAsignados(map);
    setErrorMsg("");
    setExitoMsg("");
  }, [votanteActualId, votosRegistrados]);

  // Lista de votantes habilitados (Titulares no inhabilitados + Comodines designados)
  const votantesHabilitados = comite.filter((miembro) => {
    if (miembro.es_comodin) {
      return inhabilitaciones.some((i) => i.suplente_id === miembro.id);
    }
    const inhab = inhabilitaciones.find((i) => i.integrante_id === miembro.id);
    return !inhab || inhab.suplente_id; // Habilitado si no tiene inhab o si tiene comodín asignado
  });

  const votanteActual = comite.find((c) => c.id === votanteActualId);
  const votanteColab = COLABORADORES_INICIALES.find((c) => c.id === votanteActual?.colaborador_id);
  const votanteCoord = COORDINACIONES_INICIALES.find((c) => c.id === votanteActual?.coordinacion_id);

  const isInhabilitadoSinSuplente = inhabilitaciones.some(
    (i) => i.integrante_id === votanteActualId && !i.suplente_id
  );

  // Manejar asignación de puntos (3, 2, 1)
  const handleAsignarPuntos = (nominacionId: string, puntos: 1 | 2 | 3) => {
    setErrorMsg("");
    setExitoMsg("");

    const updated = { ...puntosAsignados };

    // Si ya tenía estos puntos en otra nominación, se los quitamos a la otra
    Object.keys(updated).forEach((id) => {
      if (updated[id] === puntos && id !== nominacionId) {
        delete updated[id];
      }
    });

    // Si ya tenía esta puntuación en la misma, la deseleccionamos
    if (updated[nominacionId] === puntos) {
      delete updated[nominacionId];
    } else {
      updated[nominacionId] = puntos;
    }

    setPuntosAsignados(updated);
  };

  // Enviar boleta de votación
  const handleSubmitVotos = (e: React.FormEvent) => {
    e.preventDefault();

    if (isInhabilitadoSinSuplente) {
      setErrorMsg("Este integrante está inhabilitado por conflicto de interés y no puede votar.");
      return;
    }

    const boleta = Object.entries(puntosAsignados).map(([nominacionId, puntos]) => ({
      nominacionId,
      puntos,
    }));

    const validacion = validarBoletaBorda(boleta);
    if (!validacion.valido) {
      setErrorMsg(validacion.mensaje || "Boleta incompleta o inválida.");
      return;
    }

    const nuevosVotos: ComiteVoto[] = boleta.map((b) => ({
      id: `voto-${Date.now()}-${b.nominacionId}`,
      convocatoria_id: CONVOCATORIA_ACTUAL.id,
      integrante_id: votanteActualId,
      nominacion_id: b.nominacionId,
      puntos: b.puntos,
      created_at: new Date().toISOString(),
    }));

    const updated = saveStoredVotos(nuevosVotos);
    setVotosRegistrados(updated);
    setExitoMsg("¡Votos registrados exitosamente con método Borda (3-2-1)!");
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Encabezado */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          <Vote className="h-3.5 w-3.5" />
          Mesa Comité · Cámara de Votación Borda (3-2-1)
        </div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Votación del Comité ({CONVOCATORIA_ACTUAL.ciclo})
        </h1>
        <p className="text-xs text-slate-400 sm:text-sm">
          Asigna <strong>3 puntos</strong> a tu 1er lugar, <strong>2 puntos</strong> al 2do lugar y <strong>1 punto</strong> al 3er lugar. Cada puntuación debe asignarse a un nominado distinto.
        </p>
      </div>

      {/* Selector de Votante */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Seleccionar Integrante del Comité o Comodín Activo:
            </label>
            <select
              value={votanteActualId}
              onChange={(e) => setVotanteActualId(e.target.value)}
              className="w-full sm:w-80 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
            >
              {comite.map((miembro) => {
                const c = COLABORADORES_INICIALES.find((col) => col.id === miembro.colaborador_id);
                const coord = COORDINACIONES_INICIALES.find((co) => co.id === miembro.coordinacion_id);
                const inhab = inhabilitaciones.find((i) => i.integrante_id === miembro.id);
                const esInhab = Boolean(inhab && !inhab.suplente_id);

                return (
                  <option key={miembro.id} value={miembro.id} disabled={esInhab}>
                    {c?.nombre_completo} ({coord?.nombre || "Comodín"}) {esInhab ? "⛔ [Inhabilitado]" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Resumen de boleta actual */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400">Puntos Asignados:</span>
            <div className="flex gap-2">
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  Object.values(puntosAsignados).includes(3)
                    ? "bg-amber-400 text-slate-950"
                    : "bg-slate-800 text-slate-500"
                }`}
              >
                3 pts {Object.values(puntosAsignados).includes(3) ? "✓" : "—"}
              </span>
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  Object.values(puntosAsignados).includes(2)
                    ? "bg-slate-300 text-slate-950"
                    : "bg-slate-800 text-slate-500"
                }`}
              >
                2 pts {Object.values(puntosAsignados).includes(2) ? "✓" : "—"}
              </span>
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  Object.values(puntosAsignados).includes(1)
                    ? "bg-amber-700 text-white"
                    : "bg-slate-800 text-slate-500"
                }`}
              >
                1 pt {Object.values(puntosAsignados).includes(1) ? "✓" : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs font-semibold text-rose-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      {exitoMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {exitoMsg}
        </div>
      )}

      {/* Cards de Nominaciones a Votar */}
      <form onSubmit={handleSubmitVotos} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {nominaciones.map((nom) => {
            const nominado = COLABORADORES_INICIALES.find((c) => c.id === nom.nominado_id);
            const coord = COORDINACIONES_INICIALES.find((c) => c.id === nom.coordinacion_id);
            const puntosVotados = puntosAsignados[nom.id];

            return (
              <div
                key={nom.id}
                className={`glass-card rounded-2xl p-6 border transition-all ${
                  puntosVotados === 3
                    ? "border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                    : puntosVotados === 2
                    ? "border-slate-300 bg-slate-300/10"
                    : puntosVotados === 1
                    ? "border-amber-700 bg-amber-700/10"
                    : "border-slate-800"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Info Principal */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-medium text-slate-400">
                          {coord?.nombre || "Coordinación"}
                        </span>
                        <h3 className="text-lg font-bold text-white">
                          {nominado?.nombre_completo || "Colaborador"}
                        </h3>
                      </div>

                      {puntosVotados && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black shadow-md ${
                            puntosVotados === 3
                              ? "bg-amber-400 text-slate-950"
                              : puntosVotados === 2
                              ? "bg-slate-200 text-slate-950"
                              : "bg-amber-700 text-white"
                          }`}
                        >
                          ★ {puntosVotados} PUNTOS ASIGNADOS
                        </span>
                      )}
                    </div>

                    {/* Pilares */}
                    <div className="flex flex-wrap gap-1.5">
                      {nom.pilares.map((pKey) => {
                        const pilar = PILARES_INICIALES.find((p) => p.clave === pKey);
                        return (
                          <span
                            key={pKey}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] ${formatPilarBadgeColor(
                              pKey
                            )}`}
                          >
                            {pilar?.nombre || pKey}
                          </span>
                        );
                      })}
                    </div>

                    {/* Relato */}
                    <p className="text-xs text-slate-200 leading-relaxed">
                      "{nom.descripcion_hecho}"
                    </p>

                    {nom.impacto && (
                      <div className="text-[11px] text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                        <strong className="text-slate-200">Impacto:</strong> {nom.impacto}
                      </div>
                    )}

                    {/* Dictamen Árbitro IA */}
                    {nom.dictamen_ia && (
                      <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-3 text-xs text-purple-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-purple-300 flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5" /> Dictamen del Árbitro IA
                          </span>
                          <span className="font-mono text-amber-300 font-bold">
                            Score Pilares: {nom.score_pilares || 90}/100 · Sesgo: {nom.riesgo_sesgo || 0}%
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px]">{nom.dictamen_ia}</p>
                      </div>
                    )}
                  </div>

                  {/* Asignador de Puntos Borda */}
                  <div className="flex md:flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
                    <button
                      type="button"
                      onClick={() => handleAsignarPuntos(nom.id, 3)}
                      className={`flex-1 md:w-36 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                        puntosVotados === 3
                          ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-500/30"
                          : "bg-slate-900 border border-slate-700 text-amber-300 hover:bg-amber-500/20"
                      }`}
                    >
                      🥇 3 Pts (1er Lugar)
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAsignarPuntos(nom.id, 2)}
                      className={`flex-1 md:w-36 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                        puntosVotados === 2
                          ? "bg-slate-200 text-slate-950 shadow-md"
                          : "bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      🥈 2 Pts (2do Lugar)
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAsignarPuntos(nom.id, 1)}
                      className={`flex-1 md:w-36 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                        puntosVotados === 1
                          ? "bg-amber-700 text-white shadow-md"
                          : "bg-slate-900 border border-slate-700 text-amber-500 hover:bg-amber-800/30"
                      }`}
                    >
                      🥉 1 Pt (3er Lugar)
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botón de Envío */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-600 px-8 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:from-emerald-300 hover:to-emerald-500 transition-all"
          >
            <Send className="h-4 w-4" />
            Guardar Boleta de Votación (Borda 3-2-1)
          </button>
        </div>
      </form>
    </div>
  );
}
