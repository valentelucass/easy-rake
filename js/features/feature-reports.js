/**
 * @file feature-reports.js
 * @description Contém a lógica de eventos para gerar relatórios e comprovantes.
 */
import { dom } from '../ui/dom-elements.js';
import { apiRefatorada as api } from '../core/api.js';
import { appState } from '../core/state.js';
import { uiReports } from '../ui/ui-reports.js';
import { uiManager } from '../ui/ui-manager.js';

function exportReportToExcel(reportData) {
    if (typeof XLSX === 'undefined') {
        return alert("Biblioteca de exportação (XLSX) não encontrada.");
    }
    const wb = XLSX.utils.book_new();
    const { resumo_financeiro, situacao_jogadores, rake_detalhado, gastos_detalhados, caixinhas_detalhadas } = reportData;

    // Aba Resumo
    const wsSummaryData = [
        ["Item", "Valor"],
        ["Rake Total", resumo_financeiro.total_rake],
        ["Cashback Caixinhas", resumo_financeiro.total_cashback_caixinhas],
        ["Receita Total", parseFloat(resumo_financeiro.total_rake || 0) + parseFloat(resumo_financeiro.total_cashback_caixinhas || 0)],
        ["Despesas Totais", resumo_financeiro.total_expenses],
        ["Saldo (Lucro/Prejuízo)", (parseFloat(resumo_financeiro.total_rake || 0) + parseFloat(resumo_financeiro.total_cashback_caixinhas || 0)) - parseFloat(resumo_financeiro.total_expenses || 0)]
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(wsSummaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Resumo");

    // Aba Jogadores
    const wsPlayersData = [
        ["Jogador", "Comprou", "Devolveu", "Saldo"],
        ...(situacao_jogadores || []).map(p => [p.name, p.total_comprado, p.total_devolvido, p.saldo_atual])
    ];
    const wsPlayers = XLSX.utils.aoa_to_sheet(wsPlayersData);
    XLSX.utils.book_append_sheet(wb, wsPlayers, "Jogadores");

    // Aba Rake Detalhado
    const wsRakeData = [
        ["Data/Hora", "Valor"],
        ...(rake_detalhado || []).map(e => [new Date(e.timestamp).toLocaleString('pt-BR'), e.amount])
    ];
    const wsRake = XLSX.utils.aoa_to_sheet(wsRakeData);
    XLSX.utils.book_append_sheet(wb, wsRake, "Rake Detalhado");

    // Aba Despesas
    const wsExpensesData = [
        ["Descrição", "Valor"],
        ...(gastos_detalhados || []).map(e => [e.description, e.amount])
    ];
    const wsExpenses = XLSX.utils.aoa_to_sheet(wsExpensesData);
    XLSX.utils.book_append_sheet(wb, wsExpenses, "Despesas");

    // Aba Caixinhas (se houver)
    if (caixinhas_detalhadas && caixinhas_detalhadas.length > 0) {
        const wsCaixinhasData = [
            ["Nome", "Valor Atual", "% Cashback"],
            ...caixinhas_detalhadas.map(c => [c.nome_caixinha, c.valor_atual, c.cashback_percent])
        ];
        const wsCaixinhas = XLSX.utils.aoa_to_sheet(wsCaixinhasData);
        XLSX.utils.book_append_sheet(wb, wsCaixinhas, "Caixinhas");
    }

    const fileName = `Relatorio_EasyRake_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

export const reportsFeature = {
    async gerarRelatorioParcial() {
        const sessionId = appState.getSessionId();
        if (!sessionId) return alert('Sessão de caixa não encontrada.');
        const result = await api.gerarRelatorioParcial(sessionId);
        if (result.success) {
            const { userInfo } = appState.getState();
            const reportHTML = uiReports.buildCompleteReportHTML({ ...result.report, isFinal: false }, userInfo);
            uiManager.showModal('report', { title: 'Relatório Parcial', html: reportHTML });
            document.getElementById('btnExportExcel').onclick = () => exportReportToExcel(result.report);
            document.getElementById('btnPrintReport').onclick = () => window.print();
            
            // Listener para o botão de fechar o modal
            dom.modals.report.closeBtn.onclick = () => uiManager.hideModal('report');
        }
    },

    async fecharCaixa(valorReal) {
        if (isNaN(valorReal)) return alert("Informe o Valor Final Real.");
        if (!confirm("Tem certeza que deseja fechar o caixa?")) return;
        
        const payload = {
            sessionId: appState.getSessionId(), // Pega o ID da sessão atual
            finalAmount: valorReal
        };
        const result = await api.fecharCaixa(payload);
        if (result.success) {
            const { userInfo } = appState.getState();
            const reportHTML = uiReports.buildCompleteReportHTML({ ...result.report, isFinal: true }, userInfo);
            uiManager.showModal('report', { title: 'Relatório de Fechamento', html: reportHTML });
            document.getElementById('btnExportExcel').onclick = () => exportReportToExcel(result.report);
            document.getElementById('btnPrintReport').onclick = () => window.print();
            
            // Listener para o botão de fechar o modal
            dom.modals.report.closeBtn.onclick = () => uiManager.hideModal('report');
        } else {
            alert("Erro ao fechar caixa: " + result.message);
        }
    },
    
    gerarComprovanteRake() {
        const state = appState.getState();
        if (!state.cashierSession) return alert("Caixa está fechado.");
        const receiptHTML = uiReports.buildRakeReceiptHTML(state);
        uiManager.showModal('report', { title: 'Comprovante de Rake', html: receiptHTML });
        document.getElementById('btnPrintReport').onclick = () => window.print();
        
        // Listener para o botão de fechar o modal
        dom.modals.report.closeBtn.onclick = () => uiManager.hideModal('report');
    },

    gerarComprovanteVenda(receiptData) {
        const receiptHTML = uiReports.buildSaleReceiptHTML(receiptData);
        uiManager.showModal('report', { title: 'Comprovante de Venda', html: receiptHTML });
        document.getElementById('btnPrintReport').onclick = () => window.print();
        const btnExport = document.getElementById('btnExportReceipt');
        if (btnExport) {
            btnExport.onclick = () => {
                const el = document.getElementById('comprovante-venda-pdf');
                if (window.html2pdf) {
                    html2pdf().set({
                        margin: 0,
                        filename: 'Comprovante_Venda_EasyRake.pdf',
                        html2canvas: { scale: 2 },
                        jsPDF: { unit: 'mm', format: [80, 120], orientation: 'portrait' }
                    }).from(el).save();
                } else {
                    alert('Exportação para PDF indisponível. Por favor, peça ao suporte para instalar html2pdf.js.');
                }
            };
        }
        // Listener para o botão de fechar o modal
        dom.modals.report.closeBtn.onclick = () => uiManager.hideModal('report');
    }
};