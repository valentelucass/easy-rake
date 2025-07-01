<?php
include 'db_connection.php'; // Sua conexão com o banco

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// 1. Recebe os dados do formulário de registro
$data = json_decode(file_get_contents('php://input'), true);
$nome_unidade = $data['nome_unidade'] ?? '';
$email_gestor = $data['email_gestor'] ?? '';
$senha_gestor = $data['senha_gestor'] ?? '';

if (empty($nome_unidade) || empty($email_gestor) || empty($senha_gestor)) {
    exit(json_encode(['success' => false, 'message' => 'Todos os campos são obrigatórios.']));
}

// 2. Lógica para gerar um Código de Acesso único
$codigo_acesso = null;
do {
    // Gera um código de 4 dígitos com zeros à esquerda se necessário
    $codigo_acesso = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
    $stmt = $conn->prepare("SELECT id FROM unidades WHERE codigo_acesso = ?");
    $stmt->execute([$codigo_acesso]);
} while ($stmt->fetch()); // Continua o loop se o código já existir

// 3. Criptografa a senha para armazenamento seguro
$hashedPassword = password_hash($senha_gestor, PASSWORD_DEFAULT);

// 4. Insere a nova unidade no banco de dados
try {
    $stmt = $conn->prepare("INSERT INTO unidades (nome_unidade, email_gestor, senha_gestor, codigo_acesso) VALUES (?, ?, ?, ?)");
    $stmt->execute([$nome_unidade, $email_gestor, $hashedPassword, $codigo_acesso]);

    // 5. Retorna sucesso com o código de acesso para ser exibido ao usuário
    echo json_encode(['success' => true, 'codigo_acesso' => $codigo_acesso]);

} catch (PDOException $e) {
    // Trata erros, como email duplicado
    if ($e->errorInfo[1] == 1062) { // 1062 é o código de erro para entrada duplicada
        echo json_encode(['success' => false, 'message' => 'Este e-mail já está cadastrado.']);
    } else {
        error_log('Erro ao criar unidade: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Erro interno ao criar a unidade.']);
    }
}
?>