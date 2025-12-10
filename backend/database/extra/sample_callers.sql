-- Add Sample Users/Callers to the Database
-- These users can be selected as "Caller" when creating tickets

USE customer_ticketing_db;

-- Add sample customers (callers)
INSERT INTO users (name, email, password, role) VALUES
('John Doe', 'john.doe@example.com', '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'customer'),
('Jane Smith', 'jane.smith@example.com', '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'customer'),
('Bob Johnson', 'bob.johnson@example.com', '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'customer'),
('Alice Williams', 'alice.williams@example.com', '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'customer'),
('Charlie Brown', 'charlie.brown@example.com', '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'customer'),
('Diana Prince', 'diana.prince@example.com', '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'customer'),
('Edward Norton', 'edward.norton@example.com', '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'customer'),
('Fiona Apple', 'fiona.apple@example.com', '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'customer')
ON DUPLICATE KEY UPDATE name=name;

-- Add sample employees (can also be callers)
INSERT INTO users (name, email, password, role) VALUES
('Support Agent 1', 'agent1@example.com', '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'employee'),
('Support Agent 2', 'agent2@example.com', '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'employee')
ON DUPLICATE KEY UPDATE name=name;

-- Note: The password hash above is a placeholder
-- In production, use bcrypt to hash actual passwords
-- Example: password "password123" should be hashed using bcrypt

-- To verify users were added:
SELECT id, name, email, role FROM users ORDER BY role, name;

    