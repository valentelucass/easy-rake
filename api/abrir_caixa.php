<?php
session_start();
include 'db_connection.php';

header("Content-Type: application/json");

// 1. Segurança: Verificações de sessão
if (!isset($_SESSION['user_id'], $_SESSION['unidade_id'])) {
    exit(json_encode(['success' => false, 'message' => 'Acesso não autorizado. Sessão inválida.']));
}

// Impede que um novo caixa seja aberto se já existir um aberto para esta unidade
$stmt_check = $conn->prepare("SELECT id FROM cashier_sessions WHERE unidade_id = ? AND status = 'open'");
$stmt_check->execute([$_SESSION['unidade_id']]);
if ($stmt_check->fetch()) {
    exit(json_encode(['success' => false, 'message' => 'Já existe um caixa aberto para esta unidade.']));
}

// 2. Leitura e validação dos dados
$data = json_decode(file_get_contents('php://input'), true);
$valor_inicial = $data['valor_inicial'] ?? null;

if (!is_numeric($valor_inicial) || $valor_inicial < 0) {
    exit(json_encode(['success' => false, 'message' => 'Valor inicial inválido.']));
}

// 3. Insere a nova sessão de caixa no banco
$sql = "INSERT INTO cashier_sessions (unidade_id, opened_by_user_id, opened_at, initial_amount, status) VALUES (?, ?, NOW(), ?, 'open')";
$stmt = $conn->prepare($sql);

try {
    $stmt->execute([
        $_SESSION['unidade_id'],
        $_SESSION['user_id'],
        $valor_inicial
    ]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Não foi possível abrir o caixa.']);
    }

} catch (PDOException $e) {
    error_log("Erro ao abrir caixa: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erro interno no servidor.']);
}
?>