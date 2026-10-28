const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET /api/app-data — trae el bloque de datos del tenant que hizo login
// (nunca de otro, req.user.tenant_id sale del JWT, no lo manda el cliente).
router.get("/", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT data FROM app_data WHERE tenant_id = $1`,
    [req.user.tenant_id]
  );
  // Si el tenant nunca ha guardado nada todavía (primera vez que entra),
  // no hay fila — se lo decimos al frontend con null, y él sabe crear
  // los datos por defecto (igual que hacía antes con localStorage vacío).
  res.json({ data: rows[0]?.data ?? null });
});

// PUT /api/app-data — reemplaza por completo el bloque de datos del tenant.
// Se llama cada vez que algo cambia en la app (nuevo crédito, pago
// marcado, fecha corregida, etc.) — el mismo patrón "guardar todo" que
// ya usaba localStorage, solo que ahora queda en tu servidor.
router.put("/", async (req, res) => {
  const { data } = req.body;
  if (!data || typeof data !== "object") {
    return res.status(400).json({ error: "Falta el campo 'data'" });
  }
  await pool.query(
    `INSERT INTO app_data (tenant_id, data, actualizado_en)
     VALUES ($1, $2, NOW())
     ON CONFLICT (tenant_id) DO UPDATE SET data = $2, actualizado_en = NOW()`,
    [req.user.tenant_id, JSON.stringify(data)]
  );
  res.json({ ok: true });
});

module.exports = router;
