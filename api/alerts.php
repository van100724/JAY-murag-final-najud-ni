<?php
require_once 'db.php';
handleCors();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query('SELECT * FROM alerts ORDER BY created_at DESC');
        echo json_encode($stmt->fetchAll());
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if ($id === 'all') {
            $pdo->exec('DELETE FROM alerts');
            echo json_encode(['message' => 'All alerts cleared']);
        } elseif ($id) {
            $stmt = $pdo->prepare('DELETE FROM alerts WHERE id = ?');
            $stmt->execute([$id]);
            echo json_encode(['message' => 'Alert deleted']);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'ID required']);
        }
        break;
}
?>
