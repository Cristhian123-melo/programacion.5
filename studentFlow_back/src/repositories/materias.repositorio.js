import { pool } from "../config/database.js";

/**
 * Mapeo de campos permitidos para el ordenamiento de materias en SQL.
 * @type {Object.<string, string>}
 */
const sortableFields = {
  id: "m.id_materia",
  nombre: "m.nombre",
  codigo: "m.codigo",
  creditos: "m.creditos",
  color: "m.color",
  activa: "m.activa",
  createdAt: "m.created_at",
  updatedAt: "m.updated_at"
};

/**
 * Normaliza y valida la columna y dirección de ordenamiento para la consulta SQL.
 * @param {string} sort - Campo por el cual se desea ordenar.
 * @param {string} order - Dirección del ordenamiento ("asc" o "desc").
 * @returns {string} Fragmento SQL de ordenamiento (ej. "m.nombre ASC").
 */
function normalizeSort(sort, order) {
  const column = sortableFields[sort] || sortableFields.nombre;
  const direction = String(order).toLowerCase() === "desc" ? "DESC" : "ASC";
  return `${column} ${direction}`;
}

/**
 * Mapea una fila de resultado de la base de datos al formato de objeto Materia.
 * @param {Object} row - Fila retornada por la consulta SQL.
 * @returns {Object} Objeto Materia estructurado.
 */
function mapMateria(row) {
  return {
    id: row.id,
    usuarioId: row.usuarioId,
    nombre: row.nombre,
    codigo: row.codigo,
    creditos: row.creditos,
    color: row.color,
    activa: row.activa,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

/**
 * Consulta todas las materias pertenecientes a un usuario con soporte para filtros, paginación y ordenamiento.
 * @param {number|string} userId - Identificador único del usuario.
 * @param {Object} [filters={}] - Criterios de búsqueda y paginación.
 * @param {boolean} [filters.activa] - Filtra por estado activo/inactivo.
 * @param {string} [filters.search] - Texto para buscar por nombre o código.
 * @param {string} [filters.sort] - Campo de ordenamiento.
 * @param {string} [filters.order] - Orden asc o desc.
 * @param {number} [filters.limit] - Límite de registros por página.
 * @param {number} [filters.page] - Número de página actual.
 * @returns {Promise<{materias: Array<Object>, total: number}>} Promesa con el listado de materias y total de registros.
 */
export async function findAllByUserId(userId, filters = {}) {
  const conditions = ["m.id_usuario = ?"];
  const params = [userId];

  if (typeof filters.activa === "boolean") {
    conditions.push("m.activa = ?");
    params.push(filters.activa ? 1 : 0);
  }

  if (filters.search) {
    conditions.push("(m.nombre LIKE ? OR m.codigo LIKE ?)");
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM materia m
     WHERE ${conditions.join(" AND ")}`,
    params
  );

  const orderBy = normalizeSort(filters.sort, filters.order);
  const limit = filters.limit;
  const offset = (filters.page - 1) * limit;

  const [rows] = await pool.execute(
    `SELECT
       m.id_materia AS id,
       m.id_usuario AS usuarioId,
       m.nombre,
       m.codigo,
       m.color,
       m.creditos,
       m.activa,
       m.created_at AS createdAt,
       m.updated_at AS updatedAt
     FROM materia m
     WHERE ${conditions.join(" AND ")}
     ORDER BY ${orderBy}
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    materias: rows.map(mapMateria),
    total: countRows[0].total
  };
}

/**
 * Busca una materia específica por su ID y el ID del usuario propietario.
 * @param {number|string} id - Identificador de la materia.
 * @param {number|string} userId - Identificador del usuario.
 * @returns {Promise<Object|null>} Objeto de la materia si se encuentra, o null.
 */
export async function findByIdAndUserId(id, userId) {
  const [rows] = await pool.execute(
    `SELECT
       m.id_materia AS id,
       m.id_usuario AS usuarioId,
       m.nombre,
       m.codigo,
       m.color,
       m.creditos,
       m.activa,
       m.created_at AS createdAt,
       m.updated_at AS updatedAt
     FROM materia m
     WHERE m.id_materia = ? AND m.id_usuario = ?`,
    [id, userId]
  );

  return rows[0] ? mapMateria(rows[0]) : null;
}

/**
 * Inserta una nueva materia vinculada a un usuario.
 * @param {number|string} userId - Identificador del usuario propietario.
 * @param {Object} materia - Datos de la materia a crear.
 * @returns {Promise<Object>} La materia recién creada.
 */
export async function createMateria(userId, materia) {
  const [result] = await pool.execute(
    `INSERT INTO materia (id_usuario, nombre, codigo, color, creditos, activa)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      userId,
      materia.nombre,
      materia.codigo,
      materia.color,
      materia.creditos,
      materia.activa ? 1 : 0
    ]
  );

  return findByIdAndUserId(result.insertId, userId);
}

/**
 * Verifica si existe una materia con el mismo código para un usuario determinado.
 * @param {number|string} userId - Identificador del usuario.
 * @param {string} codigo - Código de la materia a validar.
 * @param {number|string} [excludeId] - ID de materia a ignorar (útil para actualizaciones).
 * @returns {Promise<boolean>} True si ya existe, false en caso contrario.
 */
export async function existsByCode(userId, codigo, excludeId) {
  const params = [userId, codigo];
  let sql = "SELECT 1 FROM materia WHERE id_usuario = ? AND codigo = ?";

  if (excludeId) {
    sql += " AND id_materia <> ?";
    params.push(excludeId);
  }

  sql += " LIMIT 1";

  const [rows] = await pool.execute(sql, params);
  return rows.length > 0;
}

/**
 * Verifica si existe una materia con el mismo nombre para un usuario determinado.
 * @param {number|string} userId - Identificador del usuario.
 * @param {string} nombre - Nombre de la materia a validar.
 * @param {number|string} [excludeId] - ID de materia a ignorar.
 * @returns {Promise<boolean>} True si ya existe, false en caso contrario.
 */
export async function existsByName(userId, nombre, excludeId) {
  const params = [userId, nombre];
  let sql = "SELECT 1 FROM materia WHERE id_usuario = ? AND nombre = ?";

  if (excludeId) {
    sql += " AND id_materia <> ?";
    params.push(excludeId);
  }

  sql += " LIMIT 1";

  const [rows] = await pool.execute(sql, params);
  return rows.length > 0;
}

/**
 * Actualiza parcialmente los campos de una materia existente.
 * @param {number|string} id - Identificador de la materia.
 * @param {number|string} userId - Identificador del usuario.
 * @param {Object} partialMateria - Objeto con los atributos a actualizar.
 * @returns {Promise<Object|null>} Objeto de la materia actualizada.
 */
export async function patchMateria(id, userId, partialMateria) {
  const fields = [];
  const params = [];

  if (partialMateria.nombre !== undefined) {
    fields.push("nombre = ?");
    params.push(partialMateria.nombre);
  }

  if (partialMateria.codigo !== undefined) {
    fields.push("codigo = ?");
    params.push(partialMateria.codigo);
  }

  if (partialMateria.color !== undefined) {
    fields.push("color = ?");
    params.push(partialMateria.color);
  }

  if (partialMateria.creditos !== undefined) {
    fields.push("creditos = ?");
    params.push(partialMateria.creditos);
  }

  if (partialMateria.activa !== undefined) {
    fields.push("activa = ?");
    params.push(partialMateria.activa ? 1 : 0);
  }

  if (fields.length === 0) {
    return findByIdAndUserId(id, userId);
  }

  params.push(id, userId);

  await pool.execute(
    `UPDATE materia
     SET ${fields.join(", ")}
     WHERE id_materia = ? AND id_usuario = ?`,
    params
  );

  return findByIdAndUserId(id, userId);
}

/**
 * Elimina una materia de la base de datos verificando su propietario.
 * @param {number|string} id - Identificador de la materia a eliminar.
 * @param {number|string} userId - Identificador del usuario.
 * @returns {Promise<boolean>} True si la eliminación fue exitosa, false si no.
 */
export async function deleteMateria(id, userId) {
  const [result] = await pool.execute(
    "DELETE FROM materia WHERE id_materia = ? AND id_usuario = ?",
    [id, userId]
  );

  return result.affectedRows > 0;
}

/**
 * Actualiza todos los campos de una materia (reemplazo total/PUT).
 * @param {number|string} id - Identificador de la materia.
 * @param {number|string} userId - Identificador del usuario.
 * @param {Object} materia - Objeto completo con los nuevos datos.
 * @returns {Promise<Object|null>} La materia actualizada.
 */
export async function updateMateria(id, userId, materia) {
  await pool.execute(
    `UPDATE materia
     SET nombre = ?, codigo = ?, color = ?, creditos = ?, activa = ?
     WHERE id_materia = ? AND id_usuario = ?`,
    [
      materia.nombre,
      materia.codigo,
      materia.color,
      materia.creditos,
      materia.activa ? 1 : 0,
      id,
      userId
    ]
  );

  return findByIdAndUserId(id, userId);
}

/**
 * Obtiene todas las tareas asociadas a una materia específica validando el id del usuario.
 * @param {number|string} materiaId - Identificador de la materia.
 * @param {number|string} userId - Identificador del usuario propietario.
 * @returns {Promise<Array<Object>>} Listado de tareas pertenecientes a la materia.
 */
export async function findTareasByMateriaIdAndUserId(materiaId, userId) {
  const [rows] = await pool.execute(
    `SELECT 
       t.id_tarea AS id,
       t.id_materia AS materiaId,
       t.id_usuario AS usuarioId,
       t.titulo,
       t.descripcion,
       t.fecha_entrega AS fechaEntrega,
       t.completada,
       t.created_at AS createdAt,
       t.updated_at AS updatedAt
     FROM tarea t
     WHERE t.id_materia = ? AND t.id_usuario = ?`,
    [materiaId, userId]
  );

  return rows;
}