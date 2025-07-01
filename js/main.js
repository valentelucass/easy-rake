// === js/main.js (VERSÃO FINAL E CORRIGIDA) ===

/**
 * Lida com a ação de logout do usuário.
 */
function handleLogout() {
    if (confirm('Você tem certeza que deseja sair?')) {
        window.location.href = 'logout.php';
    }
}

/**
 * Ponto de entrada do JavaScript. Executado quando a página carrega.
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- LÓGICA QUE RODA APENAS NA PÁGINA DE LOGIN ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        
        // 1. Conecta o envio do formulário à função de login do auth.js
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Impede o recarregamento da página
            handleLogin(); 
        });

        // 2. Lógica correta e final para os botões 'Tipo de Acesso'
        const userTypeSelector = document.getElementById('userTypeSelector');
        if (userTypeSelector) {
            const options = userTypeSelector.querySelectorAll('.user-type-option');
            const accessCodeGroup = document.getElementById('access-code-group');

            // Este é o loop correto, sem duplicação
            options.forEach(option => {
                option.addEventListener('click', () => {
                    // Remove a classe 'active' de todos os botões
                    options.forEach(btn => btn.classList.remove('active'));
                    // Adiciona a classe 'active' apenas no botão que foi clicado
                    option.classList.add('active');

                    const selectedProfile = option.dataset.profile;

                    // Garante que o elemento do código de acesso foi encontrado antes de usá-lo
                    if (accessCodeGroup) {
                        // Mostra ou esconde o campo 'Código de Acesso' com base na seleção
                        if (selectedProfile === 'sanger') {
                            accessCodeGroup.style.display = 'block';
                        } else {
                            accessCodeGroup.style.display = 'none';
                        }
                    }
                });
            });
        }
    }

    // --- LÓGICA QUE RODA APENAS NA PÁGINA DO DASHBOARD ---
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
});