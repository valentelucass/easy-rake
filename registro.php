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
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/login.css">
    <link rel="stylesheet" href="css/mobile.css">
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
            <button type="submit" class="login-button">Criar Unidade e Cadastrar</button>
            <div class="login-footer">
                <a href="login.php">Já tenho uma conta</a>
            </div>
        </form>
    </div>
    
    <script>
    document.getElementById('registerGestorForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        // Usaremos a API de registrar_unidade.php
        fetch('api/registrar_unidade.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(Object.fromEntries(formData))
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('login-container').innerHTML = `
                    <div class="login-header">
                        <h1>Unidade Criada!</h1>
                        <h2>Bem-vindo ao Easy Rake</h2>
                    </div>
                    <div style="text-align:center; color:#ccc;">
                        <p>Sua unidade foi criada. Abaixo está a chave para seus operadores.</p>
                        <p style="margin-top:1rem;">Código de Acesso da Unidade:</p>
                        <p style="font-size: 2rem; color: #e51e3e; font-weight: bold; margin:0;">${data.codigo_acesso}</p>
                        <p style="font-size: 0.8rem; color: #888;">(Guarde este código)</p>
                        <a href="login.php" class="button login-button" style="margin-top: 2rem; text-decoration:none; display:inline-block; line-height:1.5;">Ir para o Login</a>
                    </div>`;
            } else {
                alert('Erro: ' + (data.message || 'Não foi possível criar a unidade.'));
            }
        });
    });
    </script>
</body>
</html>