const jwt = require('jsonwebtoken');

const JWT_ALGORITHM = 'HS256';
const DEFAULT_SECRET = 'sifcom_dev_jwt_secret_key_change_in_prod_2026';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length < 12) {
    return DEFAULT_SECRET;
  }
  return secret;
};

// -----------------------------------------------------------------------------
// OWASP API8:2023 — Security Misconfiguration
// Cabeceras HTTP de endurecimiento sin exponer tecnologías internas
// -----------------------------------------------------------------------------
const securityHeaders = (_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(self), camera=(self)');
  next();
};

// -----------------------------------------------------------------------------
// OWASP API4:2023 — Unrestricted Resource Consumption
// Rate Limiter en memoria por IP y ventana de tiempo configurable
// -----------------------------------------------------------------------------
const createRateLimiter = ({ windowMs = 60_000, max = 100, message = 'Demasiadas solicitudes, intenta más tarde' } = {}) => {
  const hits = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const record = hits.get(ip);

    if (!record || now > record.resetAt) {
      hits.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    record.count += 1;
    if (record.count > max) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({
        ok: false,
        error: message,
        message,
      });
    }

    return next();
  };
};

// -----------------------------------------------------------------------------
// OWASP API2:2023 — Broken Authentication
// Firma y verificación estricta de JWT con expiración acotada y algoritmo fijo
// -----------------------------------------------------------------------------
const firmarToken = (usuario) =>
  jwt.sign(
    {
      IdUser: usuario.IdUser,
      Email: usuario.Email,
      PermisosUser: usuario.PermisosUser,
    },
    getJwtSecret(),
    { algorithm: JWT_ALGORITHM, expiresIn: '2h' },
  );

const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
  if (!token) {
    return res.status(401).json({
      ok: false,
      error: 'Debes iniciar sesión (Token no enviado)',
      message: 'Debes iniciar sesión (Token no enviado)',
    });
  }
  try {
    req.user = jwt.verify(token, getJwtSecret(), { algorithms: [JWT_ALGORITHM] });
    return next();
  } catch {
    return res.status(401).json({
      ok: false,
      error: 'Token inválido o expirado',
      message: 'Token inválido o expirado',
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.PermisosUser !== 'ADMIN') {
    return res.status(403).json({
      ok: false,
      error: 'No tienes permisos para realizar esta acción (Se requiere rol ADMIN)',
      message: 'No tienes permisos para realizar esta acción (Se requiere rol ADMIN)',
    });
  }
  return next();
};

// -----------------------------------------------------------------------------
// Validación de parámetros de ruta (Diapositiva 16 de 3.3.pdf)
// Convierte req.params.id a Number y exige entero positivo -> 400 Bad Request
// -----------------------------------------------------------------------------
const parsePositiveIntParam = (paramName = 'id') => (req, res, next) => {
  const value = Number(req.params[paramName]);
  if (!Number.isInteger(value) || value <= 0) {
    return res.status(400).json({
      ok: false,
      error: `El parámetro '${paramName}' debe ser un número entero positivo`,
      message: `El parámetro '${paramName}' debe ser un número entero positivo`,
      errors: [{ field: paramName, code: 'invalid_integer' }],
    });
  }
  req.parsedId = value;
  return next();
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// -----------------------------------------------------------------------------
// OWASP API9:2023 — Improper Inventory Management
// Respuesta JSON estándar 404 para cualquier ruta no inventariada
// -----------------------------------------------------------------------------
const notFoundHandler = (req, res) => {
  res.status(404).json({
    ok: false,
    error: `Endpoint no encontrado: ${req.method} ${req.originalUrl}`,
    message: 'El recurso o endpoint solicitado no existe en esta versión de la API',
  });
};

// -----------------------------------------------------------------------------
// OWASP API8:2023 — Security Misconfiguration
// Manejador centralizado de errores que oculta detalles de BD o stacktraces
// -----------------------------------------------------------------------------
const errorHandler = (err, _req, res, _next) => {
  console.error('[SIFCOM API Error]:', err.message);

  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      ok: false,
      error: 'El cuerpo de la solicitud supera el límite permitido (100 KB)',
      message: 'El cuerpo de la solicitud supera el límite permitido (100 KB)',
    });
  }

  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      ok: false,
      error: 'Formato JSON inválido en el cuerpo de la solicitud',
      message: 'Formato JSON inválido en el cuerpo de la solicitud',
    });
  }

  return res.status(500).json({
    ok: false,
    error: 'Error interno del servidor',
    message: 'Error interno del servidor',
  });
};

module.exports = {
  securityHeaders,
  createRateLimiter,
  firmarToken,
  requireAuth,
  requireAdmin,
  parsePositiveIntParam,
  asyncHandler,
  notFoundHandler,
  errorHandler,
};
