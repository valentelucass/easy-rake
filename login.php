<?php
// === login.php (VERSÃO FINAL E COMPLETA) ===
session_start();
// Se o usuário já está logado, redireciona para o dashboard
if (isset($_SESSION['user_id'])) {
    header('Location: dashboard.php');
    exit();
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Easy Rake - Login</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/login.css">
    <link rel="stylesheet" href="css/mobile.css">
</head>
<body class="login-page">
    <div id="login-container" class="login-container">
        <div class="login-header">
            <h1>Easy Rake</h1>
            <h2>Caixa - Cash Game</h2>
        </div>

        <form id="loginForm" class="login-form">
            <div class="input-group">
                <input type="text" id="username" name="username" class="input-field" placeholder=" " required>
                <label for="username" class="input-label">Seu E-mail / Usuário</label>
            </div>

            <div class="input-group">
                <input type="password" id="password" name="password" class="input-field" placeholder=" " required>
                <label for="password" class="input-label">Senha</label>
            </div>

            <div class="input-group">
                <label class="static-label">Tipo de Acesso</label>
                <div class="user-type-selector" id="userTypeSelector">
                    <button type="button" class="user-type-option active" data-profile="gestor">Caixa / Gestor</button>
                    <button type="button" class="user-type-option" data-profile="sanger">Sanger</button>
                </div>
            </div>

            <div class="input-group" id="access-code-group" style="display: none;">
                <input type="text" id="codigo_acesso" name="codigo_acesso" class="input-field" placeholder=" ">
                <label for="codigo_acesso" class="input-label">Código de Acesso</label>
            </div>

            <button type="submit" class="login-button">Entrar</button>
            <div class="login-footer"><a href="registro.php">Não tenho acesso. Cadastrar-se.</a></div>
        </form>
    </div>
    
    <script src="js/auth.js"></script>
    <script src="js/main.js"></script>
</body>
</html>