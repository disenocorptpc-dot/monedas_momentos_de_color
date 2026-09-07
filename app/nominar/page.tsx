"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  COORDINACIONES_INICIALES,
  COLABORADORES_INICIALES,
  MESA_ALTA_INICIALES,
  PILARES_INICIALES,
  CONVOCATORIA_ACTUAL,
  Nominacion,
} from "@/lib/supabase";
import {
  getCuotaDisponible,
  pushNominacion,
  fetchNominaciones,
} from "@/lib/local-store";
import { formatPilarBadgeColor, getPilarTheme } from "@/lib/utils";
import { getUsuario } from "@/lib/session";
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
  Ban,
  Pencil,
} from "lucide-react";

export default function NominarPage() {
  const router = useRouter();

  // Estados de modo edición
  const [editId, setEditId] = useState<string | null>(null);
  const [originalNom, setOriginalNom] = useState<Nominacion | null>(null);
  const [cargandoEdicion, setCargandoEdicion] = useState(false);

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
  const [cuotaInfo, setCuotaInfo] = useState<{ total: number; usadas: number; disponibles: number; tieneDesierta?: boolean }>({ total: 1, usadas: 0, disponibles: 1 });
  const [errorMsg, setErrorMsg] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [guardadoExito, setGuardadoExito] = useState(false);

  // Estados para declarar sin nominados (pasar ciclo)
  const [showPasarModal, setShowPasarModal] = useState(false);
  const [motivoPasar, setMotivoPasar] = useState("");
  const [guardandoPasar, setGuardandoPasar] = useState(false);
  const [paseExitoso, setPaseExitoso] = useState(false);

  // Inicialización de modo edición o auto-selección de coordinación por usuario
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const idToEdit = params.get("edit");
    const coordParam = params.get("coord");

    if (idToEdit) {
      setEditId(idToEdit);
      setCargandoEdicion(true);
      fetchNominaciones().then((noms) => {
        const found = noms.find((n) => n.id === idToEdit);
        if (found) {
          setOriginalNom(found);
          setCoordinacionId(found.coordinacion_id);
          setNominadoId(found.nominado_id);
          setPilaresSeleccionados(found.pilares || []);
          setDescripcionHecho(found.descripcion_hecho || "");
          setImpacto(found.impacto || "");
          setFotoPreview(found.foto_url || null);
          setFotoDescripcion(found.foto_descripcion || "");
        }
        setCargandoEdicion(false);
      });
    } else if (coordParam) {
      setCoordinacionId(coordParam);
    } else {
      const user = getUsuario();
      if (user?.coordinacion_id) {
        setCoordinacionId(user.coordinacion_id);
      }
    }
  }, []);

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

  const coordinacionActual = COORDINACIONES_INICIALES.find((c) => c.id === coordinacionId);

  const titularMesaAlta =
    MESA_ALTA_INICIALES.find((m) => m.coordinacion_id === coordinacionId) ||
    COLABORADORES_INICIALES.find((c) => c.coordinacion_id === coordinacionId && c.titular_mesa_alta);

  const nominadoSeleccionado = COLABORADORES_INICIALES.find((c) => c.id === nominadoId);
  const isEditingSameCoord = Boolean(editId && originalNom && originalNom.coordinacion_id === coordinacionId);

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

  // Enviar o actualizar nominación
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

    const isEditingSameCoord = Boolean(editId && originalNom && originalNom.coordinacion_id === coordinacionId);
    if (!isEditingSameCoord && cuotaInfo.disponibles <= 0) {
      setErrorMsg("Esta coordinación ya utilizó toda su cuota de nominaciones para este ciclo.");
      return;
    }

    const nominacionAGuardar: Nominacion = {
      id: editId || originalNom?.id || `nom-${Date.now()}`,
      convocatoria_id: CONVOCATORIA_ACTUAL.id,
      nominado_id: nominadoId,
      nominador_id: originalNom?.nominador_id || titularMesaAlta?.id || "col-1",
      coordinacion_id: coordinacionId,
      pilares: pilaresSeleccionados,
      descripcion_hecho: descripcionHecho.trim(),
      impacto: impacto.trim() || undefined,
      foto_url: fotoPreview || undefined,
      foto_descripcion: fotoDescripcion.trim() || undefined,
      riesgo_sesgo: originalNom?.riesgo_sesgo || 0,
      score_pilares: originalNom?.score_pilares,
      dictamen_ia: originalNom?.dictamen_ia,
      estado: originalNom?.estado || "aceptada",
    };

    setGuardando(true);
    setErrorMsg("");

    try {
      await pushNominacion(nominacionAGuardar);
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

  // Manejar pase de turno (declarar sin nominados)
  const handleConfirmarPasar = async () => {
    setGuardandoPasar(true);
    setErrorMsg("");

    const nominacionDesierta: Nominacion = {
      id: `nom-pass-${coordinacionId}-${CONVOCATORIA_ACTUAL.id}`,
      convocatoria_id: CONVOCATORIA_ACTUAL.id,
      nominado_id: "sin_nominado",
      nominador_id: titularMesaAlta?.id || "ma-2",
      coordinacion_id: coordinacionId,
      pilares: [],
      descripcion_hecho: motivoPasar.trim() || "La coordinación declara formalmente desierta su postulación para este ciclo.",
      riesgo_sesgo: 0,
      estado: "desierta",
    };

    try {
      await pushNominacion(nominacionDesierta);
      setShowPasarModal(false);
      setPaseExitoso(true);
      setTimeout(() => {
        router.push("/dashboard-mesa-alta");
      }, 1500);
    } catch (err: any) {
      setErrorMsg("Ocurrió un error al registrar el pase de turno. Por favor intenta de nuevo.");
    } finally {
      setGuardandoPasar(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Encabezado */}
      <div className="space-y-2">
        <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
          editId 
            ? "border-blue-300 bg-blue-50 text-blue-800"
            : "border-[#B88F69]/30 bg-[#B88F69]/10 text-[#B88F69]"
        }`}>
          {editId ? <Pencil className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
          {editId ? "Modo Edición de Postulación" : "Mesa Alta · Postulación Oficial"}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {editId ? "Editar Nominación de Talento" : "Formulario de Nominación de Talento"}
        </h1>
        <p className="text-xs text-slate-500 sm:text-sm">
          {editId 
            ? `Actualiza la información, pilares y relato de la postulación para la deliberación del ciclo ${CONVOCATORIA_ACTUAL.ciclo}.`
            : `Registra y documenta un Momento de Color para la deliberación del ciclo ${CONVOCATORIA_ACTUAL.ciclo}.`}
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
          {editId 
            ? "¡Nominación actualizada exitosamente! Redirigiendo al panel de cuotas..."
            : "¡Nominación registrada exitosamente! Redirigiendo al panel de cuotas..."}
        </div>
      )}

      {paseExitoso && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-900">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-700" />
          ¡Se ha registrado que tu coordinación pasa su turno este ciclo! Redirigiendo al panel de cuotas...
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
                  isEditingSameCoord
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : cuotaInfo.tieneDesierta
                    ? "bg-amber-50 text-amber-800 border border-amber-200"
                    : cuotaInfo.disponibles > 0
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {isEditingSameCoord
                  ? "Postulación Existente"
                  : cuotaInfo.tieneDesierta
                  ? "Turno Pasado"
                  : cuotaInfo.disponibles > 0
                  ? "Habilitado"
                  : "Cuota Agotada"}
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
              const theme = getPilarTheme(p.clave);
              return (
                <button
                  type="button"
                  key={p.clave}
                  onClick={() => togglePilar(p.clave)}
                  className={`relative flex flex-col text-left rounded-xl p-4 border-2 transition-all ${
                    isSelected
                      ? "shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70"
                  }`}
                  style={{
                    borderColor: isSelected ? theme.color : undefined,
                    backgroundColor: isSelected ? `${theme.color}12` : undefined,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: theme.color }}
                      />
                      <span
                        className="font-bold text-xs"
                        style={{ color: theme.color }}
                      >
                        {p.nombre}
                      </span>
                    </div>
                    {isSelected ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: theme.color }} />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-slate-300 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{p.descripcion}</p>
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

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-slate-200">
          <div>
            <button
              type="button"
              onClick={() => setShowPasarModal(true)}
              disabled={guardando || guardandoPasar || cuotaInfo.tieneDesierta}
              className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Ban className="h-4 w-4 text-amber-700" />
              {cuotaInfo.tieneDesierta ? "Turno ya declarado desierto" : "Declarar Sin Nominados (Pasar Ciclo)"}
            </button>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard-mesa-alta")}
              className="rounded-lg px-5 py-3 text-xs font-medium text-slate-500 hover:text-slate-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={(!isEditingSameCoord && cuotaInfo.disponibles <= 0) || guardando || cargandoEdicion}
              className="inline-flex items-center gap-2 rounded-lg bg-[#254D6E] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1c3d59] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {guardando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando en la nube...
                </>
              ) : editId ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Guardar Cambios de Postulación
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar Nominación Oficial
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Modal: Declarar Sin Nominados / Pasar Ciclo */}
      {showPasarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <Ban className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Declarar Sin Nominados · {coordinacionActual?.nombre}
                </h3>
                <p className="text-xs text-slate-500">
                  Ciclo {CONVOCATORIA_ACTUAL.ciclo} · Titular: {titularMesaAlta?.nombre_completo || "Rufino Santa Rosa"}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 space-y-2">
              <p className="font-semibold">¿Confirmas que tu coordinación no postulará candidatos este ciclo?</p>
              <p className="text-amber-800 leading-relaxed">
                Esta acción registrará formalmente que tu área pasa su turno en esta convocatoria. Tu cuota se marcará como concluida en el Dashboard de Mesa Alta y el comité deliberador podrá proceder con la votación entre las candidaturas activas sin dejar cuotas en espera.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Motivo o Justificación (Opcional):
              </label>
              <textarea
                rows={3}
                value={motivoPasar}
                onChange={(e) => setMotivoPasar(e.target.value)}
                placeholder="Ej. Durante este ciclo no se registraron acciones extraordinarias que califiquen a la Moneda Momento de Color..."
                className="w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPasarModal(false)}
                disabled={guardandoPasar}
                className="rounded-lg px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleConfirmarPasar}
                disabled={guardandoPasar}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {guardandoPasar ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Confirmar y Pasar Turno
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
