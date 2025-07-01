<?php
// === login.php (VERSÃO FINAL E CORRETA) ===
session_start();
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
                <label for="username" class="input-label">Nome de Usuário</label>
            </div>
            <div class="input-group">
                <input type="password" id="password" name="password" class="input-field" placeholder=" " required>
                <label for="password" class="input-label">Senha</label>
            </div>
            <div class="input-group">
                <input type="text" id="unitCode" name="unitCode" class="input-field" placeholder=" " required>
                <label for="unitCode" class="input-label">Código da Unidade</label>
            </div>
            <div class="input-group">
                <label class="static-label">Tipo de Usuário</label>
                <div class="user-type-selector" id="userTypeSelector">
                    <button type="button" class="user-type-option" data-profile="caixa">Caixa</button>
                    <button type="button" class="user-type-option active" data-profile="gestor">Gestor</button>
                    <button type="button" class="user-type-option" data-profile="sanger">Sanger</button>
                </div>
            </div>
            <div class="input-group" id="sanger-name-group" style="display: none;">
    <input type="text" id="sangerName" name="sangerName" class="input-field" placeholder=" ">
    <label for="sangerName" class="input-label">Seu Nome</label>
</div>
            <button type="submit" class="login-button">Entrar</button>
            <div class="login-footer"><a href="registro.php">Não tenho acesso. Cadastrar-se.</a></div>
        </form>
    </div>
    
    <script src="js/auth.js"></script>
    <script src="js/main.js"></script>
</body>
</html>