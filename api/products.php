<?php
require_once 'db.php';
handleCors();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query('SELECT * FROM products');
        echo json_encode($stmt->fetchAll());
        break;

    case 'POST':
        $data = getJsonInput();
        $sql = "INSERT INTO products (id, name, sku, category, price, cost_price, quantity, reorder_level, supplier, description, image) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['id'], $data['name'], $data['sku'], $data['category'], 
            $data['price'], $data['cost_price'], $data['quantity'], 
            $data['reorder_level'], $data['supplier'], $data['description'], $data['image']
        ]);

        // Check for low stock alert after creation
        if ($data['quantity'] <= $data['reorder_level']) {
            $alertId = 'ALT-' . bin2hex(random_bytes(4));
            $alertMsg = "Low stock alert: " . $data['name'] . " has only " . $data['quantity'] . " units left.";
            $alertStmt = $pdo->prepare("INSERT INTO alerts (id, product_id, type, message) VALUES (?, ?, 'low-stock', ?)");
            $alertStmt->execute([$alertId, $data['id'], $alertMsg]);
        }

        echo json_encode(['message' => 'Product created']);
        break;

    case 'PUT':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID required']);
            break;
        }
        $data = getJsonInput();
        $fields = [];
        $values = [];
        foreach ($data as $key => $value) {
            if ($key !== 'id') {
                $fields[] = "$key = ?";
                $values[] = $value;
            }
        }
        $values[] = $id;
        $sql = "UPDATE products SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);

        // Check for low stock alert after update
        $prodStmt = $pdo->prepare("SELECT name, quantity, reorder_level FROM products WHERE id = ?");
        $prodStmt->execute([$id]);
        $product = $prodStmt->fetch();

        if ($product && $product['quantity'] <= $product['reorder_level']) {
            $alertCheck = $pdo->prepare("SELECT id FROM alerts WHERE product_id = ? AND type = 'low-stock'");
            $alertCheck->execute([$id]);
            if (!$alertCheck->fetch()) {
                $alertId = 'ALT-' . bin2hex(random_bytes(4));
                $alertMsg = "Low stock alert: " . $product['name'] . " has only " . $product['quantity'] . " units left.";
                $alertStmt = $pdo->prepare("INSERT INTO alerts (id, product_id, type, message) VALUES (?, ?, 'low-stock', ?)");
                $alertStmt->execute([$alertId, $id, $alertMsg]);
            }
        } else {
            // If stock is now healthy, remove the alert
            $pdo->prepare("DELETE FROM alerts WHERE product_id = ? AND type = 'low-stock'")->execute([$id]);
        }

        echo json_encode(['message' => 'Product updated']);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID required']);
            break;
        }
        $stmt = $pdo->prepare('DELETE FROM products WHERE id = ?');
        $stmt->execute([$id]);
        echo json_encode(['message' => 'Product deleted']);
        break;
}
?>
