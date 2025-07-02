function handleFormSubmit() {
    const selectedProfileBtn = document.querySelector('.user-type-option.active');
    const profileType = selectedProfileBtn ? selectedProfileBtn.dataset.profile : null;
    if (profileType === 'sanger') {
        submitSangerRequest();
    } else {
        submitLogin();
    }
}
function submitLogin() {
    const data = {
        email: document.getElementById('username').value,
        password: document.getElementById('password').value
    };
    fetch('api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            window.location.href = 'dashboard.php';
        } else {
            alert(result.message || 'Dados inválidos.');
        }
    })
    .catch(error => console.error('Erro na requisição de login:', error));
}
function submitSangerRequest() {
    const data = {
        sangerName: document.getElementById('sangerName').value,
        unitCode: document.getElementById('codigo_acesso_sanger').value
    };
    if (!data.sangerName || !data.unitCode) {
        alert("Por favor, preencha seu nome e o código de acesso da unidade.");
        return;
    }
    fetch('api/solicitar_acesso.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            document.getElementById('login-container').innerHTML = `
                <div class="login-header"><h1>Solicitação Enviada!</h1></div>
                <div style="text-align: center; color: #ccc;">
                    <p>Aguarde a aprovação do gestor. Após aprovado, ele irá criar seu usuário e senha para login.</p>
                    <a href="login.php" class="button login-button mt-4" style="text-decoration:none;">OK</a>
                </div>
            `;
        } else {
            alert(result.message || 'Não foi possível enviar a solicitação.');
        }
    })
    .catch(error => console.error('Erro na requisição do sanger:', error));
}