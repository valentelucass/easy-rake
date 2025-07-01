// === js/dashboard.js (VERSÃO FINAL E COMPLETA) ===

let caixaState = {};

function resetCaixaState() {
    caixaState = { isCashierOpen: false, sessionId: null, initialAmount: 0, chipsSold: 0, chipsReturned: 0, rake: 0, expenses: [] };
}
resetCaixaState();

function loadSession() {
    fetch('api/get_session.php').then(res => res.json()).then(data => {
        const openCashierScreen = document.getElementById('open-cashier-screen');
        const appScreen = document.getElementById('app-screen');
        if (data.success && data.isCashierOpen) {
            caixaState = data.caixaState;
            openCashierScreen.style.display = 'none';
            appScreen.style.display = 'block';
        } else {
            openCashierScreen.style.display = 'block';
            appScreen.style.display = 'none';
        }
        document.getElementById('welcome-message-open-cashier').textContent = `Bem-vindo, ${loggedInUserName} (${loggedInUserProfile})`;
        document.getElementById('welcome-message').textContent = `Bem-vindo, ${loggedInUserName} (${loggedInUserProfile})`;
        setupUIForProfile(loggedInUserProfile);
        updateDashboardUI(caixaState);
        updateExpensesList(caixaState.expenses);
    }).catch(err => console.error("Falha ao carregar sessão:", err));
}

function abrirCaixa() {
    const valorInicial = parseFloat(document.getElementById('initialCashValue').value);
    if (isNaN(valorInicial) || valorInicial < 0) { alert("Valor inicial inválido."); return; }
    fetch('api/abrir_caixa.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ unitCode: '1001', openedBy: loggedInUserId, initialAmount: valorInicial }) })
    .then(res => res.json()).then(data => {
        if (data.success) {
            caixaState = data.caixaState;
            document.getElementById('open-cashier-screen').style.display = 'none';
            document.getElementById('app-screen').style.display = 'block';
            setupUIForProfile(loggedInUserProfile);
            updateDashboardUI(caixaState);
        } else { alert('Erro: ' + data.message); }
    }).catch(err => console.error("Falha em abrirCaixa:", err));
}

function venderFichas() {
    const playerName = document.getElementById('playerName').value.trim().toLowerCase();
    const playerCpf = document.getElementById('playerCpf').value.trim();
    const playerPhone = document.getElementById('playerPhone').value.trim();
    const amount = parseFloat(document.getElementById('chipValue').value);
    if (!playerName || isNaN(amount) || amount <= 0) { alert("Dados de venda inválidos."); return; }
    
    caixaState.chipsSold += amount;
    updateDashboardUI(caixaState);

    fetch('api/vender_fichas.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: caixaState.sessionId, playerName, cpf: playerCpf, telefone: playerPhone, amount, unitCode: '1001' }) })
    .then(res => res.json()).then(data => {
        if (!data.success) {
            alert('Erro ao salvar venda: ' + (data.message || 'Falha no servidor.'));
            caixaState.chipsSold -= amount;
            updateDashboardUI(caixaState);
        }
    }).catch(err => console.error("Falha em venderFichas:", err));
    
    document.getElementById('playerName').value = ''; document.getElementById('playerCpf').value = ''; document.getElementById('playerPhone').value = ''; document.getElementById('chipValue').value = '';
}

function devolverFichas() {
    const playerName = document.getElementById('playerName').value.trim().toLowerCase();
    const amount = parseFloat(document.getElementById('chipValue').value);
    if (!playerName || isNaN(amount) || amount <= 0) { alert("Dados de devolução inválidos."); return; }

    caixaState.chipsReturned += amount;
    updateDashboardUI(caixaState);

    fetch('api/devolver_fichas.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: caixaState.sessionId, playerName, amount, unitCode: '1001' }) })
    .then(res => res.json()).then(data => {
        if (!data.success) {
            alert('Erro ao salvar devolução: ' + data.message);
            caixaState.chipsReturned -= amount;
            updateDashboardUI(caixaState);
        }
    }).catch(err => console.error("Falha em devolverFichas:", err));

    document.getElementById('playerName').value = ''; document.getElementById('chipValue').value = '';
}

function adicionarRake() {
    const amount = parseFloat(document.getElementById('rakeValue').value);
    if (isNaN(amount) || amount <= 0) { alert("Valor de rake inválido."); return; }

    caixaState.rake += amount;
    updateDashboardUI(caixaState);

    fetch('api/adicionar_rake.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: caixaState.sessionId, amount }) })
    .then(res => res.json()).then(data => {
        if (!data.success) {
            alert('Erro ao salvar rake: ' + data.message);
            caixaState.rake -= amount;
            updateDashboardUI(caixaState);
        }
    }).catch(err => console.error("Falha em adicionarRake:", err));
    document.getElementById('rakeValue').value = '';
}

function adicionarGasto() {
    const description = document.getElementById('expenseDesc').value.trim();
    const amount = parseFloat(document.getElementById('expenseValue').value);
    if (!description || isNaN(amount) || amount <= 0) { alert("Dados de gasto inválidos."); return; }

    const newExpense = { description, amount, timestamp: new Date().toISOString() };
    caixaState.expenses.push(newExpense);
    updateExpensesList(caixaState.expenses);
    updateDashboardUI(caixaState);

    fetch('api/adicionar_gasto.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: caixaState.sessionId, description, amount }) })
    .then(res => res.json()).then(data => {
        if (!data.success) {
            alert('Erro ao salvar gasto: ' + data.message);
            caixaState.expenses.pop();
            updateExpensesList(caixaState.expenses);
            updateDashboardUI(caixaState);
        }
    }).catch(err => console.error("Falha em adicionarGasto:", err));
    
    document.getElementById('expenseDesc').value = ''; document.getElementById('expenseValue').value = '';
}

function fecharCaixa() {
    const realValue = parseFloat(document.getElementById('realValue').value);
    if (isNaN(realValue) || realValue < 0) { alert("Valor final real inválido."); return; }

    const expectedValue = calculateExpectedFinalAmount(caixaState);
    if (!confirm(`Valor esperado: ${expectedValue.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}\nValor real: ${realValue.toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}\nDiferença: ${(realValue - expectedValue).toLocaleString('pt-BR', {style:'currency', currency:'BRL'})}\n\nDeseja fechar o caixa?`)) return;

    fetch('api/fechar_caixa.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: caixaState.sessionId, finalAmount: realValue }) })
    .then(res => res.json()).then(data => {
        if (data.success) {
            alert('Caixa fechado com sucesso! Gerando relatório final...');
            document.getElementById('report-title').textContent = "Relatório de Fechamento";
            displayReport(data.report);
        } else { alert('Erro: ' + data.message); }
    }).catch(err => console.error("Falha em fecharCaixa:", err));
}

// Adicionar ao dashboard.js

/** Busca os pedidos pendentes na API. */
function fetchPendingRequests() {
    // Apenas busca se o usuário for gestor e estiver na aba de aprovações
    const approvalTab = document.querySelector('[data-tab="aprovacoes"]');
    if (loggedInUserProfile !== 'gestor' || !approvalTab || !approvalTab.classList.contains('active')) {
        return;
    }

    fetch('api/get_requests.php')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                displayPendingRequests(data.requests); // Chama a função de UI
            }
        });
}

/** Aprova uma solicitação de Sanger. */
function approveRequest(requestId) {
    handleRequest(requestId, 'approve');
}

/** Recusa uma solicitação de Sanger. */
function denyRequest(requestId) {
    handleRequest(requestId, 'deny');
}

/** Função genérica para enviar a ação (aprovar/recusar) para a API. */
function handleRequest(requestId, action) {
    fetch('api/handle_request.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            fetchPendingRequests(); // Atualiza a lista após a ação
        } else {
            alert("Erro ao processar solicitação: " + data.message);
        }
    });
}

// Dentro da função loadSession, no final, inicie o "polling"
// if (data.success && data.isCashierOpen) { ... }
// ...
// Inicia a verificação de pedidos a cada 15 segundos
if (loggedInUserProfile === 'gestor') {
    setInterval(fetchPendingRequests, 15000);
}