<?php
session_start();
include 'db_connection.php';
header('Content-Type: application/json');

if (!isset($_SESSION['unidade_id']) || $_SESSION['perfil'] !== 'gestor') {
    exit(json_encode(['success' => false, 'message' => 'Ação não autorizada.']));
}

$unidade_id = $_SESSION['unidade_id'];
$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    // --- LÓGICA CORRIGIDA PARA CRIAR NOVA CAIXINHA ---
    $nome_caixinha = $data['nome_caixinha'] ?? 'Nova Caixinha';
    
    // A query agora inclui todos os campos com valores iniciais zerados.
    $sql = "INSERT INTO caixinhas 
                (unidade_id, nome_caixinha, valor_atual, participantes, cashback_percent) 
            VALUES (?, ?, 0, 1, 0)"; // Define valor_atual=0, participantes=1, cashback=0

    $stmt = $conn->prepare($sql);
    try {
        // A execução agora só precisa dos parâmetros que vêm da variável
        $stmt->execute([$unidade_id, $nome_caixinha]);
        echo json_encode(['success' => true, 'id' => $conn->lastInsertId()]);

    } catch (PDOException $e) {
        error_log("Erro ao criar caixinha: " . $e->getMessage()); // Adicionar logs ajuda a depurar
        echo json_encode(['success' => false, 'message' => 'Erro ao criar caixinha.']);
    }

} elseif ($method === 'PUT') {
    // --- LÓGICA PARA ATUALIZAR CAIXINHA EXISTENTE (permanece a mesma) ---
    $id = $data['id'] ?? 0;
    $nome_caixinha = $data['nome_caixinha'] ?? 'Caixinha';
    $valor_atual = $data['valor_atual'] ?? 0;
    $cashback_percent = $data['cashback_percent'] ?? 0;
    $participantes = $data['participantes'] ?? 1;

    if (!$id) {
        exit(json_encode(['success' => false, 'message' => 'ID da caixinha não fornecido.']));
    }

    $sql = "UPDATE caixinhas SET nome_caixinha = ?, valor_atual = ?, cashback_percent = ?, participantes = ? 
            WHERE id = ? AND unidade_id = ?";
    $stmt = $conn->prepare($sql);
    try {
        $stmt->execute([$nome_caixinha, $valor_atual, $cashback_percent, $participantes, $id, $unidade_id]);
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erro ao salvar alterações.']);
    }
}
?>
