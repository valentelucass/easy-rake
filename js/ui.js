/**
 * Função principal que renderiza toda a interface do dashboard
 * com base no estado recebido da API.
 */
function renderizarUICompleta(state) {
    const { user_info } = state;

    // 1. Renderiza o cabeçalho
    const appTitle = document.getElementById('app-title');
    if(appTitle) appTitle.textContent = `Caixa - Unidade ${user_info.codigo_acesso}`;

    const welcomeMsg = document.getElementById('welcome-message');
    if(welcomeMsg) welcomeMsg.textContent = `Bem-vindo(a), ${user_info.nome} (${user_info.perfil})`;

    const logoutBtn = document.getElementById('logoutButton');
    if(logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    // 2. Renderiza as abas de acordo com o perfil
    renderizarAbas(user_info.perfil);

    // 3. Define qual aba deve ser exibida primeiro
    const abaInicial = (user_info.perfil === 'gestor' || user_info.perfil === 'caixa') ? 'caixa' : 'fichas';
    renderizarConteudoDaAba(abaInicial, state);
}

/**
 * Cria os botões das abas e adiciona os eventos de clique.
 */
function renderizarAbas(perfil) {
    const container = document.getElementById('tabs-container');
    if(!container) return;
    container.innerHTML = ''; // Limpa abas antigas

    let abasHtml = '';
    if (perfil === 'gestor' || perfil === 'caixa') {
        abasHtml += `<button class="tab-button" data-tab="caixa">Caixa</button>`;
    }
    abasHtml += `<button class="tab-button" data-tab="fichas">Fichas</button>`;
    if (perfil === 'gestor') {
        abasHtml += `<button class="tab-button" data-tab="aprovacoes">Aprovações</button>`;
    }
    container.innerHTML = abasHtml;

    // Adiciona o evento de clique para cada aba
    container.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Atualiza o estado visual
            container.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            // Renderiza o conteúdo da aba clicada
            renderizarConteudoDaAba(e.target.dataset.tab, dashboardState);
        });
    });

    // Ativa a primeira aba visível como padrão
    const primeiraAba = container.querySelector('.tab-button');
    if (primeiraAba) primeiraAba.classList.add('active');
}

/**
 * Renderiza o conteúdo HTML da aba selecionada.
 */
function renderizarConteudoDaAba(nomeAba, state) {
    const mainContent = document.getElementById('main-content');
    if(!mainContent) return;
    mainContent.innerHTML = ''; // Limpa o conteúdo anterior

    switch (nomeAba) {
        case 'caixa':
            // Só mostra se o caixa estiver aberto
            if (state.caixa) {
                mainContent.innerHTML = getHtmlAbaCaixa(state);
                vincularEventosAbaCaixa();
            } else {
                mainContent.innerHTML = getHtmlAbaCaixaFechado();
                // vincularEventosAbaCaixaFechado(); // Para o botão de abrir caixa
            }
            break;
        case 'fichas':
            mainContent.innerHTML = getHtmlAbaFichas();
            vincularEventosAbaFichas();
            break;
        case 'aprovacoes':
            mainContent.innerHTML = getHtmlAbaAprovacoes();
            carregarAprovacoes(); // Busca os dados para esta aba específica
            break;
    }
}

// As funções getHtml... e vincularEventos... seriam adicionadas aqui, construindo
// visualmente cada aba e conectando seus botões às funções do dashboard.js.
// Exemplo para a aba de Fichas:

function getHtmlAbaFichas() {
    return `
        <section class="content-section">
            <h2 class="section-title">Venda e Devolução de Fichas</h2>
            <div class="input-group">
                <label for="nome_jogador">Nome do Jogador</label>
                <input type="text" id="nome_jogador" autocomplete="off">
            </div>
            <div class="input-group">
                <label for="valor_fichas">Valor das Fichas (R$)</label>
                <input type="number" id="valor_fichas" placeholder="0,00">
            </div>
            <div class="action-buttons">
                <button id="btn-vender-fichas" class="button">Vender Fichas</button>
                <button id="btn-devolver-fichas" class="button destructive">Devolver Fichas</button>
            </div>
        </section>
    `;
}

function vincularEventosAbaFichas() {
    const btnVender = document.getElementById('btn-vender-fichas');
    const btnDevolver = document.getElementById('btn-devolver-fichas');

    btnVender.addEventListener('click', () => {
        const dados = {
            valor: document.getElementById('valor_fichas').value,
            nome_jogador: document.getElementById('nome_jogador').value
        };
        // Chama a função centralizada do dashboard.js
        registrarTransacao('venda', dados);
    });

    btnDevolver.addEventListener('click', () => {
        const dados = {
            valor: document.getElementById('valor_fichas').value,
            nome_jogador: document.getElementById('nome_jogador').value
        };
        // Chama a mesma função, mas com tipo diferente
        registrarTransacao('devolucao', dados);
    });
}

function getHtmlAbaCaixaFechado() {
    return `<section class="content-section"><h2 class="section-title">O caixa está fechado.</h2><p>Abra um novo caixa para iniciar as operações.</p><button id="btn-abrir-caixa" class="button">Abrir Caixa</button></section>`;
}

// Função para renderizar o restante da aba caixa
function getHtmlAbaCaixa(state) {
    const { caixa, caixinhas, gastos_recentes } = state;
    const formatBRL = (value) => (parseFloat(value) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // O HTML da sua aba caixa iria aqui, usando os dados de 'state'
    return `
        <section class="content-section">
            <h2 class="section-title">Gerenciamento de Caixa</h2>
            <div class="dashboard-grid">
                <div class="dashboard-card"><h3 class="card-title">Fichas Vendidas</h3><p class="card-value positive">${formatBRL(caixa.total_sales)}</p></div>
                <div class="dashboard-card"><h3 class="card-title">Fichas Devolvidas</h3><p class="card-value negative">${formatBRL(caixa.total_returns)}</p></div>
                <div class="dashboard-card"><h3 class="card-title">Rake</h3><p class="card-value positive">${formatBRL(caixa.total_rake)}</p></div>
                <div class="dashboard-card"><h3 class="card-title">Caixinhas</h3><p class="card-value">${formatBRL(caixa.total_caixinhas)}</p></div>
            </div>
        </section>
        `;
}

function vincularEventosAbaCaixa(){} // Os eventos dos botões da aba caixa iriam aqui

function getHtmlAbaAprovacoes(){ /* ... */ } // HTML da aba de aprovações
async function carregarAprovacoes(){ /* ... */ } // Lógica para buscar e exibir aprovações