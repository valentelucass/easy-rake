<?php
session_start();
include 'db_connection.php';
header('Content-Type: application/json');

// Segurança: Apenas usuários logados podem acessar
if (!isset($_SESSION['user_id'], $_SESSION['unidade_id'])) {
    exit(json_encode(['success' => false, 'message' => 'Acesso não autorizado.']));
}

$data = json_decode(file_get_contents('php://input'), true);
$unidade_id = $_SESSION['unidade_id'];
$sessao_id = $data['sessionId'] ?? null;
$player_id = $data['playerId'] ?? null;
$valor_debito = $data['valorDebito'] ?? 0;

if (!$sessao_id || !$player_id || !is_numeric($valor_debito) || $valor_debito <= 0) {
    exit(json_encode(['success' => false, 'message' => 'Dados inválidos para quitar o débito.']));
}

// Insere uma nova transação do tipo 'pagamento_debito'
// Esta transação representa o dinheiro que o jogador entregou para zerar a conta.
$sql = "INSERT INTO transactions (cashier_session_id, player_id, type, amount, description) VALUES (?, ?, 'pagamento_debito', ?, ?)";
$stmt = $conn->prepare($sql);

try {
    $stmt->execute([$sessao_id, $player_id, $valor_debito, 'Pagamento de débito em aberto']);
    echo json_encode(['success' => true, 'message' => 'Débito quitado com sucesso.']);
} catch (PDOException $e) {
    error_log('Erro ao quitar débito: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erro ao registrar o pagamento no banco de dados.']);
}
?>