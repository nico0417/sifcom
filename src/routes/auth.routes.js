const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const {
  asyncHandler,
  createRateLimiter,
  firmarToken,
  requireAuth,
} = require('../middlewares/security');

const router = express.Router();

// OWASP API2 & API4: Limitar intentos de autenticación a máx 15 cada 15 min por IP
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Demasiados intentos de autenticación. Intenta nuevamente en 15 minutos.',
});

const emailOk = (email) =>
  typeof email === 'string' &&
  email.length <= 120 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const passwordOk = (password) =>
  typeof password === 'string' &&
  password.length >= 8 &&
  password.length <= 100 &&
  /\d/.test(password);

const col = (row, ...keys) => {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null) return row[key];
  }
  return undefined;
};

const publicUser = (row) => ({
  IdUser: col(row, 'iduser', 'IdUser'),
  Email: col(row, 'email', 'Email'),
  Nombre: col(row, 'nombre', 'Nombre'),
  Comuna: col(row, 'comuna', 'Comuna'),
  PermisosUser: col(row, 'permisosuser', 'PermisosUser'),
});

// -----------------------------------------------------------------------------
// POST /api/auth/register
// OWASP API2 / Prevención de Escalación de Privilegios:
// Toda cuenta registrada públicamente se crea con rol 'INSPECTOR'.
// -----------------------------------------------------------------------------
router.post(
  '/auth/register',
  authLimiter,
  asyncHandler(async (req, res) => {
    const body = req.body || {};
    const Email = String(body.Email ?? body.email ?? '').trim().toLowerCase();
    const Nombre = String(body.Nombre ?? body.nombre ?? '').trim();
    const Comuna = String(body.Comuna ?? body.comuna ?? '').trim();
    const Contrasena = body.Contrasena ?? body.contrasena ?? body.password;

    if (!Email || !Nombre || !Comuna || !Contrasena) {
      return res.status(400).json({
        ok: false,
        error: 'Completa todos los campos obligatorios (Nombre, Comuna, Correo y Contraseña)',
        message: 'Completa todos los campos obligatorios',
      });
    }
    if (Nombre.length < 2 || Nombre.length > 120 || Comuna.length > 80) {
      return res.status(400).json({
        ok: false,
        error: 'El nombre o la comuna tienen una longitud inválida',
        message: 'El nombre o la comuna tienen una longitud inválida',
      });
    }
    if (!emailOk(Email)) {
      return res.status(400).json({
        ok: false,
        error: 'Correo inválido',
        message: 'Correo inválido',
      });
    }
    if (!passwordOk(Contrasena)) {
      return res.status(400).json({
        ok: false,
        error: 'La contraseña debe tener al menos 8 caracteres y un número',
        message: 'La contraseña debe tener al menos 8 caracteres y un número',
      });
    }

    const existe = await pool.query('SELECT 1 FROM usuario WHERE email = $1', [Email]);
    if (existe.rowCount > 0) {
      return res.status(409).json({
        ok: false,
        error: 'El correo ya está registrado',
        message: 'El correo ya está registrado',
      });
    }

    const hash = await bcrypt.hash(Contrasena, 10);
    const rolFijo = 'INSPECTOR';

    const inserted = await pool.query(
      `INSERT INTO usuario (email, nombre, comuna, contrasena, permisosuser)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING iduser, email, nombre, comuna, permisosuser`,
      [Email, Nombre, Comuna, hash, rolFijo],
    );

    const user = publicUser(inserted.rows[0]);
    return res.status(201).json({
      ok: true,
      message: 'Cuenta creada exitosamente',
      user,
      data: { user },
    });
  }),
);

// -----------------------------------------------------------------------------
// POST /api/auth/login
// OWASP API2: Mensaje uniforme ante credenciales inválidas + firma JWT HS256
// -----------------------------------------------------------------------------
router.post(
  '/auth/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const body = req.body || {};
    const Email = String(body.Email ?? body.email ?? '').trim().toLowerCase();
    const Contrasena = body.Contrasena ?? body.contrasena ?? body.password;

    if (!Email || !Contrasena || typeof Contrasena !== 'string') {
      return res.status(400).json({
        ok: false,
        error: 'Completa correo y contraseña',
        message: 'Completa correo y contraseña',
      });
    }

    const result = await pool.query(
      `SELECT iduser, email, nombre, comuna, contrasena, permisosuser
       FROM usuario WHERE email = $1`,
      [Email],
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        ok: false,
        error: 'Credenciales inválidas',
        message: 'Credenciales inválidas',
      });
    }

    const usuario = result.rows[0];
    const hash = col(usuario, 'contrasena', 'Contrasena');
    const match = await bcrypt.compare(Contrasena, hash);
    if (!match) {
      return res.status(401).json({
        ok: false,
        error: 'Credenciales inválidas',
        message: 'Credenciales inválidas',
      });
    }

    const user = publicUser(usuario);
    const token = firmarToken(user);

    return res.status(200).json({
      ok: true,
      message: 'Inicio de sesión exitoso',
      token,
      user,
      data: { token, user },
    });
  }),
);

// -----------------------------------------------------------------------------
// GET /api/usuarios/perfil
// OWASP API1 (BOLA): Obtiene exclusivamente el perfil del usuario en req.user.IdUser
// -----------------------------------------------------------------------------
router.get(
  '/usuarios/perfil',
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await pool.query(
      `SELECT iduser, email, nombre, comuna, permisosuser
       FROM usuario WHERE iduser = $1`,
      [req.user.IdUser],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Usuario no encontrado',
        message: 'Usuario no encontrado',
      });
    }
    const user = publicUser(result.rows[0]);
    return res.json({
      ok: true,
      user,
      data: user,
    });
  }),
);

// -----------------------------------------------------------------------------
// PUT /api/usuarios/perfil
// OWASP API1 (BOLA): Actualiza únicamente el registro perteneciente a req.user.IdUser
// e impide modificar permisosuser desde el perfil.
// -----------------------------------------------------------------------------
router.put(
  '/usuarios/perfil',
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = req.body || {};
    const Nombre = String(body.Nombre ?? body.nombre ?? '').trim();
    const Email = String(body.Email ?? body.email ?? '').trim().toLowerCase();
    const Comuna = String(body.Comuna ?? body.comuna ?? '').trim();
    const Contrasena = body.Contrasena ?? body.contrasena ?? body.password;

    if (!Nombre || !Email || !Comuna) {
      return res.status(400).json({
        ok: false,
        error: 'Completa Nombre, Correo y Comuna',
        message: 'Completa Nombre, Correo y Comuna',
      });
    }
    if (!emailOk(Email)) {
      return res.status(400).json({
        ok: false,
        error: 'Formato de correo inválido',
        message: 'Formato de correo inválido',
      });
    }

    const duplicado = await pool.query(
      'SELECT 1 FROM usuario WHERE email = $1 AND iduser <> $2',
      [Email, req.user.IdUser],
    );
    if (duplicado.rowCount > 0) {
      return res.status(409).json({
        ok: false,
        error: 'El correo ya está siendo utilizado por otra cuenta',
        message: 'El correo ya está siendo utilizado por otra cuenta',
      });
    }

    let result;
    if (Contrasena) {
      if (!passwordOk(Contrasena)) {
        return res.status(400).json({
          ok: false,
          error: 'La nueva contraseña debe tener al menos 8 caracteres y un número',
          message: 'La nueva contraseña debe tener al menos 8 caracteres y un número',
        });
      }
      const hash = await bcrypt.hash(Contrasena, 10);
      result = await pool.query(
        `UPDATE usuario
         SET nombre = $1, email = $2, comuna = $3, contrasena = $4
         WHERE iduser = $5
         RETURNING iduser, email, nombre, comuna, permisosuser`,
        [Nombre, Email, Comuna, hash, req.user.IdUser],
      );
    } else {
      result = await pool.query(
        `UPDATE usuario
         SET nombre = $1, email = $2, comuna = $3
         WHERE iduser = $4
         RETURNING iduser, email, nombre, comuna, permisosuser`,
        [Nombre, Email, Comuna, req.user.IdUser],
      );
    }

    const user = publicUser(result.rows[0]);
    return res.json({
      ok: true,
      message: 'Perfil actualizado correctamente',
      user,
      data: { user },
    });
  }),
);

module.exports = router;
