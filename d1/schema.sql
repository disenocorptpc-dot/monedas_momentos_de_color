-- ─── Monedas · Momentos de Color — D1 Schema ─────────────────────────────────

CREATE TABLE IF NOT EXISTS nominaciones (
  id               TEXT PRIMARY KEY,
  convocatoria_id  TEXT NOT NULL,
  nominado_id      TEXT NOT NULL,
  nominador_id     TEXT NOT NULL,
  coordinacion_id  TEXT NOT NULL,
  pilares          TEXT NOT NULL,          -- JSON array
  descripcion_hecho TEXT NOT NULL,
  impacto          TEXT,
  foto_url         TEXT,
  foto_descripcion TEXT,
  riesgo_sesgo     INTEGER DEFAULT 0,
  score_pilares    INTEGER,
  dictamen_ia      TEXT,
  estado           TEXT DEFAULT 'enviada', -- enviada | aceptada | rechazada
  created_at       TEXT DEFAULT (datetime('now')),
  updated_at       TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS comite_votos (
  id               TEXT PRIMARY KEY,
  convocatoria_id  TEXT NOT NULL,
  integrante_id    TEXT NOT NULL,
  nominacion_id    TEXT NOT NULL,
  puntos           INTEGER NOT NULL CHECK (puntos IN (1, 2, 3)),
  created_at       TEXT DEFAULT (datetime('now')),
  UNIQUE (convocatoria_id, integrante_id, nominacion_id)
);

CREATE TABLE IF NOT EXISTS inhabilitaciones (
  id               TEXT PRIMARY KEY,
  convocatoria_id  TEXT NOT NULL,
  integrante_id    TEXT NOT NULL,
  motivo           TEXT NOT NULL,
  suplente_id      TEXT,
  designado_por    TEXT NOT NULL,
  created_at       TEXT DEFAULT (datetime('now')),
  UNIQUE (convocatoria_id, integrante_id)
);

CREATE INDEX IF NOT EXISTS idx_nom_convocatoria ON nominaciones(convocatoria_id);
CREATE INDEX IF NOT EXISTS idx_votos_conv_integrante ON comite_votos(convocatoria_id, integrante_id);
