const pool = require("../db");

// Se ejecuta en TODAS las rutas de negocio, después de verificarTokenJWT.
// Si el tenant fue suspendido (porque no pagó), aquí se le corta el
// acceso al instante, sin importar que su token siga siendo "válido".
async function verificarTenantActivo(req, res, next) {
  const { rows } = await pool.query(
    "SELECT estado FROM tenants WHERE id = $1",
    [req.user.tenant_id]
  );
  if (!rows[0] || rows[0].estado !== "activo") {
    return res.status(403).json({
      error: "Tu suscripción está suspendida. Contacta al soporte para reactivarla.",
    });
  }
  next();
}

module.exports = { verificarTenantActivo };
