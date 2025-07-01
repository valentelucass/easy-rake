<?php
include 'db_connection.php';
// ... (cabeçalhos CORS) ...
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$sangerName = $data['sangerName'] ?? '';
$unitCode = $data['unitCode'] ?? '';

// Verifica se a unidade existe
$stmt = $conn->prepare("SELECT code FROM units WHERE code = ?");
$stmt->execute([$unitCode]);
if ($stmt->rowCount() == 0) {
    exit(json_encode(['success' => false, 'message' => 'Código de unidade inválido.']));
}

// Insere a solicitação como pendente
$stmt = $conn->prepare("INSERT INTO pending_requests (unit_code, sanger_name) VALUES (?, ?)");
if ($stmt->execute([$unitCode, $sangerName])) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Não foi possível enviar a solicitação.']);
}
?>