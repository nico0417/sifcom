-- =============================================================================
-- SIFCOM — Sistema de Fiscalización en Terreno de Contratos Municipales
-- Script SQL Reproducible (DDL + Claves + Restricciones + Datos Iniciales)
-- Motor: PostgreSQL 14+
-- =============================================================================

-- Para crear la base de datos desde cero (opcional en consola psql):
-- CREATE DATABASE sifcom ENCODING 'UTF8';
-- \c sifcom;

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. TABLA: usuario (Entidad Usuario del MER)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuario (
  iduser SERIAL PRIMARY KEY,
  email VARCHAR(120) UNIQUE NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  comuna VARCHAR(80) NOT NULL,
  contrasena TEXT NOT NULL,
  permisosuser VARCHAR(20) NOT NULL DEFAULT 'INSPECTOR'
    CHECK (permisosuser IN ('ADMIN', 'INSPECTOR')),
  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. TABLA: contrato (Entidad Contrato del MER)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contrato (
  idcontrato SERIAL PRIMARY KEY,
  empresa VARCHAR(160) NOT NULL,
  giro VARCHAR(160) NOT NULL,
  presupuesto NUMERIC(14, 0) NOT NULL CHECK (presupuesto >= 0),
  vigencia DATE NOT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. TABLA: checklist (Entidad Checklist del MER)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS checklist (
  idchecklist SERIAL PRIMARY KEY,
  descripcion VARCHAR(200) UNIQUE NOT NULL
);

-- -----------------------------------------------------------------------------
-- 4. TABLA: itemschecklist (Relación N:M "Items" entre Checklist y Contrato)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS itemschecklist (
  idchecklist INTEGER NOT NULL REFERENCES checklist(idchecklist) ON DELETE CASCADE,
  idcontrato INTEGER NOT NULL REFERENCES contrato(idcontrato) ON DELETE CASCADE,
  PRIMARY KEY (idchecklist, idcontrato)
);

-- -----------------------------------------------------------------------------
-- 5. TABLA: fiscalizacion (Entidad Fiscalizacion + Relaciones Fiscalizar y Evalúa)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fiscalizacion (
  idfiscalizacion SERIAL PRIMARY KEY,
  obra VARCHAR(200) NOT NULL,
  ubicacion TEXT,
  foto TEXT,
  observaciones TEXT,
  fechafisc TIMESTAMP NOT NULL DEFAULT NOW(),
  estado VARCHAR(40) NOT NULL DEFAULT 'PENDIENTE'
    CHECK (estado IN ('CUMPLE', 'ALERTA', 'MULTA', 'PENDIENTE')),
  iduser INTEGER NOT NULL REFERENCES usuario(iduser) ON DELETE RESTRICT,
  idcontrato INTEGER NOT NULL REFERENCES contrato(idcontrato) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 6. TABLA: fiscalizacion_checklist (Respuestas de cada ítem en una Fiscalización)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fiscalizacion_checklist (
  idfiscalizacion INTEGER NOT NULL REFERENCES fiscalizacion(idfiscalizacion) ON DELETE CASCADE,
  idchecklist INTEGER NOT NULL REFERENCES checklist(idchecklist) ON DELETE RESTRICT,
  cumple BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (idfiscalizacion, idchecklist)
);

-- -----------------------------------------------------------------------------
-- 7. TABLA: multa (Entidad Multa + Relaciones Sanciona [Contrato 1:1 - 0:N Multa]
--                  y Genera [Fiscalizacion 1:1 - 0:1 Multa])
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS multa (
  idmulta SERIAL PRIMARY KEY,
  monto NUMERIC(14, 0) NOT NULL CHECK (monto > 0),
  motivo TEXT NOT NULL,
  fechamulta TIMESTAMP NOT NULL DEFAULT NOW(),
  idcontrato INTEGER NOT NULL REFERENCES contrato(idcontrato) ON DELETE CASCADE,
  idfiscalizacion INTEGER UNIQUE NOT NULL REFERENCES fiscalizacion(idfiscalizacion) ON DELETE CASCADE
);

-- Índices para optimizar consultas por claves foráneas y fechas
CREATE INDEX IF NOT EXISTS idx_fiscalizacion_iduser ON fiscalizacion(iduser);
CREATE INDEX IF NOT EXISTS idx_fiscalizacion_idcontrato ON fiscalizacion(idcontrato);
CREATE INDEX IF NOT EXISTS idx_multa_idcontrato ON multa(idcontrato);

-- =============================================================================
-- DATOS INICIALES DE PRUEBA (SEED)
-- Contraseñas cifradas con bcrypt (cost = 10):
--   admin@sifcom.cl     -> Admin1234
--   inspector@sifcom.cl -> Inspector1234
-- =============================================================================

INSERT INTO usuario (email, nombre, comuna, contrasena, permisosuser)
VALUES
  ('admin@sifcom.cl', 'Valeria Rojas (Admin)', 'Valparaíso', '$2b$10$uq2Yx1VpB694dX/ZUfDhoen4YjpA02IoH7NtmNRkqyi4omn2wwmUa', 'ADMIN'),
  ('inspector@sifcom.cl', 'Carlos Pérez (Inspector)', 'Viña del Mar', '$2b$10$BnXDUDv0wW0FQ09CWK1Bk.zepUKApzZLpgeL5hduruV420k3Nboqe', 'INSPECTOR')
ON CONFLICT (email) DO NOTHING;

INSERT INTO checklist (descripcion)
VALUES
  ('Cumplimiento de horario'),
  ('Implementos de seguridad'),
  ('Calidad del servicio')
ON CONFLICT (descripcion) DO NOTHING;

DO $$
DECLARE
  v_admin_id INTEGER;
  v_insp_id INTEGER;
  v_c1 INTEGER;
  v_c2 INTEGER;
  v_c3 INTEGER;
  v_c4 INTEGER;
  v_c5 INTEGER;
  v_f1 INTEGER;
  v_f2 INTEGER;
  v_f3 INTEGER;
  v_f4 INTEGER;
BEGIN
  IF (SELECT COUNT(*) FROM contrato) = 0 THEN
    INSERT INTO contrato (empresa, giro, presupuesto, vigencia)
    VALUES ('Arauco Mantenciones S.A.', 'Contrato Áreas Verdes', 120000000, '2026-12-31')
    RETURNING idcontrato INTO v_c1;

    INSERT INTO contrato (empresa, giro, presupuesto, vigencia)
    VALUES ('LimpiaMar Ltda.', 'Camiones de Aseo', 210000000, '2026-12-31')
    RETURNING idcontrato INTO v_c2;

    INSERT INTO contrato (empresa, giro, presupuesto, vigencia)
    VALUES ('Constructora Pacifico', 'Contrato Remodelación', 320000000, '2026-12-31')
    RETURNING idcontrato INTO v_c3;

    INSERT INTO contrato (empresa, giro, presupuesto, vigencia)
    VALUES ('LimpiaMar Ltda.', 'Contrato Aseo zona centro', 100000000, '2026-12-31')
    RETURNING idcontrato INTO v_c4;

    INSERT INTO contrato (empresa, giro, presupuesto, vigencia)
    VALUES ('ElectroValpo SpA', 'Contrato Iluminaria Pública', 200000000, '2026-12-31')
    RETURNING idcontrato INTO v_c5;

    -- Vincular todos los ítems de checklist a cada contrato (itemschecklist)
    INSERT INTO itemschecklist (idchecklist, idcontrato)
    SELECT ch.idchecklist, co.idcontrato
    FROM checklist ch
    CROSS JOIN contrato co
    ON CONFLICT DO NOTHING;

    SELECT iduser INTO v_insp_id FROM usuario WHERE email = 'inspector@sifcom.cl' LIMIT 1;
    SELECT iduser INTO v_admin_id FROM usuario WHERE email = 'admin@sifcom.cl' LIMIT 1;

    -- Insertar fiscalizaciones de ejemplo
    INSERT INTO fiscalizacion (obra, ubicacion, foto, observaciones, fechafisc, estado, iduser, idcontrato)
    VALUES (
      'Plaza O''Higgins',
      'Ubicación GPS Detectada (-33.045, -71.619)',
      'evidencia_plaza_ohiggins.jpg',
      'Alerta de incumplimiento en riego de sector norte',
      '2026-10-18 10:30:00',
      'ALERTA',
      v_insp_id,
      v_c1
    ) RETURNING idfiscalizacion INTO v_f1;

    INSERT INTO fiscalizacion (obra, ubicacion, foto, observaciones, fechafisc, estado, iduser, idcontrato)
    VALUES (
      'Camión GL PT 98',
      'Ubicación GPS Detectada (-33.042, -71.612)',
      'camion_aseo_glpt98.jpg',
      'Retraso en frecuencia de recorrido matutino',
      '2026-09-21 12:32:00',
      'ALERTA',
      v_insp_id,
      v_c2
    ) RETURNING idfiscalizacion INTO v_f2;

    INSERT INTO fiscalizacion (obra, ubicacion, foto, observaciones, fechafisc, estado, iduser, idcontrato)
    VALUES (
      'Obras Errázuriz',
      'Ubicación GPS Detectada (-33.039, -71.627)',
      'obras_errazuriz_epp.jpg',
      'Incumplimiento grave de implementos de seguridad y horario',
      '2026-09-04 16:40:00',
      'MULTA',
      v_insp_id,
      v_c3
    ) RETURNING idfiscalizacion INTO v_f3;

    INSERT INTO fiscalizacion (obra, ubicacion, foto, observaciones, fechafisc, estado, iduser, idcontrato)
    VALUES (
      'Calle Las Heras',
      'Ubicación GPS Detectada (-33.046, -71.615)',
      'luminarias_las_heras.jpg',
      'Cumple / Sin observaciones',
      '2026-09-23 18:54:00',
      'CUMPLE',
      v_admin_id,
      v_c5
    ) RETURNING idfiscalizacion INTO v_f4;

    -- Insertar multa asociada a la fiscalización con incumplimiento grave
    INSERT INTO multa (monto, motivo, fechamulta, idcontrato, idfiscalizacion)
    VALUES (
      500000,
      'Multa aplicada por incumplimiento de implementos de seguridad en Obras Errázuriz',
      '2026-09-05 16:40:00',
      v_c3,
      v_f3
    );
  END IF;
END $$;

COMMIT;
