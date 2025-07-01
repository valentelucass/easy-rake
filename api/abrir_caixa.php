<?php
session_start();
include 'db_connection.php';
// ... (cabeçalhos CORS) ...
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$unitCode = '1001';
$openedBy = $data['openedBy'];
$initialAmount = $data['initialAmount'];
$openedAt = date('Y-m-d H:i:s');

$stmt = $conn->prepare("INSERT INTO cashier_sessions (unit_code, opened_by, opened_at, initial_amount, status) VALUES (?, ?, ?, ?, 'open')");
$stmt->execute([$unitCode, $openedBy, $openedAt, $initialAmount]);

if ($stmt->rowCount() > 0) {
    $sessionId = $conn->lastInsertId();
    $caixaState = [
        'sessionId' => $sessionId,
        'isCashierOpen' => true,
        'openedAt' => $openedAt,
        'openedBy' => $openedBy,
        'initialAmount' => (float)$initialAmount,
        'chipsSold' => 0.0,
        'chipsReturned' => 0.0,
        'rake' => 0.0,
        'expenses' => []
    ];
    echo json_encode(['success' => true, 'caixaState' => $caixaState]);
} else {
    echo json_encode(['success' => false, 'message' => 'Falha ao abrir o caixa.']);
}
?>