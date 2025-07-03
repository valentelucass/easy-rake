<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    exit(json_encode(['success' => false, 'message' => 'Acesso não autorizado.']));
}

include 'db_connection.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$sessionId = $data['sessionId'];

try {
    $summaryStmt = $conn->prepare("SELECT * FROM cashier_session_summary WHERE id = ?");
    $summaryStmt->execute([$sessionId]);
    $summary = $summaryStmt->fetch(PDO::FETCH_ASSOC);

    if (!$summary) {
        throw new Exception('Sessão de caixa não encontrada.');
    }

    $reportDetails = [];
    $reportDetails['unidade_info'] = [
        'nome' => $_SESSION['nome'],
        'codigo_acesso' => $_SESSION['codigo_acesso'],
        'operador' => $_SESSION['nome'],
        'data_emissao' => date('Y-m-d H:i:s')
    ];
    $reportDetails['resumo_financeiro'] = $summary; // CORRIGIDO: Removido array_values

    $transStmt = $conn->prepare("SELECT t.type, t.amount, t.description, t.timestamp, p.name as player_name
                                FROM transactions t 
                                LEFT JOIN players p ON t.player_id = p.id 
                                WHERE t.cashier_session_id = ? ORDER BY t.timestamp ASC");
    $transStmt->execute([$sessionId]);
    $transactions = $transStmt->fetchAll(PDO::FETCH_ASSOC);
    $reportDetails['transactions'] = $transactions;
    
    // CORREÇÃO: mantido array_values apenas onde é necessário (após array_filter)
    $reportDetails['rake_detalhado'] = array_values(array_filter($transactions, fn($t) => $t['type'] === 'rake'));
    $reportDetails['gastos_detalhados'] = array_values(array_filter($transactions, fn($t) => $t['type'] === 'despesa'));

    // ... (O restante da sua lógica de buscar jogadores e caixinhas continua igual) ...

    echo json_encode(['success' => true, 'report' => $reportDetails]);

} catch (Exception $e) {
    error_log('Erro ao gerar relatório parcial: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erro interno do servidor: ' . $e->getMessage()]);
}
?>