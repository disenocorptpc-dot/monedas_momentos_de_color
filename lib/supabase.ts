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
  { id: "c3", nombre: "Arte y Branding", cuota_mes: 1 },
  { id: "c4", nombre: "Operaciones", cuota_mes: 2 },
  { id: "c5", nombre: "Taller", cuota_mes: 2 },
  { id: "c6", nombre: "Proyectos Especiales", cuota_mes: 1 },
];

export const COLABORADORES_INICIALES: Colaborador[] = [
  { id: "col-1", nombre_completo: "Eva Flores", coordinacion_id: "c1", titular_mesa_alta: "Eva Flores", activo: true },
  { id: "col-2", nombre_completo: "Jonatan Aguilar", coordinacion_id: "c1", jefe_directo: "Eva Flores", activo: true },
  { id: "col-3", nombre_completo: "Homero Hernández", coordinacion_id: "c2", titular_mesa_alta: "Homero Hernández", activo: true },
  { id: "col-4", nombre_completo: "Carlos Mendoza (3D)", coordinacion_id: "c2", jefe_directo: "Homero Hernández", activo: true },
  { id: "col-5", nombre_completo: "Paola Carmona", coordinacion_id: "c3", titular_mesa_alta: "Paola Carmona", activo: true },
  { id: "col-6", nombre_completo: "Tanya Castro", coordinacion_id: "c3", activo: true },
  { id: "col-7", nombre_completo: "Cristina Coba", coordinacion_id: "c4", titular_mesa_alta: "Cristina Coba", activo: true },
  { id: "col-8", nombre_completo: "Angie Sierra", coordinacion_id: "c4", activo: true },
  { id: "col-9", nombre_completo: "Manuel Rivas (Taller)", coordinacion_id: "c5", titular_mesa_alta: "Manuel Rivas", activo: true },
  { id: "col-10", nombre_completo: "David Solís (Taller)", coordinacion_id: "c5", activo: true },
  { id: "col-11", nombre_completo: "Laura Poot (Proyectos)", coordinacion_id: "c6", titular_mesa_alta: "Laura Poot", activo: true },
  // Comodines
  { id: "col-comodin-1", nombre_completo: "Alejandra (Ale) - Cultura", coordinacion_id: "", titular_mesa_alta: "Gerencia de Cultura", activo: true },
  { id: "col-comodin-2", nombre_completo: "Comodín Dirección General", coordinacion_id: "", activo: true },
];

export const COMITE_INICIAL: ComiteIntegrante[] = [
  { id: "com-1", colaborador_id: "col-2", coordinacion_id: "c1", es_titular: true, es_comodin: false, activo: true }, // Jonatan (Fotografía)
  { id: "com-2", colaborador_id: "col-3", coordinacion_id: "c2", es_titular: true, es_comodin: false, activo: true }, // Homero (DI 3D)
  { id: "com-3", colaborador_id: "col-5", coordinacion_id: "c3", es_titular: true, es_comodin: false, activo: true }, // Paola (Arte y Branding)
  { id: "com-4", colaborador_id: "col-7", coordinacion_id: "c4", es_titular: true, es_comodin: false, activo: true }, // Cristina (Operaciones)
  { id: "com-5", colaborador_id: "col-9", coordinacion_id: "c5", es_titular: true, es_comodin: false, activo: true }, // Manuel (Taller)
  { id: "com-6", colaborador_id: "col-11", coordinacion_id: "c6", es_titular: true, es_comodin: false, activo: true }, // Laura (Proyectos Especiales)
  // Comodines registrados
  { id: "com-comodin-1", colaborador_id: "col-comodin-1", coordinacion_id: null, es_titular: false, es_comodin: true, activo: true },
  { id: "com-comodin-2", colaborador_id: "col-comodin-2", coordinacion_id: null, es_titular: false, es_comodin: true, activo: true },
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
