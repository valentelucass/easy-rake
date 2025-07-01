<?php
include 'db_connection.php';
// ... (cabeçalhos CORS) ...
header('Content-Type: application/json');

// Seleciona os dados principais de todos os relatórios, mais recentes primeiro
$stmt = $conn->prepare("SELECT id, generated_at, type FROM reports ORDER BY generated_at DESC");
$stmt->execute();
$reports = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['success' => true, 'reports' => $reports]);
?>