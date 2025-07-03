/**
 * @file feature-aprovacoes.js
 * @description Módulo para a lógica da aba de aprovações de acesso para o gestor.
 */

import { apiRefatorada as api } from '../core/api.js';
import { uiManager } from '../ui/ui-manager.js';

// --- Mapeamento dos Elementos do DOM ---
const dom = {
    aprovacoesContent: document.getElementById('aprovacoes-content'),
};

// --- Funções de Renderização e Lógica ---

function renderizarSolicitacoes(requests) {
    uiManager.renderApprovalRequests(requests);
    const container = dom.aprovacoesContent.querySelector('.content-section');
    const list = container.querySelector('.requests-list-container');
    if (!list) return;
    list.querySelectorAll('.btn-processar').forEach(button => {
        button.addEventListener('click', handleProcessarSolicitacao);
    });
}


async function handleProcessarSolicitacao(event) {
    const { requestId, action } = event.target.dataset;

    if (!confirm(`Tem certeza que deseja ${action.toUpperCase()} esta solicitação?`)) {
        return;
    }

    const result = await api.processarAprovacao({ usuario_id: requestId, acao: action });

    if (result.success) {
        alert(result.message);
        inicializarAbaAprovacoes(); // Recarrega os dados da aba
    } else {
        alert('Erro: ' + result.message);
    }
}


/**
 * Busca as solicitações pendentes na API e dispara a renderização.
 */
export async function inicializarAbaAprovacoes() {
    const container = dom.aprovacoesContent.querySelector('.content-section');
    container.innerHTML = '<p style="text-align:center;">Carregando...</p>';

    const result = await api.getSolicitacoesPendentes();

    if (result.success) {
        renderizarSolicitacoes(result.requests);
    } else {
        container.innerHTML = `<p style="text-align:center; color:#ef4444;">Erro ao carregar solicitações: ${result.message}</p>`;
    }
}