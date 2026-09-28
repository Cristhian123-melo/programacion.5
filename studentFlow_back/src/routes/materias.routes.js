import { Router } from "express";

import {
  listMaterias,
  getMateriaById,
  createMateria,
  replaceMateria,
  updateMateria,
  deleteMateria,
  getTareasByMateria
} from "../controllers/materias.controller.js";

const router = Router();

/**
 * Rutas para el recurso de Materias
 * Base path: /api/v1/materias
 */

// Obtener todas las materias (admite paginación y filtros)
router.get("/", listMaterias);

// Obtener una materia específica por ID
router.get("/:id", getMateriaById);

// Obtener las tareas vinculadas a una materia específica
router.get("/:id/tareas", getTareasByMateria);

// Crear una nueva materia
router.post("/", createMateria);

// Reemplazar completamente una materia existente
router.put("/:id", replaceMateria);

// Actualizar parcialmente una materia
router.patch("/:id", updateMateria);

// Eliminar una materia
router.delete("/:id", deleteMateria);

export default router;