// === js/reports.js (VERSÃO FINAL E COMPLETA) ===

/**
 * Busca os detalhes de um relatório específico salvo no banco e o exibe.
 * @param {number} reportId - O ID do relatório a ser buscado.
 */
function viewReportDetails(reportId) {
    console.log(`Buscando detalhes para o relatório ID: ${reportId}`);
    
    // PRIMEIRO, FECHA O MODAL DA LISTA
    document.getElementById('reports-list-modal').style.display = 'none';

    fetch('api/get_report_details.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: reportId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('report-title').textContent = "Visualizando Relatório Salvo";
            // Passamos 'true' para indicar que é um relatório histórico
            displayReport(data.report, true); 
        } else {
            alert("Erro ao buscar detalhes do relatório: " + data.message);
        }
    })
    .catch(error => console.error('Erro na API de detalhes do relatório:', error));
}

/** * Gera um relatório parcial da sessão ATUAL e o exibe.
 * Também salva este relatório no banco de dados.
 */
function gerarRelatorioParcial() {
    // Agora busca o ID da sessão de dentro do nosso novo estado global
    const sessaoId = dashboardState.caixa ? dashboardState.caixa.id : null;

    if (!sessaoId) {
        alert("Nenhum caixa aberto para gerar relatório.");
        return;
    }
    fetch('api/gerar_relatorio.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessaoId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('report-title').textContent = "Relatório Parcial";
            displayReport(data.report);
        } else {
            alert("Erro ao gerar relatório: " + data.message);
        }
    })
    .catch(error => console.error('Erro na API do relatório:', error));
}

// === js/reports.js ===
// ... (código existente) ...

/**
 * Gera um comprovante de rake parcial da sessão atual.
 */
function gerarComprovanteRakeParcial() {
    const sessaoId = dashboardState.caixa ? dashboardState.caixa.id : null;

    if (!sessaoId) {
        alert("Nenhum caixa aberto para gerar comprovante de rake.");
        return;
    }

    // Buscamos apenas as entradas de rake para este comprovante
    const rakeEntries = dashboardState.rake_entries || [];
    const totalRake = parseFloat(dashboardState.caixa.total_rake || 0);
    const emittedDateTime = new Date().toLocaleString('pt-BR'); // Data e hora de emissão

const rakeTableRows = rakeEntries.map(entry => {
    const dateObj = new Date(entry.timestamp);
    const datePart = dateObj.toLocaleDateString('pt-BR');
    const timePart = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `
        <div class="comp-item-row">
            <span>${datePart} ${timePart}</span>
            <span class="comp-value">${formatCurrency(entry.amount)}</span>
        </div>
    `;
}).join('');

const comprovanteHtml = `
    <div class="comprovante-container">
        <h2 class="comp-title">Easy Rake</h2>
        <p class="comp-subtitle">Unidade: ${dashboardState.user_info.codigo_acesso}</p>
        <p class="comp-doc-type">COMPROVANTE DE RAKE</p>

        <hr class="comp-hr-solid" />

        <div class="comp-info-row">
            <span class="comp-label">Data/Hora:</span>
            <span class="comp-value">${emittedDateTime}</span>
        </div>
        <div class="comp-info-row">
            <span class="comp-label">Operador:</span>
            <span class="comp-value">${dashboardState.user_info.nome}</span>
        </div>

        <hr class="comp-hr-solid" />

        <h4 class="comp-section-title">DETALHAMENTO DO RAKE:</h4>
        ${rakeTableRows || '<p class="comp-no-entries">Nenhuma entrada de rake nesta sessão.</p>'}

        <hr class="comp-hr-solid" />

        <div class="comp-info-row comp-total-row">
            <span class="comp-label">RAKE TOTAL:</span>
            <span class="comp-value">${formatCurrency(totalRake)}</span>
        </div>

        <hr class="comp-hr-solid" />

        <div class="comp-observacoes">
            <p class="comp-observacao-text">Guarde este comprovante para controle.</p>
        </div>

        <div class="comp-assinatura">
            <p>_________________________</p>
            <p>Assinatura do Responsável</p>
        </div>
    </div>
`;

    // Reutilizamos o modal de relatório, mas ajustamos o conteúdo
    const modal = document.getElementById('report-modal');
    const modalTitle = document.getElementById('report-title');
    const body = document.getElementById('report-body');

    // ADICIONE ESTA VERIFICAÇÃO para garantir que os elementos foram encontrados
    if (!modal || !modalTitle || !body) {
        console.error("Elementos do modal de relatório não encontrados. Verifique os IDs no HTML.");
        return; // Sai da função se os elementos não existirem
    }

    modalTitle.textContent = "Comprovante de Rake Parcial";
    body.innerHTML = comprovanteHtml;
    
    // Adiciona listener para o botão de impressão (se existir dentro do novo HTML)
    const printButton = body.querySelector('#btnPrintReport'); // Buscar dentro do body do modal
    if (printButton) {
        printButton.addEventListener('click', () => window.print());
    } else {
        // Se o botão não estiver no HTML gerado, adicionamos um fora da div comprovante-container
        const printBtnWrapper = document.createElement('div');
        printBtnWrapper.className = 'modal-footer'; // Reutiliza a classe para estilização
        printBtnWrapper.style.textAlign = 'right';
        printBtnWrapper.style.marginTop = '2rem';
        printBtnWrapper.innerHTML = '<button id="btnPrintReport" class="button">Imprimir Comprovante</button>';
        body.appendChild(printBtnWrapper);
        document.getElementById('btnPrintReport').addEventListener('click', () => window.print());
    }


    modal.style.display = 'flex';

    document.getElementById('btn-close-modal').onclick = () => {
        modal.style.display = 'none';
        // Não recarrega a página, pois é um relatório parcial e não um fechamento de caixa
    };
}

/** Busca e exibe a lista de todos os relatórios salvos. */
function listarRelatorios() {
    fetch('api/listar_relatorios.php')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayReportsList(data.reports);
        } else {
            alert('Erro ao buscar relatórios.');
        }
    })
    .catch(error => console.error('Erro na API de listar relatórios:', error));
}

/** Apaga todos os relatórios do banco de dados após confirmação. */
function deleteAllReports() {
    if (!confirm("ATENÇÃO!\n\nVocê tem certeza que deseja apagar PERMANENTEMENTE todos os relatórios salvos? Esta ação não pode ser desfeita.")) {
        return;
    }
    fetch('api/apagar_relatorios.php', { method: 'POST' })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            listarRelatorios(); // Atualiza a lista, que agora estará vazia
        } else {
            alert("Erro: " + data.message);
        }
    })
    .catch(error => console.error('Erro ao apagar relatórios:', error));
}

function displayReport(reportData, isFinal = false) {
    const modal = document.getElementById('report-modal');
    const modalTitle = document.getElementById('report-title');
    const body = document.getElementById('report-body');
    const user_info = dashboardState.user_info;

    if (!modal || !modalTitle || !body) return;

    modalTitle.textContent = isFinal ? 'Relatório de Fechamento de Caixa' : 'Relatório Parcial';

    // --- Lógica de Cálculo Baseada na sua Especificação ---
    const { caixa, transactions, players_details } = reportData;
    const totalExpenses = parseFloat(caixa.total_expenses || 0);
    const totalRake = parseFloat(caixa.total_rake || 0);
    // Futuramente, o cashback das caixinhas virá aqui
    const totalCashback = 0; 
    const receitaEmpresa = totalRake + totalCashback;
    const lucroPrejuizo = receitaEmpresa - totalExpenses;

    // --- Montagem do HTML do Relatório ---

    // Seção: Detalhes por Jogador
    const playersHtml = (players_details || []).map(p => {
        const totalComprado = transactions.filter(t => t.player_name === p.name && t.type === 'venda').reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const totalDevolvido = transactions.filter(t => t.player_name === p.name && t.type === 'devolucao').reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const saldo = totalDevolvido - totalComprado;
        return `<tr>
                    <td>${p.name}</td>
                    <td class="currency">${formatCurrency(totalComprado)}</td>
                    <td class="currency">${formatCurrency(totalDevolvido)}</td>
                    <td class="currency" style="color:${saldo < 0 ? '#ef4444' : '#22c55e'};">${formatCurrency(saldo)}</td>
                </tr>`;
    }).join('');

    // Seção: Lista de Despesas
    const expensesHtml = transactions.filter(t => t.type === 'despesa').map(e => `<tr><td>${e.description}</td><td class="currency">${formatCurrency(e.amount)}</td></tr>`).join('');

    const reportHTML = `
        <div class="recibo-container">
            <h2 class="recibo-title">RELATÓRIO DE SESSÃO</h2>
            <div class="recibo-section">
                <p><strong>Unidade:</strong> ${user_info.nome} (${user_info.codigo_acesso})</p>
                <p><strong>Operador:</strong> ${user_info.nome}</p>
                <p><strong>Gerado em:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            </div>
            <hr class="recibo-hr">

            <h3>Resumo Geral da Empresa</h3>
            <div class="recibo-section">
                <p><strong>(+) Rake Total:</strong> ${formatCurrency(totalRake)}</p>
                <p><strong>(+) Cashback Caixinhas:</strong> ${formatCurrency(totalCashback)}</p>
                <p style="border-bottom: 1px solid #444; padding-bottom: 0.5rem;"><strong>= Receita Total:</strong> ${formatCurrency(receitaEmpresa)}</p>
                <p><strong>(-) Despesas Totais:</strong> ${formatCurrency(totalExpenses)}</p>
                <p style="font-size: 1.2rem;"><strong>= LUCRO/PREJUÍZO:</strong> <span style="color:${lucroPrejuizo < 0 ? '#ef4444' : '#22c55e'};">${formatCurrency(lucroPrejuizo)}</span></p>
            </div>
            <hr class="recibo-hr">

            <h3>Controle de Fichas</h3>
            <div class="recibo-section">
                 <p><strong>(+) Fichas Vendidas:</strong> ${formatCurrency(caixa.total_sales)}</p>
                 <p><strong>(-) Fichas Devolvidas:</strong> ${formatCurrency(caixa.total_returns)}</p>
            </div>
            <hr class="recibo-hr">

            <h3>Detalhamento por Jogador</h3>
            <table class="report-table">
                <thead><tr><th>Nome</th><th class="currency">Comprou</th><th class="currency">Devolveu</th><th class="currency">Saldo</th></tr></thead>
                <tbody>${playersHtml || '<tr><td colspan="4">Nenhuma movimentação de jogadores.</td></tr>'}</tbody>
            </table>

            <h3 style="margin-top: 2rem;">Detalhamento de Despesas</h3>
            <table class="report-table">
                <thead><tr><th>Descrição</th><th class="currency">Valor</th></tr></thead>
                <tbody>${expensesHtml || '<tr><td colspan="2">Nenhuma despesa registrada.</td></tr>'}</tbody>
            </table>

            ${isFinal ? `
                <hr class="recibo-hr">
                <h3>Fechamento do Caixa</h3>
                <div class="recibo-section final-values">
                    <p><strong>VALOR REAL CONFERIDO:</strong> ${formatCurrency(caixa.final_amount)}</p>
                </div>` : ''
            }

            <div class="modal-footer" style="text-align: right; margin-top: 2rem;">
                <button id="btnPrintReport" class="button">Imprimir Relatório</button>
            </div>
        </div>
    `;

    body.innerHTML = reportHTML;
    document.getElementById('btnPrintReport').addEventListener('click', () => window.print());
    modal.style.display = 'flex';

document.getElementById('btn-close-modal').onclick = () => {
    modal.style.display = 'none';

    // Se for um relatório final, realizamos a limpeza da tela manualmente.
    if (isFinal) {
        // Remove o botão "Continuar Sessão" da tela
        window.location.reload();
        const continueWrapper = document.getElementById('continue-session-wrapper');
        if (continueWrapper) {
            continueWrapper.innerHTML = ''; 
        }

        // Reseta o estado do caixa no nosso objeto global de JavaScript
        dashboardState.caixa = null;

        // Garante que a tela de abrir caixa seja a única visível
        document.getElementById('app-screen').style.display = 'none';
        document.getElementById('open-cashier-screen').style.display = 'block';
    }
};
}