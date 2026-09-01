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
} from "@/lib/local-store";
import { formatPilarBadgeColor } from "@/lib/utils";
import { calcularComputoBorda, ComputoCiclo } from "@/lib/borda";
import { generarReporteClaudePrompt } from "@/lib/arbitro-ia";
import {
  BarChart3,
  Award,
  Crown,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Download,
  Users,
} from "lucide-react";

export default function ResultadosPage() {
  const [computo, setComputo] = useState<ComputoCiclo | null>(null);
  const [nominaciones, setNominaciones] = useState<Nominacion[]>([]);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const com = getStoredComite();
    const inhab = getStoredInhabilitaciones();
    const nom = getStoredNominaciones().filter((n) => n.estado === "aceptada");
    const vot = getStoredVotos();

    setNominaciones(nom);
    const res = calcularComputoBorda(
      nom,
      vot,
      com,
      inhab,
      COLABORADORES_INICIALES,
      PILARES_INICIALES,
      CONVOCATORIA_ACTUAL.quorum_minimo
    );
    setComputo(res);
  }, []);

  const handleCopiarParaClaude = () => {
    const texto = generarReporteClaudePrompt(nominaciones, CONVOCATORIA_ACTUAL.ciclo);
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const handleDescargarJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify({ convocatoria: CONVOCATORIA_ACTUAL, computo }, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `resultados_monedas_${CONVOCATORIA_ACTUAL.ciclo.replace(/\s+/g, "_")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (!computo) {
    return <div className="p-8 text-center text-xs text-slate-400">Calculando cómputo Borda...</div>;
  }

  const ganador = computo.resultados[0];

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
            <BarChart3 className="h-3.5 w-3.5" />
            Cómputo Oficial & Reconocimiento
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Resultados — {CONVOCATORIA_ACTUAL.ciclo}
          </h1>
          <p className="text-xs text-slate-400 sm:text-sm">
            Cómputo por método Borda (3-2-1) auditado por Árbitro IA.
          </p>
        </div>

        {/* Acciones de Exportación */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopiarParaClaude}
            className="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-950/40 px-4 py-2 text-xs font-bold text-purple-200 hover:bg-purple-900/40 transition-all"
          >
            {copiado ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copiado ? "¡Prompt Copiado!" : "Copiar Reporte para Claude Web"}
          </button>
          <button
            onClick={handleDescargarJSON}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            JSON
          </button>
        </div>
      </div>

      {/* Tarjeta de Quórum y Métricas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-1">
          <p className="text-xs text-slate-400 font-medium">Quórum de Votación</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-white">{computo.votantesValidos} votantes</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                computo.tieneQuorum
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
              }`}
            >
              {computo.tieneQuorum ? "Válido (≥ 4)" : "Ciclo Nulo (< 4)"}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Total votos emitidos: {computo.totalVotosEmitidos}</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-1">
          <p className="text-xs text-slate-400 font-medium">Puntos Borda Distribuidos</p>
          <p className="text-2xl font-black text-amber-400">
            {computo.resultados.reduce((acc, r) => acc + r.puntosTotales, 0)} pts
          </p>
          <p className="text-[11px] text-slate-400">Máximo teórico: {computo.maxPuntosPosibles} pts</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-1">
          <p className="text-xs text-slate-400 font-medium">Reconocimiento del Mes</p>
          <p className="text-2xl font-black text-white">
            {ganador?.colaborador?.nombre_completo || "Pendiente"}
          </p>
          <p className="text-[11px] text-amber-300 font-medium">
            {ganador?.puntosTotales || 0} Puntos Borda
          </p>
        </div>
      </div>

      {/* Podio / Ganador Destacado */}
      {ganador && (
        <div className="relative overflow-hidden rounded-3xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-xs font-extrabold text-slate-950 shadow-md shadow-amber-500/30">
                <Crown className="h-4 w-4" /> GANADOR DE LA MONEDA DE COLOR
              </div>

              <h2 className="font-serif text-2xl sm:text-4xl font-black text-white">
                {ganador.colaborador?.nombre_completo}
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{ganador.nominacion.descripcion_hecho}"
              </p>

              {ganador.nominacion.impacto && (
                <p className="text-xs text-amber-200 bg-amber-950/40 p-3 rounded-xl border border-amber-500/30">
                  <strong>Impacto:</strong> {ganador.nominacion.impacto}
                </p>
              )}

              {/* Pilares */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {ganador.nominacion.pilares.map((pKey) => {
                  const pilar = PILARES_INICIALES.find((p) => p.clave === pKey);
                  return (
                    <span
                      key={pKey}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${formatPilarBadgeColor(
                        pKey
                      )}`}
                    >
                      {pilar?.nombre || pKey}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 p-6 text-center shrink-0">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Puntaje Final
              </span>
              <span className="text-5xl font-black text-amber-400 my-1">
                {ganador.puntosTotales}
              </span>
              <span className="text-[11px] text-slate-400">Puntos Borda</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabla General de Resultados */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Tabla General de Posiciones
          </h3>
          <span className="text-xs text-slate-400">Método Borda 3-2-1</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3 text-center">Pos</th>
                <th className="px-5 py-3">Colaborador</th>
                <th className="px-5 py-3">Pilares</th>
                <th className="px-5 py-3 text-center">Puntos Borda</th>
                <th className="px-5 py-3">Detalle de Votos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {computo.resultados.map((res) => (
                <tr key={res.nominacion.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-4 text-center font-black text-sm">
                    {res.posicion === 1 ? "🥇 1" : res.posicion === 2 ? "🥈 2" : res.posicion === 3 ? "🥉 3" : res.posicion}
                  </td>
                  <td className="px-5 py-4 font-bold text-white">
                    {res.colaborador?.nombre_completo || "Colaborador"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {res.nominacion.pilares.map((pKey) => (
                        <span
                          key={pKey}
                          className={`px-2 py-0.5 rounded-full text-[10px] ${formatPilarBadgeColor(
                            pKey
                          )}`}
                        >
                          {PILARES_INICIALES.find((p) => p.clave === pKey)?.nombre || pKey}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center font-black text-amber-400 text-sm">
                    {res.puntosTotales} pts
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-[11px]">
                    {res.votosDetalle.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {res.votosDetalle.map((v, i) => (
                          <span
                            key={i}
                            className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md text-slate-300"
                          >
                            {v.votoPor}: <strong>+{v.puntos}</strong>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-600">Sin votos registrados</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Distribución por Pilares */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-400" />
          Distribución de Reconocimiento por Pilar
        </h3>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {computo.distribucionPilares.map((item) => (
            <div
              key={item.pilar.clave}
              className="glass-card rounded-2xl p-4 border border-slate-800/80 space-y-2"
            >
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] ${formatPilarBadgeColor(
                  item.pilar.clave
                )}`}
              >
                {item.pilar.nombre}
              </span>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-xs text-slate-400">Postulaciones:</span>
                <span className="text-sm font-bold text-white">{item.nominacionesCount}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Puntos Borda:</span>
                <span className="text-sm font-bold text-amber-400">{item.puntosCount} pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
