/**
 * @file auth.js
 * @description Contém toda a lógica de autenticação e eventos da tela de login.
 * Este módulo é o único controlador da página login.php.
 */

// Importa o 'api' para se comunicar com o backend de forma centralizada.
import { apiRefatorada as api } from '../core/api.js';

// Mapeia todos os elementos da página de login para evitar repetição.
const dom = {
    loginForm: document.getElementById('loginForm'),
    userTypeSelector: document.getElementById('userTypeSelector'),
    gestorCaixaFields: document.getElementById('gestor-caixa-fields'),
    sangerFields: document.getElementById('sanger-fields'),
    mainActionButton: document.getElementById('main-action-button'),
    footerLink: document.getElementById('footer-link'),
    usernameInput: document.getElementById('username'),
    passwordInput: document.getElementById('password'),
    sangerNameInput: document.getElementById('sangerName'),
    sangerCodeInput: document.getElementById('codigo_acesso_sanger'),
    loginContainer: document.getElementById('login-container')
};

/**
 * Tenta realizar o login do Gestor ou Caixa.
 */
async function handleLogin() {
    const credentials = {
        email: dom.usernameInput.value,
        password: dom.passwordInput.value
    };
    if (!credentials.email || !credentials.password) {
        return alert('E-mail/Usuário e senha são obrigatórios.');
    }
    const result = await api.login(credentials);
    if (result.success) {
        window.location.href = 'dashboard.php';
    } else {
        alert(result.message || 'Credenciais inválidas.');
    }
}

/**
 * Envia uma solicitação de acesso para o perfil Sanger.
 */
async function handleSangerRequest() {
    const sangerData = {
        username: dom.sangerNameInput.value, // Corrigido para corresponder ao backend
        password: 'sanger_password', // O backend pode exigir uma senha, mesmo que temporária
        codigo_acesso: dom.sangerCodeInput.value
    };
    if (!sangerData.username || !sangerData.codigo_acesso) {
        return alert("Preencha seu nome e o código de acesso da unidade.");
    }
    // Supondo que a API correta seja 'registrar_sanger.php'
    const result = await api.registrarSanger(sangerData);
    if (result.success) {
        dom.loginContainer.innerHTML = `
            <div class="login-header"><h1>Solicitação Enviada!</h1></div>
            <div style="text-align: center; color: #ccc;">
                <p>Aguarde a aprovação do gestor.</p>
                <a href="login.php" class="button login-button mt-4" style="text-decoration:none;">OK</a>
            </div>`;
    } else {
        alert(result.message || 'Não foi possível enviar a solicitação.');
    }
}

/**
 * Alterna a visibilidade dos campos do formulário.
 */
function switchForm(profile) {
    const isSanger = profile === 'sanger';
    dom.gestorCaixaFields.style.display = isSanger ? 'none' : 'block';
    dom.sangerFields.style.display = isSanger ? 'block' : 'none';
    dom.gestorCaixaFields.querySelectorAll('input').forEach(i => i.required = !isSanger);
    dom.sangerFields.querySelectorAll('input').forEach(i => i.required = isSanger);
    dom.mainActionButton.textContent = isSanger ? 'Solicitar Acesso' : 'Entrar';
    dom.footerLink.style.display = isSanger ? 'none' : 'block';
}

/**
 * Ponto de entrada: Inicializa todos os eventos da página.
 */
function initializeLogin() {
    // Garante que o código só execute se os elementos existirem.
    if (!dom.loginForm) return;

    dom.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const selectedProfile = dom.userTypeSelector.querySelector('.active').dataset.profile;
        if (selectedProfile === 'sanger') {
            handleSangerRequest();
        } else {
            handleLogin();
        }
    });

    dom.userTypeSelector.querySelectorAll('.user-type-option').forEach(option => {
        option.addEventListener('click', () => {
            dom.userTypeSelector.querySelector('.active').classList.remove('active');
            option.classList.add('active');
            switchForm(option.dataset.profile);
        });
    });
}

// Inicia a lógica da página de login assim que o HTML estiver pronto.
document.addEventListener('DOMContentLoaded', initializeLogin);