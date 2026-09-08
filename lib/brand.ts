/* ════════════════════════════════════════════════════════════════
   SISTEMA DE DISEÑO · THE PALACE COMPANY
   Fuente de verdad para color, marca y activos.

   Los valores HEX vienen de la gama cromática oficial:
   design_system/referencia/gama-cromatica-rgb.pdf

   No hardcodear colores de marca en los componentes. Importar de aquí.
   ════════════════════════════════════════════════════════════════ */

/* ── Gama cromática oficial ───────────────────────────────────── */
export const BRAND = {
  /* Principales */
  oceano: "#254D6E", // RGB 37 77 110 — Azul Océano
  perla: "#EDECE4", // RGB 237 236 228 — Perla

  /* Secundarios */
  bronce: "#B88F69", // RGB 184 143 105 — Bronce
  azulLigero: "#E0E5E5", // RGB 224 229 229 — Azul Ligero

  /* ── Derivados de uso interno (NO son colores de marca) ──
     Sombras y tintes calculados a partir de los oficiales para
     profundidad, papel y jerarquía de texto en documentos. */
  oceanoDeep: "#1B3A53", // Océano oscurecido, para degradados de banda
  bronceClaro: "#D9C0A0", // Bronce aclarado, para filetes y realces
  perlaPapel: "#FCFBF7", // Fondo papel de diplomas y documentos
  tinta: "#1C3444", // Texto de titulares
  tintaSuave: "#6E6857", // Texto de cuerpo secundario
  tintaTenue: "#9A9484", // Metadatos, folios, notas al pie
} as const;

/* ── Identidad y activos servidos desde /public/brand ─────────── */
export const MARCA = {
  nombre: "The Palace Company",
  desde: 1984,

  /* Logotipo principal — lockup horizontal en una línea.
     Relación de aspecto 840.68 : 39.78 (≈ 21.1:1) */
  logoHorizontalAzul: "/brand/logo/tpc-logotipo-horizontal-azul.svg",
  logoHorizontalBlanco: "/brand/logo/tpc-logotipo-horizontal-blanco.svg",

  /* Logotipo secundario — lockup vertical en dos líneas.
     Relación de aspecto 579.63 : 132.76 (≈ 4.37:1) */
  logoVerticalAzul: "/brand/logo/tpc-logotipo-vertical-azul.svg",
  logoVerticalBlanco: "/brand/logo/tpc-logotipo-vertical-blanco.svg",

  /* Monograma TPC y emblema.
     Los .svg base traen fill:currentColor (útiles inline). Para <img>
     hay que usar las variantes teñidas, porque un SVG externo no
     hereda el color del documento que lo inserta. */
  monograma: "/brand/logo/tpc-monograma.svg",
  monogramaOceano: "/brand/logo/tpc-monograma-oceano.svg",
  emblema: "/brand/logo/tpc-emblema.svg",

  /* Sello oficial: círculo con "THE PALACE COMPANY" + monograma + EST. 1984.
     Cuadrado 1:1 */
  sello: "/brand/sello/tpc-sello.svg",
  selloBronce: "/brand/sello/tpc-sello-bronce.svg",
  selloOceano: "/brand/sello/tpc-sello-oceano.svg",

  /* Se conserva por compatibilidad: si algún día hay un wordmark
     alternativo, apuntar aquí. Vacío = componer en tipografía. */
  wordmarkSvg: "" as string,
} as const;

/* ── Tipografía ───────────────────────────────────────────────────
   Las familias se cargan con next/font/local en app/layout.tsx y se
   exponen como variables CSS. Se consumen por Tailwind:
     font-serif → Freight Text     (titulares, diplomas, editorial)
     font-sans  → Freight Sans Pro (datos, tablas, UI)               */
export const TIPOGRAFIA = {
  display: "var(--font-display)", // Freight Text
  sans: "var(--font-sans)", // Freight Sans Pro
} as const;

/* ── Color por pilar del programa ─────────────────────────────────
   Vive en lib/utils.ts → getPilarTheme(). Se replica aquí solo como
   referencia de documentación del sistema. */
export const PILAR_COLORES = {
  atencion_detalle: "#E8903A",
  hospitalidad_emocional: "#E8584A",
  anticipacion: "#2A7D6F",
  trabajo_equipo: "#4A8BB5",
  innovacion: "#7B6FA0",
} as const;
