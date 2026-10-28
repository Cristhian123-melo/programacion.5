// Respaldo automático: todos los días guarda una copia de app_data de
// TODOS los tenants, en TU servidor Y (si está configurado) en la nube.
//
// Política de conservación pensada para datos financieros/créditos, que
// necesitas poder mirar meses o años atrás, no solo el último mes:
//   - Los últimos 90 días: se guarda CADA copia diaria, sin borrar nada.
//   - Más viejo que 90 días: se conserva SOLO una copia por mes (la
//     primera de cada mes), para siempre — así el historial nunca
//     desaparece, pero tampoco se acumulan 365 archivos casi idénticos
//     por año llenando el disco.
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const pool = require("../db");

const CARPETA_BACKUPS = path.join(__dirname, "..", "..", "backups");
const DIAS_DETALLE_DIARIO = 90;

async function hacerBackup() {
  try {
    if (!fs.existsSync(CARPETA_BACKUPS)) fs.mkdirSync(CARPETA_BACKUPS);

    const { rows: tenants } = await pool.query(
      `SELECT t.id, t.nombre_negocio, t.email_contacto, a.data
       FROM tenants t LEFT JOIN app_data a ON a.tenant_id = t.id`
    );

    const fecha = new Date().toISOString().slice(0, 10);
    const nombreArchivo = `backup-${fecha}.json`;
    const rutaArchivo = path.join(CARPETA_BACKUPS, nombreArchivo);
    const contenido = JSON.stringify(tenants, null, 2);
    fs.writeFileSync(rutaArchivo, contenido);
    console.log(`[backup] Copia local guardada: ${nombreArchivo} (${tenants.length} tenants)`);

    limpiarConHistorialLargo();
    await subirANube(nombreArchivo, contenido);
  } catch (err) {
    console.error("[backup] Falló el respaldo automático:", err.message);
  }
}

// Adelgaza el historial VIEJO (no lo borra todo) — conserva todo lo
// reciente, y de lo viejo deja una copia representativa por mes.
function limpiarConHistorialLargo() {
  const archivos = fs.readdirSync(CARPETA_BACKUPS)
    .filter((f) => /^backup-\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort();

  const limiteReciente = Date.now() - DIAS_DETALLE_DIARIO * 24 * 60 * 60 * 1000;
  const mesesYaConservados = new Set();

  // Recorremos de más nuevo a más viejo para decidir cuál es "la primera
  // copia de ese mes" (la más reciente de cada mes) que sí se queda.
  for (let i = archivos.length - 1; i >= 0; i--) {
    const archivo = archivos[i];
    const ruta = path.join(CARPETA_BACKUPS, archivo);
    const fechaArchivo = archivo.slice(7, 17); // "2026-07-15"
    const mesArchivo = fechaArchivo.slice(0, 7); // "2026-07"
    const esReciente = fs.statSync(ruta).mtimeMs >= limiteReciente;

    if (esReciente) continue; // dentro de los últimos 90 días: nunca se toca

    if (!mesesYaConservados.has(mesArchivo)) {
      // Primera copia de ese mes que encontramos (yendo de atrás hacia
      // adelante) → se queda como representante del mes.
      mesesYaConservados.add(mesArchivo);
      continue;
    }

    // Ya hay una copia guardada de este mes y esta es más vieja → se borra.
    fs.unlinkSync(ruta);
  }
}

// Sube la copia del día a almacenamiento en la nube, para que sobreviva
// aunque el servidor completo se pierda. Usa Cloudflare R2 (10GB gratis,
// compatible con S3). Si todavía no configuraste las variables de
// entorno, simplemente no hace nada — no rompe el respaldo local.
async function subirANube(nombreArchivo, contenido) {
  const { R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_ENDPOINT } = process.env;
  if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET || !R2_ENDPOINT) {
    console.log("[backup] Nube no configurada todavía (falta .env) — se quedó solo el respaldo local.");
    return;
  }
  try {
    const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
    const s3 = new S3Client({
      region: "auto",
      endpoint: R2_ENDPOINT,
      credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
    });
    await s3.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: nombreArchivo,
      Body: contenido,
      ContentType: "application/json",
    }));
    console.log(`[backup] Copia subida a la nube: ${nombreArchivo}`);
  } catch (err) {
    console.error("[backup] Falló la subida a la nube (el respaldo local sí quedó bien):", err.message);
  }
}

function iniciarBackupsAutomaticos() {
  // Todos los días a la 1:00 a.m.
  cron.schedule("0 1 * * *", hacerBackup);
  console.log("[backup] Respaldo automático diario programado (1:00 a.m.)");
  // Además, uno apenas prenda el servidor, para no depender de que quede
  // corriendo toda la noche la primera vez.
  hacerBackup();
}

module.exports = { iniciarBackupsAutomaticos, hacerBackup };
