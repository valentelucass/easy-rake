<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    exit(json_encode(['success' => false, 'message' => 'Acesso não autorizado.']));
}

include 'db_connection.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$sessionId = $data['sessionId'];
$finalAmount = $data['finalAmount'];
$observacoes = $data['observacoes'] ?? '';

$conn->beginTransaction();

try {
    $summaryStmt = $conn->prepare("SELECT * FROM cashier_session_summary WHERE id = ?");
    $summaryStmt->execute([$sessionId]);
    $summary = $summaryStmt->fetch(PDO::FETCH_ASSOC);

    if (!$summary) {
        throw new Exception('Nenhum caixa aberto encontrado.');
    }

    $reportDetails = [];
    $reportDetails['unidade_info'] = [
        'nome' => $_SESSION['nome'],
        'codigo_acesso' => $_SESSION['codigo_acesso'],
        'operador' => $_SESSION['nome'],
        'data_fechamento' => date('Y-m-d H:i:s')
    ];
    $reportDetails['resumo_financeiro'] = $summary; // CORRIGIDO
    $reportDetails['resumo_financeiro']['final_amount'] = $finalAmount; // CORRIGIDO

    $transStmt = $conn->prepare("SELECT t.type, t.amount, t.description, t.timestamp, p.name as player_name 
                                FROM transactions t 
                                LEFT JOIN players p ON t.player_id = p.id 
                                WHERE t.cashier_session_id = ? ORDER BY t.timestamp ASC");
    $transStmt->execute([$sessionId]);
    $transactions = $transStmt->fetchAll(PDO::FETCH_ASSOC);

    $reportDetails['transactions'] = $transactions;
    $reportDetails['rake_detalhado'] = array_values(array_filter($transactions, fn($t) => $t['type'] === 'rake'));
    $reportDetails['gastos_detalhados'] = array_values(array_filter($transactions, fn($t) => $t['type'] === 'despesa'));

    // ... (O resto do seu código de buscar jogadores, etc., está correto e permanece aqui)
    // ...
    // Esta parte é para garantir que a lógica completa esteja aqui
    $stmt_players_session = $conn->prepare("SELECT p.id, p.name, p.cpf, p.telefone FROM players p JOIN transactions t ON p.id = t.player_id WHERE t.cashier_session_id = ? GROUP BY p.id, p.name, p.cpf, p.telefone");
    $stmt_players_session->execute([$sessionId]);
    $players = $stmt_players_session->fetchAll(PDO::FETCH_ASSOC);
    $players_summary = [];
     foreach ($players as $player) {
        $player_id = $player['id'];
        $stmt_hist = $conn->prepare("SELECT SUM(CASE WHEN type = 'venda' THEN amount ELSE 0 END) as total_comprado, SUM(CASE WHEN type IN ('devolucao', 'pagamento_debito') THEN amount ELSE 0 END) as total_devolvido FROM transactions WHERE cashier_session_id = ? AND player_id = ?");
        $stmt_hist->execute([$sessionId, $player_id]);
        $historico = $stmt_hist->fetch(PDO::FETCH_ASSOC);
        $players_summary[] = [
            'id' => $player_id,
            'name' => $player['name'],
            'total_comprado' => $historico['total_comprado'] ?? 0,
            'total_devolvido' => $historico['total_devolvido'] ?? 0,
            'saldo_atual' => ($historico['total_devolvido'] ?? 0) - ($historico['total_comprado'] ?? 0)
        ];
    }
    $reportDetails['situacao_jogadores'] = $players_summary;

    $reportDataJson = json_encode($reportDetails, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
    $insertStmt = $conn->prepare("INSERT INTO reports (cashier_session_id, generated_at, type, data) VALUES (?, NOW(), 'final', ?)");
    $insertStmt->execute([$sessionId, $reportDataJson]);

    $stmt = $conn->prepare("UPDATE cashier_sessions SET status = 'closed', final_amount = ?, closed_at = NOW() WHERE id = ? AND status = 'open'");
    $stmt->execute([$finalAmount, $sessionId]);

    $conn->commit();
    echo json_encode(['success' => true, 'report' => $reportDetails]);

} catch (Exception $e) {
    $conn->rollBack();
    error_log('Erro ao fechar caixa: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erro interno ao fechar caixa.']);
}
?>