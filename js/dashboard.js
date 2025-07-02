// === js/dashboard.js (VERSÃO FINAL COM ORDEM DE EXECUÇÃO CORRIGIDA) ===

// Estado global da aplicação
let dashboardState = {};

// =================================================================================
// SEÇÃO 1: FUNÇÕES UTILITÁRIAS E GLOBAIS
// =================================================================================

const formatCurrency = (value) => (parseFloat(value) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function handleLogout() {
    if (confirm('Você tem certeza que deseja sair?')) {
        window.location.href = 'logout.php';
    }
}

// =================================================================================
// SEÇÃO 2: FUNÇÕES DE RENDERIZAÇÃO DA INTERFACE (Aparência da tela)
// =================================================================================

function renderizarUICompleta(state, isUpdate = false) {
    const { user_info } = state;
    document.getElementById('app-title').textContent = `Caixa - Cash Game`;
    document.getElementById('welcome-message').textContent = `Bem-vindo(a), ${user_info.nome} (${user_info.perfil}) | Unidade: ${user_info.codigo_acesso}`;
    
    // Vincula eventos aos botões que são sempre visíveis no modo App
    const logoutButton = document.getElementById('logoutButton');
    const newLogoutButton = logoutButton.cloneNode(true);
    logoutButton.parentNode.replaceChild(newLogoutButton, logoutButton);
    newLogoutButton.addEventListener('click', handleLogout);

    document.getElementById('back-to-open-screen').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.reload();
    });

    if (!isUpdate) {
        renderizarAbas(user_info.perfil);
        const abaInicial = (user_info.perfil === 'sanger') ? 'fichas' : 'caixa';
        selecionarAba(abaInicial);
    }
    
    updateResumoCaixa(state);
    updateGastos(state);
    updateFechamentoCaixa(state);
    updateRake(state);
    renderizarCaixinhasSalvas(state.caixinhas || []);
    updateActivePlayers(state);
}

function renderizarAbas(perfil) {
    const container = document.getElementById('tabs-container');
    container.innerHTML = '';
    let abasHtml = '';
    if (perfil === 'gestor' || perfil === 'caixa') abasHtml += `<button class="tab-button" data-tab="caixa">Caixa</button>`;
    abasHtml += `<button class="tab-button" data-tab="fichas">Fichas</button>`;
    if (perfil === 'gestor') abasHtml += `<button class="tab-button" data-tab="aprovacoes">Aprovações</button>`;
    container.innerHTML = abasHtml;

    container.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => selecionarAba(btn.dataset.tab));
    });
}

function selecionarAba(nomeAba) {
    document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));

    const contentEl = document.getElementById(`${nomeAba}-content`);
    if(contentEl) contentEl.style.display = 'block';

    const tabEl = document.querySelector(`.tab-button[data-tab="${nomeAba}"]`);
    if(tabEl) tabEl.classList.add('active');
    
    vincularEventosDaAba(nomeAba);
}

function vincularEventosDaAba(nomeAba) {
    const vincular = (id, evento, funcao) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            const novoElemento = elemento.cloneNode(true);
            elemento.parentNode.replaceChild(novoElemento, elemento);
            novoElemento.addEventListener(evento, funcao);
        }
    };

    if (nomeAba === 'caixa') {
        vincular('btn-adicionar-rake', 'click', handleAddRake);
        vincular('btn-adicionar-gasto', 'click', handleAddExpense);
        vincular('btn-fechar-caixa', 'click', handleCloseBox);
        vincular('btn-relatorio-parcial', 'click', gerarRelatorioParcial); // Já deve existir
        vincular('btn-comprovante-rake', 'click', gerarComprovanteRakeParcial); // << Adicione esta linha

        inicializarAbaCaixa(dashboardState);

    } else if (nomeAba === 'fichas') {
        vincular('btn-vender-fichas', 'click', handleSellChips);
        vincular('btn-devolver-fichas', 'click', handleReturnChips);
    }
}

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
    expensesBody.innerHTML = ''; 
    (state.gastos_recentes || []).forEach(g => {
        const row = expensesBody.insertRow();
        row.innerHTML = `<td>${g.description}</td><td class="currency">${formatCurrency(g.amount)}</td><td>${new Date(g.timestamp).toLocaleTimeString()}</td>`;
    });

    const totalCashback = getTotalCashbackFromUI(); // LINHA ADICIONADA: Obtém o valor total do cashback das caixinhas
    const totalRake = parseFloat(state.caixa.total_rake || 0);
    const receitaTotal = totalRake + totalCashback; // LINHA MODIFICADA/ADICIONADA: Soma o rake com o cashback para a receita total
    const gastosTotal = parseFloat(state.caixa.total_expenses || 0);
    
    document.getElementById('summary-revenue').textContent = formatCurrency(receitaTotal); // LINHA MODIFICADA: Agora usa 'receitaTotal'
    document.getElementById('summary-expenses').textContent = formatCurrency(gastosTotal);
    document.getElementById('summary-balance').textContent = formatCurrency(receitaTotal - gastosTotal); // LINHA MODIFICADA: Agora usa 'receitaTotal' para o saldo também
}

function updateFechamentoCaixa(state) {
    if (!state.caixa) return;
    const valorEsperado = (parseFloat(state.caixa.initial_amount) || 0) + (parseFloat(state.caixa.total_sales) || 0) - (parseFloat(state.caixa.total_returns) || 0) + (parseFloat(state.caixa.total_rake) || 0) - (parseFloat(state.caixa.total_expenses) || 0);
    
    document.getElementById('expectedValue').value = formatCurrency(valorEsperado);
    const realField = document.getElementById('realValue');
    const differenceField = document.getElementById('closing-difference');
    
    const newRealField = realField.cloneNode(true);
    realField.parentNode.replaceChild(newRealField, realField);
    newRealField.addEventListener('input', () => {
        const diff = (parseFloat(newRealField.value) || 0) - valorEsperado;
        differenceField.textContent = formatCurrency(diff);
        differenceField.style.color = diff < 0 ? '#ef4444' : (diff > 0 ? '#22c55e' : 'white');
    });
}

function updateActivePlayers(state) {
    const tbody = document.getElementById('active-players-tbody');
    if (!tbody) return;
    tbody.innerHTML = ''; 
    const players = state.active_players || [];
    if (players.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#a0a0a0;">Nenhum jogador ativo.</td></tr>';
        return;
    }

    players.forEach(p => {
        const saldoAtual = parseFloat(p.saldo_atual || 0);
        let situacaoHtml = '';
        if (saldoAtual < 0) {
            situacaoHtml = `<span style="color:#ef4444;">Débito: ${formatCurrency(Math.abs(saldoAtual))}</span>`;
        } else if (p.foi_quitado && saldoAtual === 0) {
            situacaoHtml = `<span style="color:#22c55e;font-weight:bold;">Quitado</span>`;
        } else if (saldoAtual > 0) {
            situacaoHtml = `<span style="color:#22c55e;">Crédito: ${formatCurrency(saldoAtual)}</span>`;
        } else {
            situacaoHtml = `<span>${formatCurrency(0)}</span>`;
        }
        
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${p.name}</td>
            <td class="currency" style="color:#ef4444;">${formatCurrency(p.total_comprado_historico)}</td>
            <td class="currency" style="color:#22c55e;">${formatCurrency(p.total_devolvido_historico)}</td>
            <td class="currency situacao-jogador" style="font-weight:bold;">${situacaoHtml}</td>
            <td style="text-align:center;">
                <button class="button secondary-outline btn-ver-detalhes" data-player-id="${p.id}" style="padding:0.5rem 1rem;width:auto;font-size:0.8rem;">Ver Detalhes</button>
                ${saldoAtual < 0 ? `<button class="button btn-quitar" style="padding:0.5rem 1rem;width:auto;font-size:0.8rem;margin-left:0.5rem;" data-player-id="${p.id}" data-saldo-devedor="${Math.abs(saldoAtual)}">Quitar</button>` : ''}
            </td>
        `;
    });
}

function displayPlayerDetails(data) {
    const modal = document.getElementById('player-details-modal');
    const title = document.getElementById('player-details-title');
    const body = document.getElementById('player-details-body');
    const player = data.details;
    const transactions = data.transactions;

    title.textContent = `Detalhes de: ${player.name}`;
    
    let totalComprado = 0, totalDevolvido = 0;
    transactions.forEach(t => {
        const valor = parseFloat(t.amount);
        if (t.type === 'venda') totalComprado += valor;
        if (t.type === 'devolucao' || t.type === 'pagamento_debito') totalDevolvido += valor;
    });
    const saldo = totalDevolvido - totalComprado;

    const historicoHtml = transactions.map(t => {
        let tipoLabel = '', corValor = '';
        switch(t.type) {
            case 'venda': tipoLabel = 'COMPRA'; corValor = '#ef4444'; break;
            case 'devolucao': tipoLabel = 'DEVOLUÇÃO'; corValor = '#22c55e'; break;
            case 'pagamento_debito': tipoLabel = 'QUITAÇÃO'; corValor = '#3b82f6'; break;
        }
        return `<tr><td>${tipoLabel}</td><td>${new Date(t.timestamp).toLocaleString('pt-BR')}</td><td class="currency" style="color:${corValor};">${formatCurrency(t.amount)}</td></tr>`;
    }).join('');

    body.innerHTML = `
        <div class="player-summary-grid">
            <div class="player-summary-card"><h4>Total Comprado</h4><p style="color:#ef4444;">${formatCurrency(totalComprado)}</p></div>
            <div class="player-summary-card"><h4>Total Devolvido/Pago</h4><p style="color:#22c55e;">${formatCurrency(totalDevolvido)}</p></div>
            <div class="player-summary-card ${saldo < 0 ? 'debito' : 'credito'}"><h4>Situação Final</h4><p>${formatCurrency(saldo)}</p></div>
        </div>
        <h3 class="transaction-history-title">Histórico de Transações</h3>
        <div class="history-table-container">
            <table class="report-table"><thead><tr><th>Tipo</th><th>Data/Hora</th><th class="currency">Valor</th></tr></thead><tbody>${historicoHtml}</tbody></table>
        </div>
    `;
    modal.style.display = 'flex';
}

// =================================================================================
// SEÇÃO 3: LÓGICA DE AÇÕES E EVENTOS
// =================================================================================

async function executarAcaoEAtualizar(endpoint, payload, successMessage) {
    if (!dashboardState.caixa) return alert("O caixa está fechado.");
    payload.sessionId = dashboardState.caixa.id;

    try {
        const response = await fetch(`api/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (result.success) {
            if (successMessage) alert(successMessage);
            const newDataResponse = await fetch('api/dashboard_data.php');
            const newData = await newDataResponse.json();
            if (newData.success) {
                dashboardState = newData;
                renderizarUICompleta(dashboardState, true);
            }
        } else {
            alert("Erro: " + (result.message || "Falha na operação."));
        }
    } catch (error) {
        console.error(`Erro na API (${endpoint}):`, error);
    }
}

// CÓDIGO FALTANTE PARA ADICIONAR
async function abrirCaixa() {
    const valorInicial = parseFloat(document.getElementById('initialCashValue').value);
    if (isNaN(valorInicial) || valorInicial < 0) {
        alert('Insira um valor inicial válido.');
        return;
    }
    
    try {
        const response = await fetch('api/abrir_caixa.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ valor_inicial: valorInicial })
        });
        const result = await response.json();
        if (result.success) {
            // Recarrega a página para iniciar a sessão com o estado limpo e correto
            window.location.reload();
        } else {
            alert('Erro ao abrir o caixa: ' + result.message);
        }
    } catch (error) {
        console.error('Erro na requisição para abrir caixa:', error);
    }
}
// FIM DO CÓDIGO FALTANTE

function handleSellChips() {
    const payload = {
        tipo: 'venda',
        nome_jogador: document.getElementById('playerName').value,
        valor: parseFloat(document.getElementById('chipValue').value),
        cpf: document.getElementById('playerCpf').value,
        telefone: document.getElementById('playerPhone').value
    };
    if (!payload.nome_jogador || isNaN(payload.valor) || payload.valor <= 0) return alert("Nome e valor são obrigatórios.");
    executarAcaoEAtualizar('transacao.php', payload);
}

function handleReturnChips() {
    const payload = {
        tipo: 'devolucao',
        nome_jogador: document.getElementById('playerName').value,
        valor: parseFloat(document.getElementById('chipValue').value)
    };
    if (!payload.nome_jogador || isNaN(payload.valor) || payload.valor <= 0) return alert("Nome e valor são obrigatórios.");
    executarAcaoEAtualizar('transacao.php', payload);
}

function handleQuitarDebito(e) {
    const button = e.target;
    const valorDebito = parseFloat(button.dataset.saldoDevedor);
    if (!confirm(`Confirmar pagamento de ${formatCurrency(valorDebito)}?`)) return;
    const payload = { playerId: button.dataset.playerId, valorDebito: valorDebito };
    executarAcaoEAtualizar('quitar_debito.php', payload, 'Débito quitado!');
}

function handleAddRake() {
    const payload = { tipo: 'rake', valor: parseFloat(document.getElementById('rakeValue').value) };
    if (isNaN(payload.valor) || payload.valor <= 0) return alert("O valor do Rake é obrigatório.");
    executarAcaoEAtualizar('transacao.php', payload);
    document.getElementById('rakeValue').value = ''; // Limpa o campo
}

function handleAddExpense() {
    const payload = {
        tipo: 'despesa',
        descricao: document.getElementById('expenseDesc').value,
        valor: parseFloat(document.getElementById('expenseValue').value)
    };
    if (!payload.descricao || isNaN(payload.valor) || payload.valor <= 0) return alert("Descrição e valor são obrigatórios.");
    executarAcaoEAtualizar('transacao.php', payload);
    document.getElementById('expenseDesc').value = ''; // Limpa os campos
    document.getElementById('expenseValue').value = '';
}

async function handleCloseBox() {
    const valorReal = parseFloat(document.getElementById('realValue').value);
    if (isNaN(valorReal)) return alert("Informe o Valor Final Real.");
    if (!confirm("Tem certeza que deseja fechar o caixa?")) return;
    
    const payload = { sessionId: dashboardState.caixa.id, finalAmount: valorReal };
    try {
        const response = await fetch('api/fechar_caixa.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (result.success && result.report) {
            displayReport(result.report, true);
        } else {
            alert("Erro ao fechar o caixa: " + (result.message || 'Falha.'));
        }
    } catch (error) {
        console.error('Erro ao fechar caixa:', error);
    }
}

// Listener de eventos global para os botões que são trocados entre abas
document.addEventListener('click', function(e) {
    if (e.target) {
        if (e.target.classList.contains('btn-ver-detalhes')) handleVerDetalhes(e);
        if (e.target.classList.contains('btn-quitar')) handleQuitarDebito(e); // << Adicione esta linha
        if (e.target.id === 'player-details-close') document.getElementById('player-details-modal').style.display = 'none';
        if (e.target.id === 'btn-print-player-details') window.print();
    }
});

// =================================================================================
// PONTO DE ENTRADA DA APLICAÇÃO (A CHAMADA FINAL)
// =================================================================================

async function inicializarDashboard() {
    try {
        const response = await fetch('api/dashboard_data.php');
        const data = await response.json();
        if (data.success) {
            dashboardState = data;
            document.getElementById('welcome-message-open-cashier').textContent = `Bem-vindo(a), ${data.user_info.nome} (${data.user_info.perfil})`;
            
            const continueWrapper = document.getElementById('continue-session-wrapper');
            continueWrapper.innerHTML = '';
            if (data.caixa) { 
                const continueButton = document.createElement('button');
                continueButton.textContent = `Continuar Sessão Aberta (Iniciada às ${new Date(data.caixa.opened_at).toLocaleTimeString()})`;
                continueButton.className = 'button secondary';
                continueButton.style.marginBottom = '2rem';
                continueButton.onclick = () => {
                    document.getElementById('open-cashier-screen').style.display = 'none';
                    document.getElementById('app-screen').style.display = 'block';
                    renderizarUICompleta(dashboardState);
                };
                continueWrapper.appendChild(continueButton);
            }
            vincularEventosCaixaFechado();
        } else {
            alert(data.message || "Sessão inválida.");
            window.location.href = 'login.php';
        }
    } catch (error) { console.error("Erro crítico na inicialização:", error); }
}

function vincularEventosCaixaFechado() {
    document.getElementById('logoutButton-open-cashier').addEventListener('click', handleLogout);
    document.getElementById('btn-abrir-caixa').addEventListener('click', abrirCaixa);
}

document.addEventListener('DOMContentLoaded', inicializarDashboard);