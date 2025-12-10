-- Recreate Assignment Groups Table and Related Structures
-- Run this to recreate assignment groups functionality

USE customer_ticketing_db;

-- Step 1: Create Assignment Groups Table
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

-- Step 2: Create Assignment Group Members Table (Many-to-Many relationship)
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

-- Step 3: Add assignment_group_id column to tickets table (if it doesn't exist)
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

-- Step 4: Add foreign key for assignment_group_id (if it doesn't exist)
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

-- Step 5: Add index for assignment_group_id (if it doesn't exist)
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

-- Step 6: Insert Sample Assignment Groups
INSERT INTO assignment_groups (name, description, email) VALUES
('IT Support Team', 'General IT support and troubleshooting', 'itsupport@cantik.com'),
('Hardware Team', 'Hardware issues - laptops, desktops, printers', 'hardware@cantik.com'),
('Network Team', 'Network connectivity and infrastructure issues', 'network@cantik.com'),
('Software Team', 'Software installation and application issues', 'software@cantik.com'),
('Help Desk', 'First-line support and ticket triage', 'helpdesk@cantik.com')
ON DUPLICATE KEY UPDATE name=name;

-- Verify creation
SELECT 'Assignment Groups table and structure created successfully!' AS status;
SELECT COUNT(*) AS assignment_groups_count FROM assignment_groups;

