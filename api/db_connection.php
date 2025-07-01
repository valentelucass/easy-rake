<?php
// Adicione estas 3 linhas para o CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$host = 'localhost:3307'; // <-- PONTO MAIS IMPORTANTE! VERIFIQUE SE A PORTA 3307 ESTÁ AQUI.
$dbname = 'easy_rake';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    // Esta mensagem de erro é o que o seu JavaScript está recebendo
    echo json_encode(['success' => false, 'message' => 'Erro na conexão com o banco de dados: ' . $e->getMessage()]);
    die();
}
?>