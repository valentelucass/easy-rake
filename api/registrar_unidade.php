<?php
include 'db_connection.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$nome_unidade = $data['nome_unidade'] ?? '';
$email_gestor = $data['email_gestor'] ?? '';
$senha_gestor = $data['senha_gestor'] ?? '';

if (empty($nome_unidade) || empty($email_gestor) || empty($senha_gestor)) {
    exit(json_encode(['success' => false, 'message' => 'Todos os campos são obrigatórios.']));
}

// Lógica para gerar código de acesso único (já estava correta)
$codigo_acesso = null;
do {
    $codigo_acesso = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
    $stmt_check = $conn->prepare("SELECT id FROM unidades WHERE codigo_acesso = ?");
    $stmt_check->execute([$codigo_acesso]);
} while ($stmt_check->fetch());

$hashedPassword = password_hash($senha_gestor, PASSWORD_DEFAULT);

// Inicia uma transação para garantir que ambas as operações (criar unidade e criar usuário) ocorram com sucesso.
$conn->beginTransaction();

try {
    // 1. Insere a nova unidade
    $stmt_unit = $conn->prepare("INSERT INTO unidades (nome_unidade, email_gestor, senha_gestor, codigo_acesso) VALUES (?, ?, ?, ?)");
    $stmt_unit->execute([$nome_unidade, $email_gestor, $hashedPassword, $codigo_acesso]);
    $unidade_id = $conn->lastInsertId();

    // 2. CRIA O USUÁRIO GESTOR CORRESPONDENTE
    $stmt_user = $conn->prepare(
        "INSERT INTO usuarios (unidade_id, username, password, profile, status) VALUES (?, ?, ?, 'gestor', 'aprovado')"
    );
    // O username do gestor será o seu e-mail para consistência
    $stmt_user->execute([$unidade_id, $email_gestor, $hashedPassword]);

    // Se tudo deu certo, confirma as alterações
    $conn->commit();
    
    echo json_encode(['success' => true, 'codigo_acesso' => $codigo_acesso]);

} catch (PDOException $e) {
    // Desfaz tudo se algo der errado
    $conn->rollBack();
    if ($e->errorInfo[1] == 1062) {
        echo json_encode(['success' => false, 'message' => 'Este e-mail já está cadastrado.']);
    } else {
        error_log('Erro ao criar unidade: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Erro interno ao criar a unidade.']);
    }
}
?>