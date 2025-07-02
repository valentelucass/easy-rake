<?php
session_start();
include 'db_connection.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    exit(json_encode(['success' => false, 'message' => 'Acesso não autorizado.']));
}

$data = json_decode(file_get_contents('php://input'), true);
$player_id = $data['playerId'] ?? null;
$session_id = $data['sessionId'] ?? null;

if (!$player_id || !$session_id) {
    exit(json_encode(['success' => false, 'message' => 'Dados insuficientes para buscar detalhes.']));
}

$response = ['success' => true, 'details' => null, 'transactions' => []];

// 1. Buscar dados do jogador (nome, cpf, etc)
$stmt_player = $conn->prepare("SELECT id, name, cpf, telefone FROM players WHERE id = ?");
$stmt_player->execute([$player_id]);
$response['details'] = $stmt_player->fetch(PDO::FETCH_ASSOC);

// 2. Buscar todas as transações do jogador nesta sessão
$stmt_trans = $conn->prepare(
    "SELECT type, amount, timestamp FROM transactions 
     WHERE player_id = ? AND cashier_session_id = ? 
     ORDER BY timestamp ASC"
);
$stmt_trans->execute([$player_id, $session_id]);
$response['transactions'] = $stmt_trans->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($response);
?>