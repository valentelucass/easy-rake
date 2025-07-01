<?php
include 'db_connection.php';
// ... (cabeçalhos CORS) ...
header('Content-Type: application/json');

// TRUNCATE TABLE é mais eficiente que DELETE para limpar uma tabela inteira.
// CUIDADO: Esta ação é irreversível.
$stmt = $conn->prepare("TRUNCATE TABLE reports");

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Todos os relatórios foram apagados.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Falha ao apagar os relatórios.']);
}
?>