# Especificación Técnica — Monedas · Momentos de Color
*Fuente de verdad para el agente de construcción*

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Backend | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| Hosting | Vercel (frontend) + Supabase cloud (backend) |
| ORM | Supabase JS client v2 (no Prisma) |

---

## Schema de Base de Datos

### `coordinaciones`
```sql
CREATE TABLE coordinaciones (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre       text NOT NULL UNIQUE,
  cuota_mes    int  NOT NULL DEFAULT 1,  -- 2 para Taller y Operaciones
  created_at   timestamptz DEFAULT now()
);
```

### `colaboradores`
```sql
CREATE TABLE colaboradores (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo   text NOT NULL,
  coordinacion_id   uuid REFERENCES coordinaciones(id),
  jefe_directo      text,
  titular_mesa_alta text,
  activo            boolean DEFAULT true,
  created_at        timestamptz DEFAULT now()
);
```

### `pilares`
```sql
CREATE TABLE pilares (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clave       text NOT NULL UNIQUE,
  nombre      text NOT NULL,
  descripcion text,
  color_hex   text,
  orden       int
);
```

### `convocatorias`
```sql
CREATE TABLE convocatorias (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ciclo             text NOT NULL UNIQUE,
  estado            text NOT NULL DEFAULT 'nominaciones',
  fecha_inicio      date NOT NULL,
  fecha_cierre_nom  date NOT NULL,
  fecha_cierre_vot  date NOT NULL,
  quorum_minimo     int  NOT NULL DEFAULT 4,
  created_at        timestamptz DEFAULT now()
);
```

### `nominaciones`
```sql
CREATE TABLE nominaciones (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  convocatoria_id   uuid REFERENCES convocatorias(id),
  nominado_id       uuid REFERENCES colaboradores(id),
  nominador_id      uuid REFERENCES colaboradores(id),
  coordinacion_id   uuid REFERENCES coordinaciones(id),
  pilares           text[] NOT NULL CHECK (array_length(pilares, 1) BETWEEN 1 AND 3),
  descripcion_hecho text NOT NULL CHECK (length(descripcion_hecho) >= 80),
  impacto           text,
  foto_url          text,
  foto_descripcion  text,
  riesgo_sesgo      int  NOT NULL DEFAULT 0 CHECK (riesgo_sesgo BETWEEN 0 AND 100),
  estado            text NOT NULL DEFAULT 'borrador',
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now(),
  CONSTRAINT foto_descripcion_required CHECK (
    foto_url IS NULL OR foto_descripcion IS NOT NULL
  )
);
```

### `comite_integrantes`
```sql
CREATE TABLE comite_integrantes (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id   uuid REFERENCES colaboradores(id),
  coordinacion_id  uuid REFERENCES coordinaciones(id),
  es_titular       boolean DEFAULT true,
  activo           boolean DEFAULT true,
  created_at       timestamptz DEFAULT now()
);
```

### `comite_inhabilitaciones`
```sql
CREATE TABLE comite_inhabilitaciones (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  convocatoria_id    uuid REFERENCES convocatorias(id),
  integrante_id      uuid REFERENCES comite_integrantes(id),
  motivo             text NOT NULL,
  suplente_id        uuid REFERENCES comite_integrantes(id),
  designado_por      text NOT NULL,
  created_at         timestamptz DEFAULT now()
);
```

### `comite_votos`
```sql
CREATE TABLE comite_votos (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  convocatoria_id  uuid REFERENCES convocatorias(id),
  integrante_id    uuid REFERENCES comite_integrantes(id),
  nominacion_id    uuid REFERENCES nominaciones(id),
  puntos           int NOT NULL CHECK (puntos IN (1, 2, 3)),
  created_at       timestamptz DEFAULT now(),
  UNIQUE (convocatoria_id, integrante_id, nominacion_id),
  UNIQUE (convocatoria_id, integrante_id, puntos)
);
```

---

## Lógica del Árbitro (riesgo_sesgo)

```typescript
function calcularRiesgoSesgo(nom: NominacionInput, ctx: NominacionContext): number {
  let riesgo = 0;
  if (!nom.impacto) riesgo += 25;
  if (ctx.nominador_es_jefe_directo) riesgo += 20;
  if (!ctx.convocatoria_tiene_quorum) riesgo += 15;
  return Math.min(riesgo, 100);
}
// Si riesgo >= 60 → alerta no bloqueante antes de confirmar envío
```

---

## Lógica de Inhabilitación

```sql
INSERT INTO comite_inhabilitaciones (convocatoria_id, integrante_id, motivo)
SELECT
  $1 AS convocatoria_id,
  ci.id,
  'nominado_en_ciclo'
FROM comite_integrantes ci
JOIN colaboradores c ON c.id = ci.colaborador_id
JOIN nominaciones n ON n.nominado_id = c.id
  AND n.convocatoria_id = $1
  AND n.estado = 'aceptada'
WHERE ci.es_titular = true AND ci.activo = true
ON CONFLICT DO NOTHING;
```

---

## Compresión de Imágenes (Frontend)

```typescript
async function comprimirImagen(file: File): Promise<Blob> {
  const img = await createImageBitmap(file);
  const MAX = 1600;
  const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
  const canvas = new OffscreenCanvas(
    Math.round(img.width * ratio),
    Math.round(img.height * ratio)
  );
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.convertToBlob({ type: 'image/webp', quality: 0.82 });
}
// Objetivo: ~77 MB/año con compresion vs ~1 GB sin ella
```

---

## Row Level Security (RLS)

```sql
ALTER TABLE nominaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nominador_ve_sus_nominaciones" ON nominaciones
  FOR SELECT USING (nominador_id = auth.uid()::uuid);

CREATE POLICY "comite_ve_todas_aceptadas" ON nominaciones
  FOR SELECT USING (
    estado = 'aceptada'
    AND EXISTS (
      SELECT 1 FROM comite_integrantes
      WHERE colaborador_id = auth.uid()::uuid AND activo = true
    )
  );
```

---

## Pantallas Requeridas (Fase 1)

| # | Pantalla | Descripción |
|---|---|---|
| P1 | Formulario Nominación | Selector nominado, pilares (1-3), hecho (>=80 chars), impacto opcional, foto opcional + descripción obligatoria si hay foto, riesgo_sesgo visible, cuota restante |
| P2 | Dashboard Mesa Alta | Lista ciclo activo, cuota usada/disponible |
| P3 | Inhabilitaciones | Lista inhabilitados, designar suplente, quórum actual |
| P4 | Panel Votación Comité | Cards nominaciones, selección Borda 3-2-1, validación sin duplicados |
| P5 | Resultados | Tabla puntajes, gráfico pilares por coordinación, ganador destacado |

---

## Pendientes de Datos (Bloquean el Seed)

1. Plantilla completa de **Taller** (~25 personas de las 49 del padrón)
2. Plantilla completa de **Proyectos Especiales**
3. Confirmar titular mesa alta: Pamela o Tanya (A y B) / María o Angie (Operaciones)
4. Confirmar que **Eva** es titular mesa alta de Fotografía
5. Autorización escrita para protocolo suplente externo (caso Fotografía, 2 personas)
