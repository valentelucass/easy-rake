// === js/main.js (VERSÃO FINAL E CORRIGIDA) ===

function handleLogout() {
    if (confirm('Você tem certeza que deseja sair?')) {
        window.location.href = 'logout.php';
    }
}

document.addEventListener('DOMContentLoaded', () => {

    // --- LÓGICA QUE RODA APENAS NA PÁGINA DE LOGIN ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleLogin(); // Função do auth.js
        });

// DENTRO DO if (loginForm) { ... }
const userTypeSelector = document.getElementById('userTypeSelector');
if (userTypeSelector) {
    const options = userTypeSelector.querySelectorAll('.user-type-option');
    const loginButton = document.querySelector('.login-button');
    const usernameGroup = document.getElementById('username').parentElement;
    const passwordGroup = document.getElementById('password').parentElement;
    const sangerNameGroup = document.getElementById('sanger-name-group');

    options.forEach(option => {
        option.addEventListener('click', () => {
            options.forEach(btn => btn.classList.remove('active'));
            option.classList.add('active');
            
            const selectedProfile = option.dataset.profile;
            if (selectedProfile === 'sanger') {
                usernameGroup.style.display = 'none';
                passwordGroup.style.display = 'none';
                sangerNameGroup.style.display = 'block';
                loginButton.textContent = 'Solicitar Acesso';
            } else {
                usernameGroup.style.display = 'block';
                passwordGroup.style.display = 'block';
                sangerNameGroup.style.display = 'none';
                loginButton.textContent = 'Entrar';
            }
        });
    });
}
    }

    // --- LÓGICA QUE RODA APENAS NA PÁGINA DO DASHBOARD ---
    const appScreen = document.getElementById('app-screen');
    if (appScreen) {
        // Inicia o dashboard buscando a sessão no servidor
        loadSession(); 

        // Conecta todos os botões do dashboard às suas funções
        document.getElementById('logoutButton').addEventListener('click', handleLogout);
        document.getElementById('logoutButton-open-cashier').addEventListener('click', handleLogout);
        document.getElementById('btn-abrir-caixa').addEventListener('click', abrirCaixa);
        document.getElementById('btn-vender-fichas').addEventListener('click', venderFichas);
        document.getElementById('btn-devolver-fichas').addEventListener('click', devolverFichas);
        document.getElementById('btn-adicionar-rake').addEventListener('click', adicionarRake);
        document.getElementById('btn-adicionar-gasto').addEventListener('click', adicionarGasto);
        document.getElementById('btn-fechar-caixa').addEventListener('click', fecharCaixa);
        
        // Conecta os botões de relatório às funções do reports.js
        document.getElementById('btn-relatorio-parcial-1').addEventListener('click', gerarRelatorioParcial);
        document.getElementById('btn-relatorio-parcial-2').addEventListener('click', gerarRelatorioParcial);
        document.getElementById('btn-ver-relatorios').addEventListener('click', listarRelatorios);

        // Conecta as abas (Caixa, Aprovações)
        const tabs = document.querySelectorAll('.tabs-container .tab-button');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(item => item.classList.remove('active'));
                const tabContents = document.querySelectorAll('main .tab-content');
                tabContents.forEach(content => content.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(tab.dataset.tab + '-content').classList.add('active');
            });
        });

        // Conecta os botões de compra rápida
        const quickBuyButtons = document.querySelectorAll('.quick-buy-buttons .button');
        quickBuyButtons.forEach(button => {
            button.addEventListener('click', () => {
                const value = button.textContent.replace('R$ ', '').trim();
                document.getElementById('chipValue').value = value;
            });
        });

        // Conecta os botões de fechar dos modais
        const closeModalButton = document.getElementById('btn-close-modal');
        if (closeModalButton) {
            closeModalButton.addEventListener('click', () => {
                document.getElementById('report-modal').style.display = 'none';
            });
        }
        const closeListModalButton = document.getElementById('btn-close-list-modal');
        if (closeListModalButton) {
            closeListModalButton.addEventListener('click', () => {
                document.getElementById('reports-list-modal').style.display = 'none';
            });
        }

        const deleteAllButton = document.getElementById('btn-delete-all-reports');
        if (deleteAllButton) {
            deleteAllButton.addEventListener('click', deleteAllReports);
        }
        
        // Conecta o cálculo "ao vivo" da diferença no fechamento
        const realValueInput = document.getElementById('realValue');
        if (realValueInput) {
            realValueInput.addEventListener('input', () => {
                const expectedValue = calculateExpectedFinalAmount(caixaState);
                const realValue = parseFloat(realValueInput.value) || 0;
                const difference = realValue - expectedValue;
                
                const differenceEl = document.getElementById('closing-difference');
                const formatBRL = (value) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                
                differenceEl.textContent = formatBRL(difference);
                
                if (difference < 0) {
                    differenceEl.style.color = '#ef4444'; // Vermelho
                } else if (difference > 0) {
                    differenceEl.style.color = '#22c55e'; // Verde
                } else {
                    differenceEl.style.color = '#ffffff'; // Branco
                }
            });
        }
    }
});