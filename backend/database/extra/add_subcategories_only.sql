-- Add Subcategories Support Only (Assignment Groups Removed)
-- Run this after the main schema.sql

USE customer_ticketing_db;

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

-- Add subcategory_id to tickets table (if it doesn't exist)
SET @dbname = DATABASE();
SET @tablename = 'tickets';
SET @columnname = 'subcategory_id';

-- Check if column exists before adding
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

