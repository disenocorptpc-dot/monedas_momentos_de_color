# Sistema de Diseño · The Palace Company

Recursos de marca curados para este proyecto. **No es el kit completo** — es el subconjunto
que el código necesita, más las fuentes editables para trabajo en Illustrator.

Kit maestro completo (366 archivos: CMYK, EPS, aplicaciones, gafetes, viniles, handover de 68 MB):

```
\\10.0.37.24\medios\Marcas Bienal - Humman\The Palace Company
```

---

## 1. Gama cromática

Valores tomados de `referencia/gama-cromatica-rgb.pdf`. **Fuente de verdad en código:
`lib/brand.ts`** — no hardcodear estos hex en los componentes.

### Principales

| Color | HEX | RGB | Uso |
|---|---|---|---|
| Azul Océano | `#254D6E` | 37 · 77 · 110 | Bandas, titulares, autoridad institucional |
| Perla | `#EDECE4` | 237 · 236 · 228 | Logotipo en negativo, fondos claros |

### Secundarios

| Color | HEX | RGB | Uso |
|---|---|---|---|
| Bronce | `#B88F69` | 184 · 143 · 105 | Filetes, acentos, sellos, realces |
| Azul Ligero | `#E0E5E5` | 224 · 229 · 229 | Fondos de apoyo, separadores |

Para Pantone (impresión con tinta directa): `referencia/gama-cromatica-pantone.pdf`.

### Derivados de uso interno

Estos **no son colores de marca**. Son tintes calculados a partir de los oficiales
para dar profundidad, papel y jerarquía de texto en documentos. Viven en `lib/brand.ts`
y no deben presentarse como parte de la paleta institucional.

`oceanoDeep #1B3A53` · `bronceClaro #D9C0A0` · `perlaPapel #FCFBF7` ·
`tinta #1C3444` · `tintaSuave #6E6857` · `tintaTenue #9A9484`

---

## 2. Tipografía

| Familia | Rol | Clase Tailwind |
|---|---|---|
| **Freight Text** | Titulares, diplomas, editorial | `font-serif` |
| **Freight Sans Pro** | Datos, tablas, interfaz | `font-sans` |

**Web:** los `.woff2` viven en `app/fonts/` y se cargan con `next/font/local` en
`app/layout.tsx`, que expone `--font-display` y `--font-sans`. Se consumen
**solo** por las clases `font-serif` / `font-sans` de Tailwind.

Pesos disponibles en web:

- Freight Text — 300, 400, 500, 700 + itálicas de 300/400/500
- Freight Sans Pro — 400, 500, 600, 700 + itálica de 400

**Illustrator / InDesign:** los `.otf` originales están en `fuentes_otf/`.
Incluyen las variantes *Small Caps* (`…SC.otf`) que no se convirtieron a web
por no usarse todavía.

> **Licencia.** Freight es una familia comercial de Phil's Fonts / GarageFonts.
> Servirla desde una web app es un uso distinto al de escritorio y puede requerir
> una licencia *webfont* aparte. La app es interna, pero vale confirmarlo con
> quien administre las licencias antes de exponerla fuera de la red corporativa.

---

## 3. Identidad

Los SVG servidos en runtime viven en `public/brand/`. Las rutas se declaran en
`lib/brand.ts` → `MARCA`. Los `.ai` editables están en `logos_fuente/`.

| Activo | Archivo en `public/brand/` | Proporción | Cuándo usarlo |
|---|---|---|---|
| Logotipo principal | `logo/tpc-logotipo-horizontal-{azul,blanco}.svg` | 21.1 : 1 | Barras y encabezados anchos |
| Logotipo secundario | `logo/tpc-logotipo-vertical-{azul,blanco}.svg` | 4.37 : 1 | Bloques compactos, bandas altas |
| Monograma TPC | `logo/tpc-monograma.svg` | 0.88 : 1 | Filigranas, favicon, acentos |
| Emblema | `logo/tpc-emblema.svg` | 1 : 1 | Aplicaciones donde el emblema completo aplica |
| Sello oficial | `sello/tpc-sello.svg` | 1 : 1 | Validación de documentos formales |

### currentColor y variantes teñidas

Los SVG derivados de PDF (`monograma`, `emblema`, `sello`) se normalizaron a
`fill: currentColor`, lo que permite teñirlos por CSS **cuando se insertan inline**.

Un SVG cargado con `<img src>` **no hereda** el color del documento que lo inserta:
`currentColor` se resuelve a negro. Para ese caso existen variantes con fill fijo:

```
logo/tpc-monograma-oceano.svg      #254D6E
sello/tpc-sello-bronce.svg         #B88F69
sello/tpc-sello-oceano.svg         #254D6E
```

Si necesitas otro tinte, duplica el archivo y sustituye `fill:currentColor`.
No apliques `filter` sobre el `<img>`: degrada el trazo fino del sello al imprimir.

---

## 4. Cómo se usa en el código

```tsx
import { BRAND, MARCA } from "@/lib/brand";

<div style={{ backgroundColor: BRAND.oceano }}>
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img src={MARCA.logoVerticalBlanco} alt={MARCA.nombre} style={{ height: "4.6cqw" }} />
</div>
```

### Escalado de documentos: unidades `cqw`

El diploma (`app/certificado/page.tsx`) **no usa breakpoints**. El contenedor declara
`containerType: "inline-size"` y todo dentro se mide en `cqw` (1 `cqw` = 1 % del ancho
del contenedor). Así la pieza escala idéntica en pantalla, PDF e impresión, y hay un
solo sistema de medida en lugar de una escalera de `sm:` / `md:`.

Al editar el diploma, **mide siempre en `cqw`**. Meter un `px` o un `text-xs` rompe
la proporción al imprimir.

### Composición del diploma

Alineado a la izquierda, **a medida completa**: con márgenes de 6.5 cqw quedan
87 cqw útiles, y cada bloque los usa de extremo a extremo. Esa es la regla que
evita zonas muertas: si un bloque no llena la medida por sí solo, lleva un dato
al costado derecho.

| Bloque | Izquierda | Derecha |
|---|---|---|
| A | rótulo del reconocimiento | ciclo |
| B | coordinación | chips de pilares |
| C | etiqueta + cita del hecho | sello oficial |
| D | emisor | folio |

**Nunca dejes un bloque con la mitad derecha vacía.** Si quitas el dato de la
derecha, hay que redistribuir el bloque, no dejar el hueco.

### El aire vertical se reparte, no se acumula

El cuerpo es `flex-col` con `justify-content: space-between` sobre los cuatro
bloques. El sobrante se divide entre los tres espacios interiores en lugar de
acumularse al final con un `mt-auto`.

Eso es lo que mantiene la distribución pareja cuando el contenido varía: un
nombre de una o dos líneas, o una cita de dos o tres, cambian el sobrante, y
`space-between` lo absorbe repartido. **No metas `mt-auto` ni `flex-1` dentro
de los bloques** — eso vuelve a concentrar el aire en un solo punto, que es
exactamente el defecto que esta retícula corrige.

### Presupuesto vertical

La hoja es A4 horizontal (`aspect-ratio: 1.414 / 1`), es decir **70.72 cqw de alto**.
Descontando banda (10), filete (0.32) y padding (8.2), quedan **≈ 52.2 cqw**.
Los cuatro bloques ocupan ≈ 44 con el contenido típico, y los ≈ 8 restantes son
el aire que se reparte.

El nombre a `5.4cqw` sobre 87 cqw de medida cabe en una línea hasta ~35
caracteres, lo que cubre el caso más largo del padrón (*Tanya Montserrat Castro
Ronquillo*, 33). A dos líneas sigue cabiendo: se come el aire repartido.

Si agregas contenido, algo tiene que salir. Las palancas, en orden de menor daño:

1. `-webkit-line-clamp` de la cita: 3 → 2 líneas
2. Tamaño del sello: `11.5cqw` → `9.5cqw`
3. Tamaño del nombre: `5.4cqw` → `4.8cqw`
4. Padding del cuerpo: `4.6cqw` → `3.6cqw`

---

## 5. Contenido de esta carpeta

```
design_system/
├── README.md                  este documento
├── fuentes_otf/
│   ├── FreightText/           7 pesos + itálicas (fuente para Illustrator)
│   └── FreightSansPro/        5 pesos (fuente para Illustrator)
├── logos_fuente/              .ai editables: principal, secundario, monograma, sello
└── referencia/
    ├── gama-cromatica-rgb.pdf
    └── gama-cromatica-pantone.pdf
```

Lo que **no** se trajo, y dónde está si lo necesitas: versiones CMYK y EPS,
GIF/JPG/PNG de respaldo, aplicaciones (listón de gafete, tarjetas, viniles de
puertas), guía de uso y el handover completo — todo en el kit maestro de red.
