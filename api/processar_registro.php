<?php
// api/processar_registro.php
include 'db_connection.php'; // Como está na mesma pasta 'api', o caminho está correto.
header('Content-Type: application/json');

$unitName = $_POST['unitName'] ?? '';
$adminUsername = $_POST['adminUsername'] ?? '';
$adminPassword = $_POST['adminPassword'] ?? '';

if (empty($unitName) || empty($adminUsername) || empty($adminPassword)) {
    exit(json_encode(['success' => false, 'message' => 'Todos os campos são obrigatórios.']));
}

// Lógica para gerar um código de unidade único
$unitCode = null;
do {
    $unitCode = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
    $stmt = $conn->prepare("SELECT code FROM units WHERE code = ?");
    $stmt->execute([$unitCode]);
} while ($stmt->fetch());

$hashedPassword = password_hash($adminPassword, PASSWORD_DEFAULT);

$conn->beginTransaction();
try {
    $stmt1 = $conn->prepare("INSERT INTO units (code, name) VALUES (?, ?)");
    $stmt1->execute([$unitCode, $unitName]);

    $stmt2 = $conn->prepare("INSERT INTO users (username, password, unit_code, profile) VALUES (?, ?, ?, 'gestor')");
    $stmt2->execute([$adminUsername, $hashedPassword, $unitCode]);

    $conn->commit();
    echo json_encode(['success' => true, 'unitCode' => $unitCode]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(['success' => false, 'message' => 'Erro ao criar unidade: ' . $e->getMessage()]);
}
?>