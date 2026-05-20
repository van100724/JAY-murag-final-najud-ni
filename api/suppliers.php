<?php
require_once 'db.php';
handleCors();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query('SELECT * FROM suppliers');
        $rows = $stmt->fetchAll();
        $mapped = array_map(function($row) {
            return [
                'id' => $row['id'],
                'name' => $row['name'],
                'contactPerson' => $row['contact_person'],
                'email' => $row['email'],
                'phone' => $row['phone'],
                'address' => $row['address'],
                'city' => $row['city'],
                'state' => $row['state'],
                'zipCode' => $row['zip_code'],
                'country' => $row['country'],
                'paymentTerms' => $row['payment_terms'],
                'category' => $row['category'],
                'status' => $row['status'],
                'rating' => $row['rating'],

                'averageDeliveryTime' => $row['average_delivery_time'],
                'createdAt' => $row['created_at']
            ];
        }, $rows);
        echo json_encode($mapped);
        break;

    case 'POST':
        try {
            $data = getJsonInput();
            if (!$data) {
                throw new Exception('Invalid JSON input');
            }
            $sql = "INSERT INTO suppliers 
                    (id, name, contact_person, email, phone, address, city, state, zip_code, country, payment_terms, category, status, rating, average_delivery_time) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data['id'] ?? null, 
                $data['name'] ?? null, 
                $data['contactPerson'] ?? null, 
                $data['email'] ?? null, 
                $data['phone'] ?? null, 
                $data['address'] ?? null, 
                $data['city'] ?? null, 
                $data['state'] ?? null, 
                $data['zipCode'] ?? null, 
                $data['country'] ?? null, 
                $data['paymentTerms'] ?? 'Net30', 
                $data['category'] ?? null, 
                $data['status'] ?? 'active', 
                $data['rating'] ?? 0,
                $data['averageDeliveryTime'] ?? 1
            ]);
            echo json_encode(['message' => 'Supplier created']);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID required']);
            break;
        }
        $data = getJsonInput();
        
        // Map camelCase to snake_case
        $map = [
            'contactPerson' => 'contact_person',
            'zipCode' => 'zip_code',
            'paymentTerms' => 'payment_terms',
            'averageDeliveryTime' => 'average_delivery_time'
        ];

        $fields = [];
        $values = [];
        foreach ($data as $key => $value) {
            if ($key !== 'id') {
                $dbKey = $map[$key] ?? $key;
                $fields[] = "$dbKey = ?";
                $values[] = $value;
            }
        }
        $values[] = $id;
        $sql = "UPDATE suppliers SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);
        echo json_encode(['message' => 'Supplier updated']);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID required']);
            break;
        }
        $stmt = $pdo->prepare('DELETE FROM suppliers WHERE id = ?');
        $stmt->execute([$id]);
        echo json_encode(['message' => 'Supplier deleted']);
        break;
}
?>
