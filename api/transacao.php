<?php
session_start();
include 'db_connection.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header('Content-Type: application/json');

// 1. Segurança e validação inicial
if (!isset($_SESSION['unidade_id'])) {
    exit(json_encode(['success' => false, 'message' => 'Acesso não autorizado.']));
}

$data = json_decode(file_get_contents('php://input'), true);
$unidade_id = $_SESSION['unidade_id'];
$tipo_transacao = $data['tipo'] ?? '';
$valor = $data['valor'] ?? 0;

// 2. Busca a sessão de caixa aberta para registrar a transação
$stmt_session = $conn->prepare("SELECT id FROM cashier_sessions WHERE unidade_id = ? AND status = 'open' LIMIT 1");
$stmt_session->execute([$unidade_id]);
$sessao = $stmt_session->fetch(PDO::FETCH_ASSOC);

if (!$sessao) {
    exit(json_encode(['success' => false, 'message' => 'Nenhum caixa aberto para registrar a transação.']));
}
$sessao_id = $sessao['id'];

// 3. Validações específicas
$tipos_permitidos = ['venda', 'devolucao', 'rake', 'despesa'];
if (!in_array($tipo_transacao, $tipos_permitidos) || !is_numeric($valor) || $valor <= 0) {
    exit(json_encode(['success' => false, 'message' => 'Dados da transação inválidos.']));
}

// 4. Lógica para Venda/Devolução (envolve um jogador)
$player_id = null;
if ($tipo_transacao === 'venda' || $tipo_transacao === 'devolucao') {
    $nome_jogador = $data['nome_jogador'] ?? '';
    if (empty($nome_jogador)) {
        exit(json_encode(['success' => false, 'message' => 'O nome do jogador é obrigatório.']));
    }

    // Procura ou cria o jogador
    $stmt_player = $conn->prepare("SELECT id FROM players WHERE name = ? AND unidade_id = ?");
    $stmt_player->execute([$nome_jogador, $unidade_id]);
    $player = $stmt_player->fetch(PDO::FETCH_ASSOC);

    if ($player) {
        $player_id = $player['id'];
    } else {
        // Se o jogador não existe, cria um novo
        $stmt_create_player = $conn->prepare("INSERT INTO players (unidade_id, name, cpf, telefone) VALUES (?, ?, ?, ?)");
        $stmt_create_player->execute([$unidade_id, $nome_jogador, $data['cpf'] ?? null, $data['telefone'] ?? null]);
        $player_id = $conn->lastInsertId();
    }
}

// 5. Insere a transação no banco de dados
$descricao = $data['descricao'] ?? null; // Usado para 'despesa'
$sql = "INSERT INTO transactions (cashier_session_id, player_id, type, amount, description) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);

try {
    $stmt->execute([$sessao_id, $player_id, $tipo_transacao, $valor, $descricao]);
    echo json_encode(['success' => true, 'message' => 'Transação registrada com sucesso.']);
} catch (PDOException $e) {
    error_log('Erro ao registrar transação: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erro ao registrar a transação no banco de dados.']);
}
?>