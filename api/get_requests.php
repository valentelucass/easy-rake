<?php
session_start();
include 'db_connection.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// 1. Segurança: Apenas gestores podem ver esta lista
if (!isset($_SESSION['unidade_id']) || $_SESSION['perfil'] !== 'gestor') {
    http_response_code(403); // Acesso Proibido
    exit(json_encode(['success' => false, 'message' => 'Acesso negado. Apenas gestores podem visualizar as aprovações.']));
}

$unidade_id = $_SESSION['unidade_id']; // Usamos o ID da unidade da sessão

try {
    // 2. Busca todas as solicitações pendentes para a unidade do gestor logado
    // A tabela pending_requests tem 'unidade_id', não 'unit_code'
    $stmt = $conn->prepare("SELECT id, sanger_name, created_at FROM pending_requests WHERE unidade_id = ? AND status = 'pending' ORDER BY created_at DESC");
    $stmt->execute([$unidade_id]);
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'requests' => $requests]);

} catch (PDOException $e) {
    error_log('Erro ao buscar solicitações pendentes (get_requests.php): ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro interno ao buscar solicitações.']);
} catch (Exception $e) {
    error_log('Erro geral ao buscar solicitações pendentes (get_requests.php): ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Ocorreu um erro inesperado.']);
}
?>
