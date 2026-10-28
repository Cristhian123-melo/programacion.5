require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const creditosRoutes = require("./routes/creditos");
const { verificarTokenJWT } = require("./middleware/auth");
const { verificarTenantActivo } = require("./middleware/tenantActivo");

const app = express();
app.use(cors());
app.use(express.json());

// Públicas
app.use("/api/auth", authRoutes);

// Panel de administración (tuyo, protegido con tu propio login)
app.use("/api/admin", adminRoutes);

// Rutas de negocio: primero se verifica el token del usuario,
// luego que su tenant esté activo. En este orden, siempre.
app.use("/api/creditos", verificarTokenJWT, verificarTenantActivo, creditosRoutes);
// Aquí vas agregando, con el mismo patrón, las rutas de las Guías 1 y 2:
// app.use("/api/calendario", verificarTokenJWT, verificarTenantActivo, calendarioRoutes);
// app.use("/api/estadisticas", verificarTokenJWT, verificarTenantActivo, estadisticasRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend corriendo en http://localhost:${PORT}`));
