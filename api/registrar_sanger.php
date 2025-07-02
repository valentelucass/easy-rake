<?php
include 'db_connection.php';

header("Content-Type: application/json");

$data = json_decode(file_get_contents('php://input'), true);

$username = $data['username'] ?? '';
$password = $data['password'] ?? '';
$codigo_acesso = $data['codigo_acesso'] ?? '';

if (empty($username) || empty($password) || empty($codigo_acesso)) {
    exit(json_encode(['success' => false, 'message' => 'Todos os campos são obrigatórios.']));
}

// 1. Validar se o código de acesso da unidade existe
$stmt_unidade = $conn->prepare("SELECT id FROM unidades WHERE codigo_acesso = ?");
$stmt_unidade->execute([$codigo_acesso]);
$unidade = $stmt_unidade->fetch(PDO::FETCH_ASSOC);

if (!$unidade) {
    exit(json_encode(['success' => false, 'message' => 'Código de Acesso inválido. Verifique com o gestor da unidade.']));
}
$unidade_id = $unidade['id'];

// 2. Criptografar a senha do Sanger
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// 3. Inserir o novo usuário Sanger com status 'pendente'
try {
    $stmt_insert = $conn->prepare(
        "INSERT INTO usuarios (unidade_id, username, password, profile, status) VALUES (?, ?, ?, 'sanger', 'pendente')"
    );
    $stmt_insert->execute([$unidade_id, $username, $hashedPassword]);

    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    // Trata erro de usuário duplicado
    if ($e->errorInfo[1] == 1062) {
        echo json_encode(['success' => false, 'message' => 'Este nome de usuário já existe. Por favor, escolha outro.']);
    } else {
        error_log('Erro ao registrar sanger: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Erro interno ao processar sua solicitação.']);
    }
}
?>