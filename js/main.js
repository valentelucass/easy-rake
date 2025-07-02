function handleLogout() {
    if (confirm('Você tem certeza que deseja sair?')) {
        window.location.href = 'logout.php';
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleFormSubmit();
        });
        const userTypeSelector = document.getElementById('userTypeSelector');
        if (userTypeSelector) {
            const options = userTypeSelector.querySelectorAll('.user-type-option');
            const gestorCaixaFields = document.getElementById('gestor-caixa-fields');
            const sangerFields = document.getElementById('sanger-fields');
            const mainButton = document.getElementById('main-action-button');
            const footerLink = document.getElementById('footer-link');
            options.forEach(option => {
                option.addEventListener('click', () => {
                    options.forEach(btn => btn.classList.remove('active'));
                    option.classList.add('active');
                    const selectedProfile = option.dataset.profile;
                    if (selectedProfile === 'sanger') {
                        gestorCaixaFields.style.display = 'none';
                        sangerFields.style.display = 'block';
                        gestorCaixaFields.querySelectorAll('input').forEach(i => i.required = false);
                        sangerFields.querySelectorAll('input').forEach(i => i.required = true);
                        mainButton.textContent = 'Solicitar Acesso';
                        footerLink.style.display = 'none';
                    } else {
                        gestorCaixaFields.style.display = 'block';
                        sangerFields.style.display = 'none';
                        gestorCaixaFields.querySelectorAll('input').forEach(i => i.required = true);
                        sangerFields.querySelectorAll('input').forEach(i => i.required = false);
                        mainButton.textContent = 'Entrar';
                        footerLink.style.display = 'block';
                    }
                });
            });
        }
    }
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
});