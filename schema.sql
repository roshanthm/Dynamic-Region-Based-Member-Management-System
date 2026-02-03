
-- Relational Schema for Dynamic Region-Based Member Management System
-- Normalized to 3NF

-- 1. Regions Table (Supports unlimited hierarchical levels)
CREATE TABLE regions (
    region_id VARCHAR(50) PRIMARY KEY,
    region_name VARCHAR(100) NOT NULL,
    region_type ENUM('State', 'District', 'Ward', 'Village', 'Department', 'Custom') NOT NULL,
    parent_region_id VARCHAR(50),
    FOREIGN KEY (parent_region_id) REFERENCES regions(region_id) ON DELETE SET NULL
);

-- 2. Members Table
CREATE TABLE members (
    member_id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    age INT,
    phone VARCHAR(20),
    address TEXT,
    region_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(region_id) ON DELETE CASCADE
);

-- 3. Users Table (RBAC)
CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'STAFF', 'SUPERVISOR') NOT NULL,
    assigned_region_id VARCHAR(50),
    FOREIGN KEY (assigned_region_id) REFERENCES regions(region_id) ON DELETE SET NULL
);

-- 4. Activity Logs Table (Audit Trail)
CREATE TABLE activity_logs (
    log_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    action_performed ENUM('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT') NOT NULL,
    entity VARCHAR(50),
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Sample Analytics Query: Region-wise member count
-- SELECT r.region_name, COUNT(m.member_id) as member_count
-- FROM regions r
-- LEFT JOIN members m ON r.region_id = m.region_id
-- GROUP BY r.region_id, r.region_name;
