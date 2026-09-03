"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  COORDINACIONES_INICIALES,
  COLABORADORES_INICIALES,
  PILARES_INICIALES,
  CONVOCATORIA_ACTUAL,
  Nominacion,
} from "@/lib/supabase";
import {
  getCuotaDisponible,
  pushNominacion,
  fetchNominaciones,
} from "@/lib/local-store";
import { formatPilarBadgeColor } from "@/lib/utils";
import { comprimirImagen } from "@/lib/image-compress";
import {
  Sparkles,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Info,
  Send,
  X,
  Loader2,
} from "lucide-react";

export default function NominarPage() {
  const router = useRouter();

  // Estados del formulario
  const [coordinacionId, setCoordinacionId] = useState(COORDINACIONES_INICIALES[0].id);
  const [nominadoId, setNominadoId] = useState("");
  const [pilaresSeleccionados, setPilaresSeleccionados] = useState<string[]>([]);
  const [descripcionHecho, setDescripcionHecho] = useState("");
  const [impacto, setImpacto] = useState("");
  const [fotoBlob, setFotoBlob] = useState<Blob | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoDescripcion, setFotoDescripcion] = useState("");

  // Estados de cuota y validación
  const [cuotaInfo, setCuotaInfo] = useState({ total: 1, usadas: 0, disponibles: 1 });
  const [errorMsg, setErrorMsg] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [guardadoExito, setGuardadoExito] = useState(false);

  // Actualizar cuota cuando cambia coordinación
  useEffect(() => {
    fetchNominaciones().then((noms) => {
      setCuotaInfo(getCuotaDisponible(coordinacionId, noms));
    });
  }, [coordinacionId]);

  // Colaboradores filtrados por coordinación
  const colaboradoresDisponibles = COLABORADORES_INICIALES.filter(
    (c) => c.coordinacion_id === coordinacionId && c.activo
  );

  const titularMesaAlta = COLABORADORES_INICIALES.find(
    (c) => c.coordinacion_id === coordinacionId && c.titular_mesa_alta
  );

  const nominadoSeleccionado = COLABORADORES_INICIALES.find((c) => c.id === nominadoId);

  // Toggle de selección de pilares (mínimo 1, máximo 3)
  const togglePilar = (clave: string) => {
    if (pilaresSeleccionados.includes(clave)) {
      setPilaresSeleccionados(pilaresSeleccionados.filter((p) => p !== clave));
    } else {
      if (pilaresSeleccionados.length >= 3) {
        setErrorMsg("Solo puedes seleccionar un máximo de 3 pilares por nominación.");
        return;
      }
      setErrorMsg("");
      setPilaresSeleccionados([...pilaresSeleccionados, clave]);
    }
  };

  // Manejar carga de imagen y compresión
  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await comprimirImagen(file);
      setFotoBlob(res.blob);
      setFotoPreview(res.dataUrl);
    } catch (err) {
      console.error(err);
      setErrorMsg("Error al procesar y comprimir la imagen.");
    }
  };

  const removeFoto = () => {
    setFotoBlob(null);
    setFotoPreview(null);
    setFotoDescripcion("");
  };

  // Enviar nominación
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nominadoId) {
      setErrorMsg("Por favor selecciona al colaborador nominado.");
      return;
    }
    if (pilaresSeleccionados.length === 0 || pilaresSeleccionados.length > 3) {
      setErrorMsg("Debes seleccionar entre 1 y 3 pilares.");
      return;
    }
    if (descripcionHecho.trim().length < 80) {
      setErrorMsg("La descripción del hecho debe tener al menos 80 caracteres.");
      return;
    }
    if (fotoPreview && !fotoDescripcion.trim()) {
      setErrorMsg("Si adjuntas una imagen, la descripción de qué se ve es obligatoria.");
      return;
    }
    if (cuotaInfo.disponibles <= 0) {
      setErrorMsg("Esta coordinación ya utilizó toda su cuota de nominaciones para este ciclo.");
      return;
    }

    const nuevaNominacion: Nominacion = {
      id: `nom-${Date.now()}`,
      convocatoria_id: CONVOCATORIA_ACTUAL.id,
      nominado_id: nominadoId,
      nominador_id: titularMesaAlta?.id || "col-1",
      coordinacion_id: coordinacionId,
      pilares: pilaresSeleccionados,
      descripcion_hecho: descripcionHecho.trim(),
      impacto: impacto.trim() || undefined,
      foto_url: fotoPreview || undefined,
      foto_descripcion: fotoDescripcion.trim() || undefined,
      riesgo_sesgo: 0,
      estado: "aceptada",
    };

    setGuardando(true);
    setErrorMsg("");

    try {
      await pushNominacion(nuevaNominacion);
      setGuardadoExito(true);
      setTimeout(() => {
        router.push("/dashboard-mesa-alta");
      }, 1200);
    } catch (err: any) {
      setErrorMsg("Ocurrió un problema al guardar la postulación. Por favor reintenta.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Encabezado */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#B88F69]/30 bg-[#B88F69]/10 px-3 py-1 text-xs font-semibold text-[#B88F69]">
          <Sparkles className="h-3.5 w-3.5" />
          Mesa Alta · Postulación Oficial
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Formulario de Nominación de Talento
        </h1>
        <p className="text-xs text-slate-500 sm:text-sm">
          Registra y documenta un Momento de Color para la deliberación del ciclo {CONVOCATORIA_ACTUAL.ciclo}.
        </p>
      </div>

      {/* Alertas */}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      {guardadoExito && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          ¡Nominación registrada exitosamente! Redirigiendo al panel de cuotas...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección 1: Coordinación y Cuota */}
        <div className="panel-card rounded-xl p-6 border border-slate-200 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#B88F69]/15 text-[#B88F69] text-xs font-bold">1</span>
            Coordinación & Cuota Mensual
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Coordinación Postulante:
              </label>
              <select
                value={coordinacionId}
                onChange={(e) => {
                  setCoordinacionId(e.target.value);
                  setNominadoId("");
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#254D6E] focus:outline-none focus:ring-1 focus:ring-[#254D6E]/20"
              >
                {COORDINACIONES_INICIALES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} (Cuota: {c.cuota_mes}/mes)
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-slate-500">
                Titular Mesa Alta: <span className="text-slate-700 font-medium">{titularMesaAlta?.nombre_completo || "Pendiente"}</span>
              </p>
            </div>

            {/* Badge de Cuota */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-500 font-medium">Estado de Cuota ({CONVOCATORIA_ACTUAL.ciclo})</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-bold text-slate-900">{cuotaInfo.disponibles}</span>
                  <span className="text-xs text-slate-500">disponibles de {cuotaInfo.total}</span>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                  cuotaInfo.disponibles > 0
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {cuotaInfo.disponibles > 0 ? "Habilitado" : "Cuota Agotada"}
              </span>
            </div>
          </div>
        </div>

        {/* Sección 2: Colaborador Nominado */}
        <div className="panel-card rounded-xl p-6 border border-slate-200 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#B88F69]/15 text-[#B88F69] text-xs font-bold">2</span>
            Colaborador Postulado
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Seleccionar Colaborador del Padrón:
            </label>
            <select
              value={nominadoId}
              onChange={(e) => setNominadoId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#254D6E] focus:outline-none focus:ring-1 focus:ring-[#254D6E]/20"
            >
              <option value="">-- Selecciona un colaborador --</option>
              {colaboradoresDisponibles.map((colab) => (
                <option key={colab.id} value={colab.id}>
                  {colab.nombre_completo} {colab.jefe_directo ? `(Jefe: ${colab.jefe_directo})` : ""}
                </option>
              ))}
            </select>

            {nominadoSeleccionado?.jefe_directo && titularMesaAlta?.nombre_completo &&
              nominadoSeleccionado.jefe_directo.toLowerCase().includes(titularMesaAlta.nombre_completo.toLowerCase()) && (
                <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-[#B88F69]/10 border border-[#B88F69]/30 p-2.5 text-[11px] text-[#8a6a4c]">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Aviso de jerarquía:</strong> Eres el jefe directo de este colaborador. La nominación es válida para la deliberación del comité.
                  </span>
                </div>
            )}
          </div>
        </div>

        {/* Sección 3: Pilares (Mínimo 1, Máximo 3) */}
        <div className="panel-card rounded-xl p-6 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#B88F69]/15 text-[#B88F69] text-xs font-bold">3</span>
              Pilares de Excelencia (Selecciona de 1 a 3)
            </h2>
            <span className="text-xs font-semibold text-[#B88F69]">
              {pilaresSeleccionados.length} / 3 seleccionados
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {PILARES_INICIALES.map((p) => {
              const isSelected = pilaresSeleccionados.includes(p.clave);
              return (
                <button
                  type="button"
                  key={p.clave}
                  onClick={() => togglePilar(p.clave)}
                  className={`flex flex-col text-left rounded-lg p-3.5 border transition-all ${
                    isSelected
                      ? "border-[#B88F69] bg-[#B88F69]/10 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${formatPilarBadgeColor(p.clave)}`}>
                      {p.nombre}
                    </span>
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-[#B88F69]" />}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">{p.descripcion}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sección 4: Relato del Hecho e Impacto */}
        <div className="panel-card rounded-xl p-6 border border-slate-200 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#B88F69]/15 text-[#B88F69] text-xs font-bold">4</span>
            Evidencia & Relato del Hecho
          </h2>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-600">
                Descripción del Hecho (Mínimo 80 caracteres): *
              </label>
              <span
                className={`text-[11px] font-mono ${
                  descripcionHecho.trim().length >= 80 ? "text-emerald-600 font-bold" : "text-slate-400"
                }`}
              >
                {descripcionHecho.trim().length} / 80 mín.
              </span>
            </div>
            <textarea
              rows={4}
              value={descripcionHecho}
              onChange={(e) => setDescripcionHecho(e.target.value)}
              placeholder="Narra con detalle la acción específica, contexto y momento donde el colaborador demostró excelencia..."
              className="w-full rounded-lg border border-slate-200 bg-white p-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#254D6E] focus:outline-none focus:ring-1 focus:ring-[#254D6E]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Impacto Observable (Opcional):
            </label>
            <textarea
              rows={2}
              value={impacto}
              onChange={(e) => setImpacto(e.target.value)}
              placeholder="Consecuencia directa en la satisfacción del huésped, ahorro o fortalecimiento del equipo..."
              className="w-full rounded-lg border border-slate-200 bg-white p-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#254D6E] focus:outline-none focus:ring-1 focus:ring-[#254D6E]/20"
            />
          </div>

          {/* Adjunto Fotográfico (Opcional) */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Evidencia Fotográfica (100% Opcional — Comprimida a ≤1600px en WebP):
            </label>

            {!fotoPreview ? (
              <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-5 cursor-pointer hover:border-[#B88F69]/50 hover:bg-white transition-all">
                <Upload className="h-6 w-6 text-slate-400 mb-1" />
                <span className="text-xs font-medium text-slate-600">Seleccionar imagen de evidencia</span>
                <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG o WebP</span>
                <input type="file" accept="image/*" onChange={handleFotoUpload} className="hidden" />
              </label>
            ) : (
              <div className="space-y-3">
                <div className="relative inline-block rounded-lg overflow-hidden border border-slate-200 bg-white">
                  <img src={fotoPreview} alt="Evidencia" className="h-40 w-auto object-cover" />
                  <button
                    type="button"
                    onClick={removeFoto}
                    className="absolute top-2 right-2 rounded-full bg-slate-900/70 p-1 text-white hover:bg-slate-900"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#B88F69] mb-1">
                    Descripción de la foto (Obligatoria al adjuntar imagen): *
                  </label>
                  <input
                    type="text"
                    value={fotoDescripcion}
                    onChange={(e) => setFotoDescripcion(e.target.value)}
                    placeholder="Explica brevemente qué se observa en la fotografía..."
                    className="w-full rounded-lg border border-[#B88F69]/40 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-[#B88F69] focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botón Final */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard-mesa-alta")}
            className="rounded-lg px-5 py-3 text-xs font-medium text-slate-500 hover:text-slate-900"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={cuotaInfo.disponibles <= 0 || guardando}
            className="inline-flex items-center gap-2 rounded-lg bg-[#254D6E] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1c3d59] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {guardando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando en la nube...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Enviar Nominación Oficial
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
