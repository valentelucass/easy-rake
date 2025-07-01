<?php
session_start();
include 'db_connection.php';

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

// 1. Segurança: Verifica se o usuário está logado
if (!isset($_SESSION['unidade_id'])) {
    exit(json_encode(['success' => false, 'message' => 'Acesso não autorizado. Por favor, faça login.']));
}

$unidade_id = $_SESSION['unidade_id'];
$response = [
    'success' => true,
    'user_info' => [
        'perfil' => $_SESSION['perfil'],
        'nome' => $_SESSION['nome'],
        'codigo_acesso' => $_SESSION['codigo_acesso']
    ],
    'caixa' => null,
    'caixinhas' => [],
    'gastos_recentes' => []
];

// 2. Busca a sessão de caixa ABERTA para a unidade
$stmt = $conn->prepare("SELECT * FROM cashier_session_summary WHERE unidade_id = ? AND status = 'open' LIMIT 1");
$stmt->execute([$unidade_id]);
$caixa_summary = $stmt->fetch(PDO::FETCH_ASSOC);

if ($caixa_summary) {
    // Se um caixa estiver aberto, preenche os dados do caixa
    $response['caixa'] = $caixa_summary;

    // 3. Busca os gastos da sessão atual
    $stmt_gastos = $conn->prepare("SELECT description, amount, timestamp FROM transactions WHERE cashier_session_id = ? AND type = 'despesa' ORDER BY timestamp DESC");
    $stmt_gastos->execute([$caixa_summary['id']]);
    $response['gastos_recentes'] = $stmt_gastos->fetchAll(PDO::FETCH_ASSOC);
}

// 4. Se o perfil for Gestor, busca também os dados das caixinhas
if ($_SESSION['perfil'] === 'gestor') {
    $stmt_caixinhas = $conn->prepare("SELECT id, nome_caixinha, valor_atual, participantes, cashback_percent FROM caixinhas WHERE unidade_id = ?");
    $stmt_caixinhas->execute([$unidade_id]);
    $response['caixinhas'] = $stmt_caixinhas->fetchAll(PDO::FETCH_ASSOC);
}

// 5. Retorna o objeto JSON completo para o frontend
echo json_encode($response);
?>