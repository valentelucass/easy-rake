<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    exit(json_encode(['success' => false, 'message' => 'Acesso não autorizado.']));
}
// api/gerar_relatorio.php (Versão que gera relatório parcial completo)
include 'db_connection.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$sessionId = $data['sessionId'];

try {
    // 1. Busca o resumo da sessão
    $summaryStmt = $conn->prepare("SELECT * FROM cashier_session_summary WHERE id = ?");
    $summaryStmt->execute([$sessionId]);
    $summary = $summaryStmt->fetch(PDO::FETCH_ASSOC);

    if (!$summary) {
        throw new Exception('Sessão de caixa não encontrada.');
    }

    // 2. Coleta de dados DETALHADOS para o relatório (mesma lógica de fechar_caixa.php)
    $reportDetails = [];
    $reportDetails['unidade_info'] = [
        'nome' => $_SESSION['nome'], // Nome da unidade, se disponível na sessão
        'codigo_acesso' => $_SESSION['codigo_acesso'], // Código da unidade
        'operador' => $_SESSION['nome'], // Nome do usuário logado
        'data_emissao' => date('Y-m-d H:i:s')
    ];
    $reportDetails['resumo_financeiro'] = $summary; 
    // Valor final não existe no relatório parcial, mas os outros totais sim
    $totalCashbackCaixinhas = 0;

    // 2.1. Transações Detalhadas
    $transStmt = $conn->prepare("SELECT t.type, t.amount, t.description, t.timestamp, p.name as player_name, p.cpf, p.telefone
                                FROM transactions t 
                                LEFT JOIN players p ON t.player_id = p.id 
                                WHERE t.cashier_session_id = ? ORDER BY t.timestamp ASC");
    $transStmt->execute([$sessionId]);
    $transactions = $transStmt->fetchAll(PDO::FETCH_ASSOC);
    $reportDetails['transactions'] = $transactions;

    // 2.2. Detalhamento de Rake
    $rakeEntries = array_filter($transactions, fn($t) => $t['type'] === 'rake');
    $reportDetails['rake_detalhado'] = $rakeEntries;

    // 2.3. Detalhamento de Despesas
    $expensesEntries = array_filter($transactions, fn($t) => $t['type'] === 'despesa');
    $reportDetails['gastos_detalhados'] = $expensesEntries;

    // 2.4. Situação dos Jogadores e Venda/Devolução de Fichas (consolidado)
    $stmt_players_session = $conn->prepare(
        "SELECT p.id, p.name, p.cpf, p.telefone FROM players p 
         JOIN transactions t ON p.id = t.player_id 
         WHERE t.cashier_session_id = ? 
         GROUP BY p.id, p.name, p.cpf, p.telefone"
    );
    $stmt_players_session->execute([$sessionId]);
    $players = $stmt_players_session->fetchAll(PDO::FETCH_ASSOC);
    $players_summary = [];

    foreach ($players as $player) {
        $player_id = $player['id'];
        $stmt_hist = $conn->prepare(
            "SELECT 
                SUM(CASE WHEN type = 'venda' THEN amount ELSE 0 END) as total_comprado,
                SUM(CASE WHEN type IN ('devolucao', 'pagamento_debito') THEN amount ELSE 0 END) as total_devolvido
             FROM transactions 
             WHERE cashier_session_id = ? AND player_id = ?"
        );
        $stmt_hist->execute([$sessionId, $player_id]);
        $historico = $stmt_hist->fetch(PDO::FETCH_ASSOC);

        $stmt_quit = $conn->prepare(
            "SELECT MAX(timestamp) as last_quit_date FROM transactions 
             WHERE cashier_session_id = ? AND player_id = ? AND type = 'pagamento_debito'"
        );
        $stmt_quit->execute([$sessionId, $player_id]);
        $last_quit = $stmt_quit->fetch(PDO::FETCH_ASSOC);
        $last_quit_date = $last_quit['last_quit_date'];

        $sql_saldo_atual = "SELECT 
                                SUM(CASE WHEN type = 'venda' THEN amount ELSE 0 END) as atual_comprado,
                                SUM(CASE WHEN type IN ('devolucao', 'pagamento_debito') THEN amount ELSE 0 END) as atual_devolvido
                            FROM transactions 
                            WHERE cashier_session_id = ? AND player_id = ?";
        
        $params = [$sessionId, $player_id];
        if ($last_quit_date) {
            $sql_saldo_atual .= " AND timestamp > ?";
            $params[] = $last_quit_date;
        }

        $stmt_saldo_atual = $conn->prepare($sql_saldo_atual);
        $stmt_saldo_atual->execute($params);
        $saldo_data = $stmt_saldo_atual->fetch(PDO::FETCH_ASSOC);
        
        $saldo_atual = ($saldo_data['atual_devolvido'] ?? 0) - ($saldo_data['atual_comprado'] ?? 0);
        $status_jogador = ($saldo_atual < 0) ? 'Débito: ' . abs($saldo_atual) : (($saldo_atual == 0 && !empty($last_quit_date)) ? 'Quitado' : 'Crédito: ' . $saldo_atual);

        $players_summary[] = [
            'id' => $player_id,
            'name' => $player['name'],
            'cpf' => $player['cpf'],
            'telefone' => $player['telefone'],
            'total_comprado' => $historico['total_comprado'] ?? 0,
            'total_devolvido' => $historico['total_devolvido'] ?? 0,
            'saldo_atual' => $saldo_atual,
            'status_jogador' => $status_jogador
        ];
    }
    $reportDetails['situacao_jogadores'] = $players_summary;

    // 2.5. Caixinhas Detalhadas (se o usuário for gestor)
    $caixinhas_detalhes = [];
    if ($_SESSION['perfil'] === 'gestor') {
        $stmt_caixinhas = $conn->prepare("SELECT id, nome_caixinha, valor_atual, participantes, cashback_percent FROM caixinhas WHERE unidade_id = ?");
        $stmt_caixinhas->execute([$_SESSION['unidade_id']]);
        $caixinhas = $stmt_caixinhas->fetchAll(PDO::FETCH_ASSOC);

        foreach ($caixinhas as $caixinha) {
            $valor_bruto = (float)$caixinha['valor_atual'];
            $cashback_percent = (float)$caixinha['cashback_percent'];
            $cashback_retido = $valor_bruto * ($cashback_percent / 100);
            $liquido_distribuido = $valor_bruto - $cashback_retido;
            $totalCashbackCaixinhas += $cashback_retido;

            $caixinhas_detalhes[] = [
                'nome_caixinha' => $caixinha['nome_caixinha'],
                'valor_bruto' => $valor_bruto,
                'cashback_percent' => $cashback_percent,
                'cashback_retido' => $cashback_retido,
                'liquido_distribuido' => $liquido_distribuido
            ];
        }
    }
    $reportDetails['caixinhas_detalhadas'] = $caixinhas_detalhes;
    $reportDetails['resumo_financeiro']['total_cashback_caixinhas'] = $totalCashbackCaixinhas;

    // Calcula a diferença de fichas
    $reportDetails['resumo_financeiro']['ficha_difference'] = 
        (float)$summary['total_sales'] - 
        ((float)$summary['total_returns'] + (float)$summary['total_rake'] + $totalCashbackCaixinhas);

    // 2.6. Observações e Assinatura (para relatório parcial, podem ser vazias ou um placeholder)
    $reportDetails['observacoes'] = ''; 
    $reportDetails['assinatura'] = '________________________________';

    // Para relatório parcial, não salvamos no histórico nem alteramos o status da sessão.
    echo json_encode(['success' => true, 'report' => $reportDetails]);

} catch (Exception $e) {
    error_log('Erro ao gerar relatório parcial: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erro interno ao gerar relatório: ' . $e->getMessage()]);
}
?>