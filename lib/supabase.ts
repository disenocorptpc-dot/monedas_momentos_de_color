import { createClient } from "@supabase/supabase-js";

export interface Coordinacion {
  id: string;
  nombre: string;
  cuota_mes: number;
}

export interface Colaborador {
  id: string;
  nombre_completo: string;
  coordinacion_id: string;
  jefe_directo?: string;
  titular_mesa_alta?: string;
  activo: boolean;
}

export interface Pilar {
  id: string;
  clave: string;
  nombre: string;
  descripcion: string;
  color_hex: string;
  orden: number;
}

export interface Convocatoria {
  id: string;
  ciclo: string;
  estado: "nominaciones" | "verificacion" | "votacion" | "computo" | "cerrado" | "nulo";
  fecha_inicio: string;
  fecha_cierre_nom: string;
  fecha_cierre_vot: string;
  quorum_minimo: number;
}

export interface Nominacion {
  id: string;
  convocatoria_id: string;
  nominado_id: string;
  nominador_id: string;
  coordinacion_id: string;
  pilares: string[];
  descripcion_hecho: string;
  impacto?: string;
  foto_url?: string;
  foto_descripcion?: string;
  riesgo_sesgo: number;
  score_pilares?: number;
  dictamen_ia?: string;
  analisis_ia?: any;
  estado: "borrador" | "enviada" | "aceptada" | "rechazada";
  created_at?: string;
  updated_at?: string;
}

export interface ComiteIntegrante {
  id: string;
  colaborador_id: string;
  coordinacion_id?: string | null;
  es_titular: boolean;
  es_comodin?: boolean;
  activo: boolean;
}

export interface ComiteInhabilitacion {
  id: string;
  convocatoria_id: string;
  integrante_id: string;
  motivo: string;
  suplente_id?: string;
  designado_por: string;
  created_at?: string;
}

export interface ComiteVoto {
  id: string;
  convocatoria_id: string;
  integrante_id: string;
  nominacion_id: string;
  puntos: 1 | 2 | 3;
  created_at?: string;
}

// Datos iniciales para arranque inmediato y fallback offline
export const PILARES_INICIALES: Pilar[] = [
  {
    id: "p1",
    clave: "atencion_detalle",
    nombre: "Atención al Detalle",
    descripcion: "Percibir lo que no se dice, actuar antes de que se pida",
    color_hex: "#E8903A",
    orden: 1,
  },
  {
    id: "p2",
    clave: "hospitalidad_emocional",
    nombre: "Hospitalidad Emocional",
    descripcion: "Conexión genuina, calidez que trasciende el protocolo",
    color_hex: "#E8584A",
    orden: 2,
  },
  {
    id: "p3",
    clave: "anticipacion",
    nombre: "Anticipación",
    descripcion: "Prever necesidades con base en contexto y lectura del huésped",
    color_hex: "#2A7D6F",
    orden: 3,
  },
  {
    id: "p4",
    clave: "trabajo_equipo",
    nombre: "Trabajo en Equipo",
    descripcion: "Colaboración que potencia al compañero y al resultado colectivo",
    color_hex: "#4A8BB5",
    orden: 4,
  },
  {
    id: "p5",
    clave: "innovacion",
    nombre: "Innovación",
    descripcion: "Solución creativa, nueva o adaptada, que resuelve un problema real",
    color_hex: "#7B6FA0",
    orden: 5,
  },
];

export const COORDINACIONES_INICIALES: Coordinacion[] = [
  { id: "c1", nombre: "Fotografía", cuota_mes: 1 },
  { id: "c2", nombre: "Diseño Industrial y 3D", cuota_mes: 1 },
  { id: "c3", nombre: "Alimentos y Bebidas", cuota_mes: 1 },
  { id: "c4", nombre: "Operaciones", cuota_mes: 2 },
  { id: "c5", nombre: "Taller de Producción", cuota_mes: 2 },
  { id: "c6", nombre: "Proyectos Especiales", cuota_mes: 1 },
];

// ─── COLABORADORES POR COORDINACIÓN (pueden ser nominados) ───────────────────
export const COLABORADORES_INICIALES: Colaborador[] = [

  // ── Fotografía (c1) ──
  { id: "c1-01", nombre_completo: "Jonatan Aguilar",   coordinacion_id: "c1", activo: true },
  { id: "c1-02", nombre_completo: "Rafael López",      coordinacion_id: "c1", activo: true },

  // ── Diseño Industrial y 3D (c2) ──
  { id: "c2-01", nombre_completo: "Homero Hernández",       coordinacion_id: "c2", activo: true },
  { id: "c2-02", nombre_completo: "Maria Esther Mendoza",   coordinacion_id: "c2", activo: true },
  { id: "c2-03", nombre_completo: "Mitchelle Pous Alarcón", coordinacion_id: "c2", activo: true },

  // ── Alimentos y Bebidas (c3) ──
  { id: "c3-01", nombre_completo: "Tanya Montserrat Castro Ronquillo",       coordinacion_id: "c3", activo: true },
  { id: "c3-02", nombre_completo: "Montserrat Madera Castillo",              coordinacion_id: "c3", activo: true },
  { id: "c3-03", nombre_completo: "Ana Ivette Aguilera Garcia",              coordinacion_id: "c3", activo: true },
  { id: "c3-04", nombre_completo: "Candy Paulette Campos Valenzuela",        coordinacion_id: "c3", activo: true },
  { id: "c3-05", nombre_completo: "Guadalupe Concepción Lopez Trejo",        coordinacion_id: "c3", activo: true },
  { id: "c3-06", nombre_completo: "Paola Carmona Peralta",                   coordinacion_id: "c3", activo: true },

  // ── Operaciones (c4) ──
  { id: "c4-01", nombre_completo: "Angie Sierra Garrido",        coordinacion_id: "c4", activo: true },
  { id: "c4-02", nombre_completo: "Fernanda Macedo Brandi",      coordinacion_id: "c4", activo: true },
  { id: "c4-03", nombre_completo: "Alexis Vazquez Herrera",      coordinacion_id: "c4", activo: true },
  { id: "c4-04", nombre_completo: "Sergio Medina Cruz",          coordinacion_id: "c4", activo: true },
  { id: "c4-05", nombre_completo: "Cristina Coba Balam",         coordinacion_id: "c4", activo: true },
  { id: "c4-06", nombre_completo: "Mitzi Sierra Garrido",        coordinacion_id: "c4", activo: true },
  { id: "c4-07", nombre_completo: "Adita Zaleta Montiel",        coordinacion_id: "c4", activo: true },
  { id: "c4-08", nombre_completo: "Juan Antonio Galvan Rivera",  coordinacion_id: "c4", activo: true },
  { id: "c4-09", nombre_completo: "Brian Uscanga Sosa",          coordinacion_id: "c4", activo: true },
  { id: "c4-10", nombre_completo: "Katherine González Ramirez",  coordinacion_id: "c4", activo: true },
  { id: "c4-11", nombre_completo: "Criserio Martínez Lopez",     coordinacion_id: "c4", activo: true },

  // ── Taller de Producción (c5) ──
  { id: "c5-01", nombre_completo: "Jonatan Daniel Durán Rosado",           coordinacion_id: "c5", activo: true },
  { id: "c5-02", nombre_completo: "Carmen Alejandra Canche Couoh",         coordinacion_id: "c5", activo: true },
  { id: "c5-03", nombre_completo: "Angel Dalí Juárez Méndez",              coordinacion_id: "c5", activo: true },
  { id: "c5-04", nombre_completo: "Arturo Loeza May",                      coordinacion_id: "c5", activo: true },
  { id: "c5-05", nombre_completo: "María del Rosario Nayeli Tepepa Gallegos", coordinacion_id: "c5", activo: true },
  { id: "c5-06", nombre_completo: "Jesús Andrés Moreno Ek",                coordinacion_id: "c5", activo: true },
  { id: "c5-07", nombre_completo: "Ricardo Emmanuel Avila Varillas",       coordinacion_id: "c5", activo: true },
  { id: "c5-08", nombre_completo: "Roiser Nicanor Cetina Chan",            coordinacion_id: "c5", activo: true },
  { id: "c5-09", nombre_completo: "Luis Alberto Ahumada Sanchez",          coordinacion_id: "c5", activo: true },
  { id: "c5-10", nombre_completo: "Anette Sugey Lopez Perez",              coordinacion_id: "c5", activo: true },
  { id: "c5-11", nombre_completo: "Javier Alejandro Martinez Sanchez",     coordinacion_id: "c5", activo: true },
  { id: "c5-12", nombre_completo: "Arian Barrios Santamaría",              coordinacion_id: "c5", activo: true },
  { id: "c5-13", nombre_completo: "David Antonio Lang Lopez",              coordinacion_id: "c5", activo: true },
  { id: "c5-14", nombre_completo: "Brandon Eduardo Estrada Hernandez",     coordinacion_id: "c5", activo: true },
  { id: "c5-15", nombre_completo: "Victor Enrique Borges Chan",            coordinacion_id: "c5", activo: true },
  { id: "c5-16", nombre_completo: "Marlon Jhonatan Beltrán Alejos",        coordinacion_id: "c5", activo: true },

  // ── Proyectos Especiales (c6) ──
  { id: "c6-01", nombre_completo: "Luis Alberto Marquez Canales",    coordinacion_id: "c6", activo: true },
  { id: "c6-02", nombre_completo: "Sergio Francisco Cárdenas Valdez", coordinacion_id: "c6", activo: true },
  { id: "c6-03", nombre_completo: "María Fernanda Aguilar Rodráguez", coordinacion_id: "c6", activo: true },
  { id: "c6-04", nombre_completo: "José Geovani Dzib Uitzil",        coordinacion_id: "c6", activo: true },
  { id: "c6-05", nombre_completo: "Daniel Vera Rodríguez",           coordinacion_id: "c6", activo: true },
  { id: "c6-06", nombre_completo: "Nancy Gabriela Lopez Jimenez",    coordinacion_id: "c6", activo: true },
  { id: "c6-07", nombre_completo: "Javougne Ramone Rodney",          coordinacion_id: "c6", activo: true },

  // ── Comodines (perfil sustitución del comité) ──
  { id: "cmd-1", nombre_completo: "Alejandra (Ale) — Cultura",     coordinacion_id: "", activo: true },
  { id: "cmd-2", nombre_completo: "Comodín — Dirección General",   coordinacion_id: "", activo: true },
];

// ─── MESA ALTA (coordinadores — pueden nominar y votar) ───────────────────────
export const MESA_ALTA_INICIALES: Colaborador[] = [
  { id: "ma-1", nombre_completo: "Eva Noya",             coordinacion_id: "c1", titular_mesa_alta: "Eva Noya",             activo: true },
  { id: "ma-2", nombre_completo: "Rufino Santa Rosa",    coordinacion_id: "c2", titular_mesa_alta: "Rufino Santa Rosa",    activo: true },
  { id: "ma-3", nombre_completo: "Pamela Castillo",      coordinacion_id: "c3", titular_mesa_alta: "Pamela Castillo",      activo: true },
  { id: "ma-4", nombre_completo: "Maria Leal",           coordinacion_id: "c4", titular_mesa_alta: "Maria Leal",           activo: true },
  { id: "ma-5", nombre_completo: "Miguel Angel Barquín", coordinacion_id: "c5", titular_mesa_alta: "Miguel Angel Barquín", activo: true },
  { id: "ma-6", nombre_completo: "Karen Muñoz",          coordinacion_id: "c6", titular_mesa_alta: "Karen Muñoz",          activo: true },
];

// ─── COMITÉ EVALUADOR (solo votan) ───────────────────────────────────────────
export const COMITE_INICIAL: ComiteIntegrante[] = [
  { id: "com-1", colaborador_id: "ev-1", coordinacion_id: "c1", es_titular: true, es_comodin: false, activo: true }, // Jonathan Aguilar - Fotografía
  { id: "com-2", colaborador_id: "ev-2", coordinacion_id: "c5", es_titular: true, es_comodin: false, activo: true }, // Nayeli Tepepa - Taller
  { id: "com-3", colaborador_id: "ev-3", coordinacion_id: "c2", es_titular: true, es_comodin: false, activo: true }, // Homero Hernández - Diseño 3D
  { id: "com-4", colaborador_id: "ev-4", coordinacion_id: "c6", es_titular: true, es_comodin: false, activo: true }, // Maria Fernanda Aguilar - Proyectos Especiales
  { id: "com-5", colaborador_id: "ev-5", coordinacion_id: "c3", es_titular: true, es_comodin: false, activo: true }, // Paola Carmona - Arte y Branding
  { id: "com-6", colaborador_id: "ev-6", coordinacion_id: "c4", es_titular: true, es_comodin: false, activo: true }, // Cristina Coba - Operaciones
  // Comodines
  { id: "com-cmd-1", colaborador_id: "cmd-1", coordinacion_id: null, es_titular: false, es_comodin: true, activo: true },
  { id: "com-cmd-2", colaborador_id: "cmd-2", coordinacion_id: null, es_titular: false, es_comodin: true, activo: true },
];

// Evaluadores del comité como entidades propias (para lookup por nombre)
export const EVALUADORES_INICIALES: Colaborador[] = [
  { id: "ev-1", nombre_completo: "Jonathan Aguilar",       coordinacion_id: "c1", activo: true },
  { id: "ev-2", nombre_completo: "Nayeli Tepepa",          coordinacion_id: "c5", activo: true },
  { id: "ev-3", nombre_completo: "Homero Hernández",       coordinacion_id: "c2", activo: true },
  { id: "ev-4", nombre_completo: "Maria Fernanda Aguilar", coordinacion_id: "c6", activo: true },
  { id: "ev-5", nombre_completo: "Paola Carmona",          coordinacion_id: "c3", activo: true },
  { id: "ev-6", nombre_completo: "Cristina Coba",          coordinacion_id: "c4", activo: true },
];

export const CONVOCATORIA_ACTUAL: Convocatoria = {
  id: "conv-2026-09",
  ciclo: "Septiembre 2026",
  estado: "nominaciones",
  fecha_inicio: "2026-09-01",
  fecha_cierre_nom: "2026-09-20",
  fecha_cierre_vot: "2026-09-27",
  quorum_minimo: 4,
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && !url.includes("placeholder") && key && !key.includes("placeholder"));
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
