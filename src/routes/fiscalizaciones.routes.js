const express = require('express');
const { pool } = require('../config/db');
const {
  asyncHandler,
  parsePositiveIntParam,
  requireAdmin,
  requireAuth,
} = require('../middlewares/security');

const router = express.Router();

// -----------------------------------------------------------------------------
// GET /api/fiscalizaciones
// OWASP API1 (BOLA) & API4 (Límite de resultados):
// - Si el usuario es ADMIN: consulta todas las fiscalizaciones.
// - Si el usuario es INSPECTOR: consulta únicamente sus propias fiscalizaciones.
// -----------------------------------------------------------------------------
router.get(
  '/fiscalizaciones',
  requireAuth,
  asyncHandler(async (req, res) => {
    const isAdmin = req.user?.PermisosUser === 'ADMIN';
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 200);

    const baseSelect = `
      SELECT f.idfiscalizacion, f.obra, f.ubicacion, f.foto, f.observaciones,
             f.fechafisc, f.estado, f.iduser, f.idcontrato,
             u.nombre AS inspectornombre
      FROM fiscalizacion f
      LEFT JOIN usuario u ON u.iduser = f.iduser
    `;

    const result = isAdmin
      ? await pool.query(
          `${baseSelect} ORDER BY f.idfiscalizacion DESC LIMIT $1`,
          [limit],
        )
      : await pool.query(
          `${baseSelect} WHERE f.iduser = $1 ORDER BY f.idfiscalizacion DESC LIMIT $2`,
          [req.user.IdUser, limit],
        );

    return res.json(result.rows);
  }),
);

// -----------------------------------------------------------------------------
// GET /api/fiscalizaciones/:id
// OWASP API1 (BOLA): Un inspector solo puede ver su propio reporte; un ADMIN ve cualquiera.
// -----------------------------------------------------------------------------
router.get(
  '/fiscalizaciones/:id',
  requireAuth,
  parsePositiveIntParam('id'),
  asyncHandler(async (req, res) => {
    const result = await pool.query(
      `SELECT f.idfiscalizacion, f.obra, f.ubicacion, f.foto, f.observaciones,
              f.fechafisc, f.estado, f.iduser, f.idcontrato,
              u.nombre AS inspectornombre
       FROM fiscalizacion f
       LEFT JOIN usuario u ON u.iduser = f.iduser
       WHERE f.idfiscalizacion = $1`,
      [req.parsedId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Fiscalización no encontrada',
        message: 'Fiscalización no encontrada',
      });
    }

    const row = result.rows[0];
    if (req.user?.PermisosUser !== 'ADMIN' && Number(row.iduser) !== Number(req.user?.IdUser)) {
      return res.status(403).json({
        ok: false,
        error: 'No tienes permiso para acceder a esta fiscalización',
        message: 'No tienes permiso para acceder a esta fiscalización',
      });
    }

    return res.json(row);
  }),
);

// -----------------------------------------------------------------------------
// POST /api/fiscalizaciones
// OWASP API1: El autor (iduser) se toma siempre de req.user.IdUser (token JWT),
// nunca del body enviado por el cliente.
// -----------------------------------------------------------------------------
router.post(
  '/fiscalizaciones',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { Obra, Ubicacion, Foto, Observaciones, FechaFisc, Estado, IdContrato, Respuestas } =
      req.body || {};
    const contratoId = Number(IdContrato);

    if (!Obra || !String(Obra).trim() || !Number.isInteger(contratoId) || contratoId <= 0) {
      return res.status(400).json({
        ok: false,
        error: 'Obra e IdContrato entero positivo son obligatorios',
        message: 'Obra e IdContrato entero positivo son obligatorios',
      });
    }

    const contratoExiste = await pool.query(
      'SELECT 1 FROM contrato WHERE idcontrato = $1',
      [contratoId],
    );
    if (contratoExiste.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        error: 'El contrato seleccionado no existe',
        message: 'El contrato seleccionado no existe',
      });
    }

    const result = await pool.query(
      `INSERT INTO fiscalizacion
        (obra, ubicacion, foto, observaciones, fechafisc, estado, iduser, idcontrato)
       VALUES ($1, $2, $3, $4, COALESCE($5, NOW()), COALESCE($6, 'PENDIENTE'), $7, $8)
       RETURNING idfiscalizacion, obra, ubicacion, foto, observaciones,
                 fechafisc, estado, iduser, idcontrato`,
      [
        String(Obra).trim(),
        Ubicacion || null,
        Foto || null,
        Observaciones || null,
        FechaFisc || null,
        Estado || null,
        req.user.IdUser,
        contratoId,
      ],
    );

    const creada = result.rows[0];

    // Guardar respuestas individuales del checklist si vienen en el payload
    if (Array.isArray(Respuestas) && Respuestas.length > 0) {
      for (const r of Respuestas) {
        const idCheck = Number(r?.IdChecklist);
        if (Number.isInteger(idCheck) && idCheck > 0) {
          await pool.query(
            `INSERT INTO fiscalizacion_checklist (idfiscalizacion, idchecklist, cumple)
             VALUES ($1, $2, $3)
             ON CONFLICT (idfiscalizacion, idchecklist) DO UPDATE SET cumple = EXCLUDED.cumple`,
            [creada.idfiscalizacion, idCheck, Boolean(r.Cumple)],
          );
        }
      }
    }

    return res.status(201).json(creada);
  }),
);

// PUT /api/fiscalizaciones/:id (Solo ADMIN)
router.put(
  '/fiscalizaciones/:id',
  requireAuth,
  requireAdmin,
  parsePositiveIntParam('id'),
  asyncHandler(async (req, res) => {
    const { Obra, Ubicacion, Foto, Observaciones, FechaFisc, Estado, IdContrato } = req.body || {};
    const contratoId = Number(IdContrato);

    if (!Obra || !String(Obra).trim() || !Number.isInteger(contratoId) || contratoId <= 0) {
      return res.status(400).json({
        ok: false,
        error: 'Obra e IdContrato son obligatorios',
        message: 'Obra e IdContrato son obligatorios',
      });
    }

    const result = await pool.query(
      `UPDATE fiscalizacion
       SET obra = $1, ubicacion = $2, foto = $3, observaciones = $4,
           fechafisc = COALESCE($5, fechafisc), estado = COALESCE($6, estado), idcontrato = $7
       WHERE idfiscalizacion = $8
       RETURNING idfiscalizacion, obra, ubicacion, foto, observaciones,
                 fechafisc, estado, iduser, idcontrato`,
      [
        String(Obra).trim(),
        Ubicacion || null,
        Foto || null,
        Observaciones || null,
        FechaFisc || null,
        Estado || null,
        contratoId,
        req.parsedId,
      ],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Fiscalización no encontrada',
        message: 'Fiscalización no encontrada',
      });
    }

    return res.json(result.rows[0]);
  }),
);

// DELETE /api/fiscalizaciones/:id (Solo ADMIN)
router.delete(
  '/fiscalizaciones/:id',
  requireAuth,
  requireAdmin,
  parsePositiveIntParam('id'),
  asyncHandler(async (req, res) => {
    const result = await pool.query(
      'DELETE FROM fiscalizacion WHERE idfiscalizacion = $1 RETURNING idfiscalizacion',
      [req.parsedId],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Fiscalización no encontrada',
        message: 'Fiscalización no encontrada',
      });
    }
    return res.status(204).send();
  }),
);

// -----------------------------------------------------------------------------
// Endpoints de MULTAS (/api/multas)
// Relación MER: Contrato (1,1) -- Sanciona -- (0,N) Multa
//               Fiscalizacion (1,1) -- Genera -- (0,1) Multa
// -----------------------------------------------------------------------------
router.get(
  '/multas',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const result = await pool.query(
      `SELECT idmulta, monto, motivo, fechamulta, idcontrato, idfiscalizacion
       FROM multa ORDER BY idmulta DESC LIMIT 200`,
    );
    return res.json(result.rows);
  }),
);

router.get(
  '/multas/:id',
  requireAuth,
  parsePositiveIntParam('id'),
  asyncHandler(async (req, res) => {
    const result = await pool.query(
      `SELECT idmulta, monto, motivo, fechamulta, idcontrato, idfiscalizacion
       FROM multa WHERE idmulta = $1`,
      [req.parsedId],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Multa no encontrada',
        message: 'Multa no encontrada',
      });
    }
    return res.json(result.rows[0]);
  }),
);

router.post(
  '/multas',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { Monto, Motivo, FechaMulta, IdContrato, IdFiscalizacion } = req.body || {};
    const montoNum = Number(Monto);
    const idContratoNum = Number(IdContrato);
    const idFiscNum = Number(IdFiscalizacion);

    if (
      Number.isNaN(montoNum) ||
      montoNum <= 0 ||
      !Motivo ||
      !Number.isInteger(idContratoNum) ||
      idContratoNum <= 0 ||
      !Number.isInteger(idFiscNum) ||
      idFiscNum <= 0
    ) {
      return res.status(400).json({
        ok: false,
        error: 'Completa Monto (> 0), Motivo, IdContrato e IdFiscalizacion válidos',
        message: 'Completa Monto (> 0), Motivo, IdContrato e IdFiscalizacion válidos',
      });
    }

    const result = await pool.query(
      `INSERT INTO multa (monto, motivo, fechamulta, idcontrato, idfiscalizacion)
       VALUES ($1, $2, COALESCE($3, NOW()), $4, $5)
       RETURNING idmulta, monto, motivo, fechamulta, idcontrato, idfiscalizacion`,
      [montoNum, String(Motivo).trim(), FechaMulta || null, idContratoNum, idFiscNum],
    );
    return res.status(201).json(result.rows[0]);
  }),
);

router.put(
  '/multas/:id',
  requireAuth,
  requireAdmin,
  parsePositiveIntParam('id'),
  asyncHandler(async (req, res) => {
    const { Monto, Motivo, FechaMulta, IdContrato, IdFiscalizacion } = req.body || {};
    const montoNum = Number(Monto);
    const idContratoNum = Number(IdContrato);
    const idFiscNum = Number(IdFiscalizacion);

    if (
      Number.isNaN(montoNum) ||
      montoNum <= 0 ||
      !Motivo ||
      !Number.isInteger(idContratoNum) ||
      !Number.isInteger(idFiscNum)
    ) {
      return res.status(400).json({
        ok: false,
        error: 'Completa Monto, Motivo, IdContrato e IdFiscalizacion válidos',
        message: 'Completa Monto, Motivo, IdContrato e IdFiscalizacion válidos',
      });
    }

    const result = await pool.query(
      `UPDATE multa
       SET monto = $1, motivo = $2, fechamulta = COALESCE($3, fechamulta), idcontrato = $4, idfiscalizacion = $5
       WHERE idmulta = $6
       RETURNING idmulta, monto, motivo, fechamulta, idcontrato, idfiscalizacion`,
      [montoNum, String(Motivo).trim(), FechaMulta || null, idContratoNum, idFiscNum, req.parsedId],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Multa no encontrada',
        message: 'Multa no encontrada',
      });
    }
    return res.json(result.rows[0]);
  }),
);

router.delete(
  '/multas/:id',
  requireAuth,
  requireAdmin,
  parsePositiveIntParam('id'),
  asyncHandler(async (req, res) => {
    const result = await pool.query(
      'DELETE FROM multa WHERE idmulta = $1 RETURNING idmulta',
      [req.parsedId],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Multa no encontrada',
        message: 'Multa no encontrada',
      });
    }
    return res.status(204).send();
  }),
);

module.exports = router;
