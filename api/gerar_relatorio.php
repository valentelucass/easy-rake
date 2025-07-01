<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    exit(json_encode(['success' => false, 'message' => 'Acesso não autorizado.']));
}
// api/gerar_relatorio.php (Versão que inclui todos os dados)
include 'db_connection.php';
// ... (cabeçalhos) ...
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$sessionId = $data['sessionId'];
// ... (validação do sessionId) ...

// Busca o resumo (existente)
$summaryStmt = $conn->prepare("SELECT * FROM cashier_session_summary WHERE id = ?");
$summaryStmt->execute([$sessionId]);
$summary = $summaryStmt->fetch(PDO::FETCH_ASSOC);

if ($summary) {
    // Busca transações (existente)
    $transStmt = $conn->prepare("SELECT t.type, t.amount, t.description, t.timestamp, p.name as player_name FROM transactions t LEFT JOIN players p ON t.player_id = p.id WHERE t.cashier_session_id = ? ORDER BY t.timestamp DESC");
    $transStmt->execute([$sessionId]);
    $transactions = $transStmt->fetchAll(PDO::FETCH_ASSOC);
    $summary['transactions'] = $transactions;

    // --- NOVA LÓGICA: BUSCAR DADOS DETALHADOS DOS JOGADORES DA SESSÃO ---
    $playersStmt = $conn->prepare(
        "SELECT p.name, p.cpf, p.telefone, b.balance 
         FROM players p
         JOIN player_balances b ON p.id = b.id
         WHERE p.id IN (SELECT DISTINCT player_id FROM transactions WHERE cashier_session_id = ? AND player_id IS NOT NULL)"
    );
    $playersStmt->execute([$sessionId]);
    $players_details = $playersStmt->fetchAll(PDO::FETCH_ASSOC);
    $summary['players_details'] = $players_details;
    // --- FIM DA NOVA LÓGICA ---

    // ... (lógica para salvar o relatório no banco) ...
    
    echo json_encode(['success' => true, 'report' => $summary]);
} // ... (else) ...
?>