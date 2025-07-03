<?php
session_start();
include 'db_connection.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$requestId = $data['requestId'] ?? null;
$action = $data['action'] ?? ''; // 'approve' ou 'deny'
$username = $data['username'] ?? null; // Nome de usuário para o novo Sanger (se aprovado)
$password = $data['password'] ?? null; // Senha para o novo Sanger (se aprovado)

// Verifica se o usuário está logado e é um gestor
if (!isset($_SESSION['unidade_id']) || $_SESSION['perfil'] !== 'gestor') {
    http_response_code(403);
    exit(json_encode(['success' => false, 'message' => 'Acesso negado. Apenas gestores podem processar solicitações.']));
}

if (empty($requestId) || !in_array($action, ['approve', 'deny'])) {
    exit(json_encode(['success' => false, 'message' => 'Dados inválidos para a ação.']));
}

$unidade_id_sessao = $_SESSION['unidade_id'];

$conn->beginTransaction(); // Inicia transação

try {
    // 1. Busca a solicitação pendente para a unidade do gestor logado
    $stmt_req = $conn->prepare("SELECT sanger_name, unidade_id FROM pending_requests WHERE id = ? AND unidade_id = ? AND status = 'pending'");
    $stmt_req->execute([$requestId, $unidade_id_sessao]);
    $request = $stmt_req->fetch(PDO::FETCH_ASSOC);

    if (!$request) {
        $conn->rollBack();
        exit(json_encode(['success' => false, 'message' => 'Solicitação não encontrada ou já processada.']));
    }

    if ($action === 'approve') {
        // Validação adicional para aprovação
        if (empty($username) || empty($password)) {
            $conn->rollBack();
            exit(json_encode(['success' => false, 'message' => 'Nome de usuário e senha são obrigatórios para aprovação.']));
        }
        
        // Criptografa a senha do novo Sanger
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        // Insere o novo usuário Sanger na tabela 'usuarios'
        $stmt_insert_user = $conn->prepare(
            "INSERT INTO usuarios (unidade_id, username, password, profile, status) VALUES (?, ?, ?, 'sanger', 'aprovado')"
        );
        $stmt_insert_user->execute([$request['unidade_id'], $username, $hashedPassword]);

        // Atualiza o status da solicitação para 'approved'
        $stmt_update_req = $conn->prepare("UPDATE pending_requests SET status = 'approved' WHERE id = ?");
        $stmt_update_req->execute([$requestId]);

        $conn->commit(); // Confirma transação
        echo json_encode(['success' => true, 'message' => 'Solicitação aprovada e usuário Sanger criado!']);

    } else { // action === 'deny'
        // Atualiza o status da solicitação para 'denied'
        $stmt_update_req = $conn->prepare("UPDATE pending_requests SET status = 'denied' WHERE id = ?");
        $stmt_update_req->execute([$requestId]);

        $conn->commit(); // Confirma transação
        echo json_encode(['success' => true, 'message' => 'Solicitação negada.']);
    }

} catch (PDOException $e) {
    $conn->rollBack(); // Reverte transação em caso de erro
    if ($e->errorInfo[1] == 1062) { // Erro de duplicidade para username
        echo json_encode(['success' => false, 'message' => 'Este nome de usuário já existe para outro Sanger. Escolha outro.']);
    } else {
        error_log('Erro no processamento da solicitação Sanger (handle_request.php): ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro interno ao processar a solicitação.']);
    }
} catch (Exception $e) {
    $conn->rollBack();
    error_log('Erro geral no processamento da solicitação Sanger (handle_request.php): ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Ocorreu um erro inesperado.']);
}
?>
