<?php
// api/get_session.php (Versão que carrega despesas)
session_start();
include 'db_connection.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    exit(json_encode(['success' => false, 'message' => 'Acesso não autorizado.']));
}
$unitCode = $_SESSION['unit_code'];

$stmt = $conn->prepare("SELECT * FROM cashier_session_summary WHERE unit_code = ? AND status = 'open' ORDER BY opened_at DESC LIMIT 1");
$stmt->execute([$unitCode]);
$summary = $stmt->fetch(PDO::FETCH_ASSOC);

if ($summary) {
    // --- LÓGICA NOVA: BUSCAR DESPESAS ---
    $expensesStmt = $conn->prepare("SELECT description, amount, timestamp FROM transactions WHERE cashier_session_id = ? AND type = 'despesa' ORDER BY timestamp DESC");
    $expensesStmt->execute([$summary['id']]);
    $expenses = $expensesStmt->fetchAll(PDO::FETCH_ASSOC);

    $caixaState = [
        'isCashierOpen' => true,
        'sessionId' => (int)$summary['id'],
        'initialAmount' => (float)$summary['initial_amount'],
        'chipsSold' => (float)$summary['total_sales'],
        'chipsReturned' => (float)$summary['total_returns'],
        'rake' => (float)$summary['total_rake'],
        'expenses' => $expenses // Envia a lista de despesas
    ];
    echo json_encode(['success' => true, 'isCashierOpen' => true, 'caixaState' => $caixaState]);
} else {
    echo json_encode(['success' => true, 'isCashierOpen' => false]);
}
?>