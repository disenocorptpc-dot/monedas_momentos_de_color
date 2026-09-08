"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  fetchNominaciones,
  fetchVotos,
  fetchInhabilitaciones,
} from "@/lib/local-store";
import { formatPilarBadgeColor } from "@/lib/utils";
import { calcularComputoBorda, ComputoCiclo, NUMERO_MONEDAS_A_REPARTIR } from "@/lib/borda";
import { generarReporteClaudePrompt } from "@/lib/arbitro-ia";
import {
  BarChart3,
  Crown,
  Sparkles,
  Copy,
  Check,
  Download,
  Award,
  Medal,
} from "lucide-react";

export default function ResultadosPage() {
  const [computo, setComputo] = useState<ComputoCiclo | null>(null);
  const [nominaciones, setNominaciones] = useState<Nominacion[]>([]);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    // 1. Cómputo rápido inicial con caché local
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

    // 2. Cómputo con datos en tiempo real de la base de datos central
    Promise.all([
      fetchNominaciones(),
      fetchVotos(),
      fetchInhabilitaciones(),
    ]).then(([nomsServer, votsServer, inhabsServer]) => {
      const activeNoms = Array.isArray(nomsServer) && nomsServer.length > 0
        ? nomsServer.filter((n) => n.estado === "aceptada")
        : nom;
      const activeVots = Array.isArray(votsServer) && votsServer.length > 0
        ? votsServer
        : vot;
      const activeInhabs = Array.isArray(inhabsServer) && inhabsServer.length > 0
        ? inhabsServer
        : inhab;

      setNominaciones(activeNoms);
      const resServer = calcularComputoBorda(
        activeNoms,
        activeVots,
        com,
        activeInhabs,
        COLABORADORES_INICIALES,
        PILARES_INICIALES,
        CONVOCATORIA_ACTUAL.quorum_minimo
      );
      setComputo(resServer);
    });
  }, []);

  const handleCopiarParaClaude = () => {
    const texto = generarReporteClaudePrompt(nominaciones, CONVOCATORIA_ACTUAL.ciclo, computo);
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

  const ganadores = computo.resultados.filter((r) => r.esGanadorMoneda);

  const posicionBadge = (posicion?: number) => {
    if (posicion === 1) return "bg-[#B88F69] text-white shadow-sm";
    if (posicion === 2) return "bg-slate-500 text-white shadow-sm";
    if (posicion === 3) return "bg-[#A77B50] text-white shadow-sm";
    if (posicion === 4) return "bg-[#254D6E] text-white shadow-sm";
    return "bg-slate-100 text-slate-500";
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#7B6FA0]/30 bg-[#7B6FA0]/10 px-3 py-1 text-xs font-semibold text-[#7B6FA0]">
            <BarChart3 className="h-3.5 w-3.5" />
            Cómputo Oficial & Reconocimiento
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Resultados — {CONVOCATORIA_ACTUAL.ciclo}
          </h1>
          <p className="text-xs text-slate-500 sm:text-sm">
            Cómputo por método Borda (3-2-1) asignando las <strong>4 Monedas de Color</strong> del ciclo.
          </p>
        </div>

        {/* Acciones de Exportación */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopiarParaClaude}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#7B6FA0]/30 bg-[#7B6FA0]/5 px-4 py-2 text-xs font-semibold text-[#7B6FA0] hover:bg-[#7B6FA0]/10 transition-all"
          >
            {copiado ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copiado ? "¡Prompt Copiado!" : "Copiar Reporte para Claude"}
          </button>
          <button
            onClick={handleDescargarJSON}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            JSON
          </button>
        </div>
      </div>

      {/* Tarjeta de Quórum y Métricas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="panel-card rounded-xl p-5 border border-slate-200 space-y-1">
          <p className="text-xs text-slate-500 font-medium">Quórum de Votación</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-slate-900">{computo.votantesValidos} votantes</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                computo.tieneQuorum
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {computo.tieneQuorum ? "Válido (≥ 4)" : "Ciclo Nulo (< 4)"}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Total votos emitidos: {computo.totalVotosEmitidos}</p>
        </div>

        <div className="panel-card rounded-xl p-5 border border-slate-200 space-y-1">
          <p className="text-xs text-slate-500 font-medium">Puntos Borda Distribuidos</p>
          <p className="text-2xl font-bold text-[#B88F69]">
            {computo.resultados.reduce((acc, r) => acc + r.puntosTotales, 0)} pts
          </p>
          <p className="text-[11px] text-slate-500">Máximo teórico: {computo.maxPuntosPosibles} pts</p>
        </div>

        <div className="panel-card rounded-xl p-5 border border-slate-200 space-y-1">
          <p className="text-xs text-slate-500 font-medium">Monedas Asignadas</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {computo.monedasAsignadas} / {computo.monedasDisponibles}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#B88F69]/10 text-[#8a6a4c] border border-[#B88F69]/30">
              Top 4 Borda
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            {computo.tieneQuorum ? "4 Galardonados oficiales" : "Quórum pendiente"}
          </p>
        </div>
      </div>

      {/* Escaparate de Honor: Las 4 Monedas de Color */}
      {ganadores.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#B88F69] px-3 py-0.5 text-[11px] font-bold text-white shadow-sm">
                <Crown className="h-3.5 w-3.5" /> CUARTETO DE HONOR — 4 MONEDAS DE COLOR
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Colaboradores Galardonados ({CONVOCATORIA_ACTUAL.ciclo})
              </h2>
              <p className="text-xs text-slate-500">
                Las 4 postulaciones más votadas por el Comité que reciben la condecoración oficial.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold self-start sm:self-auto">
              <Award className="h-4 w-4 text-emerald-600" />
              {ganadores.length} de {NUMERO_MONEDAS_A_REPARTIR} Asignadas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ganadores.map((ganador) => {
              const coordinacion = COORDINACIONES_INICIALES.find(
                (c) => c.id === ganador.nominacion.coordinacion_id
              );

              return (
                <div
                  key={ganador.nominacion.id}
                  className="relative overflow-hidden rounded-2xl border border-[#B88F69]/30 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                >
                  <div className="absolute right-0 top-0 h-24 w-24 bg-gradient-to-bl from-[#EDECE4] to-transparent pointer-events-none rounded-bl-full" />
                  
                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${posicionBadge(ganador.posicion)}`}>
                        <Medal className="h-3.5 w-3.5" />
                        #{ganador.posicion} Moneda de Color
                      </span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-[#B88F69]">
                          {ganador.puntosTotales} pts
                        </span>
                        <p className="text-[10px] text-slate-400">
                          {ganador.votos3Pts > 0 ? `${ganador.votos3Pts}x(3pts) ` : ""}
                          {ganador.votos2Pts > 0 ? `${ganador.votos2Pts}x(2pts) ` : ""}
                          {ganador.votos1Pt > 0 ? `${ganador.votos1Pt}x(1pt)` : ""}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {ganador.colaborador?.nombre_completo || "Colaborador"}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {coordinacion?.nombre || "Coordinación"}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                      "{ganador.nominacion.descripcion_hecho}"
                    </p>

                    {ganador.nominacion.impacto && (
                      <p className="text-xs text-slate-700 bg-[#EDECE4]/60 p-2.5 rounded-lg border border-[#B88F69]/20">
                        <strong>Impacto:</strong> {ganador.nominacion.impacto}
                      </p>
                    )}
                  </div>

                  {/* Pilares & Diploma */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 relative z-10">
                    <div className="flex flex-wrap gap-1.5">
                      {ganador.nominacion.pilares.map((pKey) => {
                        const pilar = PILARES_INICIALES.find((p) => p.clave === pKey);
                        return (
                          <span
                            key={pKey}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${formatPilarBadgeColor(
                              pKey
                            )}`}
                          >
                            {pilar?.nombre || pKey}
                          </span>
                        );
                      })}
                    </div>
                    <Link
                      href={`/certificado?id=${ganador.nominacion.id}&tipo=ganador`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#B88F69]/40 bg-[#B88F69]/10 px-2.5 py-1 text-xs font-bold text-[#8a6a4c] hover:bg-[#B88F69]/20 transition-all shadow-xs"
                    >
                      <Award className="h-3 w-3 text-[#B88F69]" />
                      Diploma Oficial
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabla General de Resultados */}
      <div className="panel-card rounded-xl overflow-hidden border border-slate-200">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
            Tabla General de Posiciones
          </h3>
          <span className="text-xs text-slate-500">Método Borda 3-2-1 · Desempate Oficial</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 text-center">Pos</th>
                <th className="px-5 py-3">Colaborador</th>
                <th className="px-5 py-3">Pilares</th>
                <th className="px-5 py-3 text-center">Puntos Borda</th>
                <th className="px-5 py-3">Detalle de Votos</th>
                <th className="px-5 py-3 text-right">Diploma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {computo.resultados.map((res) => (
                <tr key={res.nominacion.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${posicionBadge(res.posicion)}`}>
                      {res.posicion}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900">
                      {res.colaborador?.nombre_completo || "Colaborador"}
                    </div>
                    {res.esGanadorMoneda ? (
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-[#8a6a4c] bg-[#B88F69]/15 border border-[#B88F69]/30 px-2 py-0.5 rounded-full">
                        🪙 Moneda de Color
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        Mención Honorífica
                      </span>
                    )}
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
                  <td className="px-5 py-4 text-center">
                    <div className="font-bold text-[#B88F69] text-sm">
                      {res.puntosTotales} pts
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {res.votos3Pts > 0 ? `${res.votos3Pts}x(3pts) ` : ""}
                      {res.votos2Pts > 0 ? `${res.votos2Pts}x(2pts) ` : ""}
                      {res.votos1Pt > 0 ? `${res.votos1Pt}x(1pt)` : ""}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-500 text-[11px]">
                    {res.votosDetalle.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {res.votosDetalle.map((v, i) => (
                          <span
                            key={i}
                            className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-slate-600"
                          >
                            {v.votoPor}: <strong className="text-slate-800">+{v.puntos}</strong>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400">Sin votos registrados</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/certificado?id=${res.nominacion.id}&tipo=${res.esGanadorMoneda ? 'ganador' : 'nominacion'}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-amber-800 bg-white hover:bg-amber-50/70 border border-slate-200 hover:border-amber-300 px-2.5 py-1.5 rounded-lg transition-all shadow-xs"
                    >
                      <Award className="h-3.5 w-3.5 text-amber-600" />
                      Diploma
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Distribución por Pilares */}
      <div className="panel-card rounded-xl p-6 border border-slate-200 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#B88F69]" />
          Distribución de Reconocimiento por Pilar
        </h3>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {computo.distribucionPilares.map((item) => (
            <div
              key={item.pilar.clave}
              className="content-card rounded-xl p-4 border border-slate-200 space-y-2"
            >
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] ${formatPilarBadgeColor(
                  item.pilar.clave
                )}`}
              >
                {item.pilar.nombre}
              </span>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-xs text-slate-500">Postulaciones:</span>
                <span className="text-sm font-semibold text-slate-900">{item.nominacionesCount}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500">Puntos Borda:</span>
                <span className="text-sm font-semibold text-[#B88F69]">{item.puntosCount} pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
