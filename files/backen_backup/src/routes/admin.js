const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { verificarTokenAdmin } = require("../middleware/auth");

const router = express.Router();

// Login del ÚNICO dueño (tú). Se hace contra la tabla `admins`,
// separada por completo de la de tus clientes.
router.post("/login", async (req, res) => {
  console.log("================================");
console.log("LOGIN ADMIN");
console.log(req.body);
  const { email, password } = req.body;
  const { rows } = await pool.query("SELECT * FROM admins WHERE email=$1", [email]);
  const admin = rows[0];
  if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }
  const token = jwt.sign({ id: admin.id, tipo: "admin" }, process.env.JWT_ADMIN_SECRET, { expiresIn: "12h" });
  res.json({ token });
});

// Todo lo de abajo requiere tu token de admin.
router.use(verificarTokenAdmin);

// Lista de todos tus clientes con su estado de pago — esta es la
// vista principal de tu panel multi-tenant.
router.get("/tenants", async (req, res) => {
  const { rows } = await pool.query(`
    SELECT t.id, t.nombre_negocio, t.email_contacto, t.estado, t.fecha_registro,
           s.proximo_cobro, s.intentos_fallidos, s.estado AS estado_suscripcion
    FROM tenants t
    LEFT JOIN suscripciones s ON s.tenant_id = t.id
    ORDER BY t.fecha_registro DESC
  `);
  res.json(rows);
});

router.post("/tenants/:id/suspender", async (req, res) => {
  await pool.query(`UPDATE tenants SET estado='suspendido' WHERE id=$1`, [req.params.id]);
  res.json({ ok: true });
});

router.post("/tenants/:id/reactivar", async (req, res) => {
  await pool.query(`UPDATE tenants SET estado='activo' WHERE id=$1`, [req.params.id]);
  await pool.query(`UPDATE suscripciones SET intentos_fallidos=0 WHERE tenant_id=$1`, [req.params.id]);
  res.json({ ok: true });
});

// Genera una contraseña temporal para el dueño del tenant, por si
// tu cliente te llama porque olvidó la suya. Tú se la das por
// WhatsApp/llamada, y en el próximo login la app lo obliga a cambiarla.
router.post("/tenants/:id/reset-password", async (req, res) => {
  const temporal = crypto.randomBytes(4).toString("hex");
  const hash = await bcrypt.hash(temporal, 10);
  const { rowCount } = await pool.query(
    `UPDATE usuarios SET password_hash=$1, debe_cambiar_password=true WHERE tenant_id=$2 AND rol='dueño'`,
    [hash, req.params.id]
  );
  if (rowCount === 0) return res.status(404).json({ error: "No se encontró el usuario dueño de ese tenant" });
  res.json({ passwordTemporal: temporal });
});

module.exports = router;
