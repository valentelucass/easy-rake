// === js/auth.js (VERSÃO COM FLUXO DE SANGER) ===

function handleLogin() {
    const selectedProfile = document.querySelector('.user-type-option.active').dataset.profile;

    if (selectedProfile === 'sanger') {
        handleSangerRequest();
    } else {
        handleGestorCaixaLogin();
    }
}

function handleGestorCaixaLogin() {
    const form = document.getElementById('loginForm');
    const formData = new FormData(form);
    const selectedProfile = document.querySelector('.user-type-option.active').dataset.profile;
    formData.append('profile', selectedProfile);

    fetch('api/login.php', { method: 'POST', body: formData })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = 'dashboard.php';
        } else {
            alert(data.message || 'Dados inválidos.');
        }
    })
    .catch(error => console.error('Erro no login:', error));
}

function handleSangerRequest() {
    const sangerName = document.getElementById('sangerName').value;
    const unitCode = document.getElementById('unitCode').value;

    if (!sangerName || !unitCode) {
        alert("Por favor, preencha seu nome e o código da unidade.");
        return;
    }

    fetch('api/solicitar_acesso.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sangerName, unitCode })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Solicitação enviada! Aguardando aprovação do gestor.");
            // Futuramente, aqui entraria a lógica de espera (polling)
        } else {
            alert("Erro ao enviar solicitação: " + data.message);
        }
    });
}