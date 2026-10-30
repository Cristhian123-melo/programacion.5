import * as repo from "../repositories/recordatorios.repository.js";

export async function getRecordatorios() {
  return await repo.findAllRecordatorios();
}

export async function getRecordatorioById(id) {
  const recordatorio = await repo.findRecordatorioById(id);
  if (!recordatorio) throw new Error("Recordatorio no encontrado");
  return recordatorio;
}

export async function createRecordatorio(data) {
  return await repo.createRecordatorioData(data);
}

export async function updateRecordatorio(id, data) {
  return await repo.updateRecordatorioData(id, data);
}

export async function deleteRecordatorio(id) {
  return await repo.deleteRecordatorioData(id);
}