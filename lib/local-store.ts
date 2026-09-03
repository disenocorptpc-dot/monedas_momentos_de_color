"use client";

import {
  COMITE_INICIAL,
  CONVOCATORIA_ACTUAL,
  COORDINACIONES_INICIALES,
  ComiteInhabilitacion,
  ComiteIntegrante,
  ComiteVoto,
  Convocatoria,
  Nominacion,
} from "./supabase";

export type { Nominacion, ComiteVoto, ComiteIntegrante, ComiteInhabilitacion, Convocatoria };

const CONV_ID = CONVOCATORIA_ACTUAL.id;

export const STORAGE_KEYS = {
  NOMINACIONES: "mmc_nominaciones_v2",
  COMITE: "mmc_comite_v1",
  INHABILITACIONES: "mmc_inhabilitaciones_v1",
  VOTOS: "mmc_votos_v1",
  CONVOCATORIA: "mmc_convocatoria_v1",
};

// ─── Nominaciones ─────────────────────────────────────────────────────────────

export async function fetchNominaciones(): Promise<Nominacion[]> {
  try {
    const res = await fetch(`/api/nominaciones?convocatoria_id=${CONV_ID}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        // Actualizar caché local
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.NOMINACIONES, JSON.stringify(data));
        }
        return data;
      }
    }
  } catch (err) {
    console.warn("Fallo al conectar con /api/nominaciones, usando caché local:", err);
  }
  return getStoredNominaciones();
}

export async function pushNominacion(nom: Nominacion): Promise<boolean> {
  // Guardado local inmediato de seguridad
  saveStoredNominacion(nom);

  try {
    const res = await fetch("/api/nominaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nom),
    });
    return res.ok;
  } catch (err) {
    console.error("Error al sincronizar nominación con el servidor:", err);
    return false;
  }
}

// ─── Votos ────────────────────────────────────────────────────────────────────

export async function fetchVotos(): Promise<ComiteVoto[]> {
  try {
    const res = await fetch(`/api/votos?convocatoria_id=${CONV_ID}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.VOTOS, JSON.stringify(data));
        }
        return data;
      }
    }
  } catch (err) {
    console.warn("Fallo al conectar con /api/votos, usando caché local:", err);
  }
  return getStoredVotos();
}

export async function pushVotos(votos: ComiteVoto[]): Promise<boolean> {
  saveStoredVotos(votos);

  try {
    const res = await fetch("/api/votos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ convocatoria_id: CONV_ID, votos }),
    });
    return res.ok;
  } catch (err) {
    console.error("Error al sincronizar votos con el servidor:", err);
    return false;
  }
}

// ─── Inhabilitaciones ─────────────────────────────────────────────────────────

export async function fetchInhabilitaciones(): Promise<ComiteInhabilitacion[]> {
  try {
    const res = await fetch(`/api/inhabilitaciones?convocatoria_id=${CONV_ID}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.INHABILITACIONES, JSON.stringify(data));
        }
        return data;
      }
    }
  } catch (err) {
    console.warn("Fallo al conectar con /api/inhabilitaciones, usando caché local:", err);
  }
  return getStoredInhabilitaciones();
}

export async function pushInhabilitacion(inhab: ComiteInhabilitacion): Promise<boolean> {
  saveInhabilitacion(inhab);

  try {
    const res = await fetch("/api/inhabilitaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inhab),
    });
    return res.ok;
  } catch (err) {
    console.error("Error al sincronizar inhabilitación con el servidor:", err);
    return false;
  }
}

// ─── localStorage (caché local de respaldo y sincronización) ─────────────────

export function getStoredConvocatoria(): Convocatoria {
  if (typeof window === "undefined") return CONVOCATORIA_ACTUAL;
  const data = localStorage.getItem(STORAGE_KEYS.CONVOCATORIA);
  if (data) {
    try { return JSON.parse(data); } catch { /* noop */ }
  }
  localStorage.setItem(STORAGE_KEYS.CONVOCATORIA, JSON.stringify(CONVOCATORIA_ACTUAL));
  return CONVOCATORIA_ACTUAL;
}

export function getStoredNominaciones(): Nominacion[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEYS.NOMINACIONES);
  if (data) {
    try { return JSON.parse(data); } catch { /* noop */ }
  }
  return [];
}

export function saveStoredNominacion(nom: Nominacion): Nominacion[] {
  const current = getStoredNominaciones();
  const index = current.findIndex((n) => n.id === nom.id);
  let updated: Nominacion[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...nom, updated_at: new Date().toISOString() };
  } else {
    updated = [...current, { ...nom, id: nom.id || `nom-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }];
  }
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEYS.NOMINACIONES, JSON.stringify(updated));
  return updated;
}

export function getStoredComite(): ComiteIntegrante[] {
  if (typeof window === "undefined") return COMITE_INICIAL;
  const data = localStorage.getItem(STORAGE_KEYS.COMITE);
  if (data) {
    try { return JSON.parse(data); } catch { /* noop */ }
  }
  localStorage.setItem(STORAGE_KEYS.COMITE, JSON.stringify(COMITE_INICIAL));
  return COMITE_INICIAL;
}

export function getStoredInhabilitaciones(): ComiteInhabilitacion[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEYS.INHABILITACIONES);
  if (data) {
    try { return JSON.parse(data); } catch { /* noop */ }
  }
  return [];
}

export function saveInhabilitacion(inhab: ComiteInhabilitacion): ComiteInhabilitacion[] {
  const current = getStoredInhabilitaciones();
  const filtered = current.filter((i) => i.integrante_id !== inhab.integrante_id);
  const updated = [...filtered, { ...inhab, id: inhab.id || `inhab-${Date.now()}`, created_at: new Date().toISOString() }];
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEYS.INHABILITACIONES, JSON.stringify(updated));
  return updated;
}

export function getStoredVotos(): ComiteVoto[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEYS.VOTOS);
  if (data) {
    try { return JSON.parse(data); } catch { /* noop */ }
  }
  return [];
}

export function saveStoredVotos(nuevosVotos: ComiteVoto[]): ComiteVoto[] {
  const current = getStoredVotos();
  const integranteId = nuevosVotos[0]?.integrante_id;
  const convId = nuevosVotos[0]?.convocatoria_id;
  const filtered = current.filter((v) => !(v.integrante_id === integranteId && v.convocatoria_id === convId));
  const updated = [...filtered, ...nuevosVotos];
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEYS.VOTOS, JSON.stringify(updated));
  return updated;
}

export function getCuotaDisponible(coordinacionId: string, listaNominaciones?: Nominacion[]): { total: number; usadas: number; disponibles: number } {
  const coord = COORDINACIONES_INICIALES.find((c) => c.id === coordinacionId);
  const total = coord?.cuota_mes || 1;
  const nominaciones = listaNominaciones ?? getStoredNominaciones();
  const usadas = nominaciones.filter((n) => n.coordinacion_id === coordinacionId && n.estado !== "rechazada").length;
  return { total, usadas, disponibles: Math.max(0, total - usadas) };
}
