const { Pool } = require("pg");

// Todas las credenciales salen del archivo .env (nunca las escribas
// directo en el código, y nunca subas el .env a GitHub).
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
