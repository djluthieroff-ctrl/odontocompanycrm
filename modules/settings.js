// Settings Module - CRM Odonto Company
// ======================================

function initSettingsModule() {
    renderSettingsView();
}

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
        <div style="display: grid; gap: 1.5rem; max-width: 800px;">

            <!-- Configurações do CRC -->
            <div class="card" style="padding: var(--spacing-xl);">
                <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--gray-900); margin-bottom: 1.5rem; display:flex; align-items:center; gap:.5rem;">
                    ⚙️ Configurações do CRC
                </h3>
                <form id="settingsForm" onsubmit="saveSettings(event)">
                    <div class="form-group">
                        <label class="form-label">Nome do CRC</label>
                        <input type="text" class="form-input" name="crcName" value="${escapeHTML(settings.crcName || '')}" placeholder="Seu nome">
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Meta Diária de Agendamentos</label>
                            <input type="number" class="form-input" name="dailyGoal" value="${settings.dailyGoal}" min="1" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Comissão por Comparecimento (R$)</label>
                            <input type="number" class="form-input" name="commissionValue" value="${settings.commissionValue}" min="0" step="0.01" required>
                        </div>
                    </div>

                    <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid var(--gray-200);">
                    <h4 style="margin-bottom: 1rem; color: var(--gray-700); font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        🔌 Integrações — Z-API & Chatwoot
                    </h4>

                    <div style="display: grid; gap: 1.5rem;">
                        <!-- Z-API -->
                        <div style="background: var(--gray-50); padding: 1.25rem; border-radius: 12px; border: 1px solid var(--gray-200);">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                                <h5 style="margin:0; color: var(--gray-800); font-size: 0.9rem; display:flex; align-items:center; gap:.5rem;">
                                    🟦 Z-API (WhatsApp)
                                </h5>
                                <div style="display:flex; align-items:center; gap:.75rem;">
                                    <span id="zapiStatusBadge" class="badge badge-gray">Não testado</span>
                                    <button type="button" class="btn btn-secondary btn-small" onclick="handleTestZAPIConnection()">
                                        🔌 Testar Conexão
                                    </button>
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div class="form-group">
                                    <label class="form-label">ID da Instância</label>
                                    <input type="text" class="form-input" name="zapiInstance" value="${escapeHTML(settings.zapiInstance || '')}" placeholder="Ex: 3CXXXXXX">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Instance Token</label>
                                    <input type="password" class="form-input" name="zapiToken" value="${escapeHTML(settings.zapiToken || '')}" placeholder="Seu Token">
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div class="form-group">
                                    <label class="form-label">Client Token</label>
                                    <input type="password" class="form-input" name="zapiClientToken" value="${escapeHTML(settings.zapiClientToken || '')}" placeholder="Token do Cliente">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">URL Base da API (opcional)</label>
                                    <input type="url" class="form-input" name="zapiBaseUrl" value="${escapeHTML(settings.zapiBaseUrl || '')}" placeholder="https://api.z-api.io">
                                    <p style="font-size:0.75rem; color:var(--gray-400); margin-top:4px;">Deixe em branco para usar o padrão</p>
                                </div>
                            </div>

                            <!-- Janela de disparo -->
                            <hr style="margin: 1rem 0; border: none; border-top: 1px solid var(--gray-200);">
                            <p style="font-size:0.8rem; font-weight:600; color:var(--gray-600); margin-bottom:.75rem;">⏰ Janela de horário para disparos</p>
                            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                                <div class="form-group">
                                    <label class="form-label">Horário de Início</label>
                                    <input type="time" class="form-input" name="zapiSendFrom" value="${escapeHTML(settings.zapiSendFrom || '08:00')}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Horário de Término</label>
                                    <input type="time" class="form-input" name="zapiSendUntil" value="${escapeHTML(settings.zapiSendUntil || '20:00')}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Delay entre msgs (s)</label>
                                    <input type="number" class="form-input" name="zapiMsgDelay" value="${settings.zapiMsgDelay || 8}" min="3" max="120">
                                    <p style="font-size:0.7rem; color:var(--gray-400); margin-top:4px;">Mín. 3s recomendado</p>
                                </div>
                            </div>
                        </div>

                        <!-- Webhooks n8n -->
                        <div style="background: var(--gray-50); padding: 1.25rem; border-radius: 12px; border: 1px solid var(--gray-200);">
                            <h5 style="margin-bottom: 0.75rem; color: var(--gray-800); font-size: 0.9rem;">🤖 n8n / Webhooks</h5>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Webhook URL: Novos Leads</label>
                                    <input type="url" class="form-input" name="n8nWebhookLeads" value="${escapeHTML(settings.n8nWebhookLeads || '')}" placeholder="https://n8n.seu-servidor.com/webhook/...">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Webhook URL: Novos Agendamentos</label>
                                    <input type="url" class="form-input" name="n8nWebhookAppointments" value="${escapeHTML(settings.n8nWebhookAppointments || '')}" placeholder="https://n8n.seu-servidor.com/webhook/...">
                                </div>
                            </div>
                        </div>

                        <!-- Chatwoot -->
                        <div style="background: var(--gray-50); padding: 1.25rem; border-radius: 12px; border: 1px solid var(--gray-200);">
                            <h5 style="margin-bottom: 0.75rem; color: var(--gray-800); font-size: 0.9rem;">💬 Chatwoot</h5>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Account ID</label>
                                    <input type="text" class="form-input" name="chatwootAccountId" value="${escapeHTML(settings.chatwootAccountId || '')}" placeholder="Ex: 1">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">API Access Token</label>
                                    <input type="password" class="form-input" name="chatwootApiToken" value="${escapeHTML(settings.chatwootApiToken || '')}" placeholder="Token de acesso">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style="display:flex; gap:1rem; margin-top:1.5rem; flex-wrap:wrap;">
                        <button type="submit" class="btn btn-primary">💾 Salvar Configurações</button>
                        <button type="button" class="btn btn-secondary" onclick="exportFullBackup()">📦 Exportar Backup</button>
                        <button type="button" class="btn btn-secondary" onclick="importBackupJSON()">📥 Importar Backup</button>
                    </div>
                </form>
            </div>

            <!-- Estatísticas -->
            <div class="card" style="padding: var(--spacing-xl);">
                <h4 style="font-size: 1rem; font-weight: 600; margin-bottom: 1rem; color: var(--gray-800);">📊 Estatísticas do Sistema</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                    <div style="padding:1rem; background:var(--gray-50); border-radius:10px; text-align:center;">
                        <div style="font-size:1.75rem; font-weight:700; color:var(--primary-600);">${AppState.leads.length}</div>
                        <div style="font-size:0.75rem; color:var(--gray-500);">Leads</div>
                    </div>
                    <div style="padding:1rem; background:var(--gray-50); border-radius:10px; text-align:center;">
                        <div style="font-size:1.75rem; font-weight:700; color:var(--success-600);">${AppState.patients.length}</div>
                        <div style="font-size:0.75rem; color:var(--gray-500);">Pacientes</div>
                    </div>
                    <div style="padding:1rem; background:var(--gray-50); border-radius:10px; text-align:center;">
                        <div style="font-size:1.75rem; font-weight:700; color:var(--primary-600);">${AppState.appointments.length}</div>
                        <div style="font-size:0.75rem; color:var(--gray-500);">Agendamentos</div>
                    </div>
                    <div style="padding:1rem; background:var(--gray-50); border-radius:10px; text-align:center;">
                        <div style="font-size:1.75rem; font-weight:700; color:var(--primary-700);">${AppState.appointments.filter(a => a.attended).length}</div>
                        <div style="font-size:0.75rem; color:var(--gray-500);">Comparecimentos</div>
                    </div>
                    <div style="padding:1rem; background:var(--gray-50); border-radius:10px; text-align:center;">
                        <div style="font-size:1.25rem; font-weight:700; color:var(--gray-700);" id="storageUsage">...</div>
                        <div style="font-size:0.75rem; color:var(--gray-500);">LocalStorage</div>
                    </div>
                </div>
            </div>

            <!-- Sincronização em Nuvem -->
            <div class="card" style="padding: var(--spacing-xl); background: #f0f9ff; border: 1px solid #bae6fd;">
                <h4 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.75rem; color: #0369a1; display:flex; align-items:center; gap:.5rem;">
                    ☁️ Sincronização em Nuvem
                </h4>
                <p style="color: #0c4a6e; font-size: 0.875rem; margin-bottom: 1rem;">
                    Status: <strong id="cloudStatusLabel">${typeof isCloudConnected === 'function' && isCloudConnected() ? '<span style="color:#059669">Conectado</span>' : '<span style="color:#dc2626">Local (Offline)</span>'}</strong>
                </p>
                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    <button type="button" class="btn btn-small" onclick="forceSyncToCloud()" style="background:#0ea5e9; color:white; border:none;">
                        📤 Forçar Envio (Local → Nuvem)
                    </button>
                    <button type="button" class="btn btn-small" onclick="forceSyncFromCloud()" style="background:white; color:#0369a1; border:1px solid #bae6fd;">
                        📥 Forçar Recebimento (Nuvem → Local)
                    </button>
                </div>
                <p style="font-size: 0.75rem; color: #64748b; margin-top: 0.75rem;">
                    ⚠️ Use "Forçar Envio" se você aplicou o SQL e quer garantir que todos os dados locais subam para o servidor.
                </p>
            </div>

            <!-- Zona de Perigo -->
            <div class="card" style="padding: var(--spacing-xl); background: #fee2e2; border: 1px solid #fca5a5;">
                <h4 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.75rem; color: #991b1b; display:flex; align-items:center; gap:.5rem;">
                    ⚠️ Zona de Perigo
                </h4>
                <p style="color: #7f1d1d; font-size: 0.875rem; margin-bottom: 1rem;">
                    Ações irreversíveis. Use com cuidado.
                </p>
                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    <button type="button" class="btn btn-small" onclick="clearData('leads')" style="background:white; color:#991b1b; border:1px solid #fca5a5;">Limpar Leads</button>
                    <button type="button" class="btn btn-small" onclick="clearData('patients')" style="background:white; color:#991b1b; border:1px solid #fca5a5;">Limpar Pacientes</button>
                    <button type="button" class="btn btn-small" onclick="clearData('appointments')" style="background:white; color:#991b1b; border:1px solid #fca5a5;">Limpar Agendamentos</button>
                    <button type="button" class="btn btn-small" onclick="clearData('all')" style="background:#991b1b; color:white; border:1px solid #7f1d1d;">🚨 RESETAR TUDO</button>
                </div>
            </div>

        </div>
    `;

    updateStorageUsage();
}

// Handler para testar conexão Z-API com feedback visual
async function handleTestZAPIConnection() {
    const badge = document.getElementById('zapiStatusBadge');
    if (badge) {
        badge.className = 'badge badge-warning';
        badge.textContent = 'Testando...';
    }

    // Salva settings antes de testar
    const form = document.getElementById('settingsForm');
    if (form) {
        const fd = new FormData(form);
        AppState.settings = {
            ...AppState.settings,
            zapiInstance: fd.get('zapiInstance') || '',
            zapiToken: fd.get('zapiToken') || '',
            zapiClientToken: fd.get('zapiClientToken') || '',
            zapiBaseUrl: fd.get('zapiBaseUrl') || ''
        };
    }

    const result = await testZAPIConnection();

    if (badge) {
        if (result.connected) {
            badge.className = 'badge badge-success';
            badge.textContent = '✅ Conectado';
            showNotification('Z-API conectada com sucesso! Instância ativa.', 'success');
        } else {
            badge.className = 'badge badge-error';
            badge.textContent = '❌ Desconectado';
            showNotification(`Z-API: ${result.error || result.status}`, 'error');
        }
    }
}

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
            el.textContent = `${usedMB}MB (${pct}%)`;
            if (pct > 80) el.style.color = '#dc2626';
        }
    } catch (e) {}
}

function clearData(type) {
    const messages = {
        leads: 'Tem certeza que deseja apagar TODOS os leads?',
        patients: 'Tem certeza que deseja apagar TODOS os pacientes? Isso também apagará agendamentos.',
        appointments: 'Tem certeza que deseja apagar TODOS os agendamentos?',
        all: 'ATENÇÃO: Isso apagará TODO o banco de dados. Não pode ser desfeito. Tem certeza absoluta?'
    };
    if (!confirm(messages[type])) return;
    if (type === 'all') {
        if (!confirm('Última chance: Confirma o reset total do sistema?')) return;
        localStorage.clear();
        location.reload();
        return;
    }
    if (type === 'leads') { AppState.leads = []; saveToStorage(STORAGE_KEYS.LEADS, []); }
    if (type === 'patients') {
        AppState.patients = []; AppState.appointments = [];
        saveToStorage(STORAGE_KEYS.PATIENTS, []);
        saveToStorage(STORAGE_KEYS.APPOINTMENTS, []);
    }
    if (type === 'appointments') { AppState.appointments = []; saveToStorage(STORAGE_KEYS.APPOINTMENTS, []); }
    renderSettingsView();
    showNotification('Dados limpos com sucesso!', 'success');
}

function saveSettings(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    AppState.settings = {
        ...AppState.settings,
        crcName: formData.get('crcName') || '',
        dailyGoal: parseInt(formData.get('dailyGoal')),
        commissionValue: parseFloat(formData.get('commissionValue')),
        weeklyAppointmentsGoal: parseInt(formData.get('weeklyAppointmentsGoal')) || 80,
        weeklyVisitsGoal: parseInt(formData.get('weeklyVisitsGoal')) || 40,
        zapiInstance: formData.get('zapiInstance') || '',
        zapiToken: formData.get('zapiToken') || '',
        zapiClientToken: formData.get('zapiClientToken') || '',
        zapiBaseUrl: formData.get('zapiBaseUrl') || '',
        zapiSendFrom: formData.get('zapiSendFrom') || '08:00',
        zapiSendUntil: formData.get('zapiSendUntil') || '20:00',
        zapiMsgDelay: parseInt(formData.get('zapiMsgDelay')) || 8,
        n8nWebhookLeads: formData.get('n8nWebhookLeads') || '',
        n8nWebhookAppointments: formData.get('n8nWebhookAppointments') || '',
        chatwootAccountId: formData.get('chatwootAccountId') || '',
        chatwootApiToken: formData.get('chatwootApiToken') || ''
    };
    saveToStorage(STORAGE_KEYS.SETTINGS, AppState.settings);
    showNotification('Configurações salvas com sucesso!', 'success');
}

async function forceSyncToCloud() {
    if (!confirm('Isso enviará TODOS os seus dados locais para a nuvem. Continuar?')) return;
    showNotification('Iniciando sincronização forçada...', 'info');
    try {
        await Promise.all([
            saveToSupabase('leads', AppState.leads),
            saveToSupabase('patients', AppState.patients),
            saveToSupabase('appointments', AppState.appointments),
            saveToSupabase('settings', AppState.settings),
            saveToSupabase('old_patients', AppState.oldPatients)
        ]);
        showNotification('🚀 Sincronização concluída com sucesso!', 'success');
    } catch (error) {
        console.error('Force sync failed:', error);
        showNotification('Erro na sincronização forçada. Verifique o console.', 'error');
    }
}

async function forceSyncFromCloud() {
    if (!confirm('Deseja baixar todos os dados da nuvem? Isso mesclará com seus dados locais.')) return;
    showNotification('Baixando dados da nuvem...', 'info');
    if (typeof loadDataFromSupabase === 'function') {
        const success = await loadDataFromSupabase();
        if (success) {
            location.reload();
        } else {
            showNotification('Falha ao carregar dados da nuvem.', 'error');
        }
    }
}

// Export functions
window.initSettingsModule = initSettingsModule;
window.saveSettings = saveSettings;
window.clearData = clearData;
window.forceSyncToCloud = forceSyncToCloud;
window.forceSyncFromCloud = forceSyncFromCloud;
window.handleTestZAPIConnection = handleTestZAPIConnection;
