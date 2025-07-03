/**
 * @file ui-manager.js
 * @description Módulo orquestrador da Interface do Usuário (UI).
 * Responsável por mostrar/esconder telas, modais e atualizar o conteúdo
 * do DOM com base nos dados recebidos.
 */

import { dom } from './dom-elements.js';
import { formatCurrency } from '../core/helpers.js';
import { getTotalCashbackFromUI } from '../features/feature-caixinhas.js';

export const uiManager = {
    // --- Gerenciamento de Telas ---
    showScreen(screenName) {
        dom.openCashierScreen.style.display = 'none';
        dom.appScreen.style.display = 'none';

        if (screenName === 'app') {
            dom.appScreen.style.display = 'block';
        } else { // 'openCashier'
            dom.openCashierScreen.style.display = 'block';
        }
    },

    // --- Gerenciamento de Modais ---
    showModal(modalName, content = {}) {
        if (modalName === 'report') {
            dom.modals.report.title.textContent = content.title;
            dom.modals.report.body.innerHTML = content.html;
            dom.modals.report.container.style.display = 'flex';
        }
        if (modalName === 'playerDetails') {
            const m = dom.modals.playerDetails;
            m.title.textContent = content.title;
            m.body.innerHTML = content.html;
            m.container.style.display = 'flex';
        }
    },

    hideModal(modalName) {
        if (modalName === 'report') {
            dom.modals.report.container.style.display = 'none';
        }
        if (modalName === 'playerDetails') {
            dom.modals.playerDetails.container.style.display = 'none';
        }
    },

    // --- Funções de Renderização de Componentes ---

    renderHeader(userInfo) {
        const welcomeText = `Bem-vindo(a), ${userInfo.nome} (${userInfo.perfil}) | Unidade: ${userInfo.codigo_acesso}`;
        dom.welcomeMessageOpen.textContent = welcomeText;
        dom.headerWelcomeMessage.textContent = welcomeText;
    },

    renderTabs(perfil) {
        let abasHtml = '';
        let abaInicial = 'fichas';

        if (perfil === 'gestor' || perfil === 'caixa') {
            abasHtml += `<button class="tab-button active" data-tab="caixa">Caixa</button>`;
            abaInicial = 'caixa';
        }
        abasHtml += `<button class="tab-button" data-tab="fichas">Fichas</button>`;
        if (perfil === 'gestor') {
            abasHtml += `<button class="tab-button" data-tab="aprovacoes">Aprovações</button>`;
        }
        dom.tabsContainer.innerHTML = abasHtml;
        return abaInicial;
    },
    
    showTab(tabName) {
        dom.mainContent.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        dom.tabsContainer.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });

        const contentEl = document.getElementById(`${tabName}-content`);
        if (contentEl) contentEl.style.display = 'block';

        const tabEl = document.querySelector(`.tab-button[data-tab="${tabName}"]`);
        if (tabEl) tabEl.classList.add('active');
    },

    renderCaixaTab(state) {
        const { cashierSession, rakeEntries, recentExpenses, tipJar } = state;
        const s = dom.caixa;

        if (!cashierSession) return;

        // Top Summary Cards
        s.fichasVendidasVal.textContent = formatCurrency(cashierSession.total_sales);
        s.fichasDevolvidasVal.textContent = formatCurrency(cashierSession.total_returns);
        s.rakeVal.textContent = formatCurrency(cashierSession.total_rake);
        s.despesasVal.textContent = formatCurrency(cashierSession.total_expenses);

        s.rakeTotalVal.textContent = formatCurrency(cashierSession.total_rake);
        s.rakeHistoryList.innerHTML = (rakeEntries || [])
            .map(entry => `<li><span>${new Date(entry.timestamp).toLocaleString('pt-BR')}</span><span class="currency">${formatCurrency(entry.amount)}</span></li>`)
            .join('');

        s.expensesHistoryBody.innerHTML = (recentExpenses || [])
            .map(g => `<tr><td>${g.description}</td><td class="currency">${formatCurrency(g.amount)}</td><td>${new Date(g.timestamp).toLocaleTimeString()}</td></tr>`)
            .join('');

        // --- INTEGRAÇÃO COM CAIXINHAS E LÓGICA DE NEGÓCIO ---
        // Total de cashback das caixinhas (CR)
        const totalCashback = getTotalCashbackFromUI();
        // Receita total = Rake + Cashback das caixinhas
        const receitaTotal = (parseFloat(cashierSession.total_rake || 0)) + totalCashback;
        // Gastos total = despesas
        const gastosTotal = parseFloat(cashierSession.total_expenses || 0);
        // Saldo = receita total - gastos total
        const saldo = receitaTotal - gastosTotal;

        s.summaryRevenue.textContent = formatCurrency(receitaTotal);
        s.summaryExpenses.textContent = formatCurrency(gastosTotal);
        s.summaryBalance.textContent = formatCurrency(saldo);

        // Valor esperado = inicial + receita total - despesas (NOVA FÓRMULA)
        const valorEsperado = parseFloat(cashierSession.initial_amount || 0) + receitaTotal - gastosTotal;
        s.expectedValueInput.value = formatCurrency(valorEsperado);
        s.realValueInput.value = '';
        s.closingDifference.textContent = formatCurrency(0);

        // Atualização em tempo real da diferença
        s.realValueInput.oninput = () => {
            const expectedValueText = s.expectedValueInput.value;
            const valorEsperadoAtual = parseFloat(expectedValueText.replace(/[R$\s.]/g, '').replace(',', '.'));
            const valorReal = parseFloat(s.realValueInput.value) || 0;
            const diff = valorReal - valorEsperadoAtual;
            s.closingDifference.textContent = formatCurrency(diff);
            s.closingDifference.style.color = diff < 0 ? '#ef4444' : (diff > 0 ? '#22c55e' : 'white');
        };
    },

    renderFichasTab(state) {
        const { activePlayers } = state;
        const tbody = dom.fichas.activePlayersTbody;
        if (!tbody) return;

        tbody.innerHTML = '';
        if (!activePlayers || activePlayers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#a0a0a0;">Nenhum jogador ativo.</td></tr>';
            return;
        }

        activePlayers.forEach(p => {
            const saldoAtual = parseFloat(p.saldo_atual || 0);
            let situacaoHtml = '';
            if (saldoAtual < 0) {
                situacaoHtml = `<span style="color:#ef4444;">Débito: ${formatCurrency(Math.abs(saldoAtual))}</span>`;
            } else if (p.foi_quitado && saldoAtual === 0) {
                situacaoHtml = `<span style="color:#22c55e;font-weight:bold;">Quitado</span>`;
            } else {
                situacaoHtml = `<span>${formatCurrency(saldoAtual)}</span>`;
            }

            // Primeira linha: dados do jogador
            const row1 = tbody.insertRow();
            row1.innerHTML = `
                <td>${p.name}</td>
                <td class="currency">${formatCurrency(p.total_comprado_historico)}</td>
                <td class="currency">${formatCurrency(p.total_devolvido_historico)}</td>
                <td class="currency">${situacaoHtml}</td>
                <td></td>
            `;
            // Segunda linha: botões de ação
            const row2 = tbody.insertRow();
            row2.innerHTML = `
                <td colspan="5" style="padding-top:0.2rem;padding-bottom:1rem;">
                    <div class="table-action-group" style="justify-content:center;">
                        <button class="button button--outline btn-ver-detalhes" data-player-id="${p.id}">Detalhes</button>
                        <button class="button button--small button--success btn-quick-sell" data-player-id="${p.id}" data-player-name="${p.name}">Vender</button>
                        <button class="button button--small button--destructive btn-quick-return" data-player-id="${p.id}" data-player-name="${p.name}">Devolver</button>
                    </div>
                </td>
            `;
        });
    },

    buildPlayerDetailsHTML(data) {
        const { details, transactions } = data;
        
        let totalComprado = transactions.reduce((sum, t) => t.type === 'venda' ? sum + parseFloat(t.amount) : sum, 0);
        let totalDevolvido = transactions.reduce((sum, t) => t.type !== 'venda' ? sum + parseFloat(t.amount) : sum, 0);
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

        return `
            <div class="player-summary-grid">
                <div class="player-summary-card"><h4>Total Comprado</h4><p style="color:#ef4444;">${formatCurrency(totalComprado)}</p></div>
                <div class="player-summary-card"><h4>Total Devolvido/Pago</h4><p style="color:#22c55e;">${formatCurrency(totalDevolvido)}</p></div>
                <div class="player-summary-card ${saldo < 0 ? 'debito' : 'credito'}"><h4>Situação Final</h4><p>${formatCurrency(saldo)}</p></div>
            </div>
            <h3 class="transaction-history-title">Histórico de Transações</h3>
            <div class="history-table-container">
                <table class="report-table"><thead><tr><th>Tipo</th><th>Data/Hora</th><th class="currency">Valor</th></tr></thead><tbody>${historicoHtml}</tbody></table>
            </div>`;
    },

    // --- Funções para Registro de Unidade ---
    showRegistroSucesso(codigoAcesso) {
        const container = document.getElementById('login-container');
        if (container) {
            container.innerHTML = `
                <div class="login-header">
                    <h1>Unidade Criada!</h1>
                    <h2>Bem-vindo ao Easy Rake</h2>
                </div>
                <div style="text-align:center; color:#ccc;">
                    <p>Sua unidade foi criada. Abaixo está a chave para seus operadores.</p>
                    <p style="margin-top:1rem;">Código de Acesso da Unidade:</p>
                    <p style="font-size: 2rem; color: #e51e3e; font-weight: bold; margin:0;">${codigoAcesso}</p>
                    <p style="font-size: 0.8rem; color: #888;">(Guarde este código)</p>
                    <a href="login.php" class="button button--primary" style="margin-top: 2rem; text-decoration:none; display:inline-block; line-height:1.5;">Ir para o Login</a>
                </div>`;
        }
    },

    showErro(mensagem) {
        alert('Erro: ' + mensagem);
    },

    renderApprovalRequests(requests) {
        const container = dom.aprovacoesContent.querySelector('.content-section');
        container.innerHTML = '<h2>Solicitações de Acesso Pendentes</h2>';

        if (!requests || requests.length === 0) {
            container.innerHTML += '<p style="text-align:center; color:#a0a0a0;">Nenhuma solicitação pendente no momento.</p>';
            return;
        }

        const list = document.createElement('div');
        list.className = 'requests-list-container';

        requests.forEach(req => {
            const card = document.createElement('div');
            card.className = 'request-card';
            card.innerHTML = `
                <h4>Solicitação de Acesso</h4>
                <p><strong>Solicitante:</strong> ${req.username} (${req.profile})</p>
                <p><strong>Data:</strong> ${new Date(req.created_at).toLocaleString('pt-BR')}</p>
                <div class="request-actions">
                    <button class="button button--success btn-processar" data-request-id="${req.id}" data-action="aprovar">Aprovar</button>
                    <button class="button button--destructive btn-processar" data-request-id="${req.id}" data-action="negar">Negar</button>
                </div>
            `;
            list.appendChild(card);
        });

        container.appendChild(list);
    },

    showQuickTransactionModal({ title, onConfirm }) {
        const modal = document.getElementById('quick-transaction-modal');
        const titleEl = document.getElementById('quick-transaction-title');
        const valueInput = document.getElementById('quick-transaction-value');
        const btnConfirm = document.getElementById('quick-transaction-confirm');
        const btnCancel = document.getElementById('quick-transaction-cancel');
        const btnClose = document.getElementById('quick-transaction-close');

        titleEl.textContent = title;
        valueInput.value = '';
        modal.style.display = 'flex';

        function closeModal() {
            modal.style.display = 'none';
            btnConfirm.onclick = null;
            btnCancel.onclick = null;
            btnClose.onclick = null;
        }

        btnConfirm.onclick = () => {
            const valor = parseFloat(valueInput.value);
            if (!valor || valor <= 0) {
                valueInput.focus();
                return;
            }
            closeModal();
            onConfirm(valor);
        };
        btnCancel.onclick = closeModal;
        btnClose.onclick = closeModal;
    },
};