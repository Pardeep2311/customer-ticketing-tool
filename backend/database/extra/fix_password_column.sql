-- Fix password column in users table
-- Run this SQL script to ensure password column exists and is properly configured

USE customer_ticketing_db;

-- Check current structure
DESCRIBE users;

-- If password column doesn't exist, add it:
-- ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL AFTER email;

-- If password column exists but is nullable, make it NOT NULL:
ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NOT NULL;

-- Verify the change
DESCRIBE users;

