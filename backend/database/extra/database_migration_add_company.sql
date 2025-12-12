-- Migration: Add company field to users table
-- Date: 2024
-- Description: Add company field for customer users

-- Add company column to users table
ALTER TABLE users 
ADD COLUMN company VARCHAR(255) NULL AFTER email;

-- Update existing customers (optional - set default if needed)
-- UPDATE users SET company = 'Not Specified' WHERE role = 'customer' AND company IS NULL;

-- Add index for better query performance (optional)
-- CREATE INDEX idx_users_company ON users(company);

-- Verify the change
-- DESCRIBE users;

