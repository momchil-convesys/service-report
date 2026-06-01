-- Seed data for devices
INSERT INTO devices (id, name, type, manufacturer, model, serial_number, status, power_rating, installation_date, location, notes, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Solar Inverter 1', 'inverter', 'Victron Energy', 'MultiPlus 24/3000', 'VIC-MP-001', 'active', 3.0, '2023-01-15', 'Main Plant Building A', 'Primary inverter for solar system', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Lithium Battery Bank 1', 'battery', 'LG Chem', 'RESU10H', 'LG-BAT-001', 'active', NULL, '2023-02-20', 'Main Plant Building A', '48V battery system with 10kWh capacity', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Solar Panel Array 1', 'solar_panel', 'Sunwatts', 'SW400XL', 'SW-PANEL-001', 'active', 10.0, '2023-01-10', 'Roof - Building A', 'Grid of 25 panels (400W each)', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'Charge Controller 1', 'charge_controller', 'Victron Energy', 'SmartSolar MPPT 150/60', 'VIC-CC-001', 'active', 3.6, '2023-01-12', 'Electrical Room A', 'MPPT charge controller for solar array', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'Backup Generator 1', 'generator', 'Caterpillar', 'C4.4 DE', 'CAT-GEN-001', 'inactive', 50.0, '2022-06-01', 'Generator Room B', 'Diesel backup generator', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'Solar Inverter 2', 'inverter', 'ABB', 'REACT2-3.8-TL', 'ABB-INV-002', 'maintenance', 3.8, '2023-03-15', 'Building B Extension', 'Recently in for annual maintenance', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440007', 'Lithium Battery Bank 2', 'battery', 'Tesla', 'Powerwall', 'TSLA-BAT-002', 'active', NULL, '2023-04-10', 'Building B Extension', 'Backup energy storage system', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'Solar Panel Array 2', 'solar_panel', 'Sunwatts', 'SW350XL', 'SW-PANEL-002', 'retired', 7.0, '2021-09-05', 'Archive - Old Location', 'Original system replaced in 2023', NOW(), NOW());

-- Seed data for reports linked to devices
INSERT INTO reports (id, title, description, service_name, status, priority, device_id, assigned_to, notes, created_at, updated_at) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Monthly Inverter Maintenance', 'Routine inspection and testing of solar inverter', 'Maintenance', 'completed', 'medium', '550e8400-e29b-41d4-a716-446655440001', 'John Smith', 'All tests passed', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440002', 'Battery System Check', 'Quarterly health check of lithium battery system', 'Inspection', 'pending', 'high', '550e8400-e29b-41d4-a716-446655440002', 'Jane Doe', 'Scheduled for next week', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440003', 'Charge Controller Repair', 'Repair MPPT charge controller display issue', 'Repair', 'in-progress', 'high', '550e8400-e29b-41d4-a716-446655440004', 'Mike Johnson', 'Waiting for replacement display module', NOW(), NOW());
