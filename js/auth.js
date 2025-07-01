/**
 * Lida com o envio do formulário de login, coletando os dados
 * e enviando para a API correta.
 */
function handleLogin() {
    const form = document.getElementById('loginForm');
    // Usamos 'username' como o ID do campo de email/usuário, conforme seu HTML.
    const emailOuUsernameInput = document.getElementById('username'); 
    const passwordInput = document.getElementById('password');
    const codigoAcessoInput = document.getElementById('codigo_acesso');

    const selectedProfileBtn = document.querySelector('.user-type-option.active');
    if (!selectedProfileBtn) {
        alert('Por favor, selecione um tipo de acesso.');
        return;
    }
    const profileType = selectedProfileBtn.dataset.profile;

    // Monta o corpo da requisição
    const data = {
        email: emailOuUsernameInput.value,
        password: passwordInput.value
    };

    // Adiciona o código de acesso apenas se o perfil for Sanger
    if (profileType === 'sanger') {
        data.codigo_acesso = codigoAcessoInput.value;
    }

    fetch('api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            // Se a API confirmar o login, redireciona para o dashboard
            window.location.href = 'dashboard.php';
        } else {
            // Exibe a mensagem de erro específica vinda da API
            alert(result.message || 'Dados inválidos.');
        }
    })
    .catch(error => {
        console.error('Erro na requisição de login:', error);
        alert('Ocorreu um erro de comunicação. Verifique sua conexão e tente novamente.');
    });
}