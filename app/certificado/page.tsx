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
import { fetchNominaciones, getStoredNominaciones } from "@/lib/local-store";
import { getPilarTheme } from "@/lib/utils";
import { Award, Printer, ArrowLeft, ChevronDown, Sparkles, RefreshCw, RotateCcw } from "lucide-react";
import { BRAND, MARCA } from "@/lib/brand";
import { sintetizarHechoDiploma, obtenerSintesisPredeterminada } from "@/lib/sintesis-diploma";
/* eslint-disable @next/next/no-img-element */

/* ────────────────────────────────────────────────────────────
   Paleta institucional The Palace Company · lib/brand.ts
   ──────────────────────────────────────────────────────────── */
const OCEANO = BRAND.oceano;
const OCEANO_DEEP = BRAND.oceanoDeep;
const BRONCE = BRAND.bronce;
const BRONCE_CLARO = BRAND.bronceClaro;
const PERLA = BRAND.perlaPapel;
const TINTA = BRAND.tinta;

export default function CertificadoPage() {
  const [nominaciones, setNominaciones] = useState<Nominacion[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [esGanador, setEsGanador] = useState<boolean>(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [cargando, setCargando] = useState(true);
  const [textosDiplomas, setTextosDiplomas] = useState<Record<string, string>>({});
  const [estaSintetizando, setEstaSintetizando] = useState<boolean>(false);

  useEffect(() => {
    // Cargar textos sintetizados previamente guardados
    if (typeof window !== "undefined") {
      try {
        const guardados = localStorage.getItem("mmc_diploma_sintesis_v1");
        if (guardados) {
          setTextosDiplomas(JSON.parse(guardados));
        }
      } catch {
        /* noop */
      }
    }

    const locales = getStoredNominaciones().filter((n) => n.estado !== "desierta");
    if (locales.length > 0) {
      setNominaciones(locales);
      setSelectedId(locales[0].id);
    }

    fetchNominaciones().then((noms) => {
      const validas = (noms || []).filter((n) => n.estado !== "desierta");
      if (validas.length > 0) {
        setNominaciones(validas);
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const paramId = params.get("id");
          const paramTipo = params.get("tipo");
          if (paramId && validas.some((n) => n.id === paramId)) {
            setSelectedId(paramId);
          } else if (!selectedId) {
            setSelectedId(validas[0].id);
          }
          if (paramTipo === "nominacion") setEsGanador(false);
          else if (paramTipo === "ganador") setEsGanador(true);
        }
      }
      setCargando(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nominacionActual = nominaciones.find((n) => n.id === selectedId) || nominaciones[0];
  const colaborador = COLABORADORES_INICIALES.find((c) => c.id === nominacionActual?.nominado_id);
  const coordinacion = COORDINACIONES_INICIALES.find((c) => c.id === nominacionActual?.coordinacion_id);

  const predeterminada = nominacionActual
    ? obtenerSintesisPredeterminada(nominacionActual.id, nominacionActual.nominado_id)
    : null;

  // Síntesis automática al seleccionar un colaborador con relato largo
  useEffect(() => {
    if (!nominacionActual || !nominacionActual.id) return;
    const yaExiste = textosDiplomas[nominacionActual.id];
    const relato = nominacionActual.descripcion_hecho || "";

    // Si no tiene síntesis previa ni predeterminada y el relato es largo (>240 caracteres), sintetizar automáticamente
    if (!yaExiste && !predeterminada && relato.length > 240 && !estaSintetizando) {
      setEstaSintetizando(true);
      sintetizarHechoDiploma(
        colaborador?.nombre_completo || "Colaborador",
        relato,
        nominacionActual.pilares || []
      ).then((sintesis) => {
        if (sintesis) {
          setTextosDiplomas((prev) => {
            const nuevo = { ...prev, [nominacionActual.id]: sintesis };
            if (typeof window !== "undefined") {
              localStorage.setItem("mmc_diploma_sintesis_v1", JSON.stringify(nuevo));
            }
            return nuevo;
          });
        }
      }).finally(() => {
        setEstaSintetizando(false);
      });
    }
  }, [nominacionActual, colaborador, textosDiplomas, estaSintetizando, predeterminada]);

  const textoDiplomaActual = nominacionActual
    ? textosDiplomas[nominacionActual.id] ??
      predeterminada ??
      nominacionActual.descripcion_hecho
    : "";

  const handleTextoChange = (nuevoTexto: string) => {
    if (!nominacionActual) return;
    setTextosDiplomas((prev) => {
      const nuevo = { ...prev, [nominacionActual.id]: nuevoTexto };
      if (typeof window !== "undefined") {
        localStorage.setItem("mmc_diploma_sintesis_v1", JSON.stringify(nuevo));
      }
      return nuevo;
    });
  };

  const handleReSintetizar = async () => {
    if (!nominacionActual || estaSintetizando) return;
    setEstaSintetizando(true);
    try {
      const sintesis = await sintetizarHechoDiploma(
        colaborador?.nombre_completo || "Colaborador",
        nominacionActual.descripcion_hecho || "",
        nominacionActual.pilares || []
      );
      if (sintesis) {
        handleTextoChange(sintesis);
      }
    } finally {
      setEstaSintetizando(false);
    }
  };

  const handleRestaurarOriginal = () => {
    if (!nominacionActual) return;
    handleTextoChange(nominacionActual.descripcion_hecho || "");
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  const titulo = esGanador ? "Certificado de Excelencia" : "Certificado de Nominación";
  const rotulo = esGanador ? "Reconocimiento Oficial" : "Nominación Oficial";
  const etiquetaHecho = esGanador ? "Momento de color documentado" : "Hecho postulado";
  const acento = esGanador ? BRONCE : OCEANO;
  const folio = `${CONVOCATORIA_ACTUAL.ciclo.replace(/\s/g, "").toUpperCase()}-${
    nominacionActual?.id.slice(-6).toUpperCase() ?? "——————"
  }`;

  return (
    <div className="min-h-screen py-6 sm:py-10 print:py-0">
      {/* ══════════════ BARRA DE CONTROL (no se imprime) ══════════════ */}
      <div className="print:hidden mx-auto max-w-6xl mb-7 px-4 sm:px-0">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
            <div className="flex items-center gap-3">
              <Link
                href="/resultados"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver
              </Link>
              <div className="h-4 w-px bg-slate-200" />
              <span className="flex items-center gap-2 text-xs font-bold tracking-wide text-slate-800">
                <Award className="h-4 w-4" style={{ color: BRONCE }} />
                Emisor de Diplomas Oficiales
              </span>
            </div>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: OCEANO }}
            >
              <Printer className="h-3.5 w-3.5" />
              Imprimir / PDF
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Colaborador postulado
              </label>
              <div className="relative">
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-8 text-xs font-semibold text-slate-800 focus:border-[#254D6E] focus:outline-none focus:ring-2 focus:ring-[#254D6E]/15"
                >
                  {nominaciones.map((nom) => {
                    const c = COLABORADORES_INICIALES.find((col) => col.id === nom.nominado_id);
                    const coord = COORDINACIONES_INICIALES.find((co) => co.id === nom.coordinacion_id);
                    return (
                      <option key={nom.id} value={nom.id}>
                        {c?.nombre_completo || nom.nominado_id} — {coord?.nombre || "Área"}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Tipo de reconocimiento
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEsGanador(true)}
                  className="rounded-xl border px-3 py-2.5 text-[11px] font-bold transition-all"
                  style={
                    esGanador
                      ? { borderColor: BRONCE, backgroundColor: "#FBF6EF", color: "#8A6A4C" }
                      : { borderColor: "#E2E8F0", backgroundColor: "#F8FAFC", color: "#64748B" }
                  }
                >
                  Moneda de Color
                </button>
                <button
                  type="button"
                  onClick={() => setEsGanador(false)}
                  className="rounded-xl border px-3 py-2.5 text-[11px] font-bold transition-all"
                  style={
                    !esGanador
                      ? { borderColor: `${OCEANO}66`, backgroundColor: "#F1F5F9", color: OCEANO }
                      : { borderColor: "#E2E8F0", backgroundColor: "#F8FAFC", color: "#64748B" }
                  }
                >
                  Nominación
                </button>
              </div>
            </div>
          </div>

          {/* Fila de Edición y Síntesis Automática IA */}
          <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Cita de Mérito en Diploma
                </span>
                {estaSintetizando ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 animate-pulse border border-amber-200">
                    <Sparkles className="h-3 w-3 animate-spin text-amber-600" />
                    Sintetizando con Gemini IA...
                  </span>
                ) : (textosDiplomas[nominacionActual?.id] &&
                  textosDiplomas[nominacionActual?.id] !== predeterminada &&
                  textosDiplomas[nominacionActual?.id] !== nominacionActual?.descripcion_hecho) ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700 border border-sky-200">
                    ✏️ Editado manualmente
                  </span>
                ) : (predeterminada || (textosDiplomas[nominacionActual?.id] && textosDiplomas[nominacionActual?.id] !== nominacionActual?.descripcion_hecho)) ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                    <Sparkles className="h-3 w-3 text-emerald-600" />
                    Síntesis Oficial Automática
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200">
                    Texto original
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-[11px] font-mono font-medium ${
                    (textoDiplomaActual?.length || 0) > 270
                      ? "text-rose-600 font-bold"
                      : (textoDiplomaActual?.length || 0) >= 210
                      ? "text-emerald-700"
                      : "text-slate-500"
                  }`}
                >
                  {textoDiplomaActual?.length || 0} / 260 carac.
                </span>
                <button
                  type="button"
                  onClick={handleReSintetizar}
                  disabled={estaSintetizando}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  title="Volver a generar la síntesis con la API de Gemini"
                >
                  <RefreshCw className={`h-3 w-3 ${estaSintetizando ? "animate-spin" : ""}`} />
                  Regenerar IA
                </button>
                <button
                  type="button"
                  onClick={handleRestaurarOriginal}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 underline transition-colors"
                  title="Restaurar el texto original escrito por el nominador"
                >
                  <RotateCcw className="h-3 w-3" />
                  Original
                </button>
              </div>
            </div>

            <textarea
              value={textoDiplomaActual}
              onChange={(e) => handleTextoChange(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-serif italic text-slate-800 shadow-inner focus:border-[#254D6E] focus:outline-none focus:ring-2 focus:ring-[#254D6E]/15 resize-none leading-relaxed transition-all"
              placeholder="Escribe o ajusta la dedicatoria que aparecerá en el diploma..."
            />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          EL DIPLOMA · A4 horizontal, institucional moderno

          Alineado a la izquierda, pero a MEDIDA COMPLETA (87cqw): cada
          bloque llega de margen a margen, con un dato al costado
          derecho, para que no queden zonas muertas.

          El aire vertical NO se acumula al final: el cuerpo reparte el
          sobrante entre los cuatro bloques con space-between, así que
          la distribución se mantiene pareja sea que el nombre ocupe
          una o dos líneas, y la cita dos o tres.

          Todo se mide en cqw. Ver design_system/README.md § 4.
      ══════════════════════════════════════════════════════════════ */}
      <div className="mx-auto max-w-6xl px-4 sm:px-0">
        <div
          id="diploma-print"
          className="relative mx-auto w-full overflow-hidden print:shadow-none"
          style={{
            aspectRatio: "1.414 / 1",
            containerType: "inline-size",
            backgroundColor: PERLA,
            boxShadow: "0 24px 60px -24px rgba(15,23,42,0.30)",
          }}
        >
          {/* ─── Filigrana: monograma TPC, muy tenue, sangrando a la derecha ─── */}
          <img
            src={MARCA.monogramaOceano}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute select-none"
            style={{ right: "-8cqw", top: "21cqw", height: "40cqw", width: "auto", opacity: 0.038 }}
          />

          {/* ─── Textura de papel muy sutil ─── */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: 0.03,
              backgroundImage: `repeating-linear-gradient(135deg, ${OCEANO} 0 1px, transparent 1px 9px)`,
            }}
          />

          <div className="relative flex h-full flex-col">
            {/* ═══════════ 1 · BANDA SUPERIOR ═══════════ */}
            <header
              className="relative flex shrink-0 items-center justify-between"
              style={{
                height: "10cqw",
                backgroundColor: OCEANO,
                paddingLeft: "6.5cqw",
                paddingRight: "6.5cqw",
              }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  opacity: 0.5,
                  backgroundImage: `linear-gradient(115deg, ${OCEANO_DEEP} 0%, ${OCEANO} 45%, ${OCEANO_DEEP} 100%)`,
                }}
              />
              {/* Logotipo secundario oficial, versión negativa */}
              <img
                src={MARCA.logoVerticalBlanco}
                alt={MARCA.nombre}
                className="relative"
                style={{ height: "4.6cqw", width: "auto" }}
              />
              <p
                className="relative uppercase"
                style={{
                  fontSize: "0.95cqw",
                  letterSpacing: "0.3em",
                  color: "rgba(255,255,255,0.62)",
                }}
              >
                Monedas · Momentos de Color
              </p>
            </header>

            {/* Filete bronce */}
            <div
              className="shrink-0"
              style={{
                height: "0.32cqw",
                background: `linear-gradient(90deg, ${BRONCE} 0%, ${BRONCE_CLARO} 50%, ${BRONCE} 100%)`,
              }}
            />

            {/* ═══════════ 2 · CUERPO ═══════════
                Cuatro bloques, con el sobrante repartido entre ellos. */}
            <main
              className="relative flex flex-1 flex-col justify-between"
              style={{ padding: "4.6cqw 6.5cqw 3.6cqw 6.5cqw" }}
            >
              {/* ── BLOQUE A · rótulo + título ── */}
              <div>
                <div className="flex items-center" style={{ gap: "1.3cqw" }}>
                  <span
                    style={{
                      width: "1cqw",
                      height: "1cqw",
                      backgroundColor: acento,
                      transform: "rotate(45deg)",
                      display: "block",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    className="font-semibold uppercase"
                    style={{
                      fontSize: "1cqw",
                      letterSpacing: "0.34em",
                      color: esGanador ? "#8A6A4C" : OCEANO,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {rotulo}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      height: 1,
                      background: `linear-gradient(90deg, ${BRONCE}80, ${BRONCE}30)`,
                    }}
                  />
                  <span
                    className="font-semibold uppercase"
                    style={{
                      fontSize: "0.88cqw",
                      letterSpacing: "0.26em",
                      color: OCEANO,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Ciclo {CONVOCATORIA_ACTUAL.ciclo}
                  </span>
                </div>

                <h1
                  className="font-serif"
                  style={{
                    fontSize: "3.2cqw",
                    fontWeight: 300,
                    letterSpacing: "0.02em",
                    color: TINTA,
                    marginTop: "1.9cqw",
                    lineHeight: 1.08,
                  }}
                >
                  {titulo}
                </h1>
              </div>

              {/* ── BLOQUE B · nombre + coordinación + pilares ── */}
              <div>
                <h2
                  className="font-serif"
                  style={{
                    fontSize: "5.4cqw",
                    fontWeight: 500,
                    color: OCEANO,
                    letterSpacing: "-0.008em",
                    lineHeight: 1.05,
                  }}
                >
                  {colaborador?.nombre_completo || "Colaborador Destacado"}
                </h2>

                <div
                  style={{
                    height: "0.14cqw",
                    marginTop: "1.7cqw",
                    background: `linear-gradient(90deg, ${BRONCE} 0%, ${BRONCE}55 45%, ${BRONCE}00 100%)`,
                  }}
                />

                {/* Coordinación a la izquierda, pilares a la derecha: la fila
                    llega de margen a margen y ninguno queda flotando. */}
                <div
                  className="flex flex-wrap items-center justify-between"
                  style={{ gap: "1.6cqw", marginTop: "1.5cqw" }}
                >
                  <p
                    className="font-semibold uppercase"
                    style={{ fontSize: "1cqw", letterSpacing: "0.28em", color: "#8A7455" }}
                  >
                    {coordinacion?.nombre || "Coordinación Corporativa"}
                  </p>

                  <div className="flex flex-wrap items-center justify-end" style={{ gap: "0.7cqw" }}>
                    {nominacionActual?.pilares.map((pKey) => {
                      const pilar = PILARES_INICIALES.find((p) => p.clave === pKey);
                      const theme = getPilarTheme(pKey);
                      return (
                        <span
                          key={pKey}
                          className="inline-flex items-center font-semibold uppercase"
                          style={{
                            gap: "0.6cqw",
                            fontSize: "0.8cqw",
                            letterSpacing: "0.16em",
                            color: theme.color,
                            border: `1px solid ${theme.color}59`,
                            backgroundColor: `${theme.color}12`,
                            padding: "0.48cqw 1.05cqw",
                            borderRadius: "999px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span
                            style={{
                              width: "0.45cqw",
                              height: "0.45cqw",
                              borderRadius: "999px",
                              backgroundColor: theme.color,
                              display: "block",
                            }}
                          />
                          {pilar?.nombre || pKey}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── BLOQUE C · el hecho, con el sello al costado ── */}
              <div className="flex items-center" style={{ gap: "5cqw" }}>
                <div style={{ flex: 1 }}>
                  <div className="flex items-center" style={{ gap: "1cqw" }}>
                    <span
                      style={{
                        width: "2.4cqw",
                        height: 1,
                        display: "block",
                        backgroundColor: `${BRONCE}AA`,
                      }}
                    />
                    <span
                      className="font-semibold uppercase"
                      style={{ fontSize: "0.82cqw", letterSpacing: "0.26em", color: "#8A7455" }}
                    >
                      {etiquetaHecho}
                    </span>
                  </div>

                  <p
                    className="font-serif"
                    style={{
                      fontSize: "2.05cqw",
                      fontStyle: "italic",
                      color: "#3D3527",
                      lineHeight: 1.5,
                      marginTop: "1.1cqw",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    &ldquo;
                    {textoDiplomaActual ||
                      nominacionActual?.descripcion_hecho ||
                      "Acción extraordinaria orientada a la excelencia en la experiencia del huésped."}
                    &rdquo;
                  </p>
                </div>

                {/* Sello oficial */}
                <img
                  src={MARCA.selloOceano}
                  alt="Sello oficial The Palace Company"
                  className="shrink-0"
                  style={{ width: "11.5cqw", height: "11.5cqw" }}
                />
              </div>

              {/* ── BLOQUE D · emisor y folio ── */}
              <div>
                <div
                  style={{
                    height: 1,
                    background: `linear-gradient(90deg, ${BRONCE}70, ${BRONCE}25 55%, ${BRONCE}00 100%)`,
                  }}
                />
                <div
                  className="flex flex-wrap items-end justify-between"
                  style={{ gap: "2cqw", marginTop: "1.5cqw" }}
                >
                  <div>
                    <p
                      className="font-semibold uppercase"
                      style={{ fontSize: "0.95cqw", letterSpacing: "0.22em", color: OCEANO }}
                    >
                      Otorgado por el Comité Deliberador
                    </p>
                    <p
                      style={{
                        fontSize: "0.78cqw",
                        letterSpacing: "0.09em",
                        color: "#9A9484",
                        marginTop: "0.45cqw",
                      }}
                    >
                      {MARCA.nombre} · Programa de Reconocimiento al Talento Humano
                    </p>
                  </div>

                  <p
                    className="uppercase"
                    style={{
                      fontSize: "0.75cqw",
                      letterSpacing: "0.26em",
                      color: "#9A9484",
                      fontVariantNumeric: "tabular-nums",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Folio {folio}
                  </p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* ══════════════ Estilos de impresión ══════════════ */}
      <style jsx global>{`
        @page {
          size: A4 landscape;
          margin: 0;
        }
        @media print {
          html,
          body {
            background: #ffffff !important;
          }
          body * {
            visibility: hidden;
          }
          #diploma-print,
          #diploma-print * {
            visibility: visible;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #diploma-print {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            margin: 0 !important;
            width: 100vw !important;
            max-width: none !important;
            height: auto !important;
            aspect-ratio: 1.414 / 1 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
