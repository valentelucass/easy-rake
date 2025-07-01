<?php
session_start();
include 'db_connection.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST"); // Por enquanto, só aceitaremos POST para criar
header('Content-Type: application/json');

// 1. Segurança: Apenas gestores podem criar caixinhas
if (!isset($_SESSION['unidade_id']) || $_SESSION['perfil'] !== 'gestor') {
    exit(json_encode(['success' => false, 'message' => 'Ação não autorizada.']));
}

$data = json_decode(file_get_contents('php://input'), true);
$unidade_id = $_SESSION['unidade_id'];

// 2. Validação dos dados recebidos do formulário
$nome_caixinha = $data['nome_caixinha'] ?? '';
$valor_inicial = $data['valor'] ?? 0;
$participantes = $data['participantes'] ?? 1;
$cashback = $data['cashback'] ?? 0;

if (empty($nome_caixinha) || !is_numeric($valor_inicial) || !is_numeric($participantes) || !is_numeric($cashback)) {
    exit(json_encode(['success' => false, 'message' => 'Dados da caixinha inválidos.']));
}

// 3. Insere a nova caixinha no banco de dados
$sql = "INSERT INTO caixinhas (unidade_id, nome_caixinha, valor_atual, participantes, cashback_percent) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);

try {
    $stmt->execute([$unidade_id, $nome_caixinha, $valor_inicial, $participantes, $cashback]);
    $nova_caixinha_id = $conn->lastInsertId();

    // 4. [Opcional, mas recomendado] Registra o valor inicial como uma transação
    // Isso mantém seu histórico financeiro consistente.
    if ($valor_inicial > 0) {
        // Busca a sessão de caixa aberta
        $stmt_session = $conn->prepare("SELECT id FROM cashier_sessions WHERE unidade_id = ? AND status = 'open' LIMIT 1");
        $stmt_session->execute([$unidade_id]);
        $sessao = $stmt_session->fetch(PDO::FETCH_ASSOC);

        if ($sessao) {
            $trans_sql = "INSERT INTO transactions (cashier_session_id, type, amount, description) VALUES (?, 'caixinha', ?, ?)";
            $stmt_trans = $conn->prepare($trans_sql);
            $stmt_trans->execute([$sessao['id'], $valor_inicial, "Valor inicial para: " . $nome_caixinha]);
        }
    }

    echo json_encode(['success' => true, 'message' => 'Caixinha criada com sucesso!', 'id' => $nova_caixinha_id]);

} catch (PDOException $e) {
    error_log('Erro ao criar caixinha: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erro interno ao criar a caixinha.']);
}
?>