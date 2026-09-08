"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  COORDINACIONES_INICIALES,
  COLABORADORES_INICIALES,
  MESA_ALTA_INICIALES,
  PILARES_INICIALES,
  CONVOCATORIA_ACTUAL,
  Nominacion,
} from "@/lib/supabase";
import { fetchNominaciones, getStoredNominaciones } from "@/lib/local-store";
import { getPilarTheme } from "@/lib/utils";
import {
  Award,
  Printer,
  ArrowLeft,
} from "lucide-react";

export default function CertificadoPage() {
  const [nominaciones, setNominaciones] = useState<Nominacion[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [esGanador, setEsGanador] = useState<boolean>(true);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Cargar nominaciones desde caché y luego sincronizar
    const locales = getStoredNominaciones().filter((n) => n.estado !== "desierta");
    if (locales.length > 0) {
      setNominaciones(locales);
      setSelectedId(locales[0].id);
    }

    fetchNominaciones().then((noms) => {
      const validas = (noms || []).filter((n) => n.estado !== "desierta");
      if (validas.length > 0) {
        setNominaciones(validas);
        
        // Leer parámetro ?id= y ?tipo= de URL
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const paramId = params.get("id");
          const paramTipo = params.get("tipo");
          
          if (paramId && validas.some((n) => n.id === paramId)) {
            setSelectedId(paramId);
          } else if (!selectedId) {
            setSelectedId(validas[0].id);
          }

          if (paramTipo === "nominacion") {
            setEsGanador(false);
          } else if (paramTipo === "ganador") {
            setEsGanador(true);
          }
        }
      }
      setCargando(false);
    });
  }, []);

  const nominacionActual = nominaciones.find((n) => n.id === selectedId) || nominaciones[0];

  const colaborador = COLABORADORES_INICIALES.find(
    (c) => c.id === nominacionActual?.nominado_id
  );
  const coordinacion = COORDINACIONES_INICIALES.find(
    (c) => c.id === nominacionActual?.coordinacion_id
  );

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen py-4 sm:py-8 space-y-6">
      {/* Barra de Control Superior (Oculta al imprimir) */}
      <div className="print:hidden mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/resultados"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver a Resultados
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-[#B88F69]" />
              Emisor de Diplomas & Certificados Oficiales
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg bg-[#254D6E] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#1b3952] transition-colors"
            >
              <Printer className="h-4 w-4" />
              Imprimir / Guardar en PDF
            </button>
          </div>
        </div>

        {/* Controles de Selección */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Seleccionar Colaborador Postulado:
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-[#254D6E] focus:outline-none focus:ring-1 focus:ring-[#254D6E]"
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
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tipo de Certificado:
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEsGanador(true)}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold border transition-all ${
                  esGanador
                    ? "border-[#B88F69] bg-[#B88F69]/15 text-[#8a6a4c] shadow-xs"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                🪙 Galardonado Moneda de Color
              </button>
              <button
                type="button"
                onClick={() => setEsGanador(false)}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold border transition-all ${
                  !esGanador
                    ? "border-blue-500 bg-blue-50 text-blue-800 shadow-xs"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                🏅 Mención / Postulación de Honor
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* EL DIPLOMA / CERTIFICADO IMPRIMIBLE */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-2 sm:px-0">
        <div
          id="diploma-print"
          className="relative mx-auto w-full aspect-[1.414/1] max-w-[1040px] rounded-2xl bg-[#FCFBF7] p-8 sm:p-14 shadow-xl border-8 border-[#254D6E] overflow-hidden flex flex-col justify-between print:shadow-none print:border-8 print:border-[#254D6E] print:m-0 print:p-10 print:w-full print:h-screen print:max-w-none"
        >
          {/* Filete interior dorado decorativo */}
          <div className="pointer-events-none absolute inset-3 rounded-lg border-2 border-[#B88F69]/60" />
          <div className="pointer-events-none absolute inset-4 rounded-md border border-[#B88F69]/30" />

          {/* Esquinas clásicas de certificado */}
          <div className="pointer-events-none absolute top-5 left-5 h-8 w-8 border-t-2 border-l-2 border-[#B88F69]" />
          <div className="pointer-events-none absolute top-5 right-5 h-8 w-8 border-t-2 border-r-2 border-[#B88F69]" />
          <div className="pointer-events-none absolute bottom-5 left-5 h-8 w-8 border-b-2 border-l-2 border-[#B88F69]" />
          <div className="pointer-events-none absolute bottom-5 right-5 h-8 w-8 border-b-2 border-r-2 border-[#B88F69]" />

          {/* Resplandores suaves de fondo */}
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#B88F69]/5 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#254D6E]/5 blur-2xl" />

          {/* 1. ENCABEZADO INSTITUCIONAL */}
          <div className="relative z-10 text-center space-y-1.5">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="h-7 w-7 rounded-md bg-[#254D6E] flex items-center justify-center text-white font-serif font-black text-sm shadow-sm">
                M
              </div>
              <span className="font-serif tracking-[0.25em] text-xs font-bold text-slate-800 uppercase">
                The Palace Company
              </span>
            </div>
            <p className="text-[10px] sm:text-xs font-semibold tracking-[0.18em] text-[#B88F69] uppercase">
              Dirección Corporativa de Diseño y Experiencia
            </p>
            <div className="pt-2">
              <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-[#254D6E] tracking-tight uppercase">
                {esGanador ? "Certificado de Excelencia" : "Constancia de Reconocimiento"}
              </h1>
              <p className="font-serif italic text-xs sm:text-sm text-slate-600 mt-0.5">
                {esGanador
                  ? "Moneda de Color · Convocatoria Oficial " + CONVOCATORIA_ACTUAL.ciclo
                  : "Postulación al Mérito · Momento de Color " + CONVOCATORIA_ACTUAL.ciclo}
              </p>
            </div>
          </div>

          {/* 2. CUERPO DEL DIPLOMA */}
          <div className="relative z-10 my-auto text-center space-y-3 sm:space-y-4">
            <p className="text-xs sm:text-sm text-slate-600 font-serif">
              Se otorga con orgullo y distinción el presente reconocimiento a:
            </p>

            {/* Nombre del Colaborador */}
            <div className="py-1">
              <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-wide border-b-2 border-[#B88F69]/40 inline-block px-8 pb-1">
                {colaborador?.nombre_completo || "Colaborador Destacado"}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-[#254D6E] mt-2 uppercase tracking-wider">
                {coordinacion?.nombre || "Coordinación Corporativa"}
              </p>
            </div>

            {/* Motivo y Hecho */}
            <div className="max-w-2xl mx-auto space-y-2">
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-serif">
                {esGanador
                  ? "Por su extraordinaria vocación de servicio, calidez humana y por encarnar de manera ejemplar la filosofía de hospitalidad de The Palace Company en el momento de color documentado:"
                  : "Por su destacada participación y firme compromiso con la excelencia operativa y humana durante el presente ciclo de deliberación:"}
              </p>
              <div className="rounded-xl border border-[#B88F69]/20 bg-white/80 p-3 sm:p-4 text-xs sm:text-sm text-slate-700 italic font-serif shadow-xs">
                "{nominacionActual?.descripcion_hecho || "Acción extraordinaria orientada a la satisfacción y excelencia en la experiencia del huésped."}"
              </div>
            </div>

            {/* Pilares Demostrados */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {nominacionActual?.pilares.map((pKey) => {
                const pilar = PILARES_INICIALES.find((p) => p.clave === pKey);
                const theme = getPilarTheme(pKey);
                return (
                  <span
                    key={pKey}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-xs text-white"
                    style={{ backgroundColor: theme.color }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    {pilar?.nombre || pKey}
                  </span>
                );
              })}
            </div>
          </div>

          {/* 3. FIRMAS Y SELLO OFICIAL */}
          <div className="relative z-10 grid grid-cols-3 items-end pt-4 sm:pt-6 border-t border-[#B88F69]/30">
            {/* Firma Izquierda */}
            <div className="text-center space-y-1">
              <div className="mx-auto w-28 sm:w-44 border-b border-slate-700 pb-1">
                <span className="font-serif italic text-xs text-slate-700">Rufino Santa Rosa</span>
              </div>
              <p className="text-[9px] sm:text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                Mesa Alta Postulante
              </p>
              <p className="text-[8px] sm:text-[10px] text-slate-500">Dirección de Diseño y Experiencia</p>
            </div>

            {/* Sello Central Dorado */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-4 border-[#B88F69] bg-gradient-to-br from-[#f6e5cd] via-[#e2be8a] to-[#c69a5e] shadow-md">
                <Award className="h-8 w-8 sm:h-10 sm:w-10 text-[#543b19]" />
                <div className="absolute inset-1 rounded-full border border-dashed border-[#543b19]/40" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-mono font-bold tracking-widest text-[#8a6a4c] uppercase mt-1">
                SELLO OFICIAL
              </span>
            </div>

            {/* Firma Derecha */}
            <div className="text-center space-y-1">
              <div className="mx-auto w-28 sm:w-44 border-b border-slate-700 pb-1">
                <span className="font-serif italic text-xs text-slate-700">Comité Deliberador</span>
              </div>
              <p className="text-[9px] sm:text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                Cultura Organizacional
              </p>
              <p className="text-[8px] sm:text-[10px] text-slate-500">The Palace Company</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
