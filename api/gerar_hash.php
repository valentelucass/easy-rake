<?php
header("Access-Control-Allow-Origin: *"); // Permite que qualquer origem acesse a API
header("Access-Control-Allow-Methods: POST, GET, OPTIONS"); // Define os métodos permitidos
header("Access-Control-Allow-Headers: Content-Type"); // Define os cabeçalhos permitidos
// api/gerar_hash.php
$senha_para_converter = '123456';
$hash = password_hash($senha_para_converter, PASSWORD_DEFAULT);
echo "Senha: " . $senha_para_converter . "<br>";
echo "Hash Gerado: " . $hash;
?>