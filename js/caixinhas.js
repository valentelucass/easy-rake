// === js/caixinhas.js (VERSÃO FINAL COM LÓGICA DE NEGÓCIOS) ===

/**
 * Adiciona um novo card de caixinha à tela, com nome editável.
 */
function adicionarNovaCaixinha() {
    const container = document.getElementById('caixinhas-wrapper');
    if (!container) return;

    const cardId = 'caixinha-' + Date.now();
    const cardTemplate = `
        <div id="${cardId}" class="caixinha-card collapsed">
            <div class="caixinha-header">
                <input type="text" class="input-nome-caixinha" value="Nova Caixinha" placeholder="Nome da Caixinha">
                <span class="caixinha-toggle-icon">▼</span>
            </div>
            <div class="caixinha-body">
                 <div class="caixinha-grid">
                     <div class="caixinha-input-group">
                         <label>Valor a Inserir</label>
                         <input type="number" placeholder="0,00" class="caixinha-valor-entrada">
                     </div>
                     <div style="align-self: end;">
                         <button class="button secondary-outline btn-inserir-valor">Inserir Valor</button>
                     </div>
                 </div>
                 <ul class="caixinha-entries"></ul><hr>
                 <div class="caixinha-grid">
                     <div class="caixinha-input-group"><label>Valor Total Bruto</label><input type="text" value="R$ 0,00" class="output-valor-total" disabled></div>
                     <div class="caixinha-input-group"><label>% Cashback Rake</label><input type="number" value="0" class="input-cashback"></div>
                     <div class="caixinha-input-group"><label>Valor Líquido da Caixinha</label><input type="text" value="R$ 0,00" class="output-valor-liquido" disabled></div>
                     <div class="caixinha-input-group"><label>Nº de Participantes</label><input type="number" value="1" min="1" class="input-participantes"></div>
                 </div>
                 <div class="valor-cashback-display">Valor do Cashback (Receita): <strong>R$ 0,00</strong></div>
                 <div class="caixinha-input-group" style="text-align:center; margin-top:1rem;">
                    <label>VALOR FINAL POR PARTICIPANTE</label>
                    <span class="caixinha-summary-value output-valor-final">R$ 0,00</span>
                 </div>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('afterbegin', cardTemplate);
    const novoCard = document.getElementById(cardId);
    vincularEventosCaixinha(novoCard);
    novoCard.classList.remove('collapsed');
    novoCard.querySelector('.input-nome-caixinha').select();
}

/**
 * Vincula todos os eventos de interatividade e cálculo a um card de caixinha.
 */
function vincularEventosCaixinha(card) {
    const header = card.querySelector('.caixinha-header');
    const nomeInput = card.querySelector('.input-nome-caixinha');
    const inserirValorBtn = card.querySelector('.btn-inserir-valor');
    const valorEntradaInput = card.querySelector('.caixinha-valor-entrada');
    const cashbackInput = card.querySelector('.input-cashback');
    const participantesInput = card.querySelector('.input-participantes');

    if (header) {
        header.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT') card.classList.toggle('collapsed');
        });
    }
    if (nomeInput) {
        nomeInput.addEventListener('keydown', e => { if (e.key === 'Enter') e.target.blur(); });
    }
    if (inserirValorBtn) {
        inserirValorBtn.addEventListener('click', () => {
            const valor = parseFloat(valorEntradaInput.value);
            if (!isNaN(valor) && valor > 0) {
                const entriesList = card.querySelector('.caixinha-entries');
                const newEntry = document.createElement('li');
                newEntry.textContent = formatCurrency(valor);
                entriesList.appendChild(newEntry);
                valorEntradaInput.value = '';
                recalcularCaixinha(card);
            }
        });
    }
    if (cashbackInput) cashbackInput.addEventListener('input', () => recalcularCaixinha(card));
    if (participantesInput) participantesInput.addEventListener('input', () => recalcularCaixinha(card));
}

/**
 * Executa todas as fórmulas de cálculo para uma caixinha e atualiza a UI.
 */
function recalcularCaixinha(card) {
    const entriesList = card.querySelector('.caixinha-entries');
    const valorTotalOutput = card.querySelector('.output-valor-total');
    const cashbackInput = card.querySelector('.input-cashback');
    const participantesInput = card.querySelector('.input-participantes');
    const valorLiquidoOutput = card.querySelector('.output-valor-liquido');
    const valorFinalOutput = card.querySelector('.output-valor-final');
    const cashbackDisplay = card.querySelector('.valor-cashback-display strong');

    // 1. Calcular Valor Total Bruto
    let valorTotalBruto = 0;
    entriesList.querySelectorAll('li').forEach(item => {
        const valorNumerico = parseFloat(item.textContent.replace(/[R$\s.]/g, '').replace(',', '.'));
        if (!isNaN(valorNumerico)) valorTotalBruto += valorNumerico;
    });
    valorTotalOutput.value = formatCurrency(valorTotalBruto);

    // 2. Calcular Valor do Cashback Rake
    const cashbackPercent = parseFloat(cashbackInput.value) || 0;
    const valorCashback = valorTotalBruto * (cashbackPercent / 100);
    if(cashbackDisplay) cashbackDisplay.textContent = formatCurrency(valorCashback);

    // 3. Calcular Valor Líquido da Caixinha
    const valorLiquido = valorTotalBruto - valorCashback;
    valorLiquidoOutput.value = formatCurrency(valorLiquido);

    // 4. Calcular Valor por Participante
    const participantes = parseInt(participantesInput.value) || 1;
    const valorPorParticipante = participantes > 0 ? valorLiquido / participantes : 0;
    valorFinalOutput.textContent = formatCurrency(valorPorParticipante);
    // Atualiza o painel de resumo de gastos da empresa em tempo real
    updateGastos(dashboardState);
}