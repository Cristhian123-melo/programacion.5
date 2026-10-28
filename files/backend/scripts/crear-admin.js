// Corre esto UNA sola vez para crear tu propia cuenta de dueño de libro-mayor:
//   node scripts/crear-admin.js tuemail@ejemplo.com tuContraseñaSegura
require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("../src/db");

async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.log("Uso: node scripts/crear-admin.js email password");
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO admins (email, password_hash) VALUES ($1,$2)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [email, hash]
  );
  console.log(`Cuenta de admin lista para ${email}`);
  process.exit(0);
}

main();
