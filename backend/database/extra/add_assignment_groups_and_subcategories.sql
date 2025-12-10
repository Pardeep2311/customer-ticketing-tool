-- Add Assignment Groups and Subcategories Support
-- Run this after the main schema.sql

USE customer_ticketing_db;

-- Assignment Groups Table
CREATE TABLE IF NOT EXISTS assignment_groups (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    email VARCHAR(255), -- Group email for notifications
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assignment Group Members (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS assignment_group_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('member', 'lead') DEFAULT 'member', -- Lead can assign tickets
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES assignment_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_member (group_id, user_id),
    INDEX idx_group (group_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Subcategories Table
CREATE TABLE IF NOT EXISTS subcategories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_subcategory (category_id, name),
    INDEX idx_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add assignment_group_id and subcategory_id to tickets table
-- Check if columns exist before adding them (MySQL doesn't support IF NOT EXISTS in ALTER TABLE)

-- Add assignment_group_id column if it doesn't exist
SET @dbname = DATABASE();
SET @tablename = 'tickets';
SET @columnname = 'assignment_group_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1', -- Column exists, do nothing
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT NULL AFTER assigned_to')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add subcategory_id column if it doesn't exist
SET @columnname = 'subcategory_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1', -- Column exists, do nothing
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT NULL AFTER category_id')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add foreign key for assignment_group_id if it doesn't exist
SET @fk_name = 'tickets_ibfk_assignment_group';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (constraint_name = @fk_name)
      AND (constraint_type = 'FOREIGN KEY')
  ) > 0,
  'SELECT 1', -- Foreign key exists, do nothing
  CONCAT('ALTER TABLE ', @tablename, ' ADD CONSTRAINT ', @fk_name, ' FOREIGN KEY (assignment_group_id) REFERENCES assignment_groups(id) ON DELETE SET NULL')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add foreign key for subcategory_id if it doesn't exist
SET @fk_name = 'tickets_ibfk_subcategory';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (constraint_name = @fk_name)
      AND (constraint_type = 'FOREIGN KEY')
  ) > 0,
  'SELECT 1', -- Foreign key exists, do nothing
  CONCAT('ALTER TABLE ', @tablename, ' ADD CONSTRAINT ', @fk_name, ' FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add index for assignment_group_id if it doesn't exist
SET @index_name = 'idx_assignment_group';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = @index_name)
  ) > 0,
  'SELECT 1', -- Index exists, do nothing
  CONCAT('ALTER TABLE ', @tablename, ' ADD INDEX ', @index_name, ' (assignment_group_id)')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add index for subcategory_id if it doesn't exist
SET @index_name = 'idx_subcategory';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = @index_name)
  ) > 0,
  'SELECT 1', -- Index exists, do nothing
  CONCAT('ALTER TABLE ', @tablename, ' ADD INDEX ', @index_name, ' (subcategory_id)')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Insert Sample Assignment Groups
INSERT INTO assignment_groups (name, description, email) VALUES
('IT Support Team', 'General IT support and troubleshooting', 'itsupport@cantik.com'),
('Hardware Team', 'Hardware issues - laptops, desktops, printers', 'hardware@cantik.com'),
('Network Team', 'Network connectivity and infrastructure issues', 'network@cantik.com'),
('Software Team', 'Software installation and application issues', 'software@cantik.com'),
('Help Desk', 'First-line support and ticket triage', 'helpdesk@cantik.com')
ON DUPLICATE KEY UPDATE name=name;

-- Insert Sample Subcategories for Electronic Device Issues
-- For Technical Support
INSERT INTO subcategories (category_id, name, description) 
SELECT id, 'Installation Issues', 'Problems with software or hardware installation' FROM categories WHERE name = 'Technical Support'
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO subcategories (category_id, name, description) 
SELECT id, 'WiFi/Network Connectivity', 'WiFi connection and network connectivity problems' FROM categories WHERE name = 'Technical Support'
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO subcategories (category_id, name, description) 
SELECT id, 'System Issues', 'Operating system errors and system crashes' FROM categories WHERE name = 'Technical Support'
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO subcategories (category_id, name, description) 
SELECT id, 'Hardware Problems', 'Physical device issues - laptop, desktop, printer, etc.' FROM categories WHERE name = 'Technical Support'
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO subcategories (category_id, name, description) 
SELECT id, 'Software Issues', 'Application errors and software problems' FROM categories WHERE name = 'Technical Support'
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO subcategories (category_id, name, description) 
SELECT id, 'Driver Problems', 'Device driver installation and compatibility issues' FROM categories WHERE name = 'Technical Support'
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO subcategories (category_id, name, description) 
SELECT id, 'Performance Issues', 'Slow performance, freezing, lagging problems' FROM categories WHERE name = 'Technical Support'
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO subcategories (category_id, name, description) 
SELECT id, 'Configuration Problems', 'Device settings and configuration issues' FROM categories WHERE name = 'Technical Support'
ON DUPLICATE KEY UPDATE name=name;

-- For Account Issues
INSERT INTO subcategories (category_id, name, description) 
SELECT id, 'Password Reset', 'Password reset requests' FROM categories WHERE name = 'Account Issues'
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO subcategories (category_id, name, description) 
SELECT id, 'Account Locked', 'Account lockout issues' FROM categories WHERE name = 'Account Issues'
ON DUPLICATE KEY UPDATE name=name;

-- For Bug Report
INSERT INTO subcategories (category_id, name, description) 
SELECT id, 'Application Bug', 'Bugs in applications' FROM categories WHERE name = 'Bug Report'
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO subcategories (category_id, name, description) 
SELECT id, 'System Bug', 'System-level bugs' FROM categories WHERE name = 'Bug Report'
ON DUPLICATE KEY UPDATE name=name;

-- For Billing
INSERT INTO subcategories (category_id, name, description) 
SELECT id, 'Payment Issue', 'Payment processing problems' FROM categories WHERE name = 'Billing'
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO subcategories (category_id, name, description) 
SELECT id, 'Invoice Query', 'Questions about invoices' FROM categories WHERE name = 'Billing'
ON DUPLICATE KEY UPDATE name=name;

