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
  saveStoredNominacion,
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
  const [guardadoExito, setGuardadoExito] = useState(false);

  // Actualizar cuota cuando cambia coordinación
  useEffect(() => {
    setCuotaInfo(getCuotaDisponible(coordinacionId));
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
  const handleSubmit = (e: React.FormEvent) => {
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

    saveStoredNominacion(nuevaNominacion);
    setGuardadoExito(true);

    setTimeout(() => {
      router.push("/dashboard-mesa-alta");
    }, 1200);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Encabezado */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
          <Sparkles className="h-3.5 w-3.5" />
          Mesa Alta · Postulación Oficial
        </div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Formulario de Nominación de Talento
        </h1>
        <p className="text-xs text-slate-400 sm:text-sm">
          Registra y documenta un Momento de Color para la deliberación del ciclo {CONVOCATORIA_ACTUAL.ciclo}.
        </p>
      </div>

      {/* Alertas */}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs font-semibold text-rose-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      {guardadoExito && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-300 animate-pulse">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          ¡Nominación registrada exitosamente! Redirigiendo al panel de cuotas...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección 1: Coordinación y Cuota */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs">1</span>
            Coordinación & Cuota Mensual
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Coordinación Postulante:
              </label>
              <select
                value={coordinacionId}
                onChange={(e) => {
                  setCoordinacionId(e.target.value);
                  setNominadoId("");
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                {COORDINACIONES_INICIALES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} (Cuota: {c.cuota_mes}/mes)
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-slate-400">
                Titular Mesa Alta: <span className="text-slate-200 font-medium">{titularMesaAlta?.nombre_completo || "Pendiente"}</span>
              </p>
            </div>

            {/* Badge de Cuota */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Estado de Cuota ({CONVOCATORIA_ACTUAL.ciclo})</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-extrabold text-white">{cuotaInfo.disponibles}</span>
                  <span className="text-xs text-slate-400">disponibles de {cuotaInfo.total}</span>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  cuotaInfo.disponibles > 0
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                }`}
              >
                {cuotaInfo.disponibles > 0 ? "Habilitado" : "Cuota Agotada"}
              </span>
            </div>
          </div>
        </div>

        {/* Sección 2: Colaborador Nominado */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs">2</span>
            Colaborador Postulado
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Seleccionar Colaborador del Padrón:
            </label>
            <select
              value={nominadoId}
              onChange={(e) => setNominadoId(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
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
                <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 p-2.5 text-[11px] text-amber-300">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Aviso de jerarquía:</strong> Eres el jefe directo de este colaborador. La nominación es válida para la deliberación del comité.
                  </span>
                </div>
            )}
          </div>
        </div>

        {/* Sección 3: Pilares (Mínimo 1, Máximo 3) */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs">3</span>
              Pilares de Excelencia (Selecciona de 1 a 3)
            </h2>
            <span className="text-xs font-bold text-amber-400">
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
                  className={`flex flex-col text-left rounded-xl p-3.5 border transition-all ${
                    isSelected
                      ? `border-amber-400 bg-amber-500/15 shadow-md shadow-amber-500/10`
                      : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${formatPilarBadgeColor(p.clave)}`}>
                      {p.nombre}
                    </span>
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">{p.descripcion}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sección 4: Relato del Hecho e Impacto */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs">4</span>
            Evidencia & Relato del Hecho
          </h2>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Descripción del Hecho (Mínimo 80 caracteres): *
              </label>
              <span
                className={`text-[11px] font-mono ${
                  descripcionHecho.trim().length >= 80 ? "text-emerald-400 font-bold" : "text-slate-500"
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
              className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3.5 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Impacto Observable (Opcional):
            </label>
            <textarea
              rows={2}
              value={impacto}
              onChange={(e) => setImpacto(e.target.value)}
              placeholder="Consecuencia directa en la satisfacción del huésped, ahorro o fortalecimiento del equipo..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3.5 text-xs text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Adjunto Fotográfico (Opcional) */}
          <div className="pt-2 border-t border-slate-800/80">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Evidencia Fotográfica (100% Opcional — Comprimida a ≤1600px en WebP):
            </label>

            {!fotoPreview ? (
              <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/40 p-5 cursor-pointer hover:border-amber-500/50 hover:bg-slate-900/50 transition-all">
                <Upload className="h-6 w-6 text-slate-400 mb-1" />
                <span className="text-xs font-medium text-slate-300">Seleccionar imagen de evidencia</span>
                <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG o WebP</span>
                <input type="file" accept="image/*" onChange={handleFotoUpload} className="hidden" />
              </label>
            ) : (
              <div className="space-y-3">
                <div className="relative inline-block rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
                  <img src={fotoPreview} alt="Evidencia" className="h-40 w-auto object-cover" />
                  <button
                    type="button"
                    onClick={removeFoto}
                    className="absolute top-2 right-2 rounded-full bg-black/80 p-1 text-slate-300 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">
                    Descripción de la foto (Obligatoria al adjuntar imagen): *
                  </label>
                  <input
                    type="text"
                    value={fotoDescripcion}
                    onChange={(e) => setFotoDescripcion(e.target.value)}
                    placeholder="Explica brevemente qué se observa en la fotografía..."
                    className="w-full rounded-xl border border-amber-500/50 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
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
            className="rounded-xl px-5 py-3 text-xs font-medium text-slate-400 hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={cuotaInfo.disponibles <= 0}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-amber-500 disabled:opacity-50 transition-all"
          >
            <Send className="h-4 w-4" />
            Enviar Nominación Oficial
          </button>
        </div>
      </form>
    </div>
  );
}
