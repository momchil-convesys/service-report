-- Seed generic CMS plants and inverter devices used by /api/plants.
-- The plant type is intentionally generic; the devices here are inverter records.

INSERT INTO cms_plants (id, name, type, country, installed_power_mwp)
VALUES
  ('mock-plant-1', 'Demo Plant 1', 'solar', 'BG', '1.2'),
  ('demo-plant-2', 'Demo Plant 2', 'battery', 'BG', NULL),
  ('demo-plant-3', 'Demo Plant 3', 'wind', 'BG', '2.4')
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  country = EXCLUDED.country,
  installed_power_mwp = EXCLUDED.installed_power_mwp,
  updated_at = now();

INSERT INTO cms_devices (id, plant_id, name, type, serial_number, installed_power_kw)
VALUES
  ('mock-inverter-1', 'mock-plant-1', 'Inverter 1', 'inverter', 'P1-INV-001', '250'),
  ('mock-inverter-2', 'mock-plant-1', 'Inverter 2', 'inverter', 'P1-INV-002', '250'),
  ('mock-inverter-3', 'mock-plant-1', 'Inverter 3', 'inverter', 'P1-INV-003', '250'),
  ('mock-inverter-4', 'mock-plant-1', 'Inverter 4', 'inverter', 'P1-INV-004', '250'),
  ('mock-inverter-5', 'mock-plant-1', 'Inverter 5', 'inverter', 'P1-INV-005', '250'),
  ('demo-plant-2-inverter-1', 'demo-plant-2', 'Inverter 1', 'inverter', 'P2-INV-001', '250'),
  ('demo-plant-2-inverter-2', 'demo-plant-2', 'Inverter 2', 'inverter', 'P2-INV-002', '250'),
  ('demo-plant-2-inverter-3', 'demo-plant-2', 'Inverter 3', 'inverter', 'P2-INV-003', '250'),
  ('demo-plant-2-inverter-4', 'demo-plant-2', 'Inverter 4', 'inverter', 'P2-INV-004', '250'),
  ('demo-plant-2-inverter-5', 'demo-plant-2', 'Inverter 5', 'inverter', 'P2-INV-005', '250'),
  ('demo-plant-3-inverter-1', 'demo-plant-3', 'Inverter 1', 'inverter', 'P3-INV-001', '250'),
  ('demo-plant-3-inverter-2', 'demo-plant-3', 'Inverter 2', 'inverter', 'P3-INV-002', '250'),
  ('demo-plant-3-inverter-3', 'demo-plant-3', 'Inverter 3', 'inverter', 'P3-INV-003', '250'),
  ('demo-plant-3-inverter-4', 'demo-plant-3', 'Inverter 4', 'inverter', 'P3-INV-004', '250'),
  ('demo-plant-3-inverter-5', 'demo-plant-3', 'Inverter 5', 'inverter', 'P3-INV-005', '250')
ON CONFLICT (id) DO UPDATE
SET
  plant_id = EXCLUDED.plant_id,
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  serial_number = EXCLUDED.serial_number,
  installed_power_kw = EXCLUDED.installed_power_kw,
  updated_at = now();
