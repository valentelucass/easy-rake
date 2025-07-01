<?php
// api/get_report_details.php
include 'db_connection.php';
// ... (cabeçalhos CORS) ...
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$reportId = $data['reportId'];

if (!$reportId) {
    exit(json_encode(['success' => false, 'message' => 'ID do relatório não fornecido.']));
}

// Busca o relatório pelo ID
$stmt = $conn->prepare("SELECT data FROM reports WHERE id = ?");
$stmt->execute([$reportId]);
$report = $stmt->fetch(PDO::FETCH_ASSOC);

if ($report && !empty($report['data'])) {
    // A coluna 'data' armazena um JSON. Decodificamos e enviamos de volta.
    $reportDetails = json_decode($report['data'], true);
    echo json_encode(['success' => true, 'report' => $reportDetails]);
} else {
    echo json_encode(['success' => false, 'message' => 'Relatório não encontrado ou está vazio.']);
}
?>