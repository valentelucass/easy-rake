<?php
// api/vender_fichas.php (Versão Atualizada)
include 'db_connection.php';
// ... (cabeçalhos CORS) ...
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$sessionId = $data['sessionId'];
$playerName = $data['playerName'];
$amount = $data['amount'];
$unitCode = '1001';
$cpf = $data['cpf'] ?? null; // Pega CPF ou define como nulo
$telefone = $data['telefone'] ?? null; // Pega telefone ou define como nulo

// Verifica se o jogador existe
$stmt = $conn->prepare("SELECT id FROM players WHERE name = ? AND unit_code = ?");
$stmt->execute([$playerName, $unitCode]);
$player = $stmt->fetch(PDO::FETCH_ASSOC);

$playerId = null;
if (!$player) {
    // Se não existe, CRIA com todos os dados
    $stmt = $conn->prepare("INSERT INTO players (name, cpf, telefone, unit_code) VALUES (?, ?, ?, ?)");
    $stmt->execute([$playerName, $cpf, $telefone, $unitCode]);
    $playerId = $conn->lastInsertId();
} else {
    // Se já existe, ATUALIZA cpf e telefone se eles foram enviados
    $playerId = $player['id'];
    if (!empty($cpf) || !empty($telefone)) {
        $stmt = $conn->prepare("UPDATE players SET cpf = COALESCE(?, cpf), telefone = COALESCE(?, telefone) WHERE id = ?");
        $stmt->execute([$cpf, $telefone, $playerId]);
    }
}

// Registra a transação
$stmt = $conn->prepare("INSERT INTO transactions (cashier_session_id, type, player_id, amount, timestamp) VALUES (?, 'venda', ?, ?, NOW())");
if ($stmt->execute([$sessionId, $playerId, $amount])) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Falha ao registrar transação.']);
}
?>