const express = require('express');
const { pool } = require('../config/db');
const {
  asyncHandler,
  parsePositiveIntParam,
  requireAdmin,
  requireAuth,
} = require('../middlewares/security');

const router = express.Router();

// GET /api/contratos
router.get(
  '/contratos',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const result = await pool.query(
      `SELECT idcontrato, empresa, giro, presupuesto, vigencia
       FROM contrato ORDER BY idcontrato`,
    );
    return res.json(result.rows);
  }),
);

// GET /api/contratos/:id
router.get(
  '/contratos/:id',
  requireAuth,
  parsePositiveIntParam('id'),
  asyncHandler(async (req, res) => {
    const result = await pool.query(
      `SELECT idcontrato, empresa, giro, presupuesto, vigencia
       FROM contrato WHERE idcontrato = $1`,
      [req.parsedId],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Contrato no encontrado',
        message: 'Contrato no encontrado',
      });
    }
    return res.json(result.rows[0]);
  }),
);

// GET /api/contratos/:id/checklists
router.get(
  '/contratos/:id/checklists',
  requireAuth,
  parsePositiveIntParam('id'),
  asyncHandler(async (req, res) => {
    const result = await pool.query(
      `SELECT ch.idchecklist, ch.descripcion
       FROM checklist ch
       INNER JOIN itemschecklist ic ON ic.idchecklist = ch.idchecklist
       WHERE ic.idcontrato = $1
       ORDER BY ch.idchecklist`,
      [req.parsedId],
    );
    if (result.rowCount > 0) {
      return res.json(result.rows);
    }
    const fallback = await pool.query(
      'SELECT idchecklist, descripcion FROM checklist ORDER BY idchecklist',
    );
    return res.json(fallback.rows);
  }),
);

// GET /api/checklists
router.get(
  '/checklists',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const result = await pool.query(
      'SELECT idchecklist, descripcion FROM checklist ORDER BY idchecklist',
    );
    return res.json(result.rows);
  }),
);

// POST /api/contratos (Solo ADMIN)
router.post(
  '/contratos',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { Empresa, Giro, Presupuesto, Vigencia } = req.body || {};
    const presupuestoNum = Number(String(Presupuesto ?? '').replace(/[^\d.-]/g, ''));

    if (!Empresa || !Giro || Presupuesto == null || Number.isNaN(presupuestoNum) || presupuestoNum < 0 || !Vigencia) {
      return res.status(400).json({
        ok: false,
        error: 'Completa Empresa, Giro, Presupuesto numérico válido y Vigencia',
        message: 'Completa Empresa, Giro, Presupuesto numérico válido y Vigencia',
      });
    }

    const result = await pool.query(
      `INSERT INTO contrato (empresa, giro, presupuesto, vigencia)
       VALUES ($1, $2, $3, $4)
       RETURNING idcontrato, empresa, giro, presupuesto, vigencia`,
      [String(Empresa).trim(), String(Giro).trim(), presupuestoNum, Vigencia],
    );

    const nuevoContrato = result.rows[0];
    // Asociar automáticamente los ítems base de checklist al nuevo contrato
    const checks = await pool.query('SELECT idchecklist FROM checklist ORDER BY idchecklist');
    for (const item of checks.rows) {
      await pool.query(
        'INSERT INTO itemschecklist (idchecklist, idcontrato) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [Number(item.idchecklist), Number(nuevoContrato.idcontrato)],
      );
    }

    return res.status(201).json(nuevoContrato);
  }),
);

// PUT /api/contratos/:id (Solo ADMIN)
router.put(
  '/contratos/:id',
  requireAuth,
  requireAdmin,
  parsePositiveIntParam('id'),
  asyncHandler(async (req, res) => {
    const { Empresa, Giro, Presupuesto, Vigencia } = req.body || {};
    const presupuestoNum = Number(String(Presupuesto ?? '').replace(/[^\d.-]/g, ''));

    if (!Empresa || !Giro || Presupuesto == null || Number.isNaN(presupuestoNum) || presupuestoNum < 0 || !Vigencia) {
      return res.status(400).json({
        ok: false,
        error: 'Completa Empresa, Giro, Presupuesto numérico válido y Vigencia',
        message: 'Completa Empresa, Giro, Presupuesto numérico válido y Vigencia',
      });
    }

    const result = await pool.query(
      `UPDATE contrato
       SET empresa = $1, giro = $2, presupuesto = $3, vigencia = $4
       WHERE idcontrato = $5
       RETURNING idcontrato, empresa, giro, presupuesto, vigencia`,
      [String(Empresa).trim(), String(Giro).trim(), presupuestoNum, Vigencia, req.parsedId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Contrato no encontrado',
        message: 'Contrato no encontrado',
      });
    }

    return res.json(result.rows[0]);
  }),
);

// DELETE /api/contratos/:id (Solo ADMIN)
router.delete(
  '/contratos/:id',
  requireAuth,
  requireAdmin,
  parsePositiveIntParam('id'),
  asyncHandler(async (req, res) => {
    const result = await pool.query(
      'DELETE FROM contrato WHERE idcontrato = $1 RETURNING idcontrato',
      [req.parsedId],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Contrato no encontrado',
        message: 'Contrato no encontrado',
      });
    }
    return res.status(204).send();
  }),
);

module.exports = router;
