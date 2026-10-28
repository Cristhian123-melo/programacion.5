require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const creditosRoutes = require("./routes/creditos");
const appDataRoutes = require("./routes/appData");
const { verificarTokenJWT } = require("./middleware/auth");
const { verificarTenantActivo } = require("./middleware/tenantActivo");
const { iniciarBackupsAutomaticos } = require("./jobs/backupDiario");

const app = express();

// En producción, restringe esto a tu dominio real (ej: "https://app.libromayor.com")
// con la variable de entorno CORS_ORIGIN. Mientras desarrollas en localhost, "*" está bien.
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "5mb" })); // el bloque de créditos puede crecer, damos margen

// Evita que alguien intente adivinar contraseñas a la fuerza: máximo 10
// intentos de login por IP cada 15 minutos, tanto para tus clientes como
// para tu propio panel de admin.
const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Demasiados intentos. Espera unos minutos y vuelve a intentar." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Públicas
app.use("/api/auth/login", limiteLogin);
app.use("/api/auth", authRoutes);

// Panel de administración (tuyo, protegido con tu propio login)
app.use("/api/admin/login", limiteLogin);
app.use("/api/admin", adminRoutes);

// Rutas de negocio: primero se verifica el token del usuario,
// luego que su tenant esté activo. En este orden, siempre.
app.use("/api/creditos", verificarTokenJWT, verificarTenantActivo, creditosRoutes);
app.use("/api/app-data", verificarTokenJWT, verificarTenantActivo, appDataRoutes);
// Aquí vas agregando, con el mismo patrón, las rutas de las Guías 1 y 2:
// app.use("/api/calendario", verificarTokenJWT, verificarTenantActivo, calendarioRoutes);
// app.use("/api/estadisticas", verificarTokenJWT, verificarTenantActivo, estadisticasRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
  iniciarBackupsAutomaticos();
});
