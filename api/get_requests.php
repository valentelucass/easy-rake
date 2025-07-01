<?php
session_start();
include 'db_connection.php';
// ... (cabeçalhos CORS) ...
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    exit(json_encode(['success' => false, 'message' => 'Acesso não autorizado.']));
}
$userUnitCode = // ... (Precisamos buscar o código da unidade do usuário logado)
// Para simplificar, vamos assumir a unidade 1001 por enquanto.
// A forma correta seria:
// $stmt = $conn->prepare("SELECT unit_code FROM users WHERE id = ?");
// $stmt->execute([$_SESSION['user_id']]);
// $userUnitCode = $stmt->fetchColumn();
$userUnitCode = '1001';

$stmt = $conn->prepare("SELECT id, sanger_name, created_at FROM pending_requests WHERE unit_code = ? AND status = 'pending' ORDER BY created_at ASC");
$stmt->execute([$userUnitCode]);
$requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['success' => true, 'requests' => $requests]);
?>