import { Router } from "express";
import {
  listRecordatorios,
  getRecordatorioById,
  createRecordatorio,
  updateRecordatorio,
  deleteRecordatorio
} from "../controllers/recordatorios.controller.js";

const router = Router();

router.get("/", listRecordatorios);
router.get("/:id", getRecordatorioById);
router.post("/", createRecordatorio);
router.patch("/:id", updateRecordatorio);
router.delete("/:id", deleteRecordatorio);

export default router;