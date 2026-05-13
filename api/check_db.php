<?php
require_once 'db.php';
handleCors();

try {
    $stmt = $pdo->query("DESCRIBE suppliers");
    $columns = $stmt->fetchAll();
    echo json_encode(['columns' => array_column($columns, 'Field')]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
