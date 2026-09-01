-- ============================================================
-- 003_comodines_y_arbitro_ia.sql
-- Monedas · Momentos de Color — The Palace Company
-- Soporte para Comodines en Comité y Dictamen de Árbitro IA
-- ============================================================

-- Modificar comite_integrantes para permitir comodines (sin coordinación fija obligatoria)
ALTER TABLE comite_integrantes 
  ADD COLUMN IF NOT EXISTS es_comodin boolean DEFAULT false;

-- Permitir que coordinacion_id sea nulo para comodines generales (ej. Gerencia de Cultura)
ALTER TABLE comite_integrantes 
  ALTER COLUMN coordinacion_id DROP NOT NULL;

-- Agregar campos para el Dictamen y Evaluación del Árbitro IA
ALTER TABLE nominaciones
  ADD COLUMN IF NOT EXISTS dictamen_ia text,
  ADD COLUMN IF NOT EXISTS score_pilares int CHECK (score_pilares BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS analisis_ia jsonb;

-- Registrar al menos 1 Comodín general por defecto (Gerencia de Cultura / Ale)
INSERT INTO colaboradores (nombre_completo, jefe_directo, titular_mesa_alta, activo)
VALUES ('Alejandra (Ale) - Cultura', 'Gerencia General', 'Gerencia de Cultura', true)
ON CONFLICT DO NOTHING;

-- Asociar el comodín en comite_integrantes
INSERT INTO comite_integrantes (colaborador_id, coordinacion_id, es_titular, es_comodin, activo)
SELECT id, NULL, false, true, true 
FROM colaboradores 
WHERE nombre_completo = 'Alejandra (Ale) - Cultura'
LIMIT 1
ON CONFLICT DO NOTHING;
