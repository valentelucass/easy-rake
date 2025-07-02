<?php
session_start();
include 'db_connection.php';

header("Content-Type: application/json");

// 1. Segurança: Verificações de sessão
if (!isset($_SESSION['user_id'], $_SESSION['unidade_id'])) {
    exit(json_encode(['success' => false, 'message' => 'Acesso não autorizado. Sessão inválida.']));
}

$unidade_id = $_SESSION['unidade_id'];
$user_id = $_SESSION['user_id'];

// Impede que um novo caixa seja aberto se já existir um aberto para esta unidade
$stmt_check = $conn->prepare("SELECT id FROM cashier_sessions WHERE unidade_id = ? AND status = 'open'");
$stmt_check->execute([$unidade_id]);
if ($stmt_check->fetch()) {
    exit(json_encode(['success' => false, 'message' => 'Já existe um caixa aberto para esta unidade.']));
}

// 2. Leitura e validação dos dados
$data = json_decode(file_get_contents('php://input'), true);
$valor_inicial = $data['valor_inicial'] ?? null;

if (!is_numeric($valor_inicial) || $valor_inicial < 0) {
    exit(json_encode(['success' => false, 'message' => 'Valor inicial inválido.']));
}

// Inicia uma transação para garantir a consistência dos dados
$conn->beginTransaction();

try {
    // 3. Insere a nova sessão de caixa no banco
    $sql_open_cashier = "INSERT INTO cashier_sessions (unidade_id, opened_by_user_id, opened_at, initial_amount, status) VALUES (?, ?, NOW(), ?, 'open')";
    $stmt_open = $conn->prepare($sql_open_cashier);
    $stmt_open->execute([$unidade_id, $user_id, $valor_inicial]);

    // 4. LÓGICA DE EXCLUSÃO: Apaga todas as caixinhas da unidade
    // Este comando garante que cada nova sessão de caixa comece com a seção de caixinhas limpa.
    $sql_delete_caixinhas = "DELETE FROM caixinhas WHERE unidade_id = ?";
    $stmt_delete = $conn->prepare($sql_delete_caixinhas);
    $stmt_delete->execute([$unidade_id]);

    // Se tudo deu certo, confirma as alterações no banco
    $conn->commit();
    
    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    // Se algo deu errado, desfaz todas as alterações
    $conn->rollBack();
    error_log("Erro ao abrir caixa e apagar caixinhas: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erro interno no servidor ao abrir o caixa.']);
}
?>
