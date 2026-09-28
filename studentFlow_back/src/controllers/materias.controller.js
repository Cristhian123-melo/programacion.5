import * as materiasService from "../services/materias.service.js";
import { sendNoContent, sendSuccess } from "../utils/api-response.js";

import {
  validateCreateMateria,
  validateMateriaListQuery,
  validateMateriaId,
  validatePatchMateria
} from "../validators/materias.validator.js";

/**
 * Controlador para obtener la lista de materias filtradas del usuario autenticado.
 * @param {Object} request - Objeto de solicitud HTTP de Express.
 * @param {Object} response - Objeto de respuesta HTTP de Express.
 * @param {Function} next - Función middleware para el manejo de errores.
 */
export async function listMaterias(request, response, next) {
  try {
    const filters = validateMateriaListQuery(request.query);
    const result = await materiasService.listMaterias(request.user.id, filters);
    return sendSuccess(response, result.data, 200, result.meta);
  } catch (error) {
    return next(error);
  }
}

/**
 * Controlador para consultar los datos de una materia específica por su ID.
 * @param {Object} request - Objeto de solicitud de Express con req.params.id.
 * @param {Object} response - Objeto de respuesta de Express.
 * @param {Function} next - Middleware para retransmitir errores.
 */
export async function getMateriaById(request, response, next) {
  try {
    const id = validateMateriaId(request.params.id);
    const materia = await materiasService.getMateriaById(id, request.user.id);
    return sendSuccess(response, materia);
  } catch (error) {
    return next(error);
  }
}

/**
 * Controlador para crear e insertar una nueva materia asociada al usuario.
 * @param {Object} request - Objeto de solicitud con el cuerpo (payload) de la materia.
 * @param {Object} response - Objeto de respuesta con estado 201 Created.
 * @param {Function} next - Middleware de error.
 */
export async function createMateria(request, response, next) {
  try {
    const payload = validateCreateMateria(request.body);
    const materia = await materiasService.createMateria(request.user.id, payload);
    return sendSuccess(response, materia, 201);
  } catch (error) {
    return next(error);
  }
}

/**
 * Controlador para reemplazar completamente una materia mediante método PUT.
 * @param {Object} request - Petición Express con ID en los parámetros y body completo.
 * @param {Object} response - Objeto de respuesta.
 * @param {Function} next - Middleware de error.
 */
export async function replaceMateria(request, response, next) {
  try {
    const id = validateMateriaId(request.params.id);
    const payload = validateCreateMateria(request.body);
    const materia = await materiasService.replaceMateria(id, request.user.id, payload);
    return sendSuccess(response, materia);
  } catch (error) {
    return next(error);
  }
}

/**
 * Controlador para actualizar parcialmente los atributos de una materia vía PATCH.
 * @param {Object} request - Petición con ID y objeto con modificaciones parciales.
 * @param {Object} response - Objeto de respuesta Express.
 * @param {Function} next - Middleware de error.
 */
export async function updateMateria(request, response, next) {
  try {
    const id = validateMateriaId(request.params.id);
    const payload = validatePatchMateria(request.body);
    const materia = await materiasService.updateMateria(id, request.user.id, payload);
    return sendSuccess(response, materia);
  } catch (error) {
    return next(error);
  }
}

/**
 * Controlador para eliminar una materia perteneciente al usuario logueado.
 * @param {Object} request - Petición Express con ID de materia en params.
 * @param {Object} response - Objeto de respuesta enviando estado 204 No Content.
 * @param {Function} next - Middleware de error.
 */
export async function deleteMateria(request, response, next) {
  try {
    const id = validateMateriaId(request.params.id);
    await materiasService.removeMateria(id, request.user.id);
    return sendNoContent(response);
  } catch (error) {
    return next(error);
  }
}

/**
 * Controlador para obtener el listado de tareas asignadas a una materia en específico.
 * @param {Object} request - Petición Express con el ID de la materia en req.params.id.
 * @param {Object} response - Respuesta con la lista de tareas.
 * @param {Function} next - Middleware de manejo de errores.
 */
export async function getTareasByMateria(request, response, next) {
  try {
    const id = validateMateriaId(request.params.id);
    const tareas = await materiasService.getTareasByMateriaId(id, request.user.id);
    return sendSuccess(response, tareas);
  } catch (error) {
    return next(error);
  }
}