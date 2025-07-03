<?php
session_start();
include 'db_connection.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    exit(json_encode(['success' => false, 'message' => 'Acesso não autorizado.']));
}

$data = json_decode(file_get_contents('php://input'), true);
$player_id = $data['playerId'] ?? null;
$session_id = $data['sessionId'] ?? null; // Mantido, mas o saldo vem da view

if (!$player_id) {
    exit(json_encode(['success' => false, 'message' => 'Dados insuficientes para buscar detalhes do jogador.']));
}

$response = ['success' => true, 'details' => null, 'transactions' => []];

try {
    // 1. Buscar dados do jogador (nome, cpf, telefone) e os novos campos da view player_balances
    // Agora selecionamos explicitamente 'balance', 'total_comprado_historico', 'total_devolvido_fichas' e 'foi_quitado_flag'
    $stmt_player = $conn->prepare("SELECT p.id, p.name, p.cpf, p.telefone, pb.balance, pb.total_comprado_historico, pb.total_devolvido_fichas, pb.foi_quitado_flag FROM players p JOIN player_balances pb ON p.id = pb.id WHERE p.id = ?");
    $stmt_player->execute([$player_id]);
    $response['details'] = $stmt_player->fetch(PDO::FETCH_ASSOC);

    // 2. Buscar todas as transações do jogador nesta sessão (se session_id for fornecido e relevante)
    // Inclui a descrição para transações de despesa e pagamento_debito
    if ($session_id) {
        $stmt_trans = $conn->prepare(
            "SELECT type, amount, description, timestamp FROM transactions 
             WHERE player_id = ? AND cashier_session_id = ? 
             ORDER BY timestamp ASC"
        );
        $stmt_trans->execute([$player_id, $session_id]);
        $response['transactions'] = $stmt_trans->fetchAll(PDO::FETCH_ASSOC);
    } else {
        // Se não houver session_id, buscar todas as transações do jogador (ajuste conforme sua necessidade)
        $stmt_trans = $conn->prepare(
            "SELECT type, amount, description, timestamp FROM transactions 
             WHERE player_id = ? 
             ORDER BY timestamp ASC"
        );
        $stmt_trans->execute([$player_id]);
        $response['transactions'] = $stmt_trans->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode($response);

} catch (PDOException $e) {
    error_log('Erro ao buscar detalhes do jogador (get_player_details.php): ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro interno ao buscar detalhes do jogador.']);
} catch (Exception $e) {
    error_log('Erro geral ao buscar detalhes do jogador (get_player_details.php): ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Ocorreu um erro inesperado.']);
}
?>
