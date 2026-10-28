const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

// Cuando TÚ le vendes la app a un nuevo prestamista, llamas este endpoint
// (desde tu panel de admin) para crear su "casa" aislada: su tenant y
// su primer usuario, con su propia contraseña.
router.post("/registrar-tenant", async (req, res) => {
  const { nombreNegocio, email, password } = req.body;
  if (!nombreNegocio || !email || !password) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const tenantResult = await client.query(
      `INSERT INTO tenants (nombre_negocio, email_contacto) VALUES ($1,$2) RETURNING id`,
      [nombreNegocio, email]
    );
    const tenantId = tenantResult.rows[0].id;

    // bcrypt genera un hash distinto cada vez, aunque dos personas usen
    // la misma contraseña — así ni tú, el dueño de la base de datos,
    // puedes ver la contraseña real de tu cliente.
    const passwordHash = await bcrypt.hash(password, 10);

    await client.query(
      `INSERT INTO usuarios (tenant_id, email, password_hash, rol) VALUES ($1,$2,$3,'dueño')`,
      [tenantId, email, passwordHash]
    );

    await client.query("COMMIT");
    res.status(201).json({ tenantId, mensaje: "Cliente registrado con éxito" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "No se pudo registrar el tenant" });
  } finally {
    client.release();
  }
});

// Login de un usuario de un tenant (tu cliente, el prestamista).
// El JWT que se genera lleva adentro el tenant_id: de ahí en adelante,
// CADA petición que haga ese usuario queda automáticamente encerrada
// dentro de los datos de SU tenant, sin que él pueda ver ni tocar
// los datos de otro cliente tuyo.
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Faltan datos" });

  const { rows } = await pool.query(
    `SELECT u.id, u.password_hash, u.tenant_id, u.rol, u.debe_cambiar_password, t.estado
     FROM usuarios u JOIN tenants t ON t.id = u.tenant_id
     WHERE u.email = $1`,
    [email]
  );
  const usuario = rows[0];

  // Mensaje genérico a propósito: no revela si el email existe o no,
  // eso evita que alguien use el login para "adivinar" qué clientes tienes.
  if (!usuario) return res.status(401).json({ error: "Email o contraseña incorrectos" });

  const coincide = await bcrypt.compare(password, usuario.password_hash);
  if (!coincide) return res.status(401).json({ error: "Email o contraseña incorrectos" });

  if (usuario.estado !== "activo") {
    return res.status(403).json({ error: "Tu suscripción está suspendida. Contacta al soporte." });
  }

  const token = jwt.sign(
    { id: usuario.id, tenant_id: usuario.tenant_id, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );

  res.json({ token, debeCambiarPassword: usuario.debe_cambiar_password });
});

module.exports = router;
