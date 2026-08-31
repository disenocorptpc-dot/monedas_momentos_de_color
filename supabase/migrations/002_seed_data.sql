-- ============================================================
-- 002_seed_data.sql
-- Datos iniciales: pilares y coordinaciones
-- ============================================================

-- PILARES
INSERT INTO pilares (clave, nombre, descripcion, color_hex, orden) VALUES
  ('atencion_detalle',     'Atención al Detalle',     'Percibir lo que no se dice, actuar antes de que se pida',           '#E8903A', 1),
  ('hospitalidad_emocional','Hospitalidad Emocional', 'Conexión genuina, calidez que trasciende el protocolo',             '#E8584A', 2),
  ('anticipacion',         'Anticipación',             'Prever necesidades con base en contexto y lectura del huésped',     '#2A7D6F', 3),
  ('trabajo_equipo',       'Trabajo en Equipo',        'Colaboración que potencia al compañero y al resultado colectivo',   '#4A8BB5', 4),
  ('innovacion',           'Innovación',               'Solución creativa, nueva o adaptada, que resuelve un problema real','#7B6FA0', 5)
ON CONFLICT (clave) DO NOTHING;

-- COORDINACIONES
INSERT INTO coordinaciones (nombre, cuota_mes) VALUES
  ('Fotografía',              1),
  ('Diseño Industrial y 3D',  1),
  ('Arte y Branding',         1),
  ('Operaciones',             2),
  ('Taller',                  2),
  ('Proyectos Especiales',    1)
ON CONFLICT (nombre) DO NOTHING;

-- NOTA: colaboradores y comite_integrantes se insertan con datos confirmados
-- Ver seed/colaboradores.csv y seed/comite_integrantes.csv
-- Pendiente: plantilla completa de Taller y Proyectos Especiales
