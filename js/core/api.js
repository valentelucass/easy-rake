/**
 * @file api.js
 * @description Módulo centralizador para todas as comunicações com a API (backend).
 * Cada função aqui corresponde a um endpoint no PHP. Isso garante que, se uma URL
 * ou método de requisição mudar, a alteração só precisará ser feita neste arquivo.
 */

// Define a URL base para todas as chamadas. Se um dia a pasta 'api' mudar de nome,
// altere apenas aqui.
const API_BASE_URL = 'api/';

/**
 * Função genérica e segura para realizar requisições POST para o backend.
 * Ela lida com a configuração padrão, conversão para JSON e tratamento de erros de comunicação.
 * @param {string} endpoint - O arquivo .php a ser chamado (ex: 'login.php').
 * @param {object} body - O objeto de dados a ser enviado no corpo da requisição.
 * @returns {Promise<object>} Uma promessa que resolve para a resposta JSON do servidor.
 */
async function post(endpoint, body = {}) {
    try {
        const response = await fetch(API_BASE_URL + endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        // Se a resposta não for OK (ex: erro 500 no servidor), lança um erro.
        if (!response.ok) {
            throw new Error(`Erro na rede: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Erro na requisição para ${endpoint}:`, error);
        // Retorna um objeto de erro padronizado para a aplicação poder tratar.
        return { success: false, message: `Erro de comunicação ao acessar ${endpoint}.` };
    }
}

/**
 * Função genérica para requisições que não enviam dados (GET, por exemplo,
 * embora estejamos usando POST para consistência com o backend atual).
 * @param {string} endpoint - O arquivo .php a ser chamado.
 * @returns {Promise<object>} A resposta JSON do servidor.
 */
async function get(endpoint) {
    // Reutiliza a função post com corpo vazio, que é como o backend espera.
    return post(endpoint, {});
}

// Objeto 'api' que exporta todas as funções de comunicação de forma organizada.
export const api = {
    // --- Autenticação ---
    login: (credentials) => post('login.php', credentials),
    solicitarAcesso: (data) => post('solicitar_acesso.php', data),

    // --- Dashboard e Sessão ---
    getDashboardData: () => get('dashboard_data.php'),
    abrirCaixa: (valorInicial) => post('abrir_caixa.php', { valor_inicial: valorInicial }),
    fecharCaixa: (payload) => post('fechar_caixa.php', payload),

    // --- Transações Gerais ---
    registrarTransacao: (payload) => post('transacao.php', payload), // Para vendas, devoluções, rake, despesas
    quitarDebito: (payload) => post('quitar_debito.php', payload),

    // --- Jogadores ---
    getPlayerDetails: (payload) => post('get_player_details.php', payload),

    // --- Relatórios ---
    getReportDetails: (reportId) => post('get_report_details.php', { reportId }),
    gerarRelatorioParcial: (sessionId) => post('gerar_relatorio.php', { sessionId }),
    listarRelatorios: () => get('listar_relatorios.php'),
    apagarRelatorios: () => post('apagar_relatorios.php'), // POST, mas sem corpo de dados

    // --- Caixinhas ---
    adicionarCaixinha: (payload) => post('caixinhas.php', payload), // Usa POST para criar
    salvarCaixinha: (payload) => post('caixinhas.php', payload, 'PUT'), // Usa PUT (ajustaremos a função 'post' para aceitar method)

    // --- Aprovações (Sanger) ---
    getSolicitacoesPendentes: () => get('aprovacoes.php'), // Corrigido para o endpoint correto
    processarAprovacao: (payload) => post('processar_aprovacao.php', payload)
};

// **Ajuste para suportar o método PUT das caixinhas**
// Vamos refatorar a função 'post' para ser mais flexível.
async function request(endpoint, body = {}, method = 'POST') {
    try {
        const response = await fetch(API_BASE_URL + endpoint, {
            method: method, // Agora o método é um parâmetro
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error(`Erro na rede: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error(`Erro na requisição ${method} para ${endpoint}:`, error);
        return { success: false, message: `Erro de comunicação ao acessar ${endpoint}.` };
    }
}

// Reescrevendo o objeto 'api' com a nova função 'request' mais poderosa
export const apiRefatorada = {
    // --- Autenticação ---
    login: (credentials) => request('login.php', credentials, 'POST'),
    solicitarAcesso: (data) => request('solicitar_acesso.php', data, 'POST'),

    // --- Dashboard e Sessão ---
    getDashboardData: () => request('dashboard_data.php', {}, 'POST'), // O backend espera POST
    abrirCaixa: (valorInicial) => request('abrir_caixa.php', { valor_inicial: valorInicial }, 'POST'),
    fecharCaixa: (payload) => request('fechar_caixa.php', payload, 'POST'),

    // --- Transações Gerais ---
    registrarTransacao: (payload) => request('transacao.php', payload, 'POST'),

    // --- Jogadores ---
    getPlayerDetails: (payload) => request('get_player_details.php', payload, 'POST'),

    // --- Relatórios ---
    getReportDetails: (reportId) => request('get_report_details.php', { reportId }, 'POST'),
    gerarRelatorioParcial: (sessionId) => request('gerar_relatorio.php', { sessionId }, 'POST'),
    listarRelatorios: () => request('listar_relatorios.php', {}, 'POST'),
    apagarRelatorios: () => request('apagar_relatorios.php', {}, 'POST'),

    // --- Caixinhas ---
    adicionarCaixinha: (payload) => request('caixinhas.php', payload, 'POST'),
    salvarCaixinha: (payload) => request('caixinhas.php', payload, 'PUT'),

    // --- Aprovações ---
    getSolicitacoesPendentes: () => request('aprovacoes.php', {}, 'POST'),
    processarAprovacao: (payload) => request('processar_aprovacao.php', payload, 'POST'),

    // --- Registro de Unidade ---
    registrarUnidade: (payload) => request('registrar_unidade.php', payload, 'POST'),
    registrarSanger: (payload) => request('registrar_sanger.php', payload, 'POST')
};

// No final, você usará apenas a 'apiRefatorada'.
// Eu mantive a primeira versão no código para fins didáticos de como evoluímos.
// Você pode apagar a 'api' original e a função 'post' e 'get' antigas.