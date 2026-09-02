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

const CONV_ID = CONVOCATORIA_ACTUAL.id;
const IS_PROD = typeof window !== "undefined" && window.location.hostname !== "localhost";

// ─── Nominaciones ─────────────────────────────────────────────────────────────

export async function fetchNominaciones(): Promise<Nominacion[]> {
  if (IS_PROD) {
    const res = await fetch(`/api/nominaciones?convocatoria_id=${CONV_ID}`);
    if (res.ok) return res.json();
  }
  return getStoredNominaciones();
}

export async function pushNominacion(nom: Nominacion): Promise<void> {
  if (IS_PROD) {
    await fetch("/api/nominaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nom),
    });
  } else {
    saveStoredNominacion(nom);
  }
}

// ─── Votos ────────────────────────────────────────────────────────────────────

export async function fetchVotos(): Promise<ComiteVoto[]> {
  if (IS_PROD) {
    const res = await fetch(`/api/votos?convocatoria_id=${CONV_ID}`);
    if (res.ok) return res.json();
  }
  return getStoredVotos();
}

export async function pushVotos(votos: ComiteVoto[]): Promise<void> {
  if (IS_PROD) {
    await fetch("/api/votos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ convocatoria_id: CONV_ID, votos }),
    });
  } else {
    saveStoredVotos(votos);
  }
}

// ─── Inhabilitaciones ─────────────────────────────────────────────────────────

export async function fetchInhabilitaciones(): Promise<ComiteInhabilitacion[]> {
  if (IS_PROD) {
    const res = await fetch(`/api/inhabilitaciones?convocatoria_id=${CONV_ID}`);
    if (res.ok) return res.json();
  }
  return getStoredInhabilitaciones();
}

export async function pushInhabilitacion(inhab: ComiteInhabilitacion): Promise<void> {
  if (IS_PROD) {
    await fetch("/api/inhabilitaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inhab),
    });
  } else {
    saveInhabilitacion(inhab);
  }
}

// ─── localStorage (fallback local dev) ───────────────────────────────────────

const STORAGE_KEYS = {
  NOMINACIONES: "mmc_nominaciones_v2",
  COMITE: "mmc_comite_v1",
  INHABILITACIONES: "mmc_inhabilitaciones_v1",
  VOTOS: "mmc_votos_v1",
  CONVOCATORIA: "mmc_convocatoria_v1",
};

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

export function getCuotaDisponible(coordinacionId: string): { total: number; usadas: number; disponibles: number } {
  const coord = COORDINACIONES_INICIALES.find((c) => c.id === coordinacionId);
  const total = coord?.cuota_mes || 1;
  const nominaciones = getStoredNominaciones();
  const usadas = nominaciones.filter((n) => n.coordinacion_id === coordinacionId && n.estado !== "rechazada").length;
  return { total, usadas, disponibles: Math.max(0, total - usadas) };
}
