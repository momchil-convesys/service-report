-- Seed clean CMS setup data used by /api/plants.
-- This creates one client, three plants, and five inverter devices per plant.

INSERT INTO cms_clients (id, name, address)
VALUES
  ('client-1', 'Client 1', 'Service address')
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  deleted_at = NULL,
  updated_at = now();

INSERT INTO cms_plants (id, name, type, country, installed_power_mwp)
VALUES
  ('plant-1', 'Plant 1', 'solar', 'BG', '1.2'),
  ('plant-2', 'Plant 2', 'battery', 'BG', NULL),
  ('plant-3', 'Plant 3', 'wind', 'BG', '2.4')
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  country = EXCLUDED.country,
  installed_power_mwp = EXCLUDED.installed_power_mwp,
  deleted_at = NULL,
  updated_at = now();

INSERT INTO cms_plant_clients (plant_id, client_id)
VALUES
  ('plant-1', 'client-1'),
  ('plant-2', 'client-1'),
  ('plant-3', 'client-1')
ON CONFLICT DO NOTHING;

INSERT INTO cms_devices (id, plant_id, name, type, serial_number, installed_power_kw)
VALUES
  ('plant-1-inverter-1', 'plant-1', 'Inverter 1', 'inverter', 'P1-INV-001', '250'),
  ('plant-1-inverter-2', 'plant-1', 'Inverter 2', 'inverter', 'P1-INV-002', '250'),
  ('plant-1-inverter-3', 'plant-1', 'Inverter 3', 'inverter', 'P1-INV-003', '250'),
  ('plant-1-inverter-4', 'plant-1', 'Inverter 4', 'inverter', 'P1-INV-004', '250'),
  ('plant-1-inverter-5', 'plant-1', 'Inverter 5', 'inverter', 'P1-INV-005', '250'),
  ('plant-2-inverter-1', 'plant-2', 'Inverter 1', 'inverter', 'P2-INV-001', '250'),
  ('plant-2-inverter-2', 'plant-2', 'Inverter 2', 'inverter', 'P2-INV-002', '250'),
  ('plant-2-inverter-3', 'plant-2', 'Inverter 3', 'inverter', 'P2-INV-003', '250'),
  ('plant-2-inverter-4', 'plant-2', 'Inverter 4', 'inverter', 'P2-INV-004', '250'),
  ('plant-2-inverter-5', 'plant-2', 'Inverter 5', 'inverter', 'P2-INV-005', '250'),
  ('plant-3-inverter-1', 'plant-3', 'Inverter 1', 'inverter', 'P3-INV-001', '250'),
  ('plant-3-inverter-2', 'plant-3', 'Inverter 2', 'inverter', 'P3-INV-002', '250'),
  ('plant-3-inverter-3', 'plant-3', 'Inverter 3', 'inverter', 'P3-INV-003', '250'),
  ('plant-3-inverter-4', 'plant-3', 'Inverter 4', 'inverter', 'P3-INV-004', '250'),
  ('plant-3-inverter-5', 'plant-3', 'Inverter 5', 'inverter', 'P3-INV-005', '250')
ON CONFLICT (id) DO UPDATE
SET
  plant_id = EXCLUDED.plant_id,
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  serial_number = EXCLUDED.serial_number,
  installed_power_kw = EXCLUDED.installed_power_kw,
  deleted_at = NULL,
  updated_at = now();
