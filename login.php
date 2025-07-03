<?php
session_start();
// Se o usuário já tem uma sessão, não deve estar na tela de login.
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
    <link rel="stylesheet" href="css/main.css">
</head>
<body class="login-page">
    <div id="login-container" class="login-container">
        <div class="login-header">
            <h1>Easy Rake</h1>
            <h2>Caixa - Cash Game</h2>
        </div>
        <form id="loginForm" class="login-form" novalidate>
            <div class="input-group">
                <label class="static-label">Tipo de Acesso</label>
                <div class="user-type-selector" id="userTypeSelector">
                    <button type="button" class="user-type-option active" data-profile="gestor">Caixa / Gestor</button>
                    <button type="button" class="user-type-option" data-profile="sanger">Sanger</button>
                </div>
            </div>
            <div id="gestor-caixa-fields">
                <div class="input-group">
                    <input type="text" id="username" class="input-field" placeholder=" " required>
                    <label for="username" class="input-label">Seu E-mail / Usuário</label>
                </div>
                <div class="input-group">
                    <input type="password" id="password" class="input-field" placeholder=" " required>
                    <label for="password" class="input-label">Senha</label>
                </div>
            </div>
            <div id="sanger-fields" style="display: none;">
                <div class="input-group">
                    <input type="text" id="sangerName" class="input-field" placeholder=" ">
                    <label for="sangerName" class="input-label">Seu Nome</label>
                </div>
                <div class="input-group">
                    <input type="text" id="codigo_acesso_sanger" class="input-field" placeholder=" ">
                    <label for="codigo_acesso_sanger" class="input-label">Código de Acesso da Unidade</label>
                </div>
            </div>
            <button type="submit" id="main-action-button" class="button button--primary">Entrar</button>
            <div class="login-footer">
                <a id="footer-link" href="registro.php">Não tenho acesso. Cadastrar-se.</a>
            </div>
        </form>
    </div>

    <script type="module" src="js/features/auth.js"></script>
</body>
</html>