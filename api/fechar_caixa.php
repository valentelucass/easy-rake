<?php
// api/fechar_caixa.php (Versão que gera relatório final)
include 'db_connection.php';
// ... (cabeçalhos CORS) ...
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$sessionId = $data['sessionId'];
$finalAmount = $data['finalAmount'];

// --- LÓGICA PARA GERAR E SALVAR O RELATÓRIO FINAL ---
$summaryStmt = $conn->prepare("SELECT * FROM cashier_session_summary WHERE id = ?");
$summaryStmt->execute([$sessionId]);
$summary = $summaryStmt->fetch(PDO::FETCH_ASSOC);

if ($summary) {
    $summary['final_amount'] = $finalAmount; // Adiciona o valor real ao relatório
    $reportDataJson = json_encode($summary);
    $insertStmt = $conn->prepare("INSERT INTO reports (cashier_session_id, generated_at, type, data) VALUES (?, NOW(), 'final', ?)");
    $insertStmt->execute([$sessionId, $reportDataJson]);
}
// --- FIM DA LÓGICA DE RELATÓRIO ---

// Atualiza a sessão para o status 'closed' (lógica existente)
$stmt = $conn->prepare("UPDATE cashier_sessions SET status = 'closed', final_amount = ?, closed_at = NOW() WHERE id = ? AND status = 'open'");
$success = $stmt->execute([$finalAmount, $sessionId]);

if ($success && $stmt->rowCount() > 0) {
    echo json_encode(['success' => true, 'report' => $summary]); // Retorna o relatório final
} else {
    echo json_encode(['success' => false, 'message' => 'Nenhum caixa aberto encontrado ou falha ao fechar.']);
}
?>