<?php
session_start();
include 'db_connection.php';

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

// 1. Segurança e validação de sessão
if (!isset($_SESSION['unidade_id'])) {
    exit(json_encode(['success' => false, 'message' => 'Acesso não autorizado. Por favor, faça login.']));
}

$unidade_id = $_SESSION['unidade_id'];
$response = [
    'success' => true,
    'user_info' => [
        'perfil' => $_SESSION['perfil'],
        'nome' => $_SESSION['nome'],
        'codigo_acesso' => $_SESSION['codigo_acesso']
    ],
    'caixa' => null,
    'caixinhas' => [],
    'gastos_recentes' => [],
    'rake_entries' => [],
    'active_players' => []
];

// 2. CORREÇÃO PRINCIPAL: Buscar da VIEW que já tem os totais calculados
$stmt = $conn->prepare("SELECT * FROM cashier_session_summary WHERE unidade_id = ? AND status = 'open' LIMIT 1");
$stmt->execute([$unidade_id]);
$caixa_summary = $stmt->fetch(PDO::FETCH_ASSOC);

if ($caixa_summary) {
    // A view já nos dá todos os totais. 'id' aqui é o session_id.
    $session_id = $caixa_summary['id']; 
    $response['caixa'] = $caixa_summary; 

    // 3. Busca outras informações da sessão (gastos, rake, etc.)
    $stmt_gastos = $conn->prepare("SELECT description, amount, timestamp FROM transactions WHERE cashier_session_id = ? AND type = 'despesa' ORDER BY timestamp DESC");
    $stmt_gastos->execute([$session_id]);
    $response['gastos_recentes'] = $stmt_gastos->fetchAll(PDO::FETCH_ASSOC);

    $stmt_rake = $conn->prepare("SELECT amount, timestamp FROM transactions WHERE cashier_session_id = ? AND type = 'rake' ORDER BY timestamp DESC");
    $stmt_rake->execute([$session_id]);
    $response['rake_entries'] = $stmt_rake->fetchAll(PDO::FETCH_ASSOC);

    // 4. MANTÉM A SUA LÓGICA REFINADA PARA JOGADORES ATIVOS
    $stmt_players = $conn->prepare(
        "SELECT p.id, p.name FROM players p 
         JOIN transactions t ON p.id = t.player_id 
         WHERE t.cashier_session_id = ? 
         GROUP BY p.id, p.name"
    );
    $stmt_players->execute([$session_id]);
    $players = $stmt_players->fetchAll(PDO::FETCH_ASSOC);

    foreach ($players as $player) {
        $player_id = $player['id'];
        
        // a) Calcula o histórico TOTAL na sessão
        $stmt_hist = $conn->prepare(
            "SELECT 
                SUM(CASE WHEN type = 'venda' THEN amount ELSE 0 END) as total_comprado,
                SUM(CASE WHEN type IN ('devolucao', 'pagamento_debito') THEN amount ELSE 0 END) as total_devolvido
             FROM transactions 
             WHERE cashier_session_id = ? AND player_id = ?"
        );
        $stmt_hist->execute([$session_id, $player_id]);
        $historico = $stmt_hist->fetch(PDO::FETCH_ASSOC);

        // b) Encontra a data da ÚLTIMA quitação na sessão
        $stmt_quit = $conn->prepare(
            "SELECT MAX(timestamp) as last_quit_date FROM transactions 
             WHERE cashier_session_id = ? AND player_id = ? AND type = 'pagamento_debito'"
        );
        $stmt_quit->execute([$session_id, $player_id]);
        $last_quit = $stmt_quit->fetch(PDO::FETCH_ASSOC);
        $last_quit_date = $last_quit['last_quit_date'];

        // c) Calcula o saldo ATUAL (após a última quitação)
        $sql_saldo_atual = "SELECT 
                                SUM(CASE WHEN type = 'venda' THEN amount ELSE 0 END) as atual_comprado,
                                SUM(CASE WHEN type IN ('devolucao', 'pagamento_debito') THEN amount ELSE 0 END) as atual_devolvido
                            FROM transactions 
                            WHERE cashier_session_id = ? AND player_id = ?";
        
        $params = [$session_id, $player_id];
        if ($last_quit_date) {
            $sql_saldo_atual .= " AND timestamp > ?";
            $params[] = $last_quit_date;
        }

        $stmt_saldo_atual = $conn->prepare($sql_saldo_atual);
        $stmt_saldo_atual->execute($params);
        $saldo_data = $stmt_saldo_atual->fetch(PDO::FETCH_ASSOC);
        
        $saldo_atual = ($saldo_data['atual_devolvido'] ?? 0) - ($saldo_data['atual_comprado'] ?? 0);

        // Adiciona o jogador com todos os dados ao array de resposta
        $response['active_players'][] = [
            'id' => $player_id,
            'name' => $player['name'],
            'total_comprado_historico' => $historico['total_comprado'] ?? 0,
            'total_devolvido_historico' => $historico['total_devolvido'] ?? 0,
            'saldo_atual' => $saldo_atual,
            'foi_quitado' => !empty($last_quit_date)
        ];
    }
}

// 5. Se o perfil for Gestor, busca também os dados das caixinhas
if ($_SESSION['perfil'] === 'gestor') {
    $stmt_caixinhas = $conn->prepare("SELECT id, nome_caixinha, valor_atual, participantes, cashback_percent FROM caixinhas WHERE unidade_id = ?");
    $stmt_caixinhas->execute([$unidade_id]);
    $response['caixinhas'] = $stmt_caixinhas->fetchAll(PDO::FETCH_ASSOC);
}

echo json_encode($response);
?>
