<?php
// === dashboard.php (VERSÃO FINAL E COMPLETA) ===
session_start();

// "Porteiro": Garante que apenas usuários logados acessem esta página.
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit();
}

// Pega os dados do usuário da sessão para usar na página.
$userId = $_SESSION['user_id'];
$userName = $_SESSION['username'];
$userProfile = $_SESSION['profile'];
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Easy Rake - Dashboard</title>

    <link rel="stylesheet" href="css/dashboard.css">
    <link rel="stylesheet" href="css/reports.css">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/mobile.css">
</head>
<body>

    <div id="open-cashier-screen" class="app-container">
        <header class="app-header">
            <a href="#" onclick="history.back(); return false;" class="back-arrow" title="Voltar">
                <svg class="back-arrow-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </a>
            <div class="user-info">
                <h1 class="app-title">Caixa - Cash Game</h1>
                <p id="welcome-message-open-cashier" class="text-muted">Bem-vindo, usuário (Perfil)</p>
            </div>
            <button id="logoutButton-open-cashier" class="button secondary">Sair</button>
        </header>
        <main>
            <section class="content-section">
                <h2 class="section-title">Gerenciamento de Caixa - Unidade Principal</h2>
                <div class="reports-shortcut">
                    <h3>Atalhos de Relatórios</h3>
                    <button id="btn-ver-relatorios" class="button secondary">Ver Relatórios</button>
                </div>
            </section>
            <section class="content-section">
                <h2 class="section-title">Abrir Caixa</h2>
                <div class="input-group">
                    <label for="initialCashValue">Valor Inicial (R$)</label>
                    <input type="number" id="initialCashValue" placeholder="0,00">
                </div>
                <button id="btn-abrir-caixa" class="button">Abrir Caixa</button>
            </section>
        </main>
    </div>

    <div id="app-screen" class="app-container" style="display: none;">
        <header class="app-header">
            <a href="#" onclick="history.back(); return false;" class="back-arrow" title="Voltar">
                <svg class="back-arrow-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </a>
            <div class="user-info">
                <h1 class="app-title">Caixa - Cash Game</h1>
                <p id="welcome-message" class="text-muted">Bem-vindo, usuário (Perfil)</p>
            </div>
            <button id="logoutButton" class="button secondary">Sair</button>
        </header>
        <div class="tabs-container">
            <button class="tab-button active" data-tab="caixa">Caixa</button>
            <button class="tab-button" data-tab="aprovacoes" data-permission="gestor">Aprovações</button>
        </div>
        <main>
            <div id="caixa-content" class="tab-content active">
                <section class="content-section" data-permission="gestor,caixa,sanger">
                    <h2 class="section-title">Gerenciamento de Caixa - Unidade 1002</h2>
                    <div class="dashboard-grid">
                        <div class="dashboard-card"><h3 class="card-title">Fichas Vendidas</h3><p id="fichas-vendidas-val" class="card-value positive">R$ 0,00</p></div>
                        <div class="dashboard-card"><h3 class="card-title">Fichas Devolvidas</h3><p id="fichas-devolvidas-val" class="card-value negative">R$ 0,00</p></div>
                        <div class="dashboard-card"><h3 class="card-title">Rake</h3><p id="rake-val" class="card-value positive">R$ 0,00</p></div>
                        <div class="dashboard-card"><h3 class="card-title">Caixinhas</h3><p id="caixinhas-val" class="card-value">R$ 0,00</p></div>
                    </div>
                    <button id="btn-relatorio-parcial-1" class="button secondary mt-4" data-permission="gestor,caixa">Gerar Relatório Parcial</button>
                </section>
                <section class="content-section" data-permission="gestor,caixa,sanger">
                    <h2 class="section-title">Venda e Devolução de Fichas</h2>
                    <div class="input-group"><label for="playerName">Nome do Jogador</label><input type="text" id="playerName" autocomplete="off"></div>
                    <div class="input-group"><label for="playerCpf">CPF (Opcional)</label><input type="text" id="playerCpf" autocomplete="off"></div>
                    <div class="input-group"><label for="playerPhone">Telefone (Opcional)</label><input type="text" id="playerPhone" autocomplete="off"></div>
                    <div class="input-group"><label for="chipValue">Valor das Fichas (R$)</label><input type="number" id="chipValue" placeholder="0,00"></div>
                    <div class="action-buttons">
                        <button id="btn-vender-fichas" class="button">Vender Fichas</button>
                        <button id="btn-devolver-fichas" class="button destructive">Devolver Fichas</button>
                    </div>
                    <div class="quick-buy mt-4">
                        <p class="text-muted">Compra Rápida</p>
                        <div class="quick-buy-buttons">
                            <button class="button secondary-outline">R$ 100</button>
                            <button class="button secondary-outline">R$ 200</button>
                            <button class="button secondary-outline">R$ 500</button>
                            <button class="button secondary-outline">R$ 1000</button>
                        </div>
                    </div>
                </section>
                <section class="content-section" data-permission="gestor,caixa">
                    <h2 class="section-title">Rake Parcial</h2>
                    <div class="input-group"><label for="rakeValue">Adicionar Rake (R$)</label><input type="number" id="rakeValue" placeholder="0,00"></div>
                    <button id="btn-adicionar-rake" class="button">Adicionar Rake</button>
                </section>
                <section class="content-section" data-permission="gestor,caixa">
                    <h2 class="section-title">Gastos da Empresa</h2>
                    <div class="input-group"><label for="expenseDesc">Descrição do gasto</label><input type="text" id="expenseDesc" autocomplete="off"></div>
                    <div class="input-group"><label for="expenseValue">Valor (R$)</label><input type="number" id="expenseValue" placeholder="0,00"></div>
                    <button id="btn-adicionar-gasto" class="button">Adicionar Gasto</button>
                    <div class="history-table-container mt-4">
                        <table class="report-table">
                            <thead><tr><th>Descrição</th><th class="currency">Valor</th><th>Data</th></tr></thead>
                            <tbody id="expenses-history-body"></tbody>
                        </table>
                    </div>
                    <div class="summary-grid mt-4">
                        <div class="summary-card revenue"><h3 class="card-title">Receita Total</h3><p id="summary-revenue" class="card-value">R$ 0,00</p></div>
                        <div class="summary-card expenses"><h3 class="card-title">Gastos Total</h3><p id="summary-expenses" class="card-value">R$ 0,00</p></div>
                        <div class="summary-card balance"><h3 class="card-title">Saldo</h3><p id="summary-balance" class="card-value">R$ 0,00</p></div>
                    </div>
                </section>
                <section class="content-section closing-box" data-permission="gestor,caixa">
                    <h2 class="section-title">Fechamento de Caixa</h2>
                    <div class="input-group"><label for="expectedValue">Valor Final Esperado</label><input type="text" id="expectedValue" value="R$ 0,00" disabled></div>
                    <div class="input-group"><label for="realValue">Valor Final Real</label><input type="number" id="realValue" placeholder="0,00"></div>
                    <div class="difference-display">
                        <span>Diferença:</span>
                        <span id="closing-difference">R$ 0,00</span>
                    </div>
                    <div class="action-buttons mt-4">
                        <button id="btn-fechar-caixa" class="button">Fechar Caixa e Gerar Relatório</button>
                        <button id="btn-relatorio-parcial-2" class="button secondary">Gerar Relatório Parcial</button>
                    </div>
                </section>
            </div>
<div id="aprovacoes-content" class="tab-content">
    <section class="content-section">
        <h2 class="section-title">Solicitações de Acesso Pendentes</h2>
        <div class="history-table-container">
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Nome do Sanger</th>
                        <th>Data da Solicitação</th>
                        <th style="text-align: center;">Ações</th>
                    </tr>
                </thead>
                <tbody id="pending-requests-tbody">
                    </tbody>
            </table>
        </div>
    </section>
</div>
        </main>
    </div>
    
    <div id="report-modal" class="modal-container">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="report-title">Relatório</h2>
                <button id="btn-close-modal" class="close-button">&times;</button>
            </div>
            <div id="report-body" class="modal-body"></div>
            <div id="report-footer" class="modal-footer">
    </div>
        </div>
    </div>
    <div id="reports-list-modal" class="modal-container">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Relatórios Salvos</h2>
                <div>
                    <button id="btn-delete-all-reports" class="button destructive" style="width:auto; padding: 0.5rem 1rem; font-size: 0.8rem;">Apagar Tudo</button>
                    <button id="btn-close-list-modal" class="close-button">&times;</button>
                </div>
            </div>
            <div class="modal-body">
                <table class="report-table">
                    <thead><tr><th>Data de Geração</th><th>Tipo</th><th>Ação</th></tr></thead>
                    <tbody id="reports-list-body"></tbody>
                </table>
            </div>
        </div>
    </div>

<script>
        const loggedInUserId = <?php echo json_encode($userId); ?>;
        const loggedInUserName = <?php echo json_encode($userName); ?>;
        const loggedInUserProfile = <?php echo json_encode($userProfile); ?>;
    </script>
    <script src="js/ui.js"></script>
    <script src="js/dashboard.js"></script>
    <script src="js/reports.js"></script> <script src="js/main.js"></script>
</body>
</html>