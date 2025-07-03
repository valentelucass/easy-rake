/**
 * @file feature-caixa.js
 * @description Contém a lógica de eventos para a aba "Caixa".
 */
import { apiRefatorada as api } from '../core/api.js';
import { appState } from '../core/state.js';
import { dom } from '../ui/dom-elements.js';
import { uiManager } from '../ui/ui-manager.js';
import { reportsFeature } from './feature-reports.js';
import { renderizarCaixinhas, adicionarNovaCaixinha } from './feature-caixinhas.js';
import { formatCurrency } from '../core/helpers.js';

async function handleAddRake() {
    const s = dom.caixa;
    const valor = parseFloat(s.rakeValueInput.value);
    if (!valor || valor <= 0) return alert("O valor do Rake é obrigatório.");

    await api.registrarTransacao({ tipo: 'rake', valor });
    s.rakeValueInput.value = '';
    await appState.refreshState();
    uiManager.renderCaixaTab(appState.getState());
}

async function handleAddExpense() {
    const s = dom.caixa;
    const valor = parseFloat(s.expenseValueInput.value);
    const descricao = s.expenseDescInput.value;
    if (!descricao || !valor || valor <= 0) return alert("Descrição e valor são obrigatórios.");
    
    await api.registrarTransacao({ tipo: 'despesa', valor, descricao });
    s.expenseValueInput.value = '';
    s.expenseDescInput.value = '';
    await appState.refreshState();
    uiManager.renderCaixaTab(appState.getState());
}

function handleCloseBox() {
    const valorReal = parseFloat(dom.caixa.realValueInput.value);
    reportsFeature.fecharCaixa(valorReal);
}

export function inicializarAbaCaixa() {
    // 1. Renderiza a UI inicial da aba usando o manager
    uiManager.renderCaixaTab(appState.getState());
    
    // 2. Inicializa a sub-feature de caixinhas
    renderizarCaixinhas();

    // 3. Adiciona os listeners de eventos
    const s = dom.caixa;
    s.btnAddRake.onclick = handleAddRake;
    s.btnAddGasto.onclick = handleAddExpense;
    s.btnFecharCaixa.onclick = handleCloseBox;

    // Ações de relatório são delegadas para a feature de relatórios
    s.btnRelatorioParcial.onclick = () => reportsFeature.gerarRelatorioParcial();
    s.btnComprovanteRake.onclick = () => reportsFeature.gerarComprovanteRake();

    // Listener para o botão de adicionar caixinha
    dom.caixinhas.btnAdd.onclick = async () => {
        await adicionarNovaCaixinha();
        uiManager.renderCaixaTab(appState.getState());
        renderizarCaixinhas(); // Re-inicializa os eventos das caixinhas
    };

    // Listener para o campo de valor real (este pode ficar aqui por ser simples)
    s.realValueInput.addEventListener('input', () => {
        const expectedValueText = s.expectedValueInput.value;
        const valorEsperado = parseFloat(expectedValueText.replace(/[R$\s.]/g, '').replace(',', '.'));
        const realValue = parseFloat(s.realValueInput.value) || 0;
        const diff = realValue - valorEsperado;
        s.closingDifference.textContent = formatCurrency(diff);
        s.closingDifference.style.color = diff < 0 ? '#ef4444' : (diff > 0 ? '#22c55e' : 'white');
    });
}