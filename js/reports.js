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
    if (!caixaState || !caixaState.sessionId) {
        alert("Nenhum caixa aberto para gerar relatório.");
        return;
    }
    fetch('api/gerar_relatorio.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: caixaState.sessionId })
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