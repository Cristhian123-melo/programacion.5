-- ============================================================
-- ESQUEMA MULTI-TENANT DE LIBRO-MAYOR (PostgreSQL)
-- Cada prestamista que te compre la app es un "tenant" aislado.
-- Sus datos NUNCA se mezclan con los de otro tenant porque
-- TODAS las tablas de negocio llevan tenant_id, y cada consulta
-- del backend siempre filtra por ese tenant_id (viene del JWT).
-- ============================================================

CREATE TABLE tenants (
  id SERIAL PRIMARY KEY,
  nombre_negocio VARCHAR(255) NOT NULL,
  email_contacto VARCHAR(255) NOT NULL UNIQUE,
  estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo','suspendido','cancelado')),
  plan VARCHAR(50) NOT NULL DEFAULT 'basico',
  fecha_registro TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Un tenant puede tener varios usuarios (ej: el dueño y un cobrador),
-- pero cada usuario tiene su PROPIA contraseña, con su propio hash.
-- Nunca se guarda la contraseña en texto plano, solo el hash de bcrypt.
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'dueño', -- dueño | cobrador
  debe_cambiar_password BOOLEAN NOT NULL DEFAULT false,
  creado_en TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, email) -- el mismo email puede repetirse ENTRE tenants distintos, no dentro del mismo
);

-- Tu propia cuenta de administrador (tú, el dueño de libro-mayor).
-- Totalmente separada de los usuarios de tus clientes.
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE suscripciones (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  monto_mensual INTEGER NOT NULL,
  wompi_payment_source_id VARCHAR(255),
  estado VARCHAR(20) NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa','vencida','cancelada')),
  proximo_cobro DATE NOT NULL,
  intentos_fallidos INTEGER NOT NULL DEFAULT 0
);

-- Ejemplo de tabla de negocio (créditos) YA con tenant_id.
-- Las tablas de las Guías 1 y 2 (cuotas, clientes, etc.) siguen
-- exactamente este mismo patrón: agrégales tenant_id igual que aquí.
CREATE TABLE creditos (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  cliente_nombre VARCHAR(255) NOT NULL,
  valor INTEGER NOT NULL,
  tasa NUMERIC(6,3) NOT NULL,
  plazo_meses INTEGER NOT NULL,
  frecuencia VARCHAR(20) NOT NULL,
  fecha_inicio DATE NOT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_creditos_tenant ON creditos(tenant_id);
CREATE INDEX idx_usuarios_tenant ON usuarios(tenant_id);

-- Guarda, por cada tenant, TODO su estado de negocio (patrimonio, recargo
-- por mora, y la lista completa de créditos con sus cuotas) como un solo
-- bloque JSON. Es el reemplazo directo de lo que antes vivía en el
-- localStorage del navegador — ahora vive en tu servidor, protegido por
-- tenant_id, y sobrevive aunque el cliente cambie de computador.
CREATE TABLE app_data (
  tenant_id INTEGER PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  actualizado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

