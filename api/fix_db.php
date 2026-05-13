<?php
require_once 'db.php';
handleCors();

try {
    $sql = "ALTER TABLE suppliers 
            ADD COLUMN IF NOT EXISTS address TEXT,
            ADD COLUMN IF NOT EXISTS city VARCHAR(100),
            ADD COLUMN IF NOT EXISTS state VARCHAR(100),
            ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20),
            ADD COLUMN IF NOT EXISTS country VARCHAR(100),
            ADD COLUMN IF NOT EXISTS payment_terms ENUM('COD', 'Net30', 'Net60', 'Net90') DEFAULT 'Net30',
            ADD COLUMN IF NOT EXISTS rating DECIMAL(3, 2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS total_orders INT DEFAULT 0,
            ADD COLUMN IF NOT EXISTS total_spent DECIMAL(15, 2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS average_delivery_time INT DEFAULT 0,
            MODIFY COLUMN status ENUM('active', 'inactive', 'blocked') DEFAULT 'active'";
    
    $pdo->exec($sql);
    echo json_encode(['success' => true, 'message' => 'Database schema updated successfully!']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
