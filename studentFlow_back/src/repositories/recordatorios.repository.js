import { pool } from "../config/database.js";

export async function findAllRecordatorios() {
  const query = `
    SELECT r.id, r.titulo, r.descripcion, r.fecha, r.estado, m.nombre as materia_nombre
    FROM recordatorios r
    LEFT JOIN materias m ON r.materia_id = m.id
    LIMIT 20
  `;
  const [rows] = await pool.query(query);
  return rows;
}

export async function findRecordatorioById(id) {
  const query = `SELECT * FROM recordatorios WHERE id = ?`;
  const [rows] = await pool.query(query, [id]);
  return rows[0];
}

export async function createRecordatorioData(data) {
  const query = `
    INSERT INTO recordatorios (titulo, descripcion, fecha, estado, materia_id)
    VALUES (?, ?, ?, ?, ?)
  `;
  const [result] = await pool.query(query, [
    data.titulo,
    data.descripcion,
    data.fecha,
    data.estado,
    data.materia_id
  ]);
  return result;
}

export async function updateRecordatorioData(id, data) {
  const query = `
    UPDATE recordatorios 
    SET titulo = ?, descripcion = ?, fecha = ?, estado = ?
    WHERE id = ?
  `;
  const [result] = await pool.query(query, [
    data.titulo,
    data.descripcion,
    data.fecha,
    data.estado,
    id
  ]);
  return result;
}

export async function deleteRecordatorioData(id) {
  const query = `DELETE FROM recordatorios WHERE id = ?`;
  const [result] = await pool.query(query, [id]);
  return result;
}