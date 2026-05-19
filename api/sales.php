<?php
require_once 'db.php';
handleCors();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query('SELECT * FROM sales ORDER BY created_at DESC');
        $sales = $stmt->fetchAll();
        
        $mappedSales = [];
        foreach ($sales as $sale) {
            $itemStmt = $pdo->prepare('SELECT * FROM sale_items WHERE sale_id = ?');
            $itemStmt->execute([$sale['id']]);
            $rawItems = $itemStmt->fetchAll();
            
            $items = array_map(function($item) {
                return [
                    'productId' => $item['product_id'],
                    'productName' => $item['product_name'],
                    'quantity' => intval($item['quantity']),
                    'unitPrice' => floatval($item['unit_price'] ?? $item['price']),
                    'discount' => floatval($item['discount'] ?? 0),
                    'total' => floatval($item['total'] ?? ($item['price'] * $item['quantity']))
                ];
            }, $rawItems);
            
            // Calculate subtotal for safety
            $subtotal = array_reduce($items, function($carry, $item) {
                return $carry + $item['total'];
            }, 0);
            
            $mappedSales[] = [
                'id' => $sale['id'],
                'items' => $items,
                'subtotal' => floatval($sale['subtotal'] ?? $subtotal),
                'tax' => floatval($sale['tax'] ?? 0),
                'discount' => floatval($sale['discount'] ?? 0),
                'total' => floatval($sale['total']),
                'paymentMethod' => $sale['payment_method'],
                'amountPaid' => floatval($sale['amount_paid'] ?? $sale['total']),
                'change' => floatval($sale['change_amount'] ?? 0),
                'status' => $sale['status'],
                'saleDate' => date('c', strtotime($sale['created_at'])), // Standardized ISO date format for JS compatibility
                'customerName' => $sale['customer_name'] ?? 'Walk-in',
                'cashier' => $sale['cashier'] ?? 'Unknown',
                'notes' => $sale['notes'] ?? ''
            ];
        }
        echo json_encode($mappedSales);
        break;

    case 'POST':
        $data = getJsonInput();
        $pdo->beginTransaction();
        try {
            // Insert sale
            $sql = "INSERT INTO sales (id, customer_name, total, tax, discount, payment_method, amount_paid, change_amount, cashier, notes) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['id'], 
                $data['customer_name'] ?? 'Walk-in', 
                $data['total'], 
                $data['tax'] ?? 0,
                $data['discount'] ?? 0, 
                $data['payment_method'], 
                $data['amount_paid'] ?? $data['total'],
                $data['change_amount'] ?? 0,
                $data['cashier'] ?? 'Unknown', 
                $data['notes'] ?? ''
            ]);

            // Insert items and update stock
            foreach ($data['items'] as $item) {
                $itemSql = "INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price) 
                            VALUES (?, ?, ?, ?, ?)";
                $itemStmt = $pdo->prepare($itemSql);
                $itemStmt->execute([
                    $data['id'], 
                    $item['productId'], 
                    $item['productName'], 
                    $item['quantity'], 
                    $item['price'] ?? $item['unitPrice']
                ]);

                // Decrease stock and get product info for alert check
                $updateSql = "UPDATE products SET quantity = quantity - ? WHERE id = ?";
                $updateStmt = $pdo->prepare($updateSql);
                $updateStmt->execute([$item['quantity'], $item['productId']]);

                // Check for low stock alert
                $prodStmt = $pdo->prepare("SELECT name, quantity, reorder_level FROM products WHERE id = ?");
                $prodStmt->execute([$item['productId']]);
                $product = $prodStmt->fetch();

                if ($product && $product['quantity'] <= $product['reorder_level']) {
                    // Check if alert already exists to avoid duplicates
                    $alertCheck = $pdo->prepare("SELECT id FROM alerts WHERE product_id = ? AND type = 'low-stock'");
                    $alertCheck->execute([$item['productId']]);
                    if (!$alertCheck->fetch()) {
                        $alertId = 'ALT-' . bin2hex(random_bytes(4));
                        $alertMsg = "Low stock alert: " . $product['name'] . " has only " . $product['quantity'] . " units left.";
                        $alertStmt = $pdo->prepare("INSERT INTO alerts (id, product_id, type, message) VALUES (?, ?, 'low-stock', ?)");
                        $alertStmt->execute([$alertId, $item['productId'], $alertMsg]);
                    }
                }
            }

            $pdo->commit();
            echo json_encode(['message' => 'Sale completed', 'id' => $data['id']]);
        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;
}
?>
