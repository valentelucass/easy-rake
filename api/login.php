<?php
// api/login.php (A LÓGICA)
session_start();

// O include funciona porque 'db_connection.php' está na mesma pasta 'api/'.
include 'db_connection.php'; 

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Lê os dados que o JavaScript enviou via POST.
$username = $_POST['username'] ?? '';
$password_from_user = $_POST['password'] ?? '';
$profile = $_POST['profile'] ?? '';

if (empty($username) || empty($password_from_user) || empty($profile)) {
    echo json_encode(['success' => false, 'message' => 'Dados de login incompletos.']);
    exit();
}

// Prepara e executa a consulta ao banco de dados.
$stmt = $conn->prepare("SELECT id, username, password, profile FROM users WHERE username = ? AND profile = ?");
$stmt->execute([$username, $profile]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

// Verifica se o usuário foi encontrado E se a senha digitada corresponde à senha criptografada no banco.
if ($user && password_verify($password_from_user, $user['password'])) {
    // Se tudo estiver certo, salva os dados na sessão do servidor.
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['profile'] = $user['profile'];
    
    // Retorna uma resposta de sucesso para o JavaScript.
    echo json_encode(['success' => true]);
} else {
    // Se o usuário não existe ou a senha está errada, retorna uma mensagem de erro.
    echo json_encode(['success' => false, 'message' => 'Dados inválidos.']);
}
?>