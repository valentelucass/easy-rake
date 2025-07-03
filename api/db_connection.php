<?php
// Adicione estas 3 linhas para o CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$host = 'localhost';
$port = 3307;
$dbname = 'easy_rake';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    // A mensagem de erro detalhada agora ficará apenas no log do servidor (error_log),
    // e não será mais exposta ao usuário final.
    error_log('Erro na conexão com o banco de dados: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Ocorreu um erro interno no servidor. Tente novamente mais tarde.']);
    die();
}
?>