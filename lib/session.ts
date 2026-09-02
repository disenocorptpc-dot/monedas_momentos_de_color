// ─── Gestión de sesión local ──────────────────────────────────────────────────
// Sin backend: guarda la identidad del usuario en localStorage para la sesión.

export type Rol = "mesa_alta" | "comite" | "comodin";

export interface Usuario {
  id: string;
  nombre: string;
  rol: Rol;
  coordinacion_id: string;
}

const KEY = "mmc_usuario_v2";

export function getUsuario(): Usuario | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Usuario;
  } catch {
    return null;
  }
}

export function setUsuario(u: Usuario): void {
  localStorage.setItem(KEY, JSON.stringify(u));
}

export function clearUsuario(): void {
  localStorage.removeItem(KEY);
}
