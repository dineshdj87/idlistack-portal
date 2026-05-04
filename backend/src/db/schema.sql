-- =============================================================
-- Idlistack Portal — PostgreSQL Schema
-- Run: psql -U postgres -d idlistack -f schema.sql
-- =============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------
-- ORGANISATIONS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organisations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  type        VARCHAR(100),
  size        VARCHAR(50),
  website     VARCHAR(255),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- USERS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID REFERENCES organisations(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  role        VARCHAR(50) DEFAULT 'admin',   -- admin | member | viewer
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- DEPLOYMENTS (app instances)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS deployments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id        UUID REFERENCES organisations(id) ON DELETE CASCADE,
  tool          VARCHAR(50) NOT NULL,        -- wordpress | ghost | mattermost | listmonk
  name          VARCHAR(255) NOT NULL,
  subdomain     VARCHAR(255) NOT NULL UNIQUE,
  container_id  VARCHAR(255),               -- Docker container ID
  status        VARCHAR(50) DEFAULT 'pending', -- pending | running | stopped | error
  cpu_percent   DECIMAL(5,2) DEFAULT 0,
  ram_percent   DECIMAL(5,2) DEFAULT 0,
  deployed_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- ALERTS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alerts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id        UUID REFERENCES organisations(id) ON DELETE CASCADE,
  deployment_id UUID REFERENCES deployments(id) ON DELETE CASCADE,
  type          VARCHAR(50) NOT NULL,        -- down | high_cpu | high_ram | recovered
  message       TEXT NOT NULL,
  sent_at       TIMESTAMPTZ DEFAULT NOW(),
  resolved      BOOLEAN DEFAULT false
);

-- -------------------------------------------------------------
-- INDEXES
-- -------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_deployments_org ON deployments(org_id);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);
CREATE INDEX IF NOT EXISTS idx_alerts_org ON alerts(org_id);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- -------------------------------------------------------------
-- SEED: Demo organisation for development
-- -------------------------------------------------------------
INSERT INTO organisations (id, name, slug, type, size, website)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Pratham Foundation',
  'pratham',
  'NGO / Nonprofit',
  '21–100 people',
  'https://pratham.org'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO users (org_id, name, email, role)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Demo Admin',
  'admin@pratham.org',
  'admin'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO deployments (org_id, tool, name, subdomain, status, cpu_percent, ram_percent)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'wordpress', 'Main Website', 'pratham.idlistack.com', 'running', 12.5, 38.2),
  ('a0000000-0000-0000-0000-000000000001', 'listmonk', 'Newsletter', 'mail.pratham.idlistack.com', 'running', 4.8, 22.1),
  ('a0000000-0000-0000-0000-000000000001', 'mattermost', 'Team Chat', 'chat.pratham.idlistack.com', 'stopped', 0, 0)
ON CONFLICT (subdomain) DO NOTHING;
