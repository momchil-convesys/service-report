-- CMS service-report tables used by /api/service-reports.
-- These are intentionally separate from the generic devices/reports tables.

CREATE TABLE IF NOT EXISTS cms_users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cms_clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cms_plants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  installed_power_mwp TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cms_plant_clients (
  plant_id TEXT NOT NULL REFERENCES cms_plants(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL REFERENCES cms_clients(id) ON DELETE CASCADE,
  PRIMARY KEY (plant_id, client_id)
);

CREATE TABLE IF NOT EXISTS cms_devices (
  id TEXT PRIMARY KEY,
  plant_id TEXT NOT NULL REFERENCES cms_plants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT '',
  serial_number TEXT NOT NULL DEFAULT '',
  installed_power_kw TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cms_service_reports (
  id SERIAL PRIMARY KEY,
  plant_id TEXT NOT NULL REFERENCES cms_plants(id),
  device_id TEXT NOT NULL REFERENCES cms_devices(id),
  user_id INTEGER REFERENCES cms_users(id),
  client_id TEXT REFERENCES cms_clients(id),
  status_report TEXT NOT NULL CHECK (status_report IN ('Done', 'Draft')),
  complaint_number TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  payload JSONB NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE cms_service_reports
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE cms_clients
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE cms_plants
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE cms_devices
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_cms_service_reports_plant ON cms_service_reports(plant_id);
CREATE INDEX IF NOT EXISTS idx_cms_service_reports_device ON cms_service_reports(device_id);
CREATE INDEX IF NOT EXISTS idx_cms_service_reports_status ON cms_service_reports(status_report);

CREATE TABLE IF NOT EXISTS inverter_schemas (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  version TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Active',
  date_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
  files JSONB NOT NULL DEFAULT '[]'::jsonb,
  materials JSONB NOT NULL DEFAULT '[]'::jsonb,
  svg TEXT NOT NULL DEFAULT ''
);
