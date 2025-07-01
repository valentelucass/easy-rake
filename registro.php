<?php
// registro.php
session_start();
// Se o usuário já estiver logado, não faz sentido ele se cadastrar.
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
        <form id="registerForm">
            <div class="input-group">
                <input type="text" id="unitName" name="unitName" class="input-field" placeholder=" " required>
                <label for="unitName" class="input-label">Nome da sua Unidade/Clube</label>
            </div>
            <div class="input-group">
                <input type="text" id="adminUsername" name="adminUsername" class="input-field" placeholder=" " required>
                <label for="adminUsername" class="input-label">Seu Nome de Usuário (Gestor)</label>
            </div>
            <div class="input-group">
                <input type="password" id="adminPassword" name="adminPassword" class="input-field" placeholder=" " required>
                <label for="adminPassword" class="input-label">Sua Senha</label>
            </div>
            <button type="submit" class="login-button">Criar Unidade e Cadastrar</button>
            <div class="login-footer">
                <a href="login.php">Já tenho uma conta</a>
            </div>
        </form>
    </div>
    
    <script>
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        // Pegamos os dados para usar na tela de sucesso
        const unitName = formData.get('unitName');
        const adminUsername = formData.get('adminUsername');
        
        const registerButton = this.querySelector('button[type="submit"]');
        registerButton.disabled = true;
        registerButton.textContent = 'Processando...';

        fetch('api/processar_registro.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // SUCESSO! Em vez de um alerta, transformamos a tela.
                const loginContainer = document.getElementById('login-container');
                loginContainer.innerHTML = `
                    <div class="login-header">
                        <h1>Unidade Criada!</h1>
                        <h2>Bem-vindo ao Easy Rake</h2>
                    </div>
                    <div class="success-info">
                        <p>Sua unidade <strong>${unitName}</strong> foi criada com sucesso. Abaixo estão seus dados de acesso principal.</p>
                        <div class="access-details">
                            <div><span>Seu Usuário (Gestor):</span><strong>${adminUsername}</strong></div>
                            <div><span>Código da sua Unidade:</span><strong class="unit-code">${data.unitCode}</strong></div>
                        </div>
                        <p class="important-note">Guarde o <strong>Código da Unidade</strong>. Ele é a chave para que seus operadores (Caixa e Sanger) possam se conectar ao seu clube.</p>
                    </div>
                    <a href="login.php" class="button login-button mt-4">Ir para o Login</a>
                `;
                // Adicionamos um pouco de estilo para a nova tela
                const style = document.createElement('style');
                style.innerHTML = `
                    .success-info { text-align: center; color: #ccc; }
                    .access-details { background-color: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 1rem; margin: 1.5rem 0; }
                    .access-details div { display: flex; justify-content: space-between; padding: 0.5rem 0; }
                    .access-details .unit-code { font-size: 1.5rem; color: #e51e3e; }
                    .important-note { font-size: 0.9rem; color: #a0a0a0; }
                    .login-button.mt-4 { margin-top: 1.5rem; text-decoration: none; display: inline-block; line-height: 1.5; }
                `;
                document.head.appendChild(style);
            } else {
                alert('Erro: ' + data.message);
                registerButton.disabled = false;
                registerButton.textContent = 'Criar Unidade e Cadastrar';
            }
        });
    });
</script>
</body>
</html>