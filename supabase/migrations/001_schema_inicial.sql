-- ============================================================
-- 001_schema_inicial.sql
-- Monedas · Momentos de Color — The Palace Company
-- ============================================================

-- COORDINACIONES
CREATE TABLE IF NOT EXISTS coordinaciones (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre       text NOT NULL UNIQUE,
  cuota_mes    int  NOT NULL DEFAULT 1,
  created_at   timestamptz DEFAULT now()
);

-- COLABORADORES
CREATE TABLE IF NOT EXISTS colaboradores (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo   text NOT NULL,
  coordinacion_id   uuid REFERENCES coordinaciones(id),
  jefe_directo      text,
  titular_mesa_alta text,
  activo            boolean DEFAULT true,
  created_at        timestamptz DEFAULT now()
);

-- PILARES
CREATE TABLE IF NOT EXISTS pilares (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clave       text NOT NULL UNIQUE,
  nombre      text NOT NULL,
  descripcion text,
  color_hex   text,
  orden       int
);

-- CONVOCATORIAS
CREATE TABLE IF NOT EXISTS convocatorias (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ciclo             text NOT NULL UNIQUE,
  estado            text NOT NULL DEFAULT 'nominaciones'
                    CHECK (estado IN ('nominaciones','verificacion','votacion','computo','cerrado','nulo')),
  fecha_inicio      date NOT NULL,
  fecha_cierre_nom  date NOT NULL,
  fecha_cierre_vot  date NOT NULL,
  quorum_minimo     int  NOT NULL DEFAULT 4,
  created_at        timestamptz DEFAULT now()
);

-- NOMINACIONES
CREATE TABLE IF NOT EXISTS nominaciones (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  convocatoria_id   uuid REFERENCES convocatorias(id) ON DELETE CASCADE,
  nominado_id       uuid REFERENCES colaboradores(id),
  nominador_id      uuid REFERENCES colaboradores(id),
  coordinacion_id   uuid REFERENCES coordinaciones(id),
  pilares           text[] NOT NULL CHECK (array_length(pilares, 1) BETWEEN 1 AND 3),
  descripcion_hecho text NOT NULL CHECK (length(trim(descripcion_hecho)) >= 80),
  impacto           text,
  foto_url          text,
  foto_descripcion  text,
  riesgo_sesgo      int  NOT NULL DEFAULT 0 CHECK (riesgo_sesgo BETWEEN 0 AND 100),
  estado            text NOT NULL DEFAULT 'borrador'
                    CHECK (estado IN ('borrador','enviada','aceptada','rechazada')),
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now(),
  CONSTRAINT foto_descripcion_required CHECK (
    foto_url IS NULL OR (foto_descripcion IS NOT NULL AND length(trim(foto_descripcion)) > 0)
  )
);

-- COMITE INTEGRANTES
CREATE TABLE IF NOT EXISTS comite_integrantes (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id   uuid REFERENCES colaboradores(id),
  coordinacion_id  uuid REFERENCES coordinaciones(id),
  es_titular       boolean DEFAULT true,
  activo           boolean DEFAULT true,
  created_at       timestamptz DEFAULT now()
);

-- COMITE INHABILITACIONES
CREATE TABLE IF NOT EXISTS comite_inhabilitaciones (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  convocatoria_id    uuid REFERENCES convocatorias(id),
  integrante_id      uuid REFERENCES comite_integrantes(id),
  motivo             text NOT NULL,
  suplente_id        uuid REFERENCES comite_integrantes(id),
  designado_por      text NOT NULL,
  created_at         timestamptz DEFAULT now()
);

-- COMITE VOTOS (Borda 3-2-1)
CREATE TABLE IF NOT EXISTS comite_votos (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  convocatoria_id  uuid REFERENCES convocatorias(id),
  integrante_id    uuid REFERENCES comite_integrantes(id),
  nominacion_id    uuid REFERENCES nominaciones(id),
  puntos           int NOT NULL CHECK (puntos IN (1, 2, 3)),
  created_at       timestamptz DEFAULT now(),
  UNIQUE (convocatoria_id, integrante_id, nominacion_id),
  UNIQUE (convocatoria_id, integrante_id, puntos)
);

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_nominaciones_convocatoria ON nominaciones(convocatoria_id);
CREATE INDEX IF NOT EXISTS idx_nominaciones_nominado ON nominaciones(nominado_id);
CREATE INDEX IF NOT EXISTS idx_comite_votos_convocatoria ON comite_votos(convocatoria_id);
CREATE INDEX IF NOT EXISTS idx_colaboradores_coordinacion ON colaboradores(coordinacion_id);

-- ROW LEVEL SECURITY
ALTER TABLE nominaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE comite_votos ENABLE ROW LEVEL SECURITY;

-- Nominador ve solo sus nominaciones
CREATE POLICY "nominador_ve_sus_nominaciones" ON nominaciones
  FOR SELECT USING (nominador_id = auth.uid()::uuid);

-- Comité ve todas las aceptadas
CREATE POLICY "comite_ve_todas_aceptadas" ON nominaciones
  FOR SELECT USING (
    estado = 'aceptada'
    AND EXISTS (
      SELECT 1 FROM comite_integrantes
      WHERE colaborador_id = auth.uid()::uuid AND activo = true
    )
  );

-- Timestamp automático
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER nominaciones_updated_at
  BEFORE UPDATE ON nominaciones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
