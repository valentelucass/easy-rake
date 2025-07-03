<?php
include 'db_connection.php'; // Sua conexão com o banco
header("Access-Control-Allow-Origin: *"); // Permite CORS
header("Access-Control-Allow-Methods: POST, GET, OPTIONS"); // Permite métodos
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With"); // Permite cabeçalhos
header('Content-Type: application/json'); // Define o tipo de conteúdo como JSON

$data = json_decode(file_get_contents('php://input'), true);
$sangerName = $data['sangerName'] ?? '';
$unitCode = $data['unitCode'] ?? '';

// Verifica se os campos estão vazios
if (empty($sangerName) || empty($unitCode)) {
    exit(json_encode(['success' => false, 'message' => 'Nome do Sanger e Código da Unidade são obrigatórios.']));
}

try {
    // Verifica se a unidade existe na tabela 'unidades' (corrigido de 'units')
    $stmt = $conn->prepare("SELECT id FROM unidades WHERE codigo_acesso = ?");
    $stmt->execute([$unitCode]);
    $unidade = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$unidade) {
        exit(json_encode(['success' => false, 'message' => 'Código de unidade inválido. Verifique com o gestor.']));
    }
    $unidade_id = $unidade['id'];

    // Insere a solicitação como pendente na tabela 'pending_requests'
    $stmt = $conn->prepare("INSERT INTO pending_requests (unidade_id, sanger_name, status) VALUES (?, ?, 'pending')");
    if ($stmt->execute([$unidade_id, $sangerName])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Não foi possível enviar a solicitação. Tente novamente.']);
    }
} catch (PDOException $e) {
    // Em caso de erro de banco de dados
    error_log('Erro ao enviar solicitação Sanger: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erro interno ao processar sua solicitação.']);
} catch (Exception $e) {
    // Em caso de outros erros
    error_log('Erro geral ao enviar solicitação Sanger: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Ocorreu um erro inesperado.']);
}
?>
