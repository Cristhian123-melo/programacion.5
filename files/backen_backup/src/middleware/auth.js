const jwt = require("jsonwebtoken");

// Verifica que la petición traiga un token válido (Authorization: Bearer xxx)
// y coloca en req.user los datos del usuario: { id, tenant_id, rol }.
// Esto es lo que garantiza que un usuario del tenant A jamás pueda,
// ni por error, tocar datos del tenant B: el tenant_id sale del token
// firmado por el servidor, el usuario nunca lo puede inventar o cambiar.
function verificarTokenJWT(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autenticado" });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, tenant_id, rol }
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

// Verifica un JWT de administrador (tú), completamente separado del
// de tus clientes. Un token de cliente jamás sirve aquí, y viceversa.
function verificarTokenAdmin(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autenticado" });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
    if (payload.tipo !== "admin") throw new Error("no es admin");
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Token de administrador inválido" });
  }
}

module.exports = { verificarTokenJWT, verificarTokenAdmin };
