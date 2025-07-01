<?php
header("Access-Control-Allow-Origin: *"); // Permite que qualquer origem acesse a API
header("Access-Control-Allow-Methods: POST, GET, OPTIONS"); // Define os métodos permitidos
header("Access-Control-Allow-Headers: Content-Type"); // Define os cabeçalhos permitidos

include 'db_connection.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$sessionId = $data['sessionId'];
$amount = $data['amount'];
$description = $data['description'];
$timestamp = date('Y-m-d H:i:s');

// Registra a transação de despesa
$stmt = $conn->prepare("INSERT INTO transactions (cashier_session_id, type, amount, description, timestamp) VALUES (?, 'despesa', ?, ?, ?)");
$stmt->execute([$sessionId, $amount, $description, $timestamp]);

if ($stmt->rowCount() > 0) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Falha ao registrar gasto.']);
}
?>