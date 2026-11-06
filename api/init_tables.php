<?php
require_once 'db.php';
handleCors();

try {
    // Create sales table
    $pdo->exec("CREATE TABLE IF NOT EXISTS sales (
        id VARCHAR(50) PRIMARY KEY,
        customer_name VARCHAR(255),
        total DECIMAL(15, 2),
        tax DECIMAL(15, 2) DEFAULT 0,
        discount DECIMAL(15, 2) DEFAULT 0,
        payment_method ENUM('cash', 'card', 'check', 'online'),
        amount_paid DECIMAL(15, 2),
        change_amount DECIMAL(15, 2) DEFAULT 0,
        status ENUM('completed', 'pending', 'cancelled') DEFAULT 'completed',
        cashier VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Create sale_items table
    $pdo->exec("CREATE TABLE IF NOT EXISTS sale_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sale_id VARCHAR(50),
        product_id VARCHAR(50),
        product_name VARCHAR(255),
        quantity INT,
        price DECIMAL(15, 2), -- This matches api/sales.php usage
        unit_price DECIMAL(15, 2), -- Adding this for completeness
        discount DECIMAL(5, 2) DEFAULT 0,
        total DECIMAL(15, 2),
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
    )");

    // Create alerts table
    $pdo->exec("CREATE TABLE IF NOT EXISTS alerts (
        id VARCHAR(50) PRIMARY KEY,
        product_id VARCHAR(50),
        type ENUM('low-stock', 'overstock', 'expired') DEFAULT 'low-stock',
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Create audit_logs table
    $pdo->exec("CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(64) PRIMARY KEY,
        action VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL DEFAULT 'system',
        severity VARCHAR(30) NOT NULL DEFAULT 'info',
        actor_name VARCHAR(150) NOT NULL DEFAULT 'System',
        actor_role VARCHAR(50) NOT NULL DEFAULT 'admin',
        entity_id VARCHAR(100) DEFAULT NULL,
        entity_name VARCHAR(255) DEFAULT NULL,
        description TEXT NOT NULL,
        metadata LONGTEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    echo json_encode(['success' => true, 'message' => 'Tables created/verified successfully!']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
