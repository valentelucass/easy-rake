/**
 * @file dashboard.js
 * @description Ponto de entrada e orquestrador principal do dashboard.
 */
import { appState } from '../core/state.js';
import { apiRefatorada as api } from '../core/api.js';
import { dom } from '../ui/dom-elements.js'; // Única fonte da verdade para o DOM
import { uiManager } from '../ui/ui-manager.js';

import { inicializarAbaCaixa } from './feature-caixa.js';
import { inicializarAbaFichas } from './feature-fichas.js';
import { inicializarAbaAprovacoes } from './feature-aprovacoes.js';

function handleLogout() {
    if (confirm('Você tem certeza que deseja sair?')) {
        window.location.href = 'logout.php';
    }
}

async function handleOpenBox() {
    const valorInicial = parseFloat(dom.initialCashValueInput.value);
    if (isNaN(valorInicial) || valorInicial < 0) {
        return alert('Por favor, insira um valor inicial válido.');
    }
    const result = await api.abrirCaixa(valorInicial);
    if (result.success) {
        window.location.reload();
    } else {
        alert('Erro ao abrir o caixa: ' + result.message);
    }
}

function selecionarAba(nomeAba) {
    uiManager.showTab(nomeAba);
    // Inicializa a lógica da feature correspondente à aba selecionada
    if (nomeAba === 'caixa') inicializarAbaCaixa();
    if (nomeAba === 'fichas') inicializarAbaFichas();
    if (nomeAba === 'aprovacoes') inicializarAbaAprovacoes();
}

async function inicializarDashboard() {
    const sucesso = await appState.initializeDashboardState();
    if (!sucesso) {
        window.location.href = 'login.php';
        return;
    }

    const { userInfo, cashierSession } = appState.getState();
    uiManager.renderHeader(userInfo);
    dom.logoutBtnOpen.addEventListener('click', handleLogout);
    dom.headerLogoutButton.addEventListener('click', handleLogout);
    
    // LINHA ADICIONADA PARA CORRIGIR A SETA 'VOLTAR'
    dom.backToOpenScreenBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.reload(); 
    });

    if (!cashierSession) {
        uiManager.showScreen('openCashier');
        dom.btnAbrirCaixa.addEventListener('click', handleOpenBox);
    } else {
        uiManager.showScreen('app');
        const abaInicial = uiManager.renderTabs(userInfo.perfil);
        dom.tabsContainer.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', () => selecionarAba(btn.dataset.tab));
        });
        selecionarAba(abaInicial);
    }
}

document.addEventListener('DOMContentLoaded', inicializarDashboard);