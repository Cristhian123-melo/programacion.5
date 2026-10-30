import * as service from "../services/recordatorios.service.js";

export async function listRecordatorios(req, res) {
  try {
    const data = await service.getRecordatorios();
    res.json({ success: true, data, message: "Recordatorios consultados correctamente." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getRecordatorioById(req, res) {
  try {
    const data = await service.getRecordatorioById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
}

export async function createRecordatorio(req, res) {
  try {
    const data = await service.createRecordatorio(req.body);
    res.status(201).json({ success: true, data, message: "Recordatorio creado exitosamente." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateRecordatorio(req, res) {
  try {
    const data = await service.updateRecordatorio(req.params.id, req.body);
    res.json({ success: true, data, message: "Recordatorio actualizado correctamente." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteRecordatorio(req, res) {
  try {
    await service.deleteRecordatorio(req.params.id);
    res.json({ success: true, message: "Recordatorio eliminado correctamente." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}