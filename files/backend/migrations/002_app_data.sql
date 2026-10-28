-- Corre esto UNA vez sobre tu base de datos YA existente (no borra nada,
-- solo agrega la tabla nueva). Ejemplo:
--   psql "postgresql://TU_USUARIO:TU_PASSWORD@localhost:5432/libro_mayor" -f migrations/002_app_data.sql

CREATE TABLE IF NOT EXISTS app_data (
  tenant_id INTEGER PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  actualizado_en TIMESTAMP NOT NULL DEFAULT NOW()
);
