# 🎨 Monedas · Momentos de Color
### Sistema de Reconocimiento al Talento Humano — The Palace Company

> **Colorea Momentos** es el programa de reconocimiento mensual que visibiliza comportamientos excelentes en el servicio hotelero. Este repositorio contiene el sistema digital completo: base de datos, lógica de negocio, seed de padrón y prompt de construcción para el agente de IA.

---

## ¿Qué es Colorea Momentos?

Colorea Momentos es la convocatoria interna de The Palace Company para reconocer a colaboradores que demuestran excelencia en el servicio. Cada mes:

1. **Mesa alta nomina** — coordinadores postulan a compañeros que vivieron un momento de color con un huésped
2. **Comité vota** — seis integrantes (uno por coordinación) puntúan mediante el método Borda (3-2-1)
3. **Gerencia reconoce** — los ganadores reciben la "Moneda de Color" y el hecho queda documentado para cultura organizacional

---

## Arquitectura del Sistema

```
┌────────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js)                   │
│  Formulario nominación │ Dashboard comité │ Resultados │
└──────────────────────────────┬─────────────────────────┘
                               │ REST / Supabase JS Client
┌──────────────────────────────▼─────────────────────────┐
│                  SUPABASE (Backend-as-a-Service)        │
│  PostgreSQL · Row Level Security · Storage · Edge Fn   │
└──────────────────────────────┬─────────────────────────┘
                               │
         ┌─────────────────────┼───────────────────────┐
         ▼                     ▼                       ▼
   nominaciones           comite_votos           colaboradores
   (mesa alta)           (mesa comité)            (padrón)
```

### Tablas principales

| Tabla | Propósito |
|---|---|
| `colaboradores` | Padrón completo con coordinación, jefe directo, y titular mesa alta |
| `nominaciones` | Registro de postulaciones (multipillar 1-3, evidencia foto opcional) |
| `comite_votos` | Votos Borda del comité (3-2-1); quórum mínimo 4 integrantes |
| `comite_integrantes` | Los 6 miembros del comité + suplentes para inhabilitación |
| `pilares` | Catálogo: Atención al Detalle, Hospitalidad Emocional, Anticipación, Trabajo en Equipo, Innovación |
| `convocatorias` | Control por ciclo mensual |

---

## Reglas de Negocio Clave

### Mesa Alta (Nominaciones)

- **Cuota diferenciada**: Taller y Operaciones → 2 nominaciones/mes; resto → 1
- **Pilares**: selección múltiple, mínimo 1, máximo 3 (la convocatoria los usa en plural)
- **Impacto**: campo opcional, pero su ausencia sube `riesgo_sesgo` y queda visible para el árbitro
- **Evidencia fotográfica**: adjunto opcional; si se sube, la descripción de qué se ve y cómo se relaciona con el hecho es **obligatoria**
- **Compresión en cliente**: imágenes redimensionadas a ≤1 600 px antes de subir (~77 MB/año vs ~1 GB sin comprimir)

### Comité (Votación)

- **6 integrantes**, uno por coordinación — la representación es equitativa por construcción
- **Método Borda 3-2-1** → máximo 36 puntos por ciclo
- **Inhabilitación**: si un integrante es nominado, se inhabilita automáticamente; Ale designa suplente
- **Quórum mínimo**: 4 votantes válidos; menos de 4 → ciclo nulo, requiere autorización de Gerencia
- **Caso Fotografía** (2 personas, una es Jonatan): si Eva nomina a Jonatan, Rafael López tampoco puede votar → Gerencia designa suplente externo. _Requiere autorización escrita previa._

### Árbitro Automático

El sistema calcula `riesgo_sesgo` (0-100) por nominación:

| Factor | Peso |
|---|---|
| Sin descripción de impacto | +25 |
| Nominador = jefe directo del nominado | +20 |
| Nominación en ciclo sin quórum | +15 |
| Foto sin descripción subida | +10 |

Si `riesgo_sesgo ≥ 60` → alerta al coordinador antes de guardar (no bloquea).

---

## Estructura del Repositorio

```
colorea-momentos/
│
├── README.md                        ← Este archivo
│
├── docs/
│   ├── 00_PROMPT_ANTIGRAVITY.md     ← Prompt completo para el agente de IA
│   ├── 01_CONVOCATORIA.md           ← Reglas oficiales (fuente de verdad)
│   └── 02_SPEC_SISTEMA.md           ← Especificación técnica detallada
│
├── seed/
│   ├── colaboradores.csv            ← Padrón (completar plantilla Taller/P.E.)
│   ├── comite_integrantes.csv       ← 6 titulares + suplentes
│   └── pilares.csv                  ← Catálogo de pilares
│
├── supabase/
│   └── migrations/
│       ├── 001_schema_inicial.sql   ← Tablas, RLS, índices
│       └── 002_seed_data.sql        ← Datos iniciales del catálogo
│
└── .github/
    └── workflows/
        └── supabase-deploy.yml      ← CI: lint SQL + push migraciones
```

---

## Padrón — Estado Actual y Pendientes

> ⚠️ **Datos incompletos — confirmar antes de ejecutar seed**

| Coordinación | Plantilla | Mesa Alta | Estado |
|---|---|---|---|
| Fotografía | 2 | Eva *(pendiente confirmar)* | ⏳ |
| Diseño Industrial y 3D | 3 | Homero Hernández | ✅ |
| Arte y Branding | 6 | Paola Carmona / Tanya M. Castro* | ⚠️ |
| Operaciones | 11 | Cristina Coba / Angie Sierra* | ⚠️ |
| Taller | ~? | *(sin plantilla)* | ❌ |
| Proyectos Especiales | ~? | *(sin plantilla)* | ❌ |

*Nombres con discrepancia entre registros previos — confirmar titular real.*

**Pendientes de Gerencia:**
- [ ] Confirmar que Eva Flores → Fotografía (mesa alta)
- [ ] Proporcionar plantilla Taller (~25 personas de 49 totales)
- [ ] Definir nombre oficial: Pamela o Tanya (A y B) / María o Angie (Operaciones)
- [ ] Autorizar por escrito el protocolo de suplente externo en Fotografía

---

## Comité — Riesgo de Inhabilitación

Con las plantillas actuales, **probabilidad ≥77%** de que al menos un integrante sea nominado cada mes:

| Integrante | Coordinación | Plantilla | P(nominado) |
|---|---|---|---|
| Jonatan Aguilar | Fotografía | 2 | 1 / 2 = 50% |
| Homero Hernández | Diseño Ind. y 3D | 3 | 1 / 3 = 33% |
| Paola Carmona | Arte y Branding | 6 | 1 / 6 = 17% |
| Cristina Coba | Operaciones | 11 (2 nom.) | ~2 / 11 = 18% |

La pantalla de inhabilitación con notificación automática y designación de suplente es **crítica**, no opcional.

---

## Cómo Construir el Sistema (Antigravity)

### Prerequisitos

- Node.js ≥ 18 + pnpm
- Supabase CLI (`npm i -g supabase`)
- Cuenta Supabase (tier gratuito suficiente para ~77 MB/año de evidencias)

### Paso 1 — Clonar y abrir como workspace

```powershell
git clone https://github.com/disenocorptpc-dot/monedas_momentos_de_color.git
cd monedas_momentos_de_color
# Abrir esta carpeta como workspace en Antigravity
```

### Paso 2 — Pegar el prompt del agente

Abre `docs/00_PROMPT_ANTIGRAVITY.md` y pega el contenido en una nueva conversación de Antigravity con la carpeta como workspace activo. El agente puede leer `docs/02_SPEC_SISTEMA.md` y los CSVs de `seed/` mientras construye.

### Paso 3 — Aplicar migraciones

```bash
supabase db push
# o manualmente:
psql $DATABASE_URL -f supabase/migrations/001_schema_inicial.sql
psql $DATABASE_URL -f supabase/migrations/002_seed_data.sql
```

---

## Variables de Entorno

Crear `.env.local` (nunca en git):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Roadmap Fase 1 — Checklist de Aceptación

- [ ] Formulario de nominación con selección múltiple de pilares (1-3)
- [ ] Validación de cuota diferenciada (Taller/Operaciones ×2)
- [ ] Campo impacto opcional con indicador de riesgo_sesgo visible
- [ ] Upload de evidencia fotográfica con compresión a 1600 px en cliente
- [ ] Descripción de foto obligatoria si se adjunta imagen
- [ ] Pantalla de inhabilitación de comité con notificación automática
- [ ] Designación de suplente por Ale con audit log
- [ ] Quórum mínimo 4 → bloqueo de ciclo si no se alcanza
- [ ] Dashboard de distribución de pilares por coordinación
- [ ] Votación Borda 3-2-1 con validación de dobles votos

---

## Contribuir

Este es un repositorio privado del equipo de Diseño Corporativo — The Palace Company.

Para dudas operativas: **Ale** (Gerencia de Cultura)  
Para dudas técnicas: **rsantarosa** (equipo Diseño Corp.)

---

<sub>Generado con Antigravity · The Palace Company · 2026</sub>
