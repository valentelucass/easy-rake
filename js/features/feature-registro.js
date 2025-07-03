/**
 * Feature: Registro de Unidade
 * Responsável por gerenciar o processo de criação de novas unidades
 */

import { apiRefatorada as api } from '../core/api.js';
import { uiManager } from '../ui/ui-manager.js';

class RegistroFeature {
    constructor() {
        this.initializeRegistro();
    }

    initializeRegistro() {
        const form = document.getElementById('registerGestorForm');
        if (form) {
            form.addEventListener('submit', this.handleRegistro.bind(this));
        }
    }

    async handleRegistro(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const registroData = Object.fromEntries(formData);
        
        try {
            // Chama a API através do módulo core
            const response = await api.registrarUnidade(registroData);
            
            if (response.success) {
                // Atualiza a UI através do módulo UI
                uiManager.showRegistroSucesso(response.codigo_acesso);
            } else {
                uiManager.showErro(response.message || 'Não foi possível criar a unidade.');
            }
        } catch (error) {
            uiManager.showErro('Erro de conexão. Tente novamente.');
        }
    }
}

// Inicializa a feature quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    new RegistroFeature();
}); 