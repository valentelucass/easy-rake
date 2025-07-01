<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    exit(json_encode(['success' => false, 'message' => 'Acesso não autorizado.']));
}

include 'db_connection.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$sessionId = $data['sessionId'];
$amount = $data['amount'];
$timestamp = date('Y-m-d H:i:s');

// Registra a transação de rake (não precisa de player_id)
$stmt = $conn->prepare("INSERT INTO transactions (cashier_session_id, type, amount, timestamp) VALUES (?, 'rake', ?, ?)");
$stmt->execute([$sessionId, $amount, $timestamp]);

if ($stmt->rowCount() > 0) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Falha ao registrar rake.']);
}
?>