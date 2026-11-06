<?php
require_once 'db.php';
handleCors();

$method = $_SERVER['REQUEST_METHOD'];

// Ensure audit_logs table exists
try {
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
} catch (Exception $e) {
    // Table creation fallback handled silently
}

switch ($method) {
    case 'GET':
        try {
            $stmt = $pdo->query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 1000');
            $logs = $stmt->fetchAll();

            $mapped = array_map(function($row) {
                $meta = null;
                if (!empty($row['metadata'])) {
                    $decoded = json_decode($row['metadata'], true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $meta = $decoded;
                    }
                }
                return [
                    'id' => $row['id'],
                    'action' => $row['action'],
                    'category' => $row['category'],
                    'severity' => $row['severity'],
                    'actorName' => $row['actor_name'],
                    'actorRole' => $row['actor_role'],
                    'entityId' => $row['entity_id'] ?? '',
                    'entityName' => $row['entity_name'] ?? '',
                    'description' => $row['description'],
                    'metadata' => $meta,
                    'timestamp' => date('c', strtotime($row['created_at']))
                ];
            }, $logs);

            echo json_encode($mapped);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'POST':
        $data = getJsonInput();
        try {
            $id = $data['id'] ?? ('AUD-' . round(microtime(true) * 1000) . '-' . bin2hex(random_bytes(2)));
            $action = $data['action'] ?? 'SYSTEM_EVENT';
            $category = $data['category'] ?? 'system';
            $severity = $data['severity'] ?? 'info';
            $actorName = $data['actorName'] ?? ($data['actor_name'] ?? 'Admin User');
            $actorRole = $data['actorRole'] ?? ($data['actor_role'] ?? 'admin');
            $entityId = $data['entityId'] ?? ($data['entity_id'] ?? null);
            $entityName = $data['entityName'] ?? ($data['entity_name'] ?? null);
            $description = $data['description'] ?? '';
            $metadata = isset($data['metadata']) ? (is_string($data['metadata']) ? $data['metadata'] : json_encode($data['metadata'])) : null;
            $createdAt = isset($data['timestamp']) ? date('Y-m-d H:i:s', strtotime($data['timestamp'])) : date('Y-m-d H:i:s');

            $sql = "INSERT INTO audit_logs (id, action, category, severity, actor_name, actor_role, entity_id, entity_name, description, metadata, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $id,
                $action,
                $category,
                $severity,
                $actorName,
                $actorRole,
                $entityId,
                $entityName,
                $description,
                $metadata,
                $createdAt
            ]);

            echo json_encode(['success' => true, 'id' => $id]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        try {
            if ($id === 'all') {
                $pdo->exec('DELETE FROM audit_logs');
                echo json_encode(['success' => true, 'message' => 'All audit logs cleared']);
            } elseif ($id) {
                $stmt = $pdo->prepare('DELETE FROM audit_logs WHERE id = ?');
                $stmt->execute([$id]);
                echo json_encode(['success' => true, 'message' => 'Audit log deleted']);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'ID required']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;
}
?>

