<?php
require_once 'db.php';
handleCors();

try {
    // 1. Fix Suppliers table columns
    $sqlSuppliers = "ALTER TABLE suppliers 
            ADD COLUMN IF NOT EXISTS address TEXT,
            ADD COLUMN IF NOT EXISTS city VARCHAR(100),
            ADD COLUMN IF NOT EXISTS state VARCHAR(100),
            ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20),
            ADD COLUMN IF NOT EXISTS country VARCHAR(100),
            ADD COLUMN IF NOT EXISTS payment_terms ENUM('COD', 'Net30', 'Net60', 'Net90') DEFAULT 'Net30',
            ADD COLUMN IF NOT EXISTS rating DECIMAL(3, 2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS average_delivery_time INT DEFAULT 0,
            MODIFY COLUMN status ENUM('active', 'inactive', 'blocked') DEFAULT 'active'";
    
    $pdo->exec($sqlSuppliers);

    // Drop total_orders and total_spent if they exist
    try {
        $pdo->exec("ALTER TABLE suppliers DROP COLUMN total_orders;");
    } catch (Exception $e) {}
    try {
        $pdo->exec("ALTER TABLE suppliers DROP COLUMN total_spent;");
    } catch (Exception $e) {}

    // 2. Fix Sales table columns
    $sqlSales = "ALTER TABLE sales 
            ADD COLUMN IF NOT EXISTS tax DECIMAL(15, 2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(15, 2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS change_amount DECIMAL(15, 2) DEFAULT 0";
    
    $pdo->exec($sqlSales);

    // 3. Fix Sale Items table columns
    $sqlSaleItems = "ALTER TABLE sale_items 
            ADD COLUMN IF NOT EXISTS unit_price DECIMAL(15, 2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS discount DECIMAL(5, 2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS total DECIMAL(15, 2) DEFAULT 0";
            
    $pdo->exec($sqlSaleItems);

    // 4. Create Audit Logs table if not exists
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

    echo json_encode(['success' => true, 'message' => 'Database schema updated successfully!']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
