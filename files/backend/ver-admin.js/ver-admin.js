require("dotenv").config();
const pool = require("../src/db");

async function main() {
  const { rows } = await pool.query(
    "SELECT id, email FROM admins"
  );

  console.table(rows);
  process.exit(0);
}

main().catch(console.error);