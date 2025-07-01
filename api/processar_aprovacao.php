<?php
session_start();
include 'db_connection.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header('Content-Type: application/json');

// 1. Segurança: Apenas gestores podem realizar esta ação
if (!isset($_SESSION['unidade_id']) || $_SESSION['perfil'] !== 'gestor') {
    exit(json_encode(['success' => false, 'message' => 'Ação não autorizada.']));
}

$data = json_decode(file_get_contents('php://input'), true);
$usuario_id = $data['usuario_id'] ?? null;
$acao = $data['acao'] ?? ''; // 'aprovar' ou 'negar'

if (!$usuario_id || !in_array($acao, ['aprovar', 'negar'])) {
    exit(json_encode(['success' => false, 'message' => 'Dados inválidos.']));
}

// 2. Define o novo status com base na ação
$novo_status = ($acao === 'aprovar') ? 'aprovado' : 'negado';

// 3. Atualiza o status do usuário no banco de dados
// A cláusula 'unidade_id = ?' é uma segurança extra para garantir que um gestor só possa
// modificar usuários da sua própria unidade.
$stmt = $conn->prepare("UPDATE usuarios SET status = ? WHERE id = ? AND unidade_id = ?");

try {
    $stmt->execute([$novo_status, $usuario_id, $_SESSION['unidade_id']]);
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Solicitação processada com sucesso.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Usuário não encontrado ou já processado.']);
    }
} catch (PDOException $e) {
    error_log('Erro ao processar aprovação: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erro interno ao processar a solicitação.']);
}
?>