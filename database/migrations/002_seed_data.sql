-- Insert sample service reports
INSERT INTO reports (id, title, description, service_name, status, priority, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Network Connectivity Issue', 'Server having intermittent network connectivity issues', 'Network Infrastructure', 'pending', 'high', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Database Performance Slow', 'Database queries taking longer than usual', 'Database Services', 'in-progress', 'critical', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'SSL Certificate Renewal', 'SSL certificate needs renewal for web server', 'Security', 'completed', 'medium', NOW(), NOW());

-- Insert sample users
INSERT INTO users (id, username, email, password_hash, first_name, last_name, created_at, updated_at) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'admin', 'admin@example.com', '$2a$10$...', 'Admin', 'User', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440002', 'technician1', 'tech1@example.com', '$2a$10$...', 'John', 'Technician', NOW(), NOW());
