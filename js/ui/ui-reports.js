/**
 * @file ui-reports.js
 * @description Constrói os templates HTML para relatórios e comprovantes.
 */
import { formatCurrency } from '../core/helpers.js';

export const uiReports = {
    buildCompleteReportHTML(reportData, userInfo) {
        const { resumo_financeiro, situacao_jogadores, gastos_detalhados, rake_detalhado, caixinhas_detalhadas, isFinal } = reportData;

        const playersHtml = (situacao_jogadores || []).map(p => {
            let situacaoDisplay = p.status_jogador === 'Quitado' ? 'Quitado' : formatCurrency(p.saldo_atual);
            let cor = p.saldo_atual < 0 ? '#ef4444' : '#22c55e';
            if (p.saldo_atual === 0) cor = 'white';
            return `<tr>
                <td>${p.name}</td>
                <td class="currency">${formatCurrency(p.total_comprado)}</td>
                <td class="currency">${formatCurrency(p.total_devolvido)}</td>
                <td class="currency" style="color:${cor}; font-weight:bold;">${situacaoDisplay}</td>
            </tr>`;
        }).join('');

        const expensesHtml = (gastos_detalhados || []).map(e => `<tr><td>${e.description}</td><td class="currency">${formatCurrency(e.amount)}</td></tr>`).join('');
        const rakeHtml = (rake_detalhado || []).map(e => `<tr><td>${new Date(e.timestamp).toLocaleString('pt-BR')}</td><td class="currency">${formatCurrency(e.amount)}</td></tr>`).join('');
        const caixinhasHtml = (caixinhas_detalhadas || []).map(c => `<tr><td>${c.nome_caixinha}</td><td class="currency">${formatCurrency(c.valor_atual)}</td><td>${c.cashback_percent}%</td></tr>`).join('');

        const receitaEmpresa = parseFloat(resumo_financeiro.total_rake || 0) + parseFloat(resumo_financeiro.total_cashback_caixinhas || 0);
        const lucroPrejuizo = receitaEmpresa - parseFloat(resumo_financeiro.total_expenses || 0);
        const saldoClass = lucroPrejuizo < 0 ? 'negative' : (lucroPrejuizo > 0 ? 'positive' : '');

        return `
            <div class="recibo-container">
                <div class="report-title">RELATÓRIO DE SESSÃO ${isFinal ? 'FINAL' : 'PARCIAL'}</div>
                <div class="report-meta">Unidade: ${userInfo.nome} (${userInfo.codigo_acesso})<br>Operador: ${userInfo.nome}</div>
                <div class="report-summary-section">
                    <div class="summary-row"><span class="summary-label">(+) Rake Total:</span><span class="summary-value">${formatCurrency(resumo_financeiro.total_rake)}</span></div>
                    <div class="summary-row"><span class="summary-label">(+) Cashback Caixinhas:</span><span class="summary-value">${formatCurrency(resumo_financeiro.total_cashback_caixinhas)}</span></div>
                    <div class="summary-row"><span class="summary-label">= Receita Total:</span><span class="summary-value">${formatCurrency(receitaEmpresa)}</span></div>
                    <div class="summary-row"><span class="summary-label">(-) Despesas Totais:</span><span class="summary-value">${formatCurrency(resumo_financeiro.total_expenses)}</span></div>
                    <div class="summary-row summary-total ${saldoClass}"><span class="summary-label">= SALDO (LUCRO/PREJUÍZO):</span><span class="summary-value">${formatCurrency(lucroPrejuizo)}</span></div>
                </div>
                <div class="report-section">
                    <div class="report-section-title">Situação dos Jogadores</div>
                    <table class="report-table"><thead><tr><th>Nome</th><th>Comprou</th><th>Devolveu</th><th>Situação</th></tr></thead><tbody>${playersHtml}</tbody></table>
                </div>
                <div class="report-section">
                    <div class="report-section-title">Entradas de Rake</div>
                    <table class="report-table"><thead><tr><th>Data/Hora</th><th>Valor</th></tr></thead><tbody>${rakeHtml}</tbody></table>
                </div>
                <div class="report-section">
                    <div class="report-section-title">Despesas</div>
                    <table class="report-table"><thead><tr><th>Descrição</th><th>Valor</th></tr></thead><tbody>${expensesHtml}</tbody></table>
                </div>
                ${(caixinhas_detalhadas && caixinhas_detalhadas.length > 0) ? `
                <div class="report-section">
                    <div class="report-section-title">Caixinhas</div>
                    <table class="report-table"><thead><tr><th>Nome</th><th>Valor Atual</th><th>% Cashback</th></tr></thead><tbody>${caixinhasHtml}</tbody></table>
                </div>` : ''}
                <div class="report-footer-btns"><button id="btnPrintReport" class="button button--primary">Imprimir</button><button id="btnExportExcel" class="button button--secondary">Exportar Excel</button></div>
            </div>`;
    },

    buildRakeReceiptHTML(state) {
        const { rakeEntries, cashierSession, userInfo } = state;
        const rows = (rakeEntries  || []).map(e => `
            <div class="rake-row">
                <span class="rake-date">${new Date(e.timestamp).toLocaleString('pt-BR')}</span>
                <span class="rake-value">${formatCurrency(e.amount)}</span>
            </div>`).join('');
        return `
            <div class="recibo-container">
                <div class="report-title">EASY RAKE</div>
                <div class="report-summary-section" style="margin-bottom:1.5rem;">
                    <div class="summary-row"><span class="summary-label">Unidade:</span><span class="summary-value">${userInfo.codigo_acesso}</span></div>
                    <div class="summary-row"><span class="summary-label">Data/Hora:</span><span class="summary-value">${new Date().toLocaleString('pt-BR')}</span></div>
                </div>
                <div class="report-section">
                    <div class="report-section-title">Entradas de Rake</div>
                    <div class="rake-list">
                        ${rows}
                    </div>
                </div>
                <div class="summary-row summary-total positive" style="margin-top:2rem;">
                    <span class="summary-label">RAKE TOTAL:</span><span class="summary-value">${formatCurrency(cashierSession.total_rake)}</span>
                </div>
                <div class="report-footer-btns"><button id="btnPrintReport" class="button button--primary">Imprimir</button></div>
            </div>`;
    },

    buildSaleReceiptHTML(receiptData) {
        return `
            <div class="comprovante-container" id="comprovante-venda-pdf">
                <div class="comp-title">EASY RAKE</div>
                <div class="comp-info-row"><span>Unidade:</span><span>${receiptData.unitCode}</span></div>
                <div class="comp-info-row"><span>Data/Hora:</span><span>${new Date().toLocaleString('pt-BR')}</span></div>
                <div class="comp-info-row"><span>Operador:</span><span>${receiptData.operatorName}</span></div>
                <div class="comp-info-row"><span>Jogador:</span><span>${receiptData.playerName}</span></div>
                <hr class="comp-hr" />
                <div class="comp-total-row"><span>VALOR DA COMPRA:</span><span class="comp-value">${formatCurrency(receiptData.value)}</span></div>
                <div class="report-footer-btns" style="margin-top:2rem;">
                    <button id="btnPrintReport" class="button button--primary">Imprimir</button>
                    <button id="btnExportReceipt" class="button button--secondary">Baixar PDF</button>
                </div>
            </div>`;
    }
};