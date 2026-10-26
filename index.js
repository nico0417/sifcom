const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { pool, ensureSchema } = require('./src/config/db');
const {
  securityHeaders,
  createRateLimiter,
  asyncHandler,
  notFoundHandler,
  errorHandler,
} = require('./src/middlewares/security');
const authRoutes = require('./src/routes/auth.routes');
const contratosRoutes = require('./src/routes/contratos.routes');
const fiscalizacionesRoutes = require('./src/routes/fiscalizaciones.routes');

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// OWASP API8: Ocultar firma de tecnología Express y aplicar cabeceras seguras
app.disable('x-powered-by');
app.use(securityHeaders);

// OWASP API8: Configuración CORS restringida a orígenes permitidos
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// OWASP API4: Límite estricto de tamaño de payload JSON (100 KB) y Rate Limiting global
app.use(express.json({ limit: '100kb' }));
app.use(
  '/api',
  createRateLimiter({
    windowMs: 60 * 1000,
    max: 120,
    message: 'Límite de solicitudes excedido. Intenta nuevamente en un minuto.',
  }),
);

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'SIFCOM API REST',
    version: '1.0.0',
  });
});

// OWASP API9: Healthcheck sin exponer nombres internos de base de datos ni credenciales
app.get(
  '/api/health',
  asyncHandler(async (_req, res) => {
    await pool.query('SELECT 1');
    res.json({ ok: true, status: 'healthy' });
  }),
);

// Montaje del inventario de rutas bajo /api y /api/v1 (OWASP API9)
app.use('/api', authRoutes);
app.use('/api', contratosRoutes);
app.use('/api', fiscalizacionesRoutes);

app.use('/api/v1', authRoutes);
app.use('/api/v1', contratosRoutes);
app.use('/api/v1', fiscalizacionesRoutes);

// Manejadores de rutas inexistentes (404 JSON) y errores internos (500 seguro)
app.use(notFoundHandler);
app.use(errorHandler);

if (require.main === module) {
  ensureSchema()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`SIFCOM API escuchando en http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('No se pudo iniciar la API:', err.message);
      process.exit(1);
    });
}

module.exports = app;
