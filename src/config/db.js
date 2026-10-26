const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'sifcom',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 15,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

const ensureSchema = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuario (
      iduser SERIAL PRIMARY KEY,
      email VARCHAR(120) UNIQUE NOT NULL,
      nombre VARCHAR(120) NOT NULL,
      comuna VARCHAR(80) NOT NULL,
      contrasena TEXT NOT NULL,
      permisosuser VARCHAR(20) NOT NULL DEFAULT 'INSPECTOR'
        CHECK (permisosuser IN ('ADMIN', 'INSPECTOR')),
      creado_en TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS contrato (
      idcontrato SERIAL PRIMARY KEY,
      empresa VARCHAR(160) NOT NULL,
      giro VARCHAR(160) NOT NULL,
      presupuesto NUMERIC(14, 0) NOT NULL CHECK (presupuesto >= 0),
      vigencia DATE NOT NULL,
      creado_en TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS checklist (
      idchecklist SERIAL PRIMARY KEY,
      descripcion VARCHAR(200) UNIQUE NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS itemschecklist (
      idchecklist INTEGER NOT NULL REFERENCES checklist(idchecklist) ON DELETE CASCADE,
      idcontrato INTEGER NOT NULL REFERENCES contrato(idcontrato) ON DELETE CASCADE,
      PRIMARY KEY (idchecklist, idcontrato)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS fiscalizacion (
      idfiscalizacion SERIAL PRIMARY KEY,
      obra VARCHAR(200) NOT NULL,
      ubicacion TEXT,
      foto TEXT,
      observaciones TEXT,
      fechafisc TIMESTAMP NOT NULL DEFAULT NOW(),
      estado VARCHAR(40) NOT NULL DEFAULT 'PENDIENTE',
      iduser INTEGER NOT NULL REFERENCES usuario(iduser),
      idcontrato INTEGER NOT NULL REFERENCES contrato(idcontrato) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS fiscalizacion_checklist (
      idfiscalizacion INTEGER NOT NULL REFERENCES fiscalizacion(idfiscalizacion) ON DELETE CASCADE,
      idchecklist INTEGER NOT NULL REFERENCES checklist(idchecklist) ON DELETE RESTRICT,
      cumple BOOLEAN NOT NULL DEFAULT TRUE,
      PRIMARY KEY (idfiscalizacion, idchecklist)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS multa (
      idmulta SERIAL PRIMARY KEY,
      monto NUMERIC(14, 0) NOT NULL,
      motivo TEXT NOT NULL,
      fechamulta TIMESTAMP NOT NULL DEFAULT NOW(),
      idcontrato INTEGER NOT NULL REFERENCES contrato(idcontrato) ON DELETE CASCADE,
      idfiscalizacion INTEGER NOT NULL REFERENCES fiscalizacion(idfiscalizacion) ON DELETE CASCADE
    )
  `);

  // Usuarios semilla por defecto (Admin e Inspector) si no existen
  const usuariosCount = await pool.query('SELECT COUNT(*)::int AS n FROM usuario');
  if (usuariosCount.rows[0].n === 0) {
    const adminHash = await bcrypt.hash('Admin1234', 10);
    const inspHash = await bcrypt.hash('Inspector1234', 10);
    await pool.query(
      `INSERT INTO usuario (email, nombre, comuna, contrasena, permisosuser) VALUES
        ('admin@sifcom.cl', 'Valeria Rojas (Admin)', 'Valparaíso', $1, 'ADMIN'),
        ('inspector@sifcom.cl', 'Carlos Pérez (Inspector)', 'Viña del Mar', $2, 'INSPECTOR')
       ON CONFLICT (email) DO NOTHING`,
      [adminHash, inspHash],
    );
  }

  // Contratos e ítems de checklist iniciales
  const contratos = await pool.query('SELECT COUNT(*)::int AS n FROM contrato');
  if (contratos.rows[0].n === 0) {
    const inserted = await pool.query(`
      INSERT INTO contrato (empresa, giro, presupuesto, vigencia) VALUES
        ('Arauco Mantenciones S.A.', 'Contrato Áreas Verdes', 120000000, '2026-12-31'),
        ('LimpiaMar Ltda.', 'Camiones de Aseo', 210000000, '2026-12-31'),
        ('Constructora Pacifico', 'Contrato Remodelación', 320000000, '2026-12-31'),
        ('LimpiaMar Ltda.', 'Contrato Aseo zona centro', 100000000, '2026-12-31'),
        ('ElectroValpo SpA', 'Contrato Iluminaria Pública', 200000000, '2026-12-31')
      RETURNING idcontrato
    `);

    const checks = await pool.query('SELECT COUNT(*)::int AS n FROM checklist');
    if (checks.rows[0].n === 0) {
      const items = await pool.query(`
        INSERT INTO checklist (descripcion) VALUES
          ('Cumplimiento de horario'),
          ('Implementos de seguridad'),
          ('Calidad del servicio')
        ON CONFLICT (descripcion) DO NOTHING
        RETURNING idchecklist
      `);
      for (const contrato of inserted.rows) {
        for (const item of items.rows) {
          await pool.query(
            'INSERT INTO itemschecklist (idchecklist, idcontrato) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [item.idchecklist, contrato.idcontrato],
          );
        }
      }
    }
  } else {
    const checks = await pool.query('SELECT COUNT(*)::int AS n FROM checklist');
    if (checks.rows[0].n === 0) {
      await pool.query(`
        INSERT INTO checklist (descripcion) VALUES
          ('Cumplimiento de horario'),
          ('Implementos de seguridad'),
          ('Calidad del servicio')
        ON CONFLICT (descripcion) DO NOTHING
      `);
    }
  }

  // Fiscalizaciones y multa inicial de muestra
  const fisc = await pool.query('SELECT COUNT(*)::int AS n FROM fiscalizacion');
  if (fisc.rows[0].n === 0) {
    const user = await pool.query('SELECT iduser FROM usuario ORDER BY iduser DESC LIMIT 1');
    const contratosSeed = await pool.query('SELECT idcontrato FROM contrato ORDER BY idcontrato LIMIT 3');
    if (user.rowCount > 0 && contratosSeed.rowCount >= 1) {
      const idUser = user.rows[0].iduser;
      const c1 = contratosSeed.rows[0].idcontrato;
      const c2 = contratosSeed.rows[1]?.idcontrato ?? c1;
      const c3 = contratosSeed.rows[2]?.idcontrato ?? c1;
      const insertedFisc = await pool.query(
        `INSERT INTO fiscalizacion (obra, ubicacion, foto, observaciones, fechafisc, estado, iduser, idcontrato)
         VALUES
           ($1, $2, NULL, $3, NOW(), $4, $5, $6),
           ($7, $2, NULL, $8, NOW(), $9, $5, $10),
           ($11, $2, NULL, $12, NOW(), $13, $5, $14)
         RETURNING idfiscalizacion, estado, idcontrato`,
        [
          "Plaza O'Higgins",
          'Ubicación GPS Detectada (-33.045, -71.619)',
          'Alerta de incumplimiento',
          'ALERTA',
          idUser,
          c1,
          'Calle Las Heras',
          'Cumple / Sin observaciones',
          'CUMPLE',
          c2,
          'Obras Errázuriz',
          'Incumplimiento de implementos de seguridad',
          'MULTA',
          c3,
        ],
      );

      const multaRow = insertedFisc.rows.find((r) => r.estado === 'MULTA');
      if (multaRow) {
        await pool.query(
          `INSERT INTO multa (monto, motivo, fechamulta, idcontrato, idfiscalizacion)
           VALUES ($1, $2, NOW(), $3, $4)`,
          [500000, 'Multa aplicada por incumplimiento en Obras Errázuriz', multaRow.idcontrato, multaRow.idfiscalizacion],
        );
      }
    }
  }
};

module.exports = { pool, ensureSchema };
