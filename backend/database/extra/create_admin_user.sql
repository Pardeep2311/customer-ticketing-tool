-- Create Admin User Script
-- Run this in MySQL to create an admin user

USE customer_ticketing_db;

-- IMPORTANT: The password hash below is for password 'admin123'
-- To generate a hash for a different password, use the createAdmin.js script:
-- node scripts/createAdmin.js "Admin Name" "admin@example.com" "your_password"

-- Create admin user with password 'admin123'
-- If user already exists, this will fail - delete the existing user first or use a different email
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@cantik.com', '$2b$10$MbR8OA4mAno65moPZDF71.YlFRIfHrDlpY5PXZIpRhSgEoPSAXbOe', 'admin');

-- To verify the admin user was created:
SELECT id, name, email, role FROM users WHERE role = 'admin';

-- Login credentials:
-- Email: admin@cantik.com
-- Password: admin123

