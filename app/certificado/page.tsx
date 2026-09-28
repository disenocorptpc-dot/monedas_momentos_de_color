"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  COORDINACIONES_INICIALES,
  COLABORADORES_INICIALES,
  PILARES_INICIALES,
  CONVOCATORIA_ACTUAL,
  Nominacion,
  findColaborador,
} from "@/lib/supabase";
import {
  fetchNominaciones,
  getStoredNominaciones,
  fetchVotos,
  getStoredVotos,
  getStoredComite,
  getStoredInhabilitaciones,
  fetchInhabilitaciones,
} from "@/lib/local-store";
import { calcularComputoBorda, ComputoCiclo } from "@/lib/borda";
import { getPilarTheme } from "@/lib/utils";
import {
  Award,
  Printer,
  ArrowLeft,
  ChevronDown,
  Sparkles,
  RefreshCw,
  RotateCcw,
  Trophy,
  Medal,
  Download,
  Layers,
  Check,
} from "lucide-react";
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

// Subcomponente reutilizable del Diploma en Container Queries (cqw)
function DiplomaView({
  nominacion,
  texto,
  esGanador,
  id,
  className = "",
}: {
  nominacion: Nominacion;
  texto: string;
  esGanador: boolean;
  id?: string;
  className?: string;
}) {
  const colab = findColaborador(nominacion?.nominado_id) ||
    COLABORADORES_INICIALES.find((c) => c.id === nominacion?.nominado_id);
  const coord = COORDINACIONES_INICIALES.find((c) => c.id === nominacion?.coordinacion_id);

  const titulo = esGanador ? "Certificado de Excelencia" : "Certificado de Nominación";
  const rotulo = esGanador ? "Reconocimiento Oficial" : "Nominación Oficial";
  const etiquetaHecho = esGanador ? "Momento de color documentado" : "Hecho postulado";
  const acento = esGanador ? BRONCE : OCEANO;
  const folio = `${CONVOCATORIA_ACTUAL.ciclo.replace(/\s/g, "").toUpperCase()}-${
    nominacion?.id ? nominacion.id.slice(-6).toUpperCase() : "——————"
  }`;

  return (
    <div
      id={id}
      className={`relative mx-auto w-full overflow-hidden print:shadow-none ${className}`}
      style={{
        aspectRatio: "1.414 / 1",
        containerType: "inline-size",
        backgroundColor: PERLA,
        boxShadow: "0 24px 60px -24px rgba(15,23,42,0.30)",
      }}
    >
      {/* ─── Filigrana: monograma TPC ─── */}
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

        {/* ═══════════ 2 · CUERPO ═══════════ */}
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
              {colab?.nombre_completo || "Colaborador Destacado"}
            </h2>

            <div
              style={{
                height: "0.14cqw",
                marginTop: "1.7cqw",
                background: `linear-gradient(90deg, ${BRONCE} 0%, ${BRONCE}55 45%, ${BRONCE}00 100%)`,
              }}
            />

            <div
              className="flex flex-wrap items-center justify-between"
              style={{ gap: "1.6cqw", marginTop: "1.5cqw" }}
            >
              <p
                className="font-semibold uppercase"
                style={{ fontSize: "1cqw", letterSpacing: "0.28em", color: "#8A7455" }}
              >
                {coord?.nombre || "Coordinación Corporativa"}
              </p>

              <div className="flex flex-wrap items-center justify-end" style={{ gap: "0.7cqw" }}>
                {nominacion?.pilares?.map((pKey) => {
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
                  fontSize:
                    (texto?.length || 0) > 240
                      ? "1.74cqw"
                      : (texto?.length || 0) > 200
                      ? "1.88cqw"
                      : "2.05cqw",
                  fontStyle: "italic",
                  color: "#3D3527",
                  lineHeight: (texto?.length || 0) > 240 ? 1.4 : 1.48,
                  marginTop: "1.1cqw",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                &ldquo;
                {texto ||
                  nominacion?.descripcion_hecho ||
                  "Acción extraordinaria orientada a la excelencia en la experiencia del huésped."}
                &rdquo;
              </p>
            </div>

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
  );
}

export default function CertificadoPage() {
  const [nominaciones, setNominaciones] = useState<Nominacion[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [esGanador, setEsGanador] = useState<boolean>(true);
  const [categoriaTab, setCategoriaTab] = useState<"ganadores" | "nominados">("ganadores");
  const [modoImpresion, setModoImpresion] = useState<"actual" | "ganadores" | "todos">("actual");
  const [menuImpresionAbierto, setMenuImpresionAbierto] = useState<boolean>(false);
  const [computo, setComputo] = useState<ComputoCiclo | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [cargando, setCargando] = useState(true);
  const [textosDiplomas, setTextosDiplomas] = useState<Record<string, string>>({});
  const [estaSintetizando, setEstaSintetizando] = useState<boolean>(false);

  useEffect(() => {
    // 1. Cargar textos sintetizados previamente guardados
    if (typeof window !== "undefined") {
      try {
        const guardados = localStorage.getItem("mmc_diploma_sintesis_v2");
        if (guardados) {
          setTextosDiplomas(JSON.parse(guardados));
        } else {
          localStorage.removeItem("mmc_diploma_sintesis_v1");
        }
      } catch {
        /* noop */
      }
    }

    // 2. Cargar datos locales de nominaciones y cómputo Borda
    const locales = getStoredNominaciones().filter((n) => n.estado !== "desierta");
    const votsLocales = getStoredVotos();
    const comite = getStoredComite();
    const inhabs = getStoredInhabilitaciones();

    if (locales.length > 0) {
      setNominaciones(locales);
      setSelectedId(locales[0].id);
      const resBorda = calcularComputoBorda(
        locales.filter((n) => n.estado === "aceptada"),
        votsLocales,
        comite,
        inhabs,
        COLABORADORES_INICIALES,
        PILARES_INICIALES,
        CONVOCATORIA_ACTUAL.quorum_minimo
      );
      setComputo(resBorda);
    }

    // 3. Sincronizar con base de datos en nube
    Promise.all([fetchNominaciones(), fetchVotos(), fetchInhabilitaciones()]).then(
      ([nomsServer, votsServer, inhabsServer]) => {
        const validas = (nomsServer || []).filter((n) => n.estado !== "desierta");
        const finalNoms = validas.length > 0 ? validas : locales;
        const finalVots = votsServer && votsServer.length > 0 ? votsServer : votsLocales;
        const finalInhabs = inhabsServer && inhabsServer.length > 0 ? inhabsServer : inhabs;

        if (finalNoms.length > 0) {
          setNominaciones(finalNoms);

          const resServer = calcularComputoBorda(
            finalNoms.filter((n) => n.estado === "aceptada"),
            finalVots,
            comite,
            finalInhabs,
            COLABORADORES_INICIALES,
            PILARES_INICIALES,
            CONVOCATORIA_ACTUAL.quorum_minimo
          );
          setComputo(resServer);

          // Revisar query params
          if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const paramId = params.get("id");
            const paramTipo = params.get("tipo");
            if (paramId && finalNoms.some((n) => n.id === paramId)) {
              setSelectedId(paramId);
            } else if (!selectedId) {
              // Preseleccionar al 1er lugar del cómputo Borda si existe
              if (resServer.resultados[0]) {
                setSelectedId(resServer.resultados[0].nominacion.id);
              } else {
                setSelectedId(finalNoms[0].id);
              }
            }

            if (paramTipo === "nominacion") {
              setEsGanador(false);
              setCategoriaTab("nominados");
            } else if (paramTipo === "ganador") {
              setEsGanador(true);
              setCategoriaTab("ganadores");
            }
          }
        }
        setCargando(false);
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lista de resultados clasificados por Borda
  const resultadosBorda = computo?.resultados || [];
  
  // Ganadores oficiales (top 4 con puntos)
  const ganadoresResultados = resultadosBorda.filter((r) => r.esGanadorMoneda);
  const ganadoresNominaciones = ganadoresResultados.map((r) => r.nominacion);
  
  // Nominados / Menciones (los restantes)
  const nominadosResultados = resultadosBorda.filter((r) => !r.esGanadorMoneda);
  const nominadosNominaciones = nominadosResultados.map((r) => r.nominacion);

  // Nominación actualmente seleccionada
  const nominacionActual =
    nominaciones.find((n) => n.id === selectedId) ||
    ganadoresNominaciones[0] ||
    nominaciones[0];

  const colaboradorActual =
    findColaborador(nominacionActual?.nominado_id) ||
    COLABORADORES_INICIALES.find((c) => c.id === nominacionActual?.nominado_id);

  const predeterminada = nominacionActual
    ? obtenerSintesisPredeterminada(nominacionActual.id, nominacionActual.nominado_id)
    : null;

  // Síntesis automática al seleccionar un colaborador con relato largo
  useEffect(() => {
    if (!nominacionActual || !nominacionActual.id) return;
    const yaExiste = textosDiplomas[nominacionActual.id];
    const relato = nominacionActual.descripcion_hecho || "";

    if (!yaExiste && !predeterminada && relato.length > 240 && !estaSintetizando) {
      setEstaSintetizando(true);
      sintetizarHechoDiploma(
        colaboradorActual?.nombre_completo || "Colaborador",
        relato,
        nominacionActual.pilares || []
      )
        .then((sintesis) => {
          if (sintesis) {
            setTextosDiplomas((prev) => {
              const nuevo = { ...prev, [nominacionActual.id]: sintesis };
              if (typeof window !== "undefined") {
                localStorage.setItem("mmc_diploma_sintesis_v2", JSON.stringify(nuevo));
              }
              return nuevo;
            });
          }
        })
        .finally(() => {
          setEstaSintetizando(false);
        });
    }
  }, [nominacionActual, colaboradorActual, textosDiplomas, estaSintetizando, predeterminada]);

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
        localStorage.setItem("mmc_diploma_sintesis_v2", JSON.stringify(nuevo));
      }
      return nuevo;
    });
  };

  const handleReSintetizar = async () => {
    if (!nominacionActual || estaSintetizando) return;
    setEstaSintetizando(true);
    try {
      const sintesis = await sintetizarHechoDiploma(
        colaboradorActual?.nombre_completo || "Colaborador",
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

  // Impresión individual del diploma actual
  const handlePrintActual = () => {
    setModoImpresion("actual");
    setMenuImpresionAbierto(false);
    if (typeof document !== "undefined") {
      document.body.classList.remove("print-mode-batch");
      document.body.classList.add("print-mode-single");
    }
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Impresión en lote (Ganadores o Todos)
  const handlePrintLote = (tipo: "ganadores" | "todos") => {
    setModoImpresion(tipo);
    setMenuImpresionAbierto(false);
    if (typeof document !== "undefined") {
      document.body.classList.remove("print-mode-single");
      document.body.classList.add("print-mode-batch");
    }
    setTimeout(() => {
      window.print();
      // Restaurar clase al terminar
      setTimeout(() => {
        if (typeof document !== "undefined") {
          document.body.classList.remove("print-mode-batch");
          document.body.classList.add("print-mode-single");
        }
      }, 1000);
    }, 250);
  };

  // Helper para obtener el texto de cualquier nominación para la impresión masiva
  const getTextoParaNominacion = (nom: Nominacion) => {
    return (
      textosDiplomas[nom.id] ??
      obtenerSintesisPredeterminada(nom.id, nom.nominado_id) ??
      nom.descripcion_hecho ??
      ""
    );
  };

  // Lista a renderizar en el contenedor batch de impresión
  const listaBatchPrint =
    modoImpresion === "ganadores"
      ? ganadoresResultados
      : modoImpresion === "todos"
      ? resultadosBorda
      : [];

  return (
    <div className="min-h-screen py-6 sm:py-10 print:py-0">
      {/* ══════════════ BARRA DE CONTROL (no se imprime) ══════════════ */}
      <div className="print:hidden mx-auto max-w-6xl mb-7 px-4 sm:px-0">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          {/* Cabecera de la barra de control */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
            <div className="flex items-center gap-3">
              <Link
                href="/resultados"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver a Resultados
              </Link>
              <div className="h-4 w-px bg-slate-200" />
              <span className="flex items-center gap-2 text-xs font-bold tracking-wide text-slate-800">
                <Award className="h-4 w-4" style={{ color: BRONCE }} />
                Emisor de Diplomas Oficiales
              </span>
            </div>

            {/* Acciones de Impresión y Descarga en Lote */}
            <div className="flex items-center gap-2 relative">
              <button
                type="button"
                onClick={handlePrintActual}
                className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:opacity-95 active:scale-95"
                style={{ backgroundColor: OCEANO }}
                title="Imprimir solo el diploma que está en pantalla"
              >
                <Printer className="h-3.5 w-3.5" />
                Imprimir Actual
              </button>

              {/* Botón desplegable para Lotes Masivos */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuImpresionAbierto(!menuImpresionAbierto)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50/80 px-3 py-2 text-xs font-bold text-amber-900 shadow-sm hover:bg-amber-100 transition-all"
                  title="Opciones de descarga e impresión masiva de diplomas"
                >
                  <Layers className="h-3.5 w-3.5 text-amber-700" />
                  <span>Imprimir / Descargar Lote</span>
                  <ChevronDown className="h-3 w-3 text-amber-700" />
                </button>

                {menuImpresionAbierto && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setMenuImpresionAbierto(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-80 z-50 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Impresión directa en navegador
                        </p>
                      </div>

                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => handlePrintLote("ganadores")}
                          className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-800 hover:bg-amber-50 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-amber-600" />
                            <span>Imprimir Ganadores (4 págs)</span>
                          </span>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded">
                            Borda 1°–4°
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePrintLote("todos")}
                          className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-800 hover:bg-sky-50 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-sky-600" />
                            <span>Imprimir Todos (6 págs)</span>
                          </span>
                          <span className="text-[10px] font-bold text-sky-700 bg-sky-100/70 px-1.5 py-0.5 rounded">
                            Lote Completo
                          </span>
                        </button>
                      </div>

                      <div className="px-3 py-2 border-t border-b border-slate-100 bg-slate-50/50 -mx-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Descarga directa PDF alta resolución
                        </p>
                      </div>

                      <div className="py-1">
                        <a
                          href="/diplomas-ganadores-monedas-de-color.pdf"
                          download="Diplomas-Ganadores-Monedas-de-Color.pdf"
                          onClick={() => setMenuImpresionAbierto(false)}
                          className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Download className="h-4 w-4 text-emerald-600" />
                            <span>PDF Ganadores Oficiales</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">163 KB</span>
                        </a>

                        <a
                          href="/diplomas-todos-monedas-de-color.pdf"
                          download="Diplomas-Todos-Monedas-de-Color.pdf"
                          onClick={() => setMenuImpresionAbierto(false)}
                          className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Download className="h-4 w-4 text-emerald-600" />
                            <span>PDF Completo (Ganadores + Nominados)</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">214 KB</span>
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ══════════ SECCIÓN 1: PESTAÑAS Y SELECCIÓN DE COLABORADOR ══════════ */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/40">
            {/* Pestañas: Ganadores vs Nominados */}
            <div className="flex items-center justify-between mb-3">
              <div className="inline-flex rounded-xl bg-slate-200/70 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setCategoriaTab("ganadores");
                    if (ganadoresNominaciones.length > 0) {
                      setSelectedId(ganadoresNominaciones[0].id);
                      setEsGanador(true);
                    }
                  }}
                  className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                    categoriaTab === "ganadores"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Trophy className="h-3.5 w-3.5 text-amber-500" />
                  <span>Ganadores Monedas de Color</span>
                  <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-[10px] font-extrabold text-amber-800">
                    {ganadoresNominaciones.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCategoriaTab("nominados");
                    if (nominadosNominaciones.length > 0) {
                      setSelectedId(nominadosNominaciones[0].id);
                      setEsGanador(false);
                    }
                  }}
                  className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                    categoriaTab === "nominados"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Medal className="h-3.5 w-3.5 text-sky-600" />
                  <span>Nominaciones del Ciclo</span>
                  <span className="rounded-full bg-sky-100 px-1.5 py-0.2 text-[10px] font-extrabold text-sky-800">
                    {nominadosNominaciones.length}
                  </span>
                </button>
              </div>

              {/* Botón rápido para descargar PDF del grupo actual */}
              {categoriaTab === "ganadores" ? (
                <a
                  href="/diplomas-ganadores-monedas-de-color.pdf"
                  download="Diplomas-Ganadores-Monedas-de-Color.pdf"
                  className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 hover:text-amber-900 underline"
                >
                  <Download className="h-3.5 w-3.5 text-amber-700" />
                  Descargar PDF Ganadores (4 págs)
                </a>
              ) : (
                <a
                  href="/diplomas-todos-monedas-de-color.pdf"
                  download="Diplomas-Todos-Monedas-de-Color.pdf"
                  className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-sky-800 hover:text-sky-900 underline"
                >
                  <Download className="h-3.5 w-3.5 text-sky-700" />
                  Descargar PDF Completo (6 págs)
                </a>
              )}
            </div>

            {/* Grid de colaboradores con medallas, áreas y puntos */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {(categoriaTab === "ganadores" ? ganadoresResultados : nominadosResultados).map(
                (item) => {
                  const esActivo = nominacionActual?.id === item.nominacion.id;
                  const colab = item.colaborador || findColaborador(item.nominacion.nominado_id);
                  const coord = COORDINACIONES_INICIALES.find(
                    (c) => c.id === item.nominacion.coordinacion_id
                  );
                  const medallaIcon =
                    item.posicion === 1 ? "🥇" : item.posicion === 2 ? "🥈" : item.posicion === 3 ? "🥉" : "🎖️";

                  return (
                    <button
                      key={item.nominacion.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(item.nominacion.id);
                        setEsGanador(categoriaTab === "ganadores");
                      }}
                      className={`relative flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                        esActivo
                          ? categoriaTab === "ganadores"
                            ? "border-amber-400 bg-amber-50/70 shadow-sm ring-2 ring-amber-400/30"
                            : "border-sky-400 bg-sky-50/70 shadow-sm ring-2 ring-sky-400/30"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold shadow-xs ${
                          item.esGanadorMoneda
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {medallaIcon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="truncate text-xs font-bold text-slate-800">
                            {colab?.nombre_completo || item.nominacion.nominado_id}
                          </p>
                          {esActivo && (
                            <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                          )}
                        </div>
                        <p className="truncate text-[10px] font-medium text-slate-500">
                          {coord?.nombre || "Área"}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-slate-700">
                            {item.puntosTotales} pts Borda
                          </span>
                          <span className="text-[10px] text-slate-400">·</span>
                          <span className="text-[10px] font-semibold text-slate-500">
                            Lugar #{item.posicion}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* ══════════ SECCIÓN 2: AJUSTE FINO Y DEDICATORIA ══════════ */}
          <div className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Selección de Colaborador (todos)
              </label>
              <div className="relative">
                <select
                  value={selectedId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setSelectedId(newId);
                    const isWinner = ganadoresNominaciones.some((g) => g.id === newId);
                    setEsGanador(isWinner);
                    setCategoriaTab(isWinner ? "ganadores" : "nominados");
                  }}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-8 text-xs font-semibold text-slate-800 focus:border-[#254D6E] focus:outline-none focus:ring-2 focus:ring-[#254D6E]/15"
                >
                  <optgroup label="🏆 Ganadores de las Monedas de Color">
                    {ganadoresResultados.map((res) => {
                      const c = res.colaborador || findColaborador(res.nominacion.nominado_id);
                      return (
                        <option key={res.nominacion.id} value={res.nominacion.id}>
                          #{res.posicion} {c?.nombre_completo} ({res.puntosTotales} pts)
                        </option>
                      );
                    })}
                  </optgroup>
                  <optgroup label="🎖️ Nominaciones del Ciclo">
                    {nominadosResultados.map((res) => {
                      const c = res.colaborador || findColaborador(res.nominacion.nominado_id);
                      return (
                        <option key={res.nominacion.id} value={res.nominacion.id}>
                          #{res.posicion} {c?.nombre_completo} ({res.puntosTotales} pts)
                        </option>
                      );
                    })}
                  </optgroup>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Tipo de reconocimiento en este diploma
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
                  Moneda de Color (Oro)
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
                  Nominación (Océano)
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
                ) : textosDiplomas[nominacionActual?.id] &&
                  textosDiplomas[nominacionActual?.id] !== predeterminada &&
                  textosDiplomas[nominacionActual?.id] !== nominacionActual?.descripcion_hecho ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700 border border-sky-200">
                    ✏️ Editado manualmente
                  </span>
                ) : predeterminada ||
                  (textosDiplomas[nominacionActual?.id] &&
                    textosDiplomas[nominacionActual?.id] !== nominacionActual?.descripcion_hecho) ? (
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
                    (textoDiplomaActual?.length || 0) > 235
                      ? "text-rose-600 font-bold"
                      : (textoDiplomaActual?.length || 0) >= 190
                      ? "text-emerald-700"
                      : "text-slate-500"
                  }`}
                >
                  {textoDiplomaActual?.length || 0} / 230 carac.
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
          VISTA EN PANTALLA & MODO IMPRESIÓN INDIVIDUAL
      ══════════════════════════════════════════════════════════════ */}
      <div className="mx-auto max-w-6xl px-4 sm:px-0">
        <DiplomaView
          id="diploma-print"
          nominacion={nominacionActual}
          texto={textoDiplomaActual}
          esGanador={esGanador}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          CONTENEDOR DE IMPRESIÓN POR LOTE (BATCH)
          Oculto en pantalla normal; se activa durante window.print()
      ══════════════════════════════════════════════════════════════ */}
      <div id="diploma-batch-container" className="hidden print:block">
        {listaBatchPrint.map((res) => {
          const texto = getTextoParaNominacion(res.nominacion);
          const esG = res.esGanadorMoneda ?? false;
          return (
            <div key={res.nominacion.id} className="diploma-batch-page">
              <DiplomaView
                nominacion={res.nominacion}
                texto={texto}
                esGanador={esG}
              />
            </div>
          );
        })}
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
            margin: 0 !important;
            padding: 0 !important;
          }

          body * {
            visibility: hidden;
          }

          /* 1. MODO IMPRESIÓN INDIVIDUAL */
          body.print-mode-single #diploma-print,
          body.print-mode-single #diploma-print * {
            visibility: visible;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body.print-mode-single #diploma-print {
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

          /* 2. MODO IMPRESIÓN POR LOTE (BATCH) */
          body.print-mode-batch #diploma-batch-container,
          body.print-mode-batch #diploma-batch-container * {
            visibility: visible;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body.print-mode-batch #diploma-batch-container {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
          }
          body.print-mode-batch .diploma-batch-page {
            display: block !important;
            width: 100vw !important;
            height: 100vh !important;
            page-break-after: always !important;
            break-after: page !important;
            box-shadow: none !important;
            overflow: hidden !important;
          }
          body.print-mode-batch .diploma-batch-page > div {
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
