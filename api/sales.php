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
                $itemPrice = $item['price'] ?? ($item['unitPrice'] ?? 0);
                $itemQty = intval($item['quantity']);
                $itemSql = "INSERT INTO sale_items (sale_id, product_id, product_name, quantity, price) 
                            VALUES (?, ?, ?, ?, ?)";
                $itemStmt = $pdo->prepare($itemSql);
                $itemStmt->execute([
                    $data['id'], 
                    $item['productId'], 
                    $item['productName'], 
                    $itemQty, 
                    $itemPrice
                ]);

                // Decrease stock and get product info for alert check (match by id, fallback to name)
                $updateSql = "UPDATE products SET quantity = GREATEST(0, quantity - ?) WHERE id = ?";
                $updateStmt = $pdo->prepare($updateSql);
                $updateStmt->execute([$itemQty, $item['productId']]);
                if ($updateStmt->rowCount() === 0 && !empty($item['productName'])) {
                    $fallbackStmt = $pdo->prepare("UPDATE products SET quantity = GREATEST(0, quantity - ?) WHERE name = ?");
                    $fallbackStmt->execute([$itemQty, $item['productName']]);
                }

                // Check for low stock alert
                $prodStmt = $pdo->prepare("SELECT id, name, quantity, reorder_level FROM products WHERE id = ? OR name = ? LIMIT 1");
                $prodStmt->execute([$item['productId'], $item['productName'] ?? '']);
                $product = $prodStmt->fetch();

                if ($product && $product['quantity'] <= $product['reorder_level']) {
                    // Check if alert already exists to avoid duplicates
                    $alertCheck = $pdo->prepare("SELECT id FROM alerts WHERE product_id = ? AND type = 'low-stock'");
                    $alertCheck->execute([$product['id']]);
                    if (!$alertCheck->fetch()) {
                        $alertId = 'ALT-' . bin2hex(random_bytes(4));
                        $alertMsg = "Low stock alert: " . $product['name'] . " has only " . $product['quantity'] . " units left.";
                        $alertStmt = $pdo->prepare("INSERT INTO alerts (id, product_id, type, message) VALUES (?, ?, 'low-stock', ?)");
                        $alertStmt->execute([$alertId, $product['id'], $alertMsg]);
                    }
                }
            }

            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Sale completed', 'id' => $data['id']]);
        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'ID required']);
            break;
        }
        $pdo->beginTransaction();
        try {
            // Get current sale status
            $stmt = $pdo->prepare("SELECT * FROM sales WHERE id = ?");
            $stmt->execute([$id]);
            $sale = $stmt->fetch();
            
            if (!$sale) {
                throw new Exception('Sale not found');
            }
            
            if ($sale['status'] === 'cancelled') {
                throw new Exception('Sale is already cancelled');
            }
            
            // Mark sale as cancelled
            $updateSale = $pdo->prepare("UPDATE sales SET status = 'cancelled' WHERE id = ?");
            $updateSale->execute([$id]);
            
            // Get sale items to restore product stock
            $itemStmt = $pdo->prepare("SELECT product_id, product_name, quantity, price FROM sale_items WHERE sale_id = ?");
            $itemStmt->execute([$id]);
            $items = $itemStmt->fetchAll();
            
            $restoredItems = [];
            foreach ($items as $item) {
                $qtyToRestore = intval($item['quantity']);
                $prodId = $item['product_id'];
                $prodName = $item['product_name'] ?? '';

                // Fetch current product stock before restoring
                $prodStmt = $pdo->prepare("SELECT id, name, quantity, reorder_level FROM products WHERE id = ? OR name = ? LIMIT 1");
                $prodStmt->execute([$prodId, $prodName]);
                $productBefore = $prodStmt->fetch();
                $prevQty = $productBefore ? intval($productBefore['quantity']) : 0;
                $targetProdId = $productBefore ? $productBefore['id'] : $prodId;

                // Restore stock in products table
                $restoreStock = $pdo->prepare("UPDATE products SET quantity = quantity + ? WHERE id = ?");
                $restoreStock->execute([$qtyToRestore, $targetProdId]);
                if ($restoreStock->rowCount() === 0 && !empty($prodName)) {
                    $fallbackRestore = $pdo->prepare("UPDATE products SET quantity = quantity + ? WHERE name = ?");
                    $fallbackRestore->execute([$qtyToRestore, $prodName]);
                }
                
                // Fetch updated product to verify new stock and clear resolved low-stock alert
                $prodAfterStmt = $pdo->prepare("SELECT id, name, quantity, reorder_level FROM products WHERE id = ? OR name = ? LIMIT 1");
                $prodAfterStmt->execute([$targetProdId, $prodName]);
                $productAfter = $prodAfterStmt->fetch();
                
                if ($productAfter && intval($productAfter['quantity']) > intval($productAfter['reorder_level'])) {
                    $pdo->prepare("DELETE FROM alerts WHERE product_id = ? AND type = 'low-stock'")->execute([$productAfter['id']]);
                }

                $restoredItems[] = [
                    'productId' => $targetProdId,
                    'productName' => $productAfter['name'] ?? $prodName,
                    'quantityRestored' => $qtyToRestore,
                    'previousStock' => $prevQty,
                    'newStock' => $productAfter ? intval($productAfter['quantity']) : ($prevQty + $qtyToRestore)
                ];
            }
            
            $pdo->commit();
            echo json_encode([
                'success' => true,
                'message' => 'Sale cancelled and stock restored successfully',
                'restoredItems' => $restoredItems
            ]);
        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;
}
?>
