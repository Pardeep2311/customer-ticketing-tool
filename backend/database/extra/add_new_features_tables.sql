-- Add new tables for Knowledge Base, Service Catalog, and Notifications
-- Run this after your main schema.sql

USE customer_ticketing_db;

-- Knowledge Base Categories
CREATE TABLE IF NOT EXISTS knowledge_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Knowledge Base Articles
CREATE TABLE IF NOT EXISTS knowledge_articles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category_id INT,
    author_id INT NOT NULL,
    views INT DEFAULT 0,
    helpful_count INT DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES knowledge_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_category (category_id),
    INDEX idx_author (author_id),
    INDEX idx_published (is_published),
    FULLTEXT idx_search (title, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Knowledge Base Favorites
CREATE TABLE IF NOT EXISTS knowledge_favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    article_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES knowledge_articles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, article_id),
    INDEX idx_user (user_id),
    INDEX idx_article (article_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Service Catalog Categories
CREATE TABLE IF NOT EXISTS service_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Service Items
CREATE TABLE IF NOT EXISTS service_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INT,
    requires_approval BOOLEAN DEFAULT FALSE,
    estimated_time VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE SET NULL,
    INDEX idx_category (category_id),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Service Requests
CREATE TABLE IF NOT EXISTS service_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    service_item_id INT NOT NULL,
    user_id INT NOT NULL,
    description TEXT,
    status ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled') DEFAULT 'pending',
    approved_by INT NULL,
    approved_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_item_id) REFERENCES service_items(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_service_item (service_item_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50), -- 'ticket_update', 'ticket_resolved', 'message', 'assignment', 'approval', etc.
    is_read BOOLEAN DEFAULT FALSE,
    link VARCHAR(500), -- URL to related resource
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read),
    INDEX idx_type (type),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Default Knowledge Categories
INSERT INTO knowledge_categories (name, description) VALUES
('Account Management', 'Account-related articles and guides'),
('Technical Support', 'Technical troubleshooting articles'),
('Billing', 'Billing and payment information'),
('General', 'General information and FAQs')
ON DUPLICATE KEY UPDATE name=name;

-- Insert Default Service Categories
INSERT INTO service_categories (name, description) VALUES
('Account Management', 'Account-related services'),
('IT Services', 'IT and technical services'),
('Access Management', 'Access and permission services')
ON DUPLICATE KEY UPDATE name=name;

-- Insert Sample Service Items
INSERT INTO service_items (name, description, category_id, requires_approval, estimated_time) VALUES
('Password Reset', 'Request a password reset for your account', 1, FALSE, '15 minutes'),
('Software Installation', 'Request installation of software on your device', 2, TRUE, '2-4 hours'),
('Access Request', 'Request access to specific systems or resources', 3, TRUE, '1-2 business days')
ON DUPLICATE KEY UPDATE name=name;

-- Insert Sample Knowledge Articles
-- Note: This uses a subquery to get the first admin user's ID
-- If you don't have an admin user, create one first or change the author_id
INSERT INTO knowledge_articles (title, content, category_id, author_id, views, helpful_count) 
SELECT 
  'How to Reset Your Password', 
  'Step-by-step guide to reset your password:\n\n1. Go to login page\n2. Click "Forgot Password"\n3. Enter your email\n4. Check your email for reset link\n5. Click link and set new password', 
  1, 
  COALESCE((SELECT id FROM users WHERE role = 'admin' LIMIT 1), 1), 
  150, 
  45
WHERE NOT EXISTS (
  SELECT 1 FROM knowledge_articles WHERE title = 'How to Reset Your Password'
);

INSERT INTO knowledge_articles (title, content, category_id, author_id, views, helpful_count) 
SELECT 
  'Troubleshooting Login Issues', 
  'Common login problems and solutions:\n\n- Forgot password: Use password reset\n- Account locked: Contact support\n- Browser issues: Clear cache and cookies', 
  2, 
  COALESCE((SELECT id FROM users WHERE role = 'admin' LIMIT 1), 1), 
  200, 
  60
WHERE NOT EXISTS (
  SELECT 1 FROM knowledge_articles WHERE title = 'Troubleshooting Login Issues'
);

