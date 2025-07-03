<?php
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
    <title>Easy Rake - Cadastre sua Unidade</title>
    <link rel="stylesheet" href="css/main.css">
</head>
<body class="login-page">
    <div id="login-container" class="login-container">
        <div class="login-header">
            <h1>Crie sua Unidade</h1>
            <h2>Easy Rake</h2>
        </div>
        <form id="registerGestorForm">
            <div class="input-group">
                <input type="text" id="unitName" name="nome_unidade" class="input-field" placeholder=" " required>
                <label for="unitName" class="input-label">Nome da sua Unidade/Clube</label>
            </div>
            <div class="input-group">
                <input type="email" id="adminEmail" name="email_gestor" class="input-field" placeholder=" " required>
                <label for="adminEmail" class="input-label">Seu E-mail (será seu login)</label>
            </div>
            <div class="input-group">
                <input type="password" id="adminPassword" name="senha_gestor" class="input-field" placeholder=" " required>
                <label for="adminPassword" class="input-label">Sua Senha</label>
            </div>
            <button type="submit" class="button button--primary">Criar Unidade e Cadastrar</button>
            <div class="login-footer">
                <a href="login.php">Já tenho uma conta</a>
            </div>
        </form>
    </div>
    
    <script type="module" src="js/features/feature-registro.js"></script>
</body>
</html>