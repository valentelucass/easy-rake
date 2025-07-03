<?php
session_start();
if (!isset($_SESSION['user_id'], $_SESSION['nome'], $_SESSION['perfil'])) {
    header('Location: login.php');
    exit();
}
$userProfile = $_SESSION['perfil'];
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Easy Rake - Dashboard</title>
    <link rel="stylesheet" href="css/main.css">
</head>
<body>
    <div id="open-cashier-screen" class="app-container">
        <header class="app-header">
            <div class="user-info">
                <h1 class="app-title">Caixa - Cash Game</h1>
                <p id="welcome-message-open-cashier" class="text-muted"></p>
            </div>
            <button id="logoutButton-open-cashier" class="button button--secondary">Sair</button>
        </header>
        <main>
            <div id="continue-session-wrapper"></div>
            <section class="content-section">
                <h2 class="section-title">Abrir Novo Caixa</h2>
                <div class="input-group">
                    <label for="initialCashValue">Valor Inicial (R$)</label>
                    <input type="number" id="initialCashValue" placeholder="0,00">
                </div>
                <button id="btn-abrir-caixa" class="button button--primary">Abrir Caixa</button>
            </section>
        </main>
    </div>

    <div id="app-screen" class="app-container" style="display: none;">
        <header class="app-header">
            <a href="#" id="back-to-open-screen" class="back-arrow" title="Voltar">
                <svg class="back-arrow-svg" viewBox="0 0 24 24">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                </svg>
            </a>
            <div class="user-info">
                <h1 id="app-title"></h1>
                <p id="welcome-message"></p>
            </div>
            <button id="logoutButton" class="button button--secondary">Sair</button>
        </header>
        <div id="tabs-container" class="tabs-container"></div>
<main id="main-content">
            <div id="caixa-content" class="tab-content">
                <section class="content-section">
                    <h2 class="section-title">Gerenciamento de Caixa - Unidade <span id="unit-code-display"></span></h2>
                    <div class="dashboard-grid">
                        <div class="dashboard-card positive-card">
                            <h3 class="card-title">Fichas Vendidas</h3>
                            <p id="fichas-vendidas-val" class="card-value positive">R$ 0,00</p>
                        </div>
                        <div class="dashboard-card negative-card">
                            <h3 class="card-title">Fichas Devolvidas</h3>
                            <p id="fichas-devolvidas-val" class="card-value negative">R$ 0,00</p>
                        </div>
                        <div class="dashboard-card positive-card">
                            <h3 class="card-title">Rake</h3>
                            <p id="rake-val" class="card-value positive">R$ 0,00</p>
                        </div>
                        <div class="dashboard-card negative-card">
                            <h3 class="card-title">Despesas</h3>
                            <p id="despesas-val" class="card-value negative">R$ 0,00</p>
                        </div>
                    </div>
                </section>
                <section class="content-section">
                    <h2 class="section-title">Rake Parcial</h2>
                    <div class="input-group">
                        <label for="rakeValue">Adicionar Rake (R$)</label>
                        <input type="number" id="rakeValue" placeholder="0,00">
                    </div>
                    <button id="btn-adicionar-rake" class="button button--primary">Adicionar Rake</button>
                    <div id="rake-summary" class="rake-total-display">
                        Rake Total: <strong id="rake-total-val">R$ 0,00</strong>
                    </div>
                    <h4 class="history-title">Histórico de Rake</h4>
                    <ul id="rake-history-list" class="rake-history"></ul>
                    <button id="btn-comprovante-rake" class="button button--secondary mt-4">Gerar Comprovante de Rake Parcial</button>
                </section>
                <section class="content-section">
                    <h2 class="section-title">Caixinhas</h2>
                    <div id="caixinhas-wrapper" class="caixinha-container"></div>
                    <button id="btn-add-caixinha" class="button button--secondary mt-4">Adicionar Nova Caixinha</button>
                </section>
                <section class="content-section">
                    <h2 class="section-title">Gastos da Empresa</h2>
                    <div class="input-group">
                        <label for="expenseDesc">Descrição do gasto</label>
                        <input type="text" id="expenseDesc">
                    </div>
                    <div class="input-group">
                        <label for="expenseValue">Valor (R$)</label>
                        <input type="number" id="expenseValue" placeholder="0,00">
                    </div>
                    <button id="btn-adicionar-gasto" class="button button--primary">Adicionar Gasto</button>
                    <div class="history-table-container mt-4">
                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th>DESCRIÇÃO</th>
                                    <th class="currency">VALOR</th>
                                    <th>DATA</th>
                                </tr>
                            </thead>
                            <tbody id="expenses-history-body"></tbody>
                        </table>
                    </div>
                    <div class="summary-grid mt-4">
                        <div class="summary-card revenue">
                            <h3 class="card-title">Receita Total</h3>
                            <p id="summary-revenue" class="card-value">R$ 0,00</p>
                        </div>
                        <div class="summary-card expenses">
                            <h3 class="card-title">Gastos Total</h3>
                            <p id="summary-expenses" class="card-value">R$ 0,00</p>
                        </div>
                        <div class="summary-card balance">
                            <h3 class="card-title">Saldo</h3>
                            <p id="summary-balance" class="card-value">R$ 0,00</p>
                        </div>
                    </div>
                </section>
                <section class="content-section closing-box">
                    <h2 class="section-title">Fechamento de Caixa</h2>
                    <div class="input-group">
                        <label for="expectedValue">Valor Final Esperado</label>
                        <input type="text" id="expectedValue" value="R$ 0,00" disabled>
                    </div>
                    <div class="input-group">
                        <label for="realValue">Valor Final Real</label>
                        <input type="number" id="realValue" placeholder="0,00">
                    </div>
                    <div class="difference-display">
                        <span>Diferença:</span>
                        <span id="closing-difference">R$ 0,00</span>
                    </div>
                    <div class="action-buttons mt-4">
                        <button id="btn-fechar-caixa" class="button button--primary">Fechar Caixa e Gerar Relatório</button>
                        <button id="btn-relatorio-parcial" class="button button--secondary">Gerar Relatório Parcial</button>
                    </div>
                </section>
            </div>

            <div id="fichas-content" class="tab-content">
                <section class="content-section">
                    <h2 class="section-title">Venda e Devolução de Fichas</h2>
                    <div class="input-group">
                        <label for="playerName">Nome do Jogador</label>
                        <input type="text" id="playerName">
                    </div>
                    <div class="input-group">
                        <label for="playerCpf">CPF (Opcional)</label>
                        <input type="text" id="playerCpf">
                    </div>
                    <div class="input-group">
                        <label for="playerPhone">Telefone (Opcional)</label>
                        <input type="text" id="playerPhone">
                    </div>
                    <div class="input-group">
                        <label for="chipValue">Valor das Fichas (R$)</label>
                        <input type="number" id="chipValue" placeholder="0,00">
                    </div>
                    <div class="action-buttons">
                        <button id="btn-vender-fichas" class="button button--primary">Vender Fichas</button>
                        <button id="btn-devolver-fichas" class="button button--destructive">Devolver Fichas</button>
                    </div>

                    <hr style="margin: 2.5rem 0; border-color: #282828;">
                    <h3 class="section-title" style="margin-bottom: 1.5rem;">Jogadores Ativos na Sessão</h3>
                    <div class="history-table-container">
                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th>Jogador</th>
                                    <th class="currency">Fichas Compradas</th>
                                    <th class="currency">Fichas Devolvidas</th>
                                    <th class="currency">Situação</th>
                                    <th style="text-align: center;">Ações</th>
                                </tr>
                            </thead>
                            <tbody id="active-players-tbody">
                                </tbody>
                        </table>
                    </div>
                </section>
            </div>

            <div id="aprovacoes-content" class="tab-content">
                <section class="content-section">
                    <h2 class="section-title">Solicitações de Acesso Pendentes</h2>
                </section>
            </div>
        </main>
    </div>
    <!-- Início do player-details-modal -->
    <div id="player-details-modal" class="modal-container">
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h2 id="player-details-title"></h2>
                <button class="close-button" id="player-details-close">&times;</button>
            </div>
            <div class="modal-body" id="player-details-body"></div>
            <div class="modal-footer">
                <button id="btn-print-player-details" class="button button--primary">Imprimir</button>
            </div>
        </div>
    </div>
    <!-- Fim do player-details-modal -->

    <!-- NOVO MODAL DE RELATÓRIO (para Rake e Relatórios Parciais/Finais) -->
    <div id="report-modal" class="modal-container">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="report-title">Título do Relatório</h2>
                <button id="btn-close-modal" class="close-button">&times;</button>
            </div>
            <div id="report-body" class="modal-body">
                <!-- Conteúdo do relatório será inserido aqui pelo JavaScript -->
            </div>

        </div>
    </div>
    <!-- Fim do report-modal -->

    <!-- Modal de Transação Rápida -->
    <div id="quick-transaction-modal" class="modal-container">
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h2 id="quick-transaction-title"></h2>
                <button class="close-button" id="quick-transaction-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="input-group">
                    <label for="quick-transaction-value">Valor das Fichas (R$)</label>
                    <input type="number" id="quick-transaction-value" placeholder="0,00" min="0" step="0.01">
                </div>
            </div>
            <div class="modal-footer">
                <button id="quick-transaction-confirm" class="button button--primary button--small">Confirmar</button>
                <button id="quick-transaction-cancel" class="button button--secondary button--small">Cancelar</button>
            </div>
        </div>
    </div>

<script type="module" src="js/features/dashboard.js"></script>

</body>
</html>