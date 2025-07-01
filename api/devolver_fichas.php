<?php
header("Access-Control-Allow-Origin: *"); // Permite que qualquer origem acesse a API
header("Access-Control-Allow-Methods: POST, GET, OPTIONS"); // Define os métodos permitidos
header("Access-Control-Allow-Headers: Content-Type"); // Define os cabeçalhos permitidos

include 'db_connection.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$sessionId = $data['sessionId'];
$playerName = $data['playerName'];
$amount = $data['amount'];
$timestamp = date('Y-m-d H:i:s'); // Formato do MySQL
$unitCode = '1001'; // Assumindo unidade fixa por enquanto

// Encontrar o ID do jogador
$stmt = $conn->prepare("SELECT id FROM players WHERE name = ? AND unit_code = ?");
$stmt->execute([$playerName, $unitCode]);
$player = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$player) {
    echo json_encode(['success' => false, 'message' => 'Jogador não encontrado para devolução.']);
    exit();
}
$playerId = $player['id'];

// Registrar a transação de devolução
$stmt = $conn->prepare("INSERT INTO transactions (cashier_session_id, type, player_id, amount, timestamp) VALUES (?, 'devolucao', ?, ?, ?)");
$stmt->execute([$sessionId, $playerId, $amount, $timestamp]);

if ($stmt->rowCount() > 0) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Falha ao registrar devolução.']);
}
?>