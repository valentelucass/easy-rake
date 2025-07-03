/**
 * @file feature-caixinhas.js
 * @description Módulo dedicado para toda a lógica de negócio e manipulação do DOM
 * relacionada à funcionalidade de "Caixinhas" na aba Caixa.
 */

import { apiRefatorada as api } from '../core/api.js';
import { appState } from '../core/state.js';
import { formatCurrency } from '../core/helpers.js';

// --- Mapeamento dos Elementos do DOM ---
const dom = {
    caixinhasWrapper: document.getElementById('caixinhas-wrapper'),
    btnAddCaixinha: document.getElementById('btn-add-caixinha')
};

// --- Funções de Lógica e Eventos ---

/**
 * Recalcula todos os valores de um card de caixinha com base nos inputs do usuário.
 * @param {HTMLElement} card - O elemento do card da caixinha a ser recalculado.
 */
function recalcularCaixinha(card) {
    const valorBase = parseFloat(card.querySelector('.output-valor-total').getAttribute('data-base-value') || 0);
    let novasEntradas = 0;
    card.querySelectorAll('.caixinha-entries li').forEach(item => {
        novasEntradas += parseFloat(item.textContent.replace(/[R$\s.]/g, '').replace(',', '.'));
    });

    const novoTotalBruto = valorBase + novasEntradas;
    card.querySelector('.output-valor-total').value = formatCurrency(novoTotalBruto);

    const cashbackPercent = parseFloat(card.querySelector('.input-cashback').value) || 0;
    const valorCashback = novoTotalBruto * (cashbackPercent / 100);
    card.querySelector('.valor-cashback-display strong').textContent = formatCurrency(valorCashback);

    const valorLiquido = novoTotalBruto - valorCashback;
    card.querySelector('.output-valor-liquido').value = formatCurrency(valorLiquido);

    const participantes = parseInt(card.querySelector('.input-participantes').value) || 1;
    card.querySelector('.output-valor-final').textContent = formatCurrency(participantes > 0 ? valorLiquido / participantes : 0);
}


/**
 * Salva o estado atual de uma caixinha no backend.
 * @param {HTMLElement} card - O elemento do card da caixinha a ser salvo.
 */
async function salvarCaixinha(card) {
    const payload = {
        id: card.dataset.id,
        nome_caixinha: card.querySelector('.input-nome-caixinha').value,
        valor_atual: parseFloat(card.querySelector('.output-valor-total').value.replace(/[R$\s.]/g, '').replace(',', '.')),
        cashback_percent: parseFloat(card.querySelector('.input-cashback').value) || 0,
        participantes: parseInt(card.querySelector('.input-participantes').value) || 1
    };
    await api.salvarCaixinha(payload);
}

/**
 * Vincula todos os eventos necessários para um card de caixinha.
 * @param {HTMLElement} card - O elemento do card da caixinha.
 */
function vincularEventosCaixinha(card) {
    card.querySelector('.caixinha-header').addEventListener('click', e => {
        if (e.target.tagName !== 'INPUT') card.classList.toggle('collapsed');
    });

    card.querySelector('.btn-inserir-valor').addEventListener('click', () => {
        const valorEntradaInput = card.querySelector('.caixinha-valor-entrada');
        const valor = parseFloat(valorEntradaInput.value);
        if (!isNaN(valor) && valor > 0) {
            card.querySelector('.caixinha-entries').insertAdjacentHTML('beforeend', `<li>${formatCurrency(valor)}</li>`);
            valorEntradaInput.value = '';
            recalcularCaixinha(card);
            salvarCaixinha(card);
        }
    });

    card.querySelector('.input-nome-caixinha').addEventListener('blur', () => salvarCaixinha(card));
    card.querySelector('.input-cashback').addEventListener('input', () => { recalcularCaixinha(card); salvarCaixinha(card); });
    card.querySelector('.input-participantes').addEventListener('input', () => { recalcularCaixinha(card); salvarCaixinha(card); });
}

/**
 * Renderiza o HTML inicial para um card de caixinha.
 * @param {object} caixinhaData - Os dados da caixinha vindos do estado.
 * @returns {string} O template HTML do card.
 */
function criarTemplateCaixinha(c) {
    return `
    <div id="caixinha-${c.id}" class="caixinha-card collapsed" data-id="${c.id}">
        <div class="caixinha-header">
            <input type="text" class="input-nome-caixinha" value="${c.nome_caixinha || ''}" placeholder="Nome da Caixinha">
            <span class="caixinha-toggle-icon">▼</span>
        </div>
        <div class="caixinha-body">
             <div class="caixinha-grid">
                 <div class="caixinha-input-group"><label>Valor a Inserir</label><input type="number" placeholder="0,00" class="caixinha-valor-entrada"></div>
                 <div style="align-self: end;"><button class="button button--outline btn-inserir-valor">Inserir Valor</button></div>
             </div>
             <ul class="caixinha-entries"></ul><hr>
             <div class="caixinha-grid">
                 <div class="caixinha-input-group"><label>Valor Total Bruto</label><input type="text" value="${formatCurrency(c.valor_atual)}" class="output-valor-total" data-base-value="${c.valor_atual}" disabled></div>
                 <div class="caixinha-input-group"><label>% Cashback Rake</label><input type="number" value="${c.cashback_percent}" min="0" class="input-cashback"></div>
                 <div class="caixinha-input-group"><label>Valor Líquido</label><input type="text" value="R$ 0,00" class="output-valor-liquido" disabled></div>
                 <div class="caixinha-input-group"><label>Nº de Participantes</label><input type="number" value="${c.participantes}" min="1" class="input-participantes"></div>
             </div>
             <div class="valor-cashback-display">Cashback (Receita): <strong>R$ 0,00</strong></div>
             <div class="caixinha-input-group" style="text-align:center; margin-top:1rem;">
                <label>VALOR FINAL P/ PARTICIPANTE</label>
                <span class="caixinha-summary-value output-valor-final">R$ 0,00</span>
             </div>
        </div>
    </div>`;
}

// --- Funções Públicas (Exportadas) ---

/**
 * Renderiza todos os cards de caixinhas na tela.
 */
export function renderizarCaixinhas() {
    const { tipJar } = appState.getState();
    if (!dom.caixinhasWrapper) return;
    dom.caixinhasWrapper.innerHTML = '';
    if (!tipJar || tipJar.length === 0) {
        dom.caixinhasWrapper.innerHTML = '<p style="color:#a0a0a0;text-align:center;width:100%;">Nenhuma caixinha criada.</p>';
        return;
    }
    tipJar.forEach(c => {
        dom.caixinhasWrapper.insertAdjacentHTML('beforeend', criarTemplateCaixinha(c));
        const card = document.getElementById(`caixinha-${c.id}`);
        vincularEventosCaixinha(card);
        recalcularCaixinha(card);
    });
}

/**
 * Adiciona uma nova caixinha no backend e atualiza a interface.
 */
export async function adicionarNovaCaixinha() {
    const result = await api.adicionarCaixinha({ nome_caixinha: 'Nova Caixinha' });
    if (result.success) {
        await appState.refreshState();
    } else {
        alert('Erro ao criar nova caixinha: ' + result.message);
    }
}

/**
 * Calcula o valor total de cashback de todas as caixinhas na interface.
 * @returns {number} O valor total de cashback.
 */
export function getTotalCashbackFromUI() {
    let totalCashback = 0;
    document.querySelectorAll('.caixinha-card .valor-cashback-display strong').forEach(el => {
        totalCashback += parseFloat(el.textContent.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
    });
    return totalCashback;
}