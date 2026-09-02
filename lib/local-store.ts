"use client";

import {
  COLABORADORES_INICIALES,
  COMITE_INICIAL,
  CONVOCATORIA_ACTUAL,
  COORDINACIONES_INICIALES,
  PILARES_INICIALES,
  Colaborador,
  ComiteInhabilitacion,
  ComiteIntegrante,
  ComiteVoto,
  Convocatoria,
  Coordinacion,
  Nominacion,
  Pilar,
  isSupabaseConfigured,
  supabase,
} from "./supabase";

const STORAGE_KEYS = {
  NOMINACIONES: "mmc_nominaciones_v2",   // v2: sin datos demo
  COMITE: "mmc_comite_v1",
  INHABILITACIONES: "mmc_inhabilitaciones_v1",
  VOTOS: "mmc_votos_v1",
  CONVOCATORIA: "mmc_convocatoria_v1",
};

export function getStoredConvocatoria(): Convocatoria {
  if (typeof window === "undefined") return CONVOCATORIA_ACTUAL;
  const data = localStorage.getItem(STORAGE_KEYS.CONVOCATORIA);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.setItem(STORAGE_KEYS.CONVOCATORIA, JSON.stringify(CONVOCATORIA_ACTUAL));
  return CONVOCATORIA_ACTUAL;
}

export function getStoredNominaciones(): Nominacion[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEYS.NOMINACIONES);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
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
    updated = [
      ...current,
      {
        ...nom,
        id: nom.id || `nom-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.NOMINACIONES, JSON.stringify(updated));
  }
  // Si Supabase está configurado, guardar también en Supabase
  if (isSupabaseConfigured()) {
    supabase.from("nominaciones").upsert(nom).then(({ error }) => {
      if (error) console.warn("Supabase upsert error:", error);
    });
  }
  return updated;
}

export function getStoredComite(): ComiteIntegrante[] {
  if (typeof window === "undefined") return COMITE_INICIAL;
  const data = localStorage.getItem(STORAGE_KEYS.COMITE);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.setItem(STORAGE_KEYS.COMITE, JSON.stringify(COMITE_INICIAL));
  return COMITE_INICIAL;
}

export function getStoredInhabilitaciones(): ComiteInhabilitacion[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEYS.INHABILITACIONES);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  return [];
}

export function saveInhabilitacion(inhab: ComiteInhabilitacion): ComiteInhabilitacion[] {
  const current = getStoredInhabilitaciones();
  const filtered = current.filter((i) => i.integrante_id !== inhab.integrante_id);
  const updated = [...filtered, { ...inhab, id: inhab.id || `inhab-${Date.now()}`, created_at: new Date().toISOString() }];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.INHABILITACIONES, JSON.stringify(updated));
  }
  return updated;
}

export function getStoredVotos(): ComiteVoto[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEYS.VOTOS);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }
  return [];
}

export function saveStoredVotos(nuevosVotos: ComiteVoto[]): ComiteVoto[] {
  const current = getStoredVotos();
  // Eliminar votos previos del mismo integrante en la misma convocatoria
  const integranteId = nuevosVotos[0]?.integrante_id;
  const convId = nuevosVotos[0]?.convocatoria_id;
  const filtered = current.filter(
    (v) => !(v.integrante_id === integranteId && v.convocatoria_id === convId)
  );
  const updated = [...filtered, ...nuevosVotos];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.VOTOS, JSON.stringify(updated));
  }
  if (isSupabaseConfigured()) {
    supabase.from("comite_votos").upsert(nuevosVotos).then(({ error }) => {
      if (error) console.warn("Supabase votes upsert error:", error);
    });
  }
  return updated;
}

export function getCuotaDisponible(coordinacionId: string): { total: number; usadas: number; disponibles: number } {
  const coord = COORDINACIONES_INICIALES.find((c) => c.id === coordinacionId);
  const total = coord?.cuota_mes || 1;
  const nominaciones = getStoredNominaciones();
  const usadas = nominaciones.filter(
    (n) => n.coordinacion_id === coordinacionId && n.estado !== "rechazada"
  ).length;
  return {
    total,
    usadas,
    disponibles: Math.max(0, total - usadas),
  };
}
