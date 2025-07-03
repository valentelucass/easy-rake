/**
 * @file state.js
 * @description Gerenciador de estado central da aplicação.
 * Este módulo é a "única fonte da verdade". Ele contém todos os dados dinâmicos
 * da aplicação (informações do usuário, dados do caixa, etc.) e fornece
 * métodos seguros para ler, atualizar e interagir com esses dados.
 * Nenhuma outra parte da aplicação deve modificar o estado diretamente.
 */

// Importamos a API para que o estado possa se autualizar buscando dados do backend.
import { apiRefatorada as api } from './api.js';

// O objeto 'state' é privado para este módulo. Ninguém de fora pode acessá-lo diretamente.
let _state = {
    userInfo: null,      // Informações do usuário logado
    cashierSession: null, // Dados da sessão do caixa (antigo 'caixa')
    tipJar: [],       // Caixinhas
    recentExpenses: [],  // Gastos recentes
    rakeEntries: [],     // Entradas de Rake
    activePlayers: [],   // Jogadores ativos na sessão
    pendingApprovals: [] // Aprovações pendentes para o gestor
};

// Objeto 'appState' que será exportado, expondo apenas as maneiras seguras de interagir com o estado.
export const appState = {
    /**
     * Retorna uma cópia segura do estado atual.
     * Usar uma cópia (desestruturação) previne modificações acidentais do estado original.
     * @returns {object} Uma cópia do objeto de estado.
     */
    getState: () => ({ ..._state }),

    /**
     * Retorna o ID da sessão de caixa atual, se houver.
     * @returns {number | null} O ID da sessão ou nulo.
     */
    getSessionId: () => _state.cashierSession ? _state.cashierSession.id : null,

    /**
     * Função central para buscar os dados iniciais do dashboard e popular o estado.
     * Esta é a principal ação que conecta o frontend ao backend após o login.
     * @returns {Promise<boolean>} Retorna true se os dados foram carregados com sucesso, false caso contrário.
     */
    async initializeDashboardState() {
        const response = await api.getDashboardData();
        if (response.success) {
            // Atualiza o estado interno com os dados recebidos da API.
            _state = {
                userInfo: response.user_info,
                cashierSession: response.caixa,
                tipJar: response.caixinhas,
                recentExpenses: response.gastos_recentes,
                rakeEntries: response.rake_entries,
                activePlayers: response.active_players,
                pendingApprovals: [] // Inicializa vazio, será carregado sob demanda.
            };
            console.log("Estado inicializado:", _state);
            return true;
        } else {
            // Em caso de falha, reseta o estado para garantir a segurança.
            this.resetState();
            console.error("Falha ao inicializar o estado:", response.message);
            alert("Não foi possível carregar os dados da sessão: " + response.message);
            return false;
        }
    },

    /**
     * Atualiza o estado buscando os dados mais recentes do backend.
     * Usado após qualquer ação que modifique os dados (vender, adicionar rake, etc).
     */
    async refreshState() {
        const response = await api.getDashboardData();
        if (response.success) {
            _state.cashierSession = response.caixa;
            _state.tipJar = response.caixinhas;
            _state.recentExpenses = response.gastos_recentes;
            _state.rakeEntries = response.rake_entries;
            _state.activePlayers = response.active_players;
        }
        // Retorna o estado completo para quem chamou poder usar imediatamente.
        return this.getState();
    },

    /**
     * Limpa completamente o estado da aplicação.
     * Essencial para o processo de logout, garantindo que nenhum dado de usuário
     * permaneça na memória.
     */
    resetState() {
        _state = {
            userInfo: null,
            cashierSession: null,
            tipJar: [],
            recentExpenses: [],
            rakeEntries: [],
            activePlayers: [],
            pendingApprovals: []
        };
    }
};