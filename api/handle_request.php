<?php
session_start();
include 'db_connection.php';
// ... (cabeçalhos CORS) ...
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$requestId = $data['requestId'] ?? null;
$action = $data['action'] ?? ''; // 'approve' ou 'deny'

if (!isset($_SESSION['user_id']) || !$requestId || !in_array($action, ['approve', 'deny'])) {
    exit(json_encode(['success' => false, 'message' => 'Dados inválidos ou acesso não autorizado.']));
}

$newStatus = ($action === 'approve') ? 'approved' : 'denied';

$stmt = $conn->prepare("UPDATE pending_requests SET status = ? WHERE id = ?");
$success = $stmt->execute([$newStatus, $requestId]);

if ($success && $stmt->rowCount() > 0) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Falha ao processar a solicitação.']);
}
?>