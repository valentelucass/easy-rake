/**
 * @file dom-elements.js
 * @description Mapeamento centralizado de todos os elementos do DOM da aplicação.
 * Isso evita a repetição de seletores e facilita a manutenção se um ID mudar no HTML.
 */

export const dom = {
    // --- Telas Principais ---
    openCashierScreen: document.getElementById('open-cashier-screen'),
    appScreen: document.getElementById('app-screen'),

    // --- Layout do App ---
    welcomeMessageOpen: document.getElementById('welcome-message-open-cashier'),
    logoutBtnOpen: document.getElementById('logoutButton-open-cashier'),
    continueSessionWrapper: document.getElementById('continue-session-wrapper'),
    btnAbrirCaixa: document.getElementById('btn-abrir-caixa'),
    initialCashValueInput: document.getElementById('initialCashValue'),
    headerWelcomeMessage: document.getElementById('welcome-message'),
    headerLogoutButton: document.getElementById('logoutButton'),
    tabsContainer: document.getElementById('tabs-container'),
    mainContent: document.getElementById('main-content'),
    backToOpenScreenBtn: document.getElementById('back-to-open-screen'),

    // --- Aba Caixa ---
    caixa: {
        fichasVendidasVal: document.getElementById('fichas-vendidas-val'),
        fichasDevolvidasVal: document.getElementById('fichas-devolvidas-val'),
        rakeVal: document.getElementById('rake-val'),
        despesasVal: document.getElementById('despesas-val'),
        rakeValueInput: document.getElementById('rakeValue'),
        btnAddRake: document.getElementById('btn-adicionar-rake'),
        rakeTotalVal: document.getElementById('rake-total-val'),
        rakeHistoryList: document.getElementById('rake-history-list'),
        expenseDescInput: document.getElementById('expenseDesc'),
        expenseValueInput: document.getElementById('expenseValue'),
        btnAddGasto: document.getElementById('btn-adicionar-gasto'),
        expensesHistoryBody: document.getElementById('expenses-history-body'),
        summaryRevenue: document.getElementById('summary-revenue'),
        summaryExpenses: document.getElementById('summary-expenses'),
        summaryBalance: document.getElementById('summary-balance'),
        expectedValueInput: document.getElementById('expectedValue'),
        realValueInput: document.getElementById('realValue'),
        closingDifference: document.getElementById('closing-difference'),
        btnFecharCaixa: document.getElementById('btn-fechar-caixa'),
        btnRelatorioParcial: document.getElementById('btn-relatorio-parcial'),
        btnComprovanteRake: document.getElementById('btn-comprovante-rake'),
    },

    // --- Aba Fichas ---
    fichas: {
        playerNameInput: document.getElementById('playerName'),
        playerCpfInput: document.getElementById('playerCpf'),
        playerPhoneInput: document.getElementById('playerPhone'),
        chipValueInput: document.getElementById('chipValue'),
        btnVender: document.getElementById('btn-vender-fichas'),
        btnDevolver: document.getElementById('btn-devolver-fichas'),
        activePlayersTbody: document.getElementById('active-players-tbody'),
    },
    
    // --- Aba Aprovações ---
    aprovacoes: {
        content: document.getElementById('aprovacoes-content'),
    },

    // --- Caixinhas (Feature da Aba Caixa) ---
    caixinhas: {
        wrapper: document.getElementById('caixinhas-wrapper'),
        btnAdd: document.getElementById('btn-add-caixinha'),
    },

    // --- Modais ---
    modals: {
        playerDetails: {
            container: document.getElementById('player-details-modal'),
            title: document.getElementById('player-details-title'),
            body: document.getElementById('player-details-body'),
            closeBtn: document.getElementById('player-details-close'),
            printBtn: document.getElementById('btn-print-player-details')
        },
        report: {
            container: document.getElementById('report-modal'),
            title: document.getElementById('report-title'),
            body: document.getElementById('report-body'),
            closeBtn: document.getElementById('btn-close-modal'),
        }
    }
};