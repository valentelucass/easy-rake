// === js/caixa.js ===
// Contém todas as funções de UI e lógica da aba "Caixa".

function updateResumoCaixa(state) {
    if (!state.caixa) return;
    document.getElementById('fichas-vendidas-val').textContent = formatCurrency(state.caixa.total_sales);
    document.getElementById('fichas-devolvidas-val').textContent = formatCurrency(state.caixa.total_returns);
    document.getElementById('rake-val').textContent = formatCurrency(state.caixa.total_rake);
    document.getElementById('despesas-val').textContent = formatCurrency(state.caixa.total_expenses);
}

function updateRake(state) {
    if (!state.caixa) return;
    const rakeTotalEl = document.getElementById('rake-total-val');
    if (rakeTotalEl) rakeTotalEl.textContent = formatCurrency(state.caixa.total_rake);

    const historyListEl = document.getElementById('rake-history-list');
    if (historyListEl) {
        historyListEl.innerHTML = (state.rake_entries || [])
            .map(entry => `<li><span>${new Date(entry.timestamp).toLocaleString('pt-BR')}</span><span class="currency">${formatCurrency(entry.amount)}</span></li>`)
            .join('');
    }
}

function updateGastos(state) {
    if (!state.caixa) return;
    
    const expensesBody = document.getElementById('expenses-history-body');
    if (expensesBody) {
        expensesBody.innerHTML = ''; 
        (state.gastos_recentes || []).forEach(g => {
            const row = expensesBody.insertRow();
            row.innerHTML = `<td>${g.description}</td><td class="currency">${formatCurrency(g.amount)}</td><td>${new Date(g.timestamp).toLocaleTimeString()}</td>`;
        });
    }

    const totalCashback = getTotalCashbackFromUI(); 
    // MODIFICAÇÃO AQUI: Garante que total_rake seja um número e o soma ao totalCashback
    const receitaTotal = (parseFloat(state.caixa.total_rake || 0)) + totalCashback;
    const gastosTotal = parseFloat(state.caixa.total_expenses || 0);
    const saldo = receitaTotal - gastosTotal;

    document.getElementById('summary-revenue').textContent = formatCurrency(receitaTotal);
    document.getElementById('summary-expenses').textContent = formatCurrency(gastosTotal);
    document.getElementById('summary-balance').textContent = formatCurrency(saldo);
}

function updateFechamentoCaixa(state) {
    if (!state.caixa) return;

    const valorInicial = parseFloat(state.caixa.initial_amount) || 0;
    const totalVendas = parseFloat(state.caixa.total_sales) || 0;
    const totalDevolucoes = parseFloat(state.caixa.total_returns) || 0;
    const totalRake = parseFloat(state.caixa.total_rake) || 0;
    const totalDespesas = parseFloat(state.caixa.total_expenses) || 0;

    let totalCaixinhas = 0;
    if (state.caixinhas && Array.isArray(state.caixinhas)) {
        totalCaixinhas = state.caixinhas.reduce((sum, caixinha) => {
            return sum + (parseFloat(caixinha.valor_atual) || 0);
        }, 0);
    }

    const valorEsperado = valorInicial + totalVendas - totalDevolucoes + totalRake - totalDespesas - totalCaixinhas;
    
    const expectedField = document.getElementById('expectedValue');
    const realField = document.getElementById('realValue');
    const differenceField = document.getElementById('closing-difference');

    if (expectedField) {
        expectedField.value = formatCurrency(valorEsperado);
    }
    
    if (realField) {
        const newRealField = realField.cloneNode(true);
        realField.parentNode.replaceChild(newRealField, realField);
        newRealField.addEventListener('input', () => {
            const realValue = parseFloat(newRealField.value) || 0;
            const diff = realValue - valorEsperado;
            differenceField.textContent = formatCurrency(diff);
            differenceField.style.color = diff < 0 ? '#ef4444' : (diff > 0 ? '#22c55e' : 'white');
        });
    }
}

// =================================================================================
// LÓGICA DAS CAIXINHAS
// =================================================================================

function inicializarAbaCaixa(state) {
    renderizarCaixinhasSalvas(state.caixinhas || []);
    const btn = document.getElementById('btn-add-caixinha');
    if (btn) {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', adicionarNovaCaixinha);
    }
}

function renderizarCaixinhasSalvas(caixinhas) {
    const container = document.getElementById('caixinhas-wrapper');
    if (!container) return;
    container.innerHTML = '';
    if (!caixinhas || caixinhas.length === 0) {
        container.innerHTML = '<p style="color:#a0a0a0;text-align:center;width:100%;">Nenhuma caixinha criada.</p>';
        return;
    }
    caixinhas.forEach(c => {
        container.insertAdjacentHTML('beforeend', criarTemplateCaixinha(c));
        const card = document.getElementById(`caixinha-${c.id}`);
        vincularEventosCaixinha(card);
        recalcularCaixinha(card);
    });
}

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
                 <div style="align-self: end;"><button class="button secondary-outline btn-inserir-valor">Inserir Valor</button></div>
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

function vincularEventosCaixinha(card) {
    card.querySelector('.caixinha-header').addEventListener('click', e => { if (e.target.tagName !== 'INPUT') card.classList.toggle('collapsed'); });
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

function recalcularCaixinha(card) {
    let valorBase = parseFloat(card.querySelector('.output-valor-total').getAttribute('data-base-value') || 0);
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
    card.querySelector('.output-valor-final').textContent = formatCurrency(valorLiquido / participantes);
    updateGastos(dashboardState);
}

async function salvarCaixinha(card) {
    const payload = {
        id: card.dataset.id,
        nome_caixinha: card.querySelector('.input-nome-caixinha').value,
        valor_atual: parseFloat(card.querySelector('.output-valor-total').value.replace(/[R$\s.]/g, '').replace(',', '.')),
        cashback_percent: parseFloat(card.querySelector('.input-cashback').value) || 0,
        participantes: parseInt(card.querySelector('.input-participantes').value) || 1
    };
    try {
        await fetch('api/caixinhas.php', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    } catch (error) { console.error("Erro ao salvar caixinha:", error); }
}

function getTotalCashbackFromUI() {
    let totalCashback = 0;
    document.querySelectorAll('.caixinha-card .valor-cashback-display strong').forEach(el => {
        totalCashback += parseFloat(el.textContent.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
    });
    return totalCashback;
}

async function adicionarNovaCaixinha() {
    // A chamada agora não tem mais o terceiro parâmetro (a mensagem do alerta)
    executarAcaoEAtualizar('caixinhas.php', { nome_caixinha: 'Nova Caixinha' });
}
