// === js/dashboard.js (Refatorado e Corrigido) ===

let dashboardState = {};
/**
 * Soma o valor do 'Cashback (Receita)' de todos os cards de caixinha na tela.
 * @returns {number} - O valor total do cashback.
 */
function getTotalCashbackFromUI() {
    let totalCashback = 0;
    document.querySelectorAll('.caixinha-card').forEach(card => {
        const cashbackDisplay = card.querySelector('.valor-cashback-display strong');
        if (cashbackDisplay) {
            const valorNumerico = parseFloat(cashbackDisplay.textContent.replace(/[R$\s.]/g, '').replace(',', '.'));
            if (!isNaN(valorNumerico)) {
                totalCashback += valorNumerico;
            }
        }
    });
    return totalCashback;
}

// Função central de formatação de moeda
const formatCurrency = (value) => (parseFloat(value) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Ponto de entrada principal
async function inicializarDashboard() {
    try {
        const response = await fetch('api/dashboard_data.php');
        const data = await response.json();
        if (data.success) {
            dashboardState = data;
            document.getElementById('welcome-message-open-cashier').textContent = `Bem-vindo(a), ${data.user_info.nome} (${data.user_info.perfil})`;
            
            const continueWrapper = document.getElementById('continue-session-wrapper');
            continueWrapper.innerHTML = '';
            if (data.caixa) { // Se existe um caixa aberto
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
    } catch (error) { console.error("Erro crítico:", error); }
}

function vincularEventosCaixaFechado() {
    document.getElementById('logoutButton-open-cashier').addEventListener('click', handleLogout);
    document.getElementById('btn-abrir-caixa').addEventListener('click', abrirCaixa);
}

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
            // SUCESSO! Agora, busca o estado atualizado...
            const newDataResponse = await fetch('api/dashboard_data.php');
            const newData = await newDataResponse.json();
            if (newData.success && newData.caixa) {
                dashboardState = newData;
                // ...e entra diretamente na tela principal do dashboard.
                document.getElementById('open-cashier-screen').style.display = 'none';
                document.getElementById('app-screen').style.display = 'block';
                renderizarUICompleta(dashboardState);
            }
        } else {
            alert('Erro ao abrir o caixa: ' + result.message);
        }
    } catch (error) {
        console.error('Erro na requisição para abrir caixa:', error);
    }
}

// --- Funções de Atualização da UI ---

function updateResumoCaixa(state) {
    if (!state.caixa) return;
    document.getElementById('unit-code-display').textContent = state.user_info.codigo_acesso;
    document.getElementById('fichas-vendidas-val').textContent = formatCurrency(state.caixa.total_sales);
    document.getElementById('fichas-devolvidas-val').textContent = formatCurrency(state.caixa.total_returns);
    document.getElementById('rake-val').textContent = formatCurrency(state.caixa.total_rake);
    document.getElementById('despesas-val').textContent = formatCurrency(state.caixa.total_expenses);
}

function updateGastos(state) {
    if (!state.caixa) return;
    const expensesBody = document.getElementById('expenses-history-body');
    // Limpa a lista antes de adicionar os itens atualizados
    expensesBody.innerHTML = ''; 
    (state.gastos_recentes || []).forEach(g => {
        const row = expensesBody.insertRow();
        row.innerHTML = `<td>${g.description}</td><td class="currency">${formatCurrency(g.amount)}</td><td>${new Date(g.timestamp).toLocaleTimeString()}</td>`;
    });

    // Lógica de Negócios correta
    const totalCashback = getTotalCashbackFromUI(); // Pega o total de cashback da tela
    const receitaTotal = (parseFloat(state.caixa.total_rake || 0)) + totalCashback;
    const gastosTotal = parseFloat(state.caixa.total_expenses || 0);
    const saldo = receitaTotal - gastosTotal;

    document.getElementById('summary-revenue').textContent = formatCurrency(receitaTotal);
    document.getElementById('summary-expenses').textContent = formatCurrency(gastosTotal);
    document.getElementById('summary-balance').textContent = formatCurrency(saldo);
}

function updateFechamentoCaixa(state) {
    if (!state.caixa) return;
    const valorEsperado = (parseFloat(state.caixa.initial_amount) || 0) 
                         + (parseFloat(state.caixa.total_sales) || 0) 
                         - (parseFloat(state.caixa.total_returns) || 0) 
                         + (parseFloat(state.caixa.total_rake) || 0) 
                         - (parseFloat(state.caixa.total_expenses) || 0);
    
    const expectedField = document.getElementById('expectedValue');
    const realField = document.getElementById('realValue');
    const differenceField = document.getElementById('closing-difference');

    expectedField.value = formatCurrency(valorEsperado);
    
    realField.addEventListener('input', () => {
        const realValue = parseFloat(realField.value) || 0;
        const diff = realValue - valorEsperado;
        differenceField.textContent = formatCurrency(diff);
        differenceField.style.color = diff < 0 ? '#ef4444' : (diff > 0 ? '#22c55e' : 'white');
    });
}

async function registrarTransacao(tipo, dados) {
    if (!dashboardState.caixa) {
        return alert("O caixa está fechado.");
    }
    // Adiciona o ID da sessão ao payload
    const payload = { 
        tipo, 
        ...dados,
        sessionId: dashboardState.caixa.id // LINHA ADICIONADA/CORRIGIDA
    };

    try {
        const response = await fetch('api/transacao.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.success) {
            // SUCESSO! Busca os dados atualizados do servidor
            const newDataResponse = await fetch('api/dashboard_data.php');
            const newData = await newDataResponse.json();
            if (newData.success) {
                dashboardState = newData; // Atualiza nosso estado global
                // Redesenha a UI com os novos totais, sem recarregar a página
                renderizarUICompleta(dashboardState, true); 
            }
        } else {
            alert("Erro ao registrar transação: " + result.message);
        }
    } catch (error) {
        console.error(`Erro ao registrar transação ${tipo}:`, error);
    }
}

// --- Funções Handler para cada ação do usuário ---

function handleSellChips() {
    const dados = {
        nome_jogador: document.getElementById('playerName').value,
        valor: parseFloat(document.getElementById('chipValue').value),
        cpf: document.getElementById('playerCpf').value,
        telefone: document.getElementById('playerPhone').value
    };
    if (!dados.nome_jogador || isNaN(dados.valor) || dados.valor <= 0) {
        return alert("Nome do jogador e valor são obrigatórios.");
    }
    registrarTransacao('venda', dados);
}

function handleReturnChips() {
    const dados = {
        nome_jogador: document.getElementById('playerName').value,
        valor: parseFloat(document.getElementById('chipValue').value)
    };
    if (!dados.nome_jogador || isNaN(dados.valor) || dados.valor <= 0) {
        return alert("Nome do jogador e valor são obrigatórios.");
    }
    registrarTransacao('devolucao', dados);
}

function handleAddRake() {
    const dados = { valor: parseFloat(document.getElementById('rakeValue').value) };
    if (isNaN(dados.valor) || dados.valor <= 0) {
        return alert("O valor do Rake é obrigatório.");
    }
    registrarTransacao('rake', dados);
}

function handleAddExpense() {
    const dados = {
        descricao: document.getElementById('expenseDesc').value,
        valor: parseFloat(document.getElementById('expenseValue').value)
    };
    if (!dados.descricao || isNaN(dados.valor) || dados.valor <= 0) {
        return alert("Descrição e valor do gasto são obrigatórios.");
    }
    registrarTransacao('despesa', dados);
}

async function handleCloseBox() {
    const valorReal = parseFloat(document.getElementById('realValue').value);
    if (isNaN(valorReal)) {
        return alert("Por favor, informe o Valor Final Real para fechar o caixa.");
    }
    if (!confirm("Tem certeza que deseja fechar o caixa? Esta ação não pode ser desfeita.")) {
        return;
    }

    const payload = {
        sessionId: dashboardState.caixa.id,
        finalAmount: valorReal
    };

    try {
        const response = await fetch('api/fechar_caixa.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.success && result.report) {
            // A API retornou sucesso e os dados do relatório.
            // Agora chamamos a função para exibir o modal do relatório.
            displayReport(result.report, true); // O 'true' indica que é um relatório final
        } else {
            alert("Erro ao fechar o caixa: " + (result.message || 'Ocorreu uma falha. Verifique se o caixa ainda está aberto.'));
        }
    } catch (error) {
        console.error('Erro na API ao fechar caixa:', error);
    }
}

document.addEventListener('DOMContentLoaded', inicializarDashboard);