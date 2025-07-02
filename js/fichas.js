// === js/fichas.js ===
// Contém as funções que atualizam a interface da aba "Fichas" e seu modal.

function updateActivePlayers(state) {
    const tbody = document.getElementById('active-players-tbody');
    if (!tbody) return;
    tbody.innerHTML = ''; 

    const players = state.active_players || [];
    if (players.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #a0a0a0;">Nenhum jogador ativo na sessão.</td></tr>';
        return;
    }

    players.forEach(p => {
        const saldoAtual = parseFloat(p.saldo_atual || 0);
        let situacaoHtml = '';

        if (saldoAtual < 0) {
            situacaoHtml = `<span style="color: #ef4444;">Débito: ${formatCurrency(Math.abs(saldoAtual))}</span>`;
        } else if (p.foi_quitado && saldoAtual === 0) {
            situacaoHtml = `<span style="color: #22c55e; font-weight: bold;">Quitado</span>`;
        } else if (saldoAtual > 0) {
            situacaoHtml = `<span style="color: #22c55e;">Crédito: ${formatCurrency(saldoAtual)}</span>`;
        } else {
             situacaoHtml = `<span>${formatCurrency(0)}</span>`;
        }
        
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${p.name}</td>
            <td class="currency" style="color: #ef4444;">${formatCurrency(p.total_comprado_historico)}</td>
            <td class="currency" style="color: #22c55e;">${formatCurrency(p.total_devolvido_historico)}</td>
            <td class="currency situacao-jogador" style="font-weight: bold;">${situacaoHtml}</td>
            <td style="text-align: center;">
                <button class="button secondary-outline btn-ver-detalhes" data-player-id="${p.id}" style="padding: 0.5rem 1rem; width: auto; font-size: 0.8rem;">Ver Detalhes</button>
                ${saldoAtual < 0 ? `<button class="button btn-quitar" style="padding: 0.5rem 1rem; width: auto; font-size: 0.8rem; margin-left: 0.5rem;" data-player-id="${p.id}" data-saldo-devedor="${Math.abs(saldoAtual)}">Quitar</button>` : ''}
            </td>
        `;
    });
}

async function handleVerDetalhes(e) {
    const button = e.target;
    const playerId = button.dataset.playerId;
    const payload = { playerId: playerId, sessionId: dashboardState.caixa.id };

    try {
        const response = await fetch('api/get_player_details.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (data.success) {
            displayPlayerDetails(data);
        } else {
            alert("Erro ao buscar detalhes: " + data.message);
        }
    } catch (error) {
        console.error("Erro na API de detalhes do jogador:", error);
    }
}

function displayPlayerDetails(data) {
    const modal = document.getElementById('player-details-modal');
    const title = document.getElementById('player-details-title');
    const body = document.getElementById('player-details-body');
    const player = data.details;
    const transactions = data.transactions;

    title.textContent = `Detalhes de: ${player.name}`;
    
    let totalComprado = 0;
    let totalDevolvido = 0;
    transactions.forEach(t => {
        const valor = parseFloat(t.amount);
        if (t.type === 'venda') totalComprado += valor;
        if (t.type === 'devolucao' || t.type === 'pagamento_debito') totalDevolvido += valor;
    });
    const saldo = totalDevolvido - totalComprado;

    const historicoHtml = transactions.map(t => {
        let tipoLabel = '';
        let corValor = '';
        switch(t.type) {
            case 'venda': tipoLabel = 'COMPRA DE FICHAS'; corValor = '#ef4444'; break;
            case 'devolucao': tipoLabel = 'DEVOLUÇÃO DE FICHAS'; corValor = '#22c55e'; break;
            case 'pagamento_debito': tipoLabel = 'PAGAMENTO DE DÉBITO'; corValor = '#3b82f6'; break;
        }
        return `<tr><td>${tipoLabel}</td><td>${new Date(t.timestamp).toLocaleString('pt-BR')}</td><td class="currency" style="color: ${corValor};">${formatCurrency(t.amount)}</td></tr>`;
    }).join('');

    body.innerHTML = `
        <div class="player-summary-grid">
            <div class="player-summary-card"><h4>Total Comprado</h4><p style="color:#ef4444;">${formatCurrency(totalComprado)}</p></div>
            <div class="player-summary-card"><h4>Total Devolvido/Pago</h4><p style="color:#22c55e;">${formatCurrency(totalDevolvido)}</p></div>
            <div class="player-summary-card ${saldo < 0 ? 'debito' : 'credito'}"><h4>Situação Final</h4><p>${formatCurrency(saldo)}</p></div>
        </div>
        <h3 class="transaction-history-title">Histórico de Transações</h3>
        <div class="history-table-container">
            <table class="report-table">
                <thead><tr><th>Tipo</th><th>Data/Hora</th><th class="currency">Valor</th></tr></thead>
                <tbody>${historicoHtml}</tbody>
            </table>
        </div>
    `;

    modal.style.display = 'flex';
}