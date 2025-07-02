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
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/dashboard.css">
    <link rel="stylesheet" href="css/reports.css">
    <link rel="stylesheet" href="css/mobile.css">
    <link rel="stylesheet" href="css/caixinhas.css">
</head>
<body>
    <div id="open-cashier-screen" class="app-container">
        <header class="app-header">
            <div class="user-info">
                <h1 class="app-title">Caixa - Cash Game</h1>
                <p id="welcome-message-open-cashier" class="text-muted"></p>
            </div>
            <button id="logoutButton-open-cashier" class="button secondary">Sair</button>
        </header>
        <main>
            <div id="continue-session-wrapper"></div>
            <section class="content-section">
                <h2 class="section-title">Abrir Novo Caixa</h2>
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
            <a href="#" id="back-to-open-screen" class="back-arrow" title="Voltar">
                <svg class="back-arrow-svg" viewBox="0 0 24 24">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                </svg>
            </a>
            <div class="user-info">
                <h1 id="app-title"></h1>
                <p id="welcome-message"></p>
            </div>
            <button id="logoutButton" class="button secondary">Sair</button>
        </header>
        <div id="tabs-container" class="tabs-container"></div>
<main id="main-content">
            <div id="caixa-content" class="tab-content">
                <section class="content-section">
                    <h2 class="section-title">Gerenciamento de Caixa - Unidade <span id="unit-code-display"></span></h2>
                    <div class="dashboard-grid">
                        <div class="dashboard-card">
                            <h3 class="card-title">Fichas Vendidas</h3>
                            <p id="fichas-vendidas-val" class="card-value positive">R$ 0,00</p>
                        </div>
                        <div class="dashboard-card">
                            <h3 class="card-title">Fichas Devolvidas</h3>
                            <p id="fichas-devolvidas-val" class="card-value negative">R$ 0,00</p>
                        </div>
                        <div class="dashboard-card">
                            <h3 class="card-title">Rake</h3>
                            <p id="rake-val" class="card-value positive">R$ 0,00</p>
                        </div>
                        <div class="dashboard-card">
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
                    <button id="btn-adicionar-rake" class="button">Adicionar Rake</button>
                    <div id="rake-summary" class="rake-total-display">
                        Rake Total: <strong id="rake-total-val">R$ 0,00</strong>
                    </div>
                    <h4 class="history-title">Histórico de Rake</h4>
                    <ul id="rake-history-list" class="rake-history"></ul>
                    <button id="btn-comprovante-rake" class="button secondary mt-4">Gerar Comprovante de Rake Parcial</button>
                </section>
                <section class="content-section">
                    <h2 class="section-title">Caixinhas</h2>
                    <div id="caixinhas-wrapper" class="caixinha-container"></div>
                    <button id="btn-add-caixinha" class="button secondary mt-4">Adicionar Nova Caixinha</button>
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
                    <button id="btn-adicionar-gasto" class="button">Adicionar Gasto</button>
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
                        <button id="btn-fechar-caixa" class="button">Fechar Caixa e Gerar Relatório</button>
                        <button id="btn-relatorio-parcial" class="button secondary">Gerar Relatório Parcial</button>
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
                        <button id="btn-vender-fichas" class="button">Vender Fichas</button>
                        <button id="btn-devolver-fichas" class="button destructive">Devolver Fichas</button>
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
    </div> <div id="player-details-modal" class="modal-container">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="player-details-title">Detalhes do Jogador</h2>
                <button id="player-details-close" class="close-button">&times;</button>
            </div>
            <div id="player-details-body" class="modal-body">
                </div>
            <div class="modal-footer">
                <button id="btn-print-player-details" class="button">Imprimir Situação</button>
            </div>
        </div>
    </div>

    <script>
        // Esta variável global é usada pelos scripts para saber o perfil do usuário logado.
        const loggedInUserProfile = "<?php echo $userProfile; ?>";
    </script>
    <script src="js/reports.js"></script>
    <script src="js/caixa.js"></script>
    <script src="js/fichas.js"></script>
    <script src="js/ui.js"></script>
    <script src="js/dashboard.js"></script>

</body>
</html>