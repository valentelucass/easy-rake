<?php
session_start();
include 'db_connection.php';

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

// 1. Segurança: Apenas gestores podem ver esta lista
if (!isset($_SESSION['unidade_id']) || $_SESSION['perfil'] !== 'gestor') {
    exit(json_encode(['success' => false, 'message' => 'Acesso negado. Apenas gestores podem visualizar as aprovações.']));
}

$unidade_id = $_SESSION['unidade_id'];

// 2. Busca todos os usuários da unidade com status 'pendente'
$stmt = $conn->prepare("SELECT id, username, profile, created_at FROM usuarios WHERE unidade_id = ? AND status = 'pendente'");
$stmt->execute([$unidade_id]);
$requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

// 3. Retorna a lista de solicitações
if ($requests) {
    echo json_encode(['success' => true, 'requests' => $requests]);
} else {
    echo json_encode(['success' => true, 'requests' => [], 'message' => 'Nenhuma solicitação pendente.']);
}
?>