-- POS Inventory System Schema
-- Created for XAMPP / MariaDB

CREATE DATABASE IF NOT EXISTS pos_inventory;
USE pos_inventory;

-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2) DEFAULT 0,
    quantity INT DEFAULT 0,
    reorder_level INT DEFAULT 10,
    supplier VARCHAR(255),
    description TEXT,
    image TEXT,
    last_restock_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100),
    payment_terms ENUM('COD', 'Net30', 'Net60', 'Net90') DEFAULT 'Net30',
    category TEXT,
    status ENUM('active', 'inactive', 'blocked') DEFAULT 'active',
    rating DECIMAL(3, 2) DEFAULT 0,
    average_delivery_time INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Sales Table
CREATE TABLE IF NOT EXISTS sales (
    id VARCHAR(50) PRIMARY KEY,
    customer_name VARCHAR(255),
    total DECIMAL(12, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0,
    payment_method ENUM('cash', 'card', 'check', 'online') NOT NULL,
    cashier VARCHAR(100),
    notes TEXT,
    status ENUM('completed', 'pending', 'cancelled') DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Sale Items Table
CREATE TABLE IF NOT EXISTS sale_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id VARCHAR(50),
    product_id VARCHAR(50),
    product_name VARCHAR(255),
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
);

-- 5. Inventory Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50),
    type VARCHAR(50),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial data (optional, but helpful for testing)
INSERT IGNORE INTO products (id, name, sku, category, price, cost_price, quantity, reorder_level, supplier, image)
VALUES 
('1', 'Industrial Claw Hammer 16oz', 'HTL-HAM-001', 'Hand Tools', 450.00, 280.00, 34, 10, 'ABC Hardware Supplies', 'https://images.unsplash.com/photo-1586864387917-f53bc264434a?w=600&h=600&fit=crop'),
('4', 'Brushless Cordless Drill 18V', 'PWR-DRL-004', 'Power Tools', 4850.00, 3200.00, 12, 5, 'PowerTools Depot', 'https://images.unsplash.com/photo-1504148455328-4972fefebfee?w=600&h=600&fit=crop');
