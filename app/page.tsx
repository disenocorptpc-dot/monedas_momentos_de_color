"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Vote, PlusCircle, Sparkles, User } from "lucide-react";
import {
  MESA_ALTA_INICIALES,
  EVALUADORES_INICIALES,
  COLABORADORES_INICIALES,
  CONVOCATORIA_ACTUAL,
} from "@/lib/supabase";
import { getUsuario, setUsuario, clearUsuario, type Usuario } from "@/lib/session";
import { getStoredNominaciones } from "@/lib/local-store";

// ─── Opciones de selección para el picker ────────────────────────────────────
const opcionesMesaAlta = MESA_ALTA_INICIALES.map((m) => ({
  id: m.id,
  nombre: m.nombre_completo,
  rol: "mesa_alta" as const,
  coordinacion_id: m.coordinacion_id,
}));

const opcionesComite = EVALUADORES_INICIALES.map((e) => ({
  id: e.id,
  nombre: e.nombre_completo,
  rol: "comite" as const,
  coordinacion_id: e.coordinacion_id,
}));

const PILARES_COLORES = [
  { label: "Atención al Detalle",    color: "#E8903A" },
  { label: "Hospitalidad Emocional", color: "#E8584A" },
  { label: "Anticipación",           color: "#2A7D6F" },
  { label: "Trabajo en Equipo",      color: "#4A8BB5" },
  { label: "Innovación",             color: "#7B6FA0" },
];

export default function HomePage() {
  const router = useRouter();
  const [usuario, setUsuarioState] = useState<Usuario | null>(null);
  const [seleccion, setSeleccion] = useState("");
  const [hayNominados, setHayNominados] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const u = getUsuario();
    setUsuarioState(u);
    setHayNominados(getStoredNominaciones().length > 0);
  }, []);

  const handleIngresar = () => {
    if (!seleccion) return;
    const todas = [...opcionesMesaAlta, ...opcionesComite];
    const found = todas.find((o) => o.id === seleccion);
    if (!found) return;
    const u: Usuario = { id: found.id, nombre: found.nombre, rol: found.rol, coordinacion_id: found.coordinacion_id };
    setUsuario(u);
    setUsuarioState(u);
  };

  const handleSalir = () => {
    clearUsuario();
    setUsuarioState(null);
    setSeleccion("");
  };

  if (!mounted) return null;

  // ── Vista: sesión activa ───────────────────────────────────────────────────
  if (usuario) {
    const esMesaAlta = usuario.rol === "mesa_alta";
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">

          {/* Encabezado con bienvenida */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center space-y-3">
            {/* Dots de pilares */}
            <div className="flex justify-center gap-1.5 mb-2">
              {PILARES_COLORES.map((p) => (
                <span key={p.label} className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
              ))}
            </div>
            <p className="text-xs font-medium text-[#B88F69] tracking-widest uppercase">
              {CONVOCATORIA_ACTUAL.ciclo} · The Palace Company
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              Monedas · Momentos de Color
            </h1>
            <div className="flex items-center justify-center gap-2 pt-1">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#254D6E]/10 text-[#254D6E]">
                <User className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold text-slate-800">{usuario.nombre}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                esMesaAlta
                  ? "bg-[#B88F69]/15 text-[#B88F69] border border-[#B88F69]/30"
                  : "bg-[#4A8BB5]/10 text-[#4A8BB5] border border-[#4A8BB5]/30"
              }`}>
                {esMesaAlta ? "Mesa Alta" : "Comité"}
              </span>
            </div>
          </div>

          {/* Acciones */}
          <div className="space-y-3">
            {esMesaAlta && (
              <button
                onClick={() => router.push("/nominar")}
                className="flex w-full items-center justify-between rounded-xl border border-[#B88F69]/30 bg-[#B88F69]/5 px-5 py-4 text-left transition-all hover:border-[#B88F69]/60 hover:bg-[#B88F69]/10 group"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#B88F69]/15 text-[#B88F69]">
                    <PlusCircle className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Nominar Colaborador</p>
                    <p className="text-xs text-slate-500">Postular para este ciclo</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#B88F69] transition-colors" />
              </button>
            )}

            <button
              onClick={() => hayNominados ? router.push("/votacion") : undefined}
              disabled={!hayNominados}
              className={`flex w-full items-center justify-between rounded-xl border px-5 py-4 text-left transition-all group ${
                hayNominados
                  ? "border-[#2A7D6F]/30 bg-[#2A7D6F]/5 hover:border-[#2A7D6F]/60 hover:bg-[#2A7D6F]/10 cursor-pointer"
                  : "border-slate-200 bg-slate-50 cursor-not-allowed opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  hayNominados ? "bg-[#2A7D6F]/15 text-[#2A7D6F]" : "bg-slate-100 text-slate-400"
                }`}>
                  <Vote className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Emitir Voto (Borda 3-2-1)</p>
                  <p className="text-xs text-slate-500">
                    {hayNominados ? "Cámara de votación abierta" : "Esperando nominaciones del ciclo"}
                  </p>
                </div>
              </div>
              <ChevronRight className={`h-4 w-4 transition-colors ${hayNominados ? "text-slate-400 group-hover:text-[#2A7D6F]" : "text-slate-300"}`} />
            </button>
          </div>

          {/* Botón salir + acceso admin discreto */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleSalir}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              ← Cambiar usuario
            </button>
            <a
              href="/admin"
              className="flex items-center gap-1 text-xs text-slate-300 hover:text-slate-500 transition-colors"
              title="Panel de administración"
            >
              <Sparkles className="h-3 w-3" />
              Admin
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Vista: selector de identidad ──────────────────────────────────────────
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">

        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="flex justify-center gap-1.5">
            {PILARES_COLORES.map((p) => (
              <span key={p.label} className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color }} />
            ))}
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest text-[#B88F69] uppercase">
              The Palace Company · {CONVOCATORIA_ACTUAL.ciclo}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Monedas · Momentos de Color
            </h1>
            <p className="mt-1 text-xs text-slate-500">Programa de Reconocimiento al Talento Humano</p>
          </div>
        </div>

        {/* Card de ingreso */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <p className="text-sm font-semibold text-slate-700">¿Quién eres?</p>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-500">Mesa Alta — Coordinadores</label>
            <select
              value={seleccion.startsWith("ma-") ? seleccion : ""}
              onChange={(e) => setSeleccion(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-[#B88F69] focus:outline-none focus:ring-1 focus:ring-[#B88F69]/20"
            >
              <option value="">— Selecciona tu nombre —</option>
              {opcionesMesaAlta.map((o) => (
                <option key={o.id} value={o.id}>{o.nombre}</option>
              ))}
            </select>
          </div>

          <div className="relative flex items-center gap-2">
            <div className="flex-1 border-t border-slate-100" />
            <span className="text-[10px] text-slate-400 font-medium">o</span>
            <div className="flex-1 border-t border-slate-100" />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-500">Comité Evaluador</label>
            <select
              value={seleccion.startsWith("ev-") ? seleccion : ""}
              onChange={(e) => setSeleccion(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-[#4A8BB5] focus:outline-none focus:ring-1 focus:ring-[#4A8BB5]/20"
            >
              <option value="">— Selecciona tu nombre —</option>
              {opcionesComite.map((o) => (
                <option key={o.id} value={o.id}>{o.nombre}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleIngresar}
            disabled={!seleccion}
            className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
              seleccion
                ? "bg-[#254D6E] text-white hover:bg-[#1c3d59]"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            Ingresar
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Acceso admin oculto */}
        <p className="text-center text-[10px] text-slate-300">
          <a href="/admin" className="hover:text-slate-500 transition-colors">
            administración ·
          </a>
        </p>
      </div>
    </div>
  );
}
