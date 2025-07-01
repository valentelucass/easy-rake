// Variável global para guardar o estado atual do dashboard
let dashboardState = {};

/**
 * Função principal que é chamada quando o dashboard carrega.
 * Busca todos os dados da unidade na API e inicia a renderização da UI.
 */
async function inicializarDashboard() {
    try {
        const response = await fetch('api/dashboard_data.php');
        const data = await response.json();

        if (data.success) {
            dashboardState = data; // Armazena os dados recebidos
            renderizarUICompleta(dashboardState); // Chama a função de UI para construir a tela
        } else {
            alert(data.message || "Sua sessão é inválida ou expirou.");
            window.location.href = 'login.php';
        }
    } catch (error) {
        console.error("Erro crítico ao buscar dados do dashboard:", error);
        window.location.href = 'login.php';
    }
}

/**
 * Função centralizada para registrar qualquer transação financeira.
 * @param {string} tipo - O tipo de transação ('venda', 'devolucao', 'rake', 'despesa').
 * @param {object} dadosTransacao - Um objeto com os dados da transação (valor, nome_jogador, etc.).
 */
async function registrarTransacao(tipo, dadosTransacao) {
    const payload = { tipo, ...dadosTransacao };

    try {
        const response = await fetch('api/transacao.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (result.success) {
            alert(result.message); // Exibe mensagem de sucesso
            inicializarDashboard(); // Recarrega TODOS os dados para manter a tela 100% atualizada
        } else {
            alert("Erro: " + result.message);
        }
    } catch (error) {
        console.error(`Erro ao registrar transação do tipo ${tipo}:`, error);
    }
}

// Adiciona o evento para iniciar o dashboard assim que o HTML da página for carregado.
document.addEventListener('DOMContentLoaded', inicializarDashboard);