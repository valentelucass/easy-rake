<?php
session_start();
include 'db_connection.php';
// ... (cabeçalhos CORS) ...
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    exit(json_encode(['success' => false, 'message' => 'Acesso não autorizado.']));
}
// A forma correta, agora implementada:
$userUnitCode = $_SESSION['unit_code'];

$stmt = $conn->prepare("SELECT id, sanger_name, created_at FROM pending_requests WHERE unit_code = ? AND status = 'pending' ORDER BY created_at ASC");
$stmt->execute([$userUnitCode]);
$requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['success' => true, 'requests' => $requests]);
?>