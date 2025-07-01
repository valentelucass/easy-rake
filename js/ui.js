// === js/ui.js (VERSÃO FINAL E CORRIGIDA) ===
// Contém apenas funções que manipulam a interface (DOM).

/** Calcula o valor final esperado com base no estado. */
function calculateExpectedFinalAmount(state) {
    if (!state) return 0;
    const totalExpenses = state.expenses ? state.expenses.reduce((total, expense) => total + expense.amount, 0) : 0;
    return (state.initialAmount || 0) + (state.chipsSold || 0) - (state.chipsReturned || 0) + (state.rake || 0) - totalExpenses;
}

/** Pega os dados do 'caixaState' e atualiza TODOS os valores visíveis no painel. */
function updateDashboardUI(state) {
    if (!state) return;
    const formatBRL = (value) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Atualiza os 4 cards principais
    if (document.getElementById('fichas-vendidas-val')) {
        document.getElementById('fichas-vendidas-val').textContent = formatBRL(state.chipsSold);
        document.getElementById('fichas-devolvidas-val').textContent = formatBRL(state.chipsReturned);
        document.getElementById('rake-val').textContent = formatBRL(state.rake);
    }
    
    // Calcula totais para os cards de resumo
    const totalRevenue = (state.chipsSold || 0) + (state.rake || 0);
    const totalExpensesAndReturns = (state.chipsReturned || 0) + (state.expenses ? state.expenses.reduce((total, expense) => total + expense.amount, 0) : 0);
    const balance = totalRevenue - totalExpensesAndReturns;

    // Atualiza os 3 cards de resumo
    if (document.getElementById('summary-revenue')) {
        document.getElementById('summary-revenue').textContent = formatBRL(totalRevenue);
        document.getElementById('summary-expenses').textContent = formatBRL(totalExpensesAndReturns);
        document.getElementById('summary-balance').textContent = formatBRL(balance);
    }

    // Atualiza o valor esperado no fechamento de caixa
    if (document.getElementById('expectedValue')) {
        const expectedAmount = calculateExpectedFinalAmount(state);
        document.getElementById('expectedValue').value = formatBRL(expectedAmount);
    }
}

/** Atualiza a lista de histórico de gastos na tela. */
function updateExpensesList(expenses) {
    const listBody = document.getElementById('expenses-history-body');
    if (!listBody) return;
    
    listBody.innerHTML = ''; // Limpa a lista
    if (expenses && expenses.length > 0) {
        expenses.forEach(expense => {
            const date = new Date(expense.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const formatBRL = (value) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            listBody.innerHTML += `
                <tr>
                    <td>${expense.description}</td>
                    <td class="currency">${formatBRL(expense.amount)}</td>
                    <td>${date}</td>
                </tr>
            `;
        });
    } else {
        listBody.innerHTML = '<tr><td colspan="3">Nenhum gasto registrado.</td></tr>';
    }
}

// No js/ui.js
/**
 * Constrói o HTML do relatório detalhado e exibe o modal.
 * @param {object} reportData - Os dados do relatório.
 * @param {boolean} isHistorical - True se for um relatório antigo, para mudar o botão do rodapé.
 */
function displayReport(reportData, isHistorical = false) {
    const reportTitle = document.getElementById('report-title');
    const reportBody = document.getElementById('report-body');
    const reportFooter = document.getElementById('report-footer'); // Selecionamos o rodapé
    const formatBRL = (value) => (parseFloat(value) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    reportTitle.textContent = isHistorical ? "Visualizando Relatório Salvo" : "Relatório Parcial";

    let html = `<h3>Resumo Geral</h3><p>Vendas: ${formatBRL(reportData.total_sales)} | Devoluções: ${formatBRL(reportData.total_returns)} | Rake: ${formatBRL(reportData.total_rake)} | Despesas: ${formatBRL(reportData.total_expenses)}</p>`;

    if (reportData.players_details && reportData.players_details.length > 0) {
        html += `<hr><h3>Detalhes por Jogador</h3><table class="report-table"><thead><tr><th>Jogador</th><th>CPF</th><th>Telefone</th><th class="currency">Balanço Final</th></tr></thead><tbody>`;
        reportData.players_details.forEach(player => {
            html += `<tr><td>${player.name || '-'}</td><td>${player.cpf || '-'}</td><td>${player.telefone || '-'}</td><td class="currency">${formatBRL(player.balance)}</td></tr>`;
        });
        html += `</tbody></table>`;
    }

    html += `<hr><h3>Transações Recentes</h3><table class="report-table"><thead><tr><th>Tipo</th><th>Descrição/Jogador</th><th class="currency">Valor</th></tr></thead><tbody>`;
    if (reportData.transactions && reportData.transactions.length > 0) {
        reportData.transactions.forEach(tx => {
            html += `<tr><td>${tx.type}</td><td>${tx.player_name || tx.description || '-'}</td><td class="currency">${formatBRL(tx.amount)}</td></tr>`;
        });
    } else {
        html += `<tr><td colspan="3">Nenhuma transação nesta sessão.</td></tr>`;
    }
    html += `</tbody></table>`;
    
    reportBody.innerHTML = html;

    // LÓGICA PARA MUDAR OS BOTÕES DO RODAPÉ
    if (isHistorical) {
        reportFooter.innerHTML = '<button id="btn-back-to-list" class="button secondary">Voltar para a Lista</button>';
        // Conecta o novo botão de voltar
        document.getElementById('btn-back-to-list').addEventListener('click', () => {
            document.getElementById('report-modal').style.display = 'none';
            listarRelatorios(); // Reabre a lista
        });
    } else {
        reportFooter.innerHTML = '<button class="button secondary" onclick="window.print()">Imprimir</button>';
    }

    document.getElementById('report-modal').style.display = 'flex';
}

/** Constrói a lista de relatórios salvos e exibe o modal. */
function displayReportsList(reports) {
    const listBody = document.getElementById('reports-list-body');
    listBody.innerHTML = '';
    if (reports.length === 0) {
        listBody.innerHTML = '<tr><td colspan="3">Nenhum relatório salvo encontrado.</td></tr>';
    } else {
        reports.forEach(report => {
            const date = new Date(report.generated_at).toLocaleString('pt-BR');
            const row = `
    <tr>
        <td>${date}</td>
        <td>${report.type}</td>
        <td><button class="button secondary-outline" style="width: auto; padding: 0.5rem 1rem;" onclick="viewReportDetails(${report.id})">Visualizar</button></td>
    </tr>
`;
            listBody.innerHTML += row;
        });
    }
    document.getElementById('reports-list-modal').style.display = 'flex';
}

/** Configura a visibilidade dos elementos com base no perfil do usuário. */
function setupUIForProfile(profile) {
    const elementsWithPermission = document.querySelectorAll('[data-permission]');
    elementsWithPermission.forEach(element => {
        const allowedProfiles = element.dataset.permission.split(',');
        element.style.display = allowedProfiles.includes(profile) ? '' : 'none';
    });
    const firstVisibleTab = document.querySelector('.tab-button:not([style*="display: none;"])');
    if (firstVisibleTab) {
        firstVisibleTab.click();
    }
}

// Adicionar ao ui.js

/** Constrói a lista de solicitações pendentes na tabela. */
function displayPendingRequests(requests) {
    const listBody = document.getElementById('pending-requests-tbody');
    if (!listBody) return;
    listBody.innerHTML = '';

    if (requests.length === 0) {
        listBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Nenhuma solicitação pendente.</td></tr>';
    } else {
        requests.forEach(req => {
            const date = new Date(req.created_at).toLocaleString('pt-BR');
            listBody.innerHTML += `
                <tr>
                    <td>${req.sanger_name}</td>
                    <td>${date}</td>
                    <td class="action-buttons" style="justify-content: center;">
                        <button class="button" style="width:auto; padding: 0.5rem 1rem;" onclick="approveRequest(${req.id})">Aprovar</button>
                        <button class="button destructive" style="width:auto; padding: 0.5rem 1rem;" onclick="denyRequest(${req.id})">Recusar</button>
                    </td>
                </tr>
            `;
        });
    }
}