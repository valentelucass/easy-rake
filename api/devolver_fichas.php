<?php
include 'db_connection.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
session_start(); // Adicionado
$sessionId = $data['sessionId'];
$playerName = $data['playerName'];
$amount = $data['amount'];
$timestamp = date('Y-m-d H:i:s'); // Formato do MySQL

if (!isset($_SESSION['user_id'])) { // Adicionado
    exit(json_encode(['success' => false, 'message' => 'Acesso não autorizado.']));
}
$unitCode = $_SESSION['unit_code']; // Corrigido

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