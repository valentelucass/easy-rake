// === js/ui.js (Refatorado) ===

function renderizarUICompleta(state, isUpdate = false) {
    const { user_info } = state;
    const welcomeText = `Bem-vindo(a), ${user_info.nome} (${user_info.perfil}) | Unidade: ${user_info.codigo_acesso}`;

    document.getElementById('app-title').textContent = `Caixa - Cash Game`;
    document.getElementById('welcome-message').textContent = welcomeText;
    document.getElementById('logoutButton').addEventListener('click', handleLogout);
    document.getElementById('back-to-open-screen').addEventListener('click', (e) => {
    e.preventDefault(); // Previne o comportamento padrão do link
    window.location.reload(); // Recarrega a página, forçando a atualização
    });

    if (!isUpdate) {
        renderizarAbas(user_info.perfil);
        const abaInicial = (user_info.perfil === 'sanger') ? 'fichas' : 'caixa';
        selecionarAba(abaInicial);
    }
    
    // Preenche os dados usando as funções do dashboard.js
    updateResumoCaixa(state);
    updateGastos(state);
    updateFechamentoCaixa(state);
    updateRake(state);
    renderizarCaixinhasSalvas(state.caixinhas || []);
    updateActivePlayers(state);
}

function renderizarAbas(perfil) {
    const container = document.getElementById('tabs-container');
    container.innerHTML = '';
    let abasHtml = '';
    if (perfil === 'gestor' || perfil === 'caixa') abasHtml += `<button class="tab-button" data-tab="caixa">Caixa</button>`;
    abasHtml += `<button class="tab-button" data-tab="fichas">Fichas</button>`;
    if (perfil === 'gestor') abasHtml += `<button class="tab-button" data-tab="aprovacoes">Aprovações</button>`;
    container.innerHTML = abasHtml;

    container.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => selecionarAba(btn.dataset.tab));
    });
}

function selecionarAba(nomeAba) {
    document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));

    document.getElementById(`${nomeAba}-content`).style.display = 'block';
    document.querySelector(`.tab-button[data-tab="${nomeAba}"]`).classList.add('active');
    
    // Vincula os eventos apenas para a aba que acabou de se tornar ativa
    vincularEventosDaAba(nomeAba);
}

function vincularEventosDaAba(nomeAba) {
    if (nomeAba === 'caixa') {
        document.getElementById('btn-adicionar-rake').addEventListener('click', handleAddRake);
        document.getElementById('btn-adicionar-gasto').addEventListener('click', handleAddExpense);
        document.getElementById('btn-add-caixinha').addEventListener('click', adicionarNovaCaixinha);
        document.querySelectorAll('.caixinha-card').forEach(vincularEventosCaixinha);
        document.getElementById('btn-fechar-caixa').addEventListener('click', handleCloseBox);
        document.getElementById('btn-relatorio-parcial').addEventListener('click', gerarRelatorioParcial);
    } else if (nomeAba === 'fichas') {
        document.getElementById('btn-vender-fichas').addEventListener('click', handleSellChips);
        document.getElementById('btn-devolver-fichas').addEventListener('click', handleReturnChips);
    }
}