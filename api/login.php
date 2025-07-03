<?php
session_start();
include 'db_connection.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

$data = json_decode(file_get_contents('php://input'), true);

$username = $data['email'] ?? null; // O campo pode ser e-mail ou username
$password = $data['password'] ?? null;

if (empty($username) || empty($password)) {
    exit(json_encode(['success' => false, 'message' => 'Usuário e senha são obrigatórios.']));
}

try {
    // Busca o usuário na tabela 'usuarios' pelo seu username (que para o gestor, é o e-mail)
    $stmt = $conn->prepare(
        "SELECT u.id, u.unidade_id, u.username, u.password, u.profile, u.status, un.nome_unidade, un.codigo_acesso
         FROM usuarios u
         JOIN unidades un ON u.unidade_id = un.id
         WHERE u.username = ?"
    );
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Verifica se o usuário existe e se a senha está correta
    if ($user && password_verify($password, $user['password'])) {
        
        // Verifica se o usuário está aprovado (exceto gestor que é sempre aprovado)
        if ($user['profile'] !== 'gestor' && $user['status'] !== 'aprovado') {
            exit(json_encode(['success' => false, 'message' => 'Seu acesso ainda não foi aprovado pelo gestor.']));
        }

        // Sucesso! Define as variáveis da sessão
        $_SESSION['user_id'] = $user['id']; // ID numérico correto!
        $_SESSION['unidade_id'] = $user['unidade_id'];
        $_SESSION['perfil'] = $user['profile'];
        $_SESSION['nome'] = ($user['profile'] === 'gestor') ? $user['nome_unidade'] : $user['username'];
        $_SESSION['codigo_acesso'] = $user['codigo_acesso'];
        
        echo json_encode(['success' => true, 'perfil' => $user['profile']]);

    } else {
        // Falha no login
        exit(json_encode(['success' => false, 'message' => 'Credenciais inválidas.']));
    }

} catch (PDOException $e) {
    error_log("Erro no login: " . $e->getMessage());
    exit(json_encode(['success' => false, 'message' => 'Erro interno no servidor durante o login.']));
}
?>