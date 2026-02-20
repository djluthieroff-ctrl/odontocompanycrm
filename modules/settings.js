// Settings Module - CRM Odonto Company
// ======================================

// Initialize Settings Module
function initSettingsModule() {
    renderSettingsView();
}

// Render Settings View
function renderSettingsView() {
    const container = document.getElementById('settingsContent');

    const settings = AppState.settings || {
        crcName: '',
        dailyGoal: 5,
        commissionValue: 50,
        weeklyAppointmentsGoal: 80,
        weeklyVisitsGoal: 40
    };

    container.innerHTML = `
        <div class="card" style="max-width: 700px; padding: var(--spacing-xl);">
            <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--gray-900); margin-bottom: var(--spacing-xl);">
                ⚙️ Configurações do CRC
            </h3>
            
            <form id="settingsForm" onsubmit="saveSettings(event)">
                <div class="form-group">
                    <label class="form-label">Nome do CRC</label>
                    <input type="text" class="form-input" name="crcName" value="${escapeHTML(settings.crcName || '')}" placeholder="Seu nome">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Meta Diária de Agendamentos</label>
                    <input type="number" class="form-input" name="dailyGoal" value="${settings.dailyGoal}" min="1" required>
                    <p style="font-size: 0.875rem; color: var(--gray-500); margin-top: 0.5rem;">
                        Quantidade de agendamentos que você deve marcar por dia
                    </p>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Valor da Comissão por Comparecimento (R$)</label>
                    <input type="number" class="form-input" name="commissionValue" value="${settings.commissionValue}" min="0" step="0.01" required>
                    <p style="font-size: 0.875rem; color: var(--gray-500); margin-top: 0.5rem;">
                        Valor que você recebe por cada paciente que comparece
                    </p>
                </div>

                <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid var(--gray-200);">
                <h4 style="margin-bottom: 1rem; color: var(--gray-700); font-size: 1.1rem;">🎯 Metas Semanais</h4>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label class="form-label">Meta de Agendamentos / Semana</label>
                        <input type="number" class="form-input" name="weeklyAppointmentsGoal" value="${settings.weeklyAppointmentsGoal || 80}" min="1" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Meta de Visitas / Semana</label>
                        <input type="number" class="form-input" name="weeklyVisitsGoal" value="${settings.weeklyVisitsGoal || 40}" min="1" required>
                    </div>
                </div>
                
                <button type="submit" class="btn btn-primary" style="margin-top: var(--spacing-lg);">
                    💾 Salvar Configurações
                </button>
                
                <button type="button" class="btn btn-secondary" onclick="exportFullBackup()" style="margin-top: var(--spacing-lg); margin-left: var(--spacing-sm);">
                    📦 Exportar Backup (JSON)
                </button>
                <button type="button" class="btn btn-secondary" onclick="importBackupJSON()" style="margin-top: var(--spacing-lg); margin-left: var(--spacing-sm);">
                    📥 Importar Backup (JSON)
                </button>
            </form>
            
            <hr style="margin: 2rem 0; border: none; border-top: 1px solid var(--gray-200);">
            
            <div style="background: var(--gray-50); padding: var(--spacing-lg); border-radius: var(--radius-md);">
                <h4 style="font-size: 1rem; font-weight: 600; margin-bottom: var(--spacing-md); color: var(--gray-800);">
                    📊 Estatísticas
                </h4>
                <div style="display: grid; gap: var(--spacing-sm); font-size: 0.875rem; color: var(--gray-600);">
                    <div>• Total de leads cadastrados: <strong>${AppState.leads.length}</strong></div>
                    <div>• Total de pacientes: <strong>${AppState.patients.length}</strong></div>
                    <div>• Total de agendamentos: <strong>${AppState.appointments.length}</strong></div>
                    <div>• Comparecimentos registrados: <strong>${AppState.appointments.filter(a => a.attended).length}</strong></div>
                    <div>• Espaço LocalStorage: <strong id="storageUsage">calculando...</strong></div>
                </div>
            </div>

            <hr style="margin: 2rem 0; border: none; border-top: 1px solid var(--gray-200);">

            <div style="background: #fee2e2; padding: var(--spacing-lg); border-radius: var(--radius-md); border: 1px solid #fca5a5;">
                <h4 style="font-size: 1rem; font-weight: 600; margin-bottom: var(--spacing-md); color: #991b1b; display: flex; align-items: center; gap: 0.5rem;">
                    ⚠️ Zona de Perigo
                </h4>
                <p style="color: #7f1d1d; font-size: 0.875rem; margin-bottom: var(--spacing-md);">
                    Ações irreversíveis. Use com cuidado para testar ou limpar o sistema.
                </p>
                
                <div style="display: flex; gap: var(--spacing-md); flex-wrap: wrap;">
                    <button type="button" class="btn btn-small" onclick="clearData('leads')" style="background: white; color: #991b1b; border: 1px solid #fca5a5;">
                        Limpar Leads
                    </button>
                    <button type="button" class="btn btn-small" onclick="clearData('patients')" style="background: white; color: #991b1b; border: 1px solid #fca5a5;">
                        Limpar Pacientes
                    </button>
                    <button type="button" class="btn btn-small" onclick="clearData('appointments')" style="background: white; color: #991b1b; border: 1px solid #fca5a5;">
                        Limpar Agendamentos
                    </button>
                    <button type="button" class="btn btn-small" onclick="clearData('all')" style="background: #991b1b; color: white; border: 1px solid #7f1d1d;">
                        🚨 RESETAR TUDO
                    </button>
                </div>
            </div>
        </div>
    `;

    // Calculate storage usage
    updateStorageUsage();
}

// Calculate and display LocalStorage usage
function updateStorageUsage() {
    try {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length * 2;
            }
        }
        const usedMB = (total / (1024 * 1024)).toFixed(2);
        const maxMB = 5;
        const pct = Math.round((total / (maxMB * 1024 * 1024)) * 100);
        const el = document.getElementById('storageUsage');
        if (el) {
            el.textContent = `${usedMB} MB / ~${maxMB} MB (${pct}%)`;
            if (pct > 80) {
                el.style.color = '#dc2626';
                showNotification('⚠️ Armazenamento local quase cheio! Faça um backup.', 'warning');
            }
        }
    } catch (e) {
        console.error('Error calculating storage:', e);
    }
}

// Clear Data Function
function clearData(type) {
    let confirmMessage = '';

    switch (type) {
        case 'leads':
            confirmMessage = 'Tem certeza que deseja apagar TODOS os leads?';
            break;
        case 'patients':
            confirmMessage = 'Tem certeza que deseja apagar TODOS os pacientes? Isso também apagará agendamentos e kanban.';
            break;
        case 'appointments':
            confirmMessage = 'Tem certeza que deseja apagar TODOS os agendamentos?';
            break;
        case 'all':
            confirmMessage = 'ATENÇÃO: Isso apagará TODO o banco de dados do sistema. Não pode ser desfeito. Tem certeza absoluta?';
            break;
    }

    if (!confirm(confirmMessage)) return;

    if (type === 'all') {
        if (!confirm('Última chance: Confirma o reset total do sistema?')) return;
        localStorage.clear();
        location.reload();
        return;
    }

    if (type === 'leads') {
        AppState.leads = [];
        saveToStorage(STORAGE_KEYS.LEADS, []);
    }

    if (type === 'patients') {
        AppState.patients = [];
        AppState.kanbanCards = [];
        AppState.appointments = [];
        saveToStorage(STORAGE_KEYS.PATIENTS, []);
        saveToStorage(STORAGE_KEYS.KANBAN, []);
        saveToStorage(STORAGE_KEYS.APPOINTMENTS, []);
    }

    if (type === 'appointments') {
        AppState.appointments = [];
        saveToStorage(STORAGE_KEYS.APPOINTMENTS, []);
    }

    renderSettingsView();
    showNotification('Dados limpos com sucesso!', 'success');
}


// Save Settings (preserves ALL fields including weekly goals)
function saveSettings(event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    AppState.settings = {
        ...AppState.settings,
        crcName: formData.get('crcName') || '',
        dailyGoal: parseInt(formData.get('dailyGoal')),
        commissionValue: parseFloat(formData.get('commissionValue')),
        weeklyAppointmentsGoal: parseInt(formData.get('weeklyAppointmentsGoal')) || 80,
        weeklyVisitsGoal: parseInt(formData.get('weeklyVisitsGoal')) || 40
    };

    saveToStorage(STORAGE_KEYS.SETTINGS, AppState.settings);
    showNotification('Configurações salvas com sucesso!', 'success');
}

// Export functions
window.initSettingsModule = initSettingsModule;
window.saveSettings = saveSettings;
window.clearData = clearData;
