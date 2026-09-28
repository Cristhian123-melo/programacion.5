import * as materiasRepository from "../repositories/materias.repositorio.js";
import { HttpError } from "../utils/http-error.js";

/**
 * Consulta y estructura el listado de materias de un usuario con metadatos de paginación.
 * @param {number|string} userId - ID del usuario autenticado.
 * @param {Object} filters - Filtros de búsqueda y parámetros de paginación.
 * @returns {Promise<{data: Array, meta: Object}>} Objeto con la lista de materias y metadatos.
 */
export async function listMaterias(userId, filters) {
  const { materias, total } = await materiasRepository.findAllByUserId(userId, filters);

  return {
    data: materias,
    meta: {
      page: filters.page,
      limit: filters.limit,
      total,
      pages: Math.ceil(total / filters.limit)
    }
  };
}

/**
 * Obtiene los detalles de una materia específica perteneciente a un usuario.
 * @param {number|string} id - ID de la materia a buscar.
 * @param {number|string} userId - ID del usuario.
 * @throws {HttpError} Error 404 si la materia no existe o no pertenece al usuario.
 * @returns {Promise<Object>} Datos de la materia encontrada.
 */
export async function getMateriaById(id, userId) {
  const materia = await materiasRepository.findByIdAndUserId(id, userId);

  if (!materia) {
    throw new HttpError(404, "Materia_not_found", "No se encontró la materia con el ID proporcionado para el usuario especificado.");
  }

  return materia;
}

/**
 * Registra una nueva materia para el usuario validando que no existan duplicados.
 * @param {number|string} userId - ID del usuario.
 * @param {Object} materia - Datos de la materia a crear.
 * @returns {Promise<Object>} Objeto de la materia creada.
 */
export async function createMateria(userId, materia) {
  await ensureUniqueFields(userId, materia);
  return materiasRepository.createMateria(userId, materia);
}

/**
 * Verifica si los campos de código o nombre ya están en uso por el usuario.
 * @param {number|string} userId - ID del usuario.
 * @param {Object} materia - Datos a verificar.
 * @param {number|string} [excludeId] - ID opcional para excluir de la verificación (en actualizaciones).
 * @throws {HttpError} Error 409 si existe duplicación en código o nombre.
 */
async function ensureUniqueFields(userId, materia, excludeId) {
  if (materia.codigo) {
    const duplicatedCode = await materiasRepository.existsByCode(userId, materia.codigo, excludeId);

    if (duplicatedCode) {
      throw new HttpError(409, "DUPLICATE_CODE", "Ya existe una materia con ese código.");
    }
  }

  if (materia.nombre) {
    const duplicatedName = await materiasRepository.existsByName(userId, materia.nombre, excludeId);

    if (duplicatedName) {
      throw new HttpError(409, "DUPLICATE_NAME", "Ya existe una materia con ese nombre.");
    }
  }
}

/**
 * Reemplaza completamente los datos de una materia existente.
 * @param {number|string} id - ID de la materia a reemplazar.
 * @param {number|string} userId - ID del usuario.
 * @param {Object} materia - Nuevos datos completos de la materia.
 * @returns {Promise<Object>} Materia actualizada.
 */
export async function replaceMateria(id, userId, materia) {
  await getMateriaById(id, userId);
  await ensureUniqueFields(userId, materia, id);
  return materiasRepository.updateMateria(id, userId, materia);
}

/**
 * Actualiza parcialmente los campos de una materia.
 * @param {number|string} id - ID de la materia.
 * @param {number|string} userId - ID del usuario.
 * @param {Object} partialMateria - Objeto con los atributos parciales a modificar.
 * @returns {Promise<Object>} Materia actualizada.
 */
export async function updateMateria(id, userId, partialMateria) {
  await getMateriaById(id, userId);
  await ensureUniqueFields(userId, partialMateria, id);
  return materiasRepository.patchMateria(id, userId, partialMateria);
}

/**
 * Elimina una materia comprobando primero su existencia e identidad del usuario.
 * @param {number|string} id - ID de la materia a eliminar.
 * @param {number|string} userId - ID del usuario.
 */
export async function removeMateria(id, userId) {
  await getMateriaById(id, userId);
  await materiasRepository.deleteMateria(id, userId);
}

/**
 * Obtiene la lista de tareas asociadas a una materia específica de un usuario.
 * @param {number|string} id - ID de la materia.
 * @param {number|string} userId - ID del usuario.
 * @returns {Promise<Array>} Lista de tareas vinculadas a esa materia.
 */
export async function getTareasByMateriaId(id, userId) {
  await getMateriaById(id, userId);
  return materiasRepository.findTareasByMateriaIdAndUserId(id, userId);
}