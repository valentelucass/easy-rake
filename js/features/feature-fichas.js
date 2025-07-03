/**
 * @file feature-fichas.js
 * @description Lógica de eventos da aba "Fichas".
 */
import { apiRefatorada as api } from '../core/api.js';
import { appState } from '../core/state.js';
import { dom } from '../ui/dom-elements.js';
import { uiManager } from '../ui/ui-manager.js';
import { formatCurrency } from '../core/helpers.js';
import { reportsFeature } from './feature-reports.js'; // Importa a feature de relatórios

async function handleTransaction(tipo) {
    const s = dom.fichas;
    const payload = {
        tipo: tipo,
        nome_jogador: s.playerNameInput.value,
        valor: parseFloat(s.chipValueInput.value),
        cpf: s.playerCpfInput.value,
        telefone: s.playerPhoneInput.value,
    };
    if (!payload.nome_jogador || !payload.valor) return alert("Nome e valor são obrigatórios.");

    const result = await api.registrarTransacao(payload);
    
    if (result.success) {
        if (tipo === 'venda') {
            const { userInfo } = appState.getState();
            reportsFeature.gerarComprovanteVenda({
                playerName: payload.nome_jogador,
                value: payload.valor,
                operatorName: userInfo.nome,
                unitCode: userInfo.codigo_acesso
            });
        }
        await appState.refreshState();
        uiManager.renderFichasTab(appState.getState());
        s.chipValueInput.value = '';
    } else {
        alert("Erro: " + result.message);
    }
}

async function handleViewDetails(playerId) {
    try {
        if (!playerId) {
            alert('ID do jogador não encontrado.');
            return;
        }
        const sessionId = appState.getSessionId ? appState.getSessionId() : null;
        const result = await api.getPlayerDetails({ playerId, sessionId });
        if (result && result.success) {
            const modalHTML = uiManager.buildPlayerDetailsHTML(result);
            uiManager.showModal('playerDetails', { title: `Detalhes de: ${result.details.name}`, html: modalHTML });
        } else {
            alert(result && result.message ? result.message : 'Não foi possível obter os detalhes do jogador.');
        }
    } catch (err) {
        alert('Erro ao buscar detalhes do jogador.');
    }
}

export function inicializarAbaFichas() {
    uiManager.renderFichasTab(appState.getState());

    const s = dom.fichas;
    s.btnVender.onclick = () => handleTransaction('venda');
    s.btnDevolver.onclick = () => handleTransaction('devolucao');

    s.activePlayersTbody.onclick = function(event) {
        const target = event.target;
        if (target.classList.contains('btn-ver-detalhes')) {
            handleViewDetails(target.dataset.playerId);
        }
        if (target.classList.contains('btn-quick-sell') || target.classList.contains('btn-quick-return')) {
            const playerId = target.dataset.playerId;
            const playerName = target.dataset.playerName;
            const tipo = target.classList.contains('btn-quick-sell') ? 'venda' : 'devolucao';
            uiManager.showQuickTransactionModal({
                title: tipo === 'venda' ? `Vender Fichas para: ${playerName}` : `Devolver Fichas de: ${playerName}`,
                onConfirm: async (valor) => {
                    const payload = {
                        tipo,
                        nome_jogador: playerName,
                        valor: valor
                    };
                    await api.registrarTransacao(payload);
                    await appState.refreshState();
                    uiManager.renderFichasTab(appState.getState());
                }
            });
        }
    };

    dom.modals.playerDetails.closeBtn.onclick = () => uiManager.hideModal('playerDetails');
    dom.modals.playerDetails.printBtn.onclick = () => window.print();
}