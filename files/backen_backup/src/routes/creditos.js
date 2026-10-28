const express = require("express");
const pool = require("../db");

const router = express.Router();

// OJO A ESTO: en TODA consulta de negocio, el WHERE tenant_id = $1
// usa el tenant_id que viene del JWT (req.user.tenant_id), NUNCA uno
// que mande el cliente en la URL o el body. Así es imposible que el
// prestamista A, por error o a propósito, lea los créditos del B.

router.get("/", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT * FROM creditos WHERE tenant_id = $1 ORDER BY creado_en DESC`,
    [req.user.tenant_id]
  );
  res.json(rows);
});

router.post("/", async (req, res) => {
  const { clienteNombre, valor, tasa, plazoMeses, frecuencia, fechaInicio } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO creditos (tenant_id, cliente_nombre, valor, tasa, plazo_meses, frecuencia, fecha_inicio)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [req.user.tenant_id, clienteNombre, valor, tasa, plazoMeses, frecuencia, fechaInicio]
  );
  res.status(201).json(rows[0]);
});

router.delete("/:id", async (req, res) => {
  // El AND tenant_id=$2 es la línea que de verdad protege el dato:
  // si alguien intenta borrar un id que no es de su tenant, no borra nada.
  const { rowCount } = await pool.query(
    `DELETE FROM creditos WHERE id=$1 AND tenant_id=$2`,
    [req.params.id, req.user.tenant_id]
  );
  if (rowCount === 0) return res.status(404).json({ error: "No encontrado" });
  res.json({ ok: true });
});

module.exports = router;
