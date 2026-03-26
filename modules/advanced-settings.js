// Configurações Avançadas - CRM Odonto Company
// =============================================

const AdvancedSettingsState = {
    settings: [],
    themes: [],
    permissions: [],
    backups: [],
    logs: [],
    security: [],
    notifications: [],
    customizations: []
};

// Inicializar Módulo de Configurações Avançadas
function initAdvancedSettingsModule() {
    AdvancedSettingsState.settings = AppState.advancedSettings || [];
    AdvancedSettingsState.themes = AppState.themes || [];
    AdvancedSettingsState.permissions = AppState.permissions || [];
    AdvancedSettingsState.backups = AppState.backups || [];
    AdvancedSettingsState.logs = AppState.logs || [];
    AdvancedSettingsState.security = AppState.security || [];
    AdvancedSettingsState.notifications = AppState.notifications || [];
    AdvancedSettingsState.customizations = AppState.customizations || [];
    renderAdvancedSettingsDashboard();
    setupAdvancedSettingsEvents();
    loadAdvancedSettingsData();
}

// Carregar Dados de Configurações
function loadAdvancedSettingsData() {
    console.log('📦 Usando dados de Configurações do AppState...');
}

// Renderizar Dashboard de Configurações Avançadas
function renderAdvancedSettingsDashboard() {
    const container = document.getElementById('advancedSettingsContent');
    if (!container) return;

    const stats = calculateAdvancedSettingsStats();

    container.innerHTML = `
        <style>
            .advanced-settings-header {
                background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
                color: white;
                padding: 2rem;
                border-radius: 16px;
                margin-bottom: 2rem;
            }

            .advanced-settings-controls {
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                align-items: center;
                margin-bottom: 2rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--gray-200);
            }

            .advanced-settings-stats-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .advanced-settings-stat-card {
                background: white;
                padding: 1.5rem;
                border-radius: 16px;
                border: 1px solid var(--gray-200);
                text-align: center;
                box-shadow: var(--shadow-md);
            }

            .advanced-settings-stat-value {
                font-size: 2rem;
                font-weight: 800;
                color: var(--gray-900);
                margin-bottom: 0.5rem;
            }

            .advanced-settings-stat-label {
                font-size: 0.875rem;
                color: var(--gray-600);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .advanced-settings-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
                margin-bottom: 1rem;
                box-shadow: var(--shadow-md);
                transition: all 0.3s ease;
                position: relative;
            }

            .advanced-settings-card.active {
                border-color: #8b5cf6;
                background: linear-gradient(135deg, #f3e8ff, #f0e5ff);
            }

            .advanced-settings-card.warning {
                border-color: #f59e0b;
                background: linear-gradient(135deg, #fffbeb, #fef3c7);
            }

            .advanced-settings-card.error {
                border-color: #ef4444;
                background: linear-gradient(135deg, #fef2f2, #fee2e2);
            }

            .advanced-settings-header-info {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 1rem;
            }

            .advanced-settings-info {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .advanced-settings-icon {
                width: 60px;
                height: 60px;
                border-radius: 12px;
                background: linear-gradient(135deg, #8b5cf6, #ec4899);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 1.5rem;
            }

            .advanced-settings-details h4 {
                margin: 0 0 0.25rem 0;
                font-size: 1.25rem;
                color: var(--gray-900);
            }

            .advanced-settings-details p {
                margin: 0;
                font-size: 0.9rem;
                color: var(--gray-600);
            }

            .advanced-settings-status {
                padding: 4px 12px;
                border-radius: 999px;
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;
            }

            .status-active { background: #f3e8ff; color: #5b21b6; }
            .status-warning { background: #fffbeb; color: #92400e; }
            .status-error { background: #fee2e2; color: #991b1b; }

            .setting-list {
                display: grid;
                gap: 0.5rem;
                margin-bottom: 1.5rem;
            }

            .setting-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                padding: 0.75rem;
                background: var(--gray-50);
                border-radius: 8px;
                border-left: 4px solid #8b5cf6;
            }

            .setting-item.active {
                border-left-color: #8b5cf6;
                background: #f3e8ff;
            }

            .setting-item.warning {
                border-left-color: #f59e0b;
                background: #fffbeb;
            }

            .setting-item.error {
                border-left-color: #ef4444;
                background: #fef2f2;
            }

            .setting-info h6 {
                margin: 0 0 0.25rem 0;
                font-size: 0.9rem;
                color: var(--gray-900);
            }

            .setting-info p {
                margin: 0;
                font-size: 0.8rem;
                color: var(--gray-600);
            }

            .setting-value {
                font-weight: 700;
                font-size: 0.9rem;
                color: var(--gray-900);
            }

            .progress-bar-advanced-settings {
                width: 100%;
                height: 12px;
                background: var(--gray-200);
                border-radius: 999px;
                overflow: hidden;
                margin-top: 0.5rem;
            }

            .progress-fill-advanced-settings {
                height: 100%;
                background: linear-gradient(90deg, #8b5cf6, #ec4899);
                transition: width 0.3s ease;
            }

            .config-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
                margin-bottom: 1.5rem;
            }

            .config-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
            }

            .config-card h5 {
                margin: 0 0 0.5rem 0;
                font-size: 1rem;
                color: var(--gray-900);
            }

            .config-card p {
                margin: 0;
                font-size: 0.9rem;
                color: var(--gray-600);
                line-height: 1.5;
            }

            .advanced-settings-actions {
                display: flex;
                gap: 0.5rem;
                margin-top: 1.5rem;
            }

            .btn-advanced-settings {
                padding: 0.5rem 1rem;
                border-radius: 8px;
                border: 1px solid var(--gray-300);
                background: white;
                cursor: pointer;
                font-size: 0.875rem;
                transition: all 0.2s;
            }

            .btn-advanced-settings:hover {
                background: var(--gray-100);
                transform: translateY(-1px);
            }

            .btn-primary-advanced-settings {
                background: #8b5cf6;
                color: white;
                border-color: #8b5cf6;
            }

            .btn-primary-advanced-settings:hover {
                background: #7c3aed;
            }

            .btn-success-advanced-settings {
                background: #10b981;
                color: white;
                border-color: #10b981;
            }

            .btn-success-advanced-settings:hover {
                background: #059669;
            }

            .btn-warning-advanced-settings {
                background: #f59e0b;
                color: white;
                border-color: #f59e0b;
            }

            .btn-warning-advanced-settings:hover {
                background: #d97706;
            }

            .btn-danger-advanced-settings {
                background: #ef4444;
                color: white;
                border-color: #ef4444;
            }

            .btn-danger-advanced-settings:hover {
                background: #dc2626;
            }

            .analytics-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
            }

            .chart-container {
                width: 100%;
                height: 300px;
                margin-top: 1rem;
            }
        </style>

        <!-- Header de Configurações Avançadas -->
        <div class="advanced-settings-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div>
                    <h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; color: white;">⚙️ Configurações Avançadas</h2>
                    <p style="margin: 0; opacity: 0.9;">Personalização, segurança e controle do sistema</p>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-primary-advanced-settings" onclick="showNewSettingForm()">➕ Nova Configuração</button>
                    <button class="btn-success-advanced-settings" onclick="showNewThemeForm()">🎨 Novo Tema</button>
                    <button class="btn-warning-advanced-settings" onclick="showNewPermissionForm()">🔒 Nova Permissão</button>
                </div>
            </div>
        </div>

        <!-- Estatísticas Gerais -->
        <div class="advanced-settings-stats-grid">
            <div class="advanced-settings-stat-card">
                <div class="advanced-settings-stat-value">${stats.totalSettings}</div>
                <div class="advanced-settings-stat-label">Configurações</div>
            </div>

            <div class="advanced-settings-stat-card">
                <div class="advanced-settings-stat-value" style="color: #8b5cf6;">${stats.activeSettings}</div>
                <div class="advanced-settings-stat-label">Ativas</div>
            </div>

            <div class="advanced-settings-stat-card">
                <div class="advanced-settings-stat-value" style="color: #f59e0b;">${stats.warningSettings}</div>
                <div class="advanced-settings-stat-label">Avisos</div>
            </div>

            <div class="advanced-settings-stat-card">
                <div class="advanced-settings-stat-value" style="color: #ef4444;">${stats.errorSettings}</div>
                <div class="advanced-settings-stat-label">Erros</div>
            </div>
        </div>

        <!-- Abas de Navegação -->
        <div class="advanced-settings-controls">
            <button class="btn-primary-advanced-settings active" onclick="switchAdvancedSettingsTab('settings')" id="tab-settings">
                ⚙️ Configurações
            </button>
            <button class="btn-primary-advanced-settings" onclick="switchAdvancedSettingsTab('themes')" id="tab-themes">
                🎨 Temas
            </button>
            <button class="btn-primary-advanced-settings" onclick="switchAdvancedSettingsTab('permissions')" id="tab-permissions">
                🔒 Permissões
            </button>
            <button class="btn-primary-advanced-settings" onclick="switchAdvancedSettingsTab('backups')" id="tab-backups">
                💾 Backups
            </button>
            <button class="btn-primary-advanced-settings" onclick="switchAdvancedSettingsTab('analytics')" id="tab-analytics">
                📈 Analytics
            </button>
        </div>

        <!-- Conteúdo das Abas -->
        <div id="advanced-settings-settings" class="advanced-settings-content active">
            ${renderSettingsTab()}
        </div>

        <div id="advanced-settings-themes" class="advanced-settings-content">
            ${renderThemesTab()}
        </div>

        <div id="advanced-settings-permissions" class="advanced-settings-content">
            ${renderPermissionsTab()}
        </div>

        <div id="advanced-settings-backups" class="advanced-settings-content">
            ${renderBackupsTab()}
        </div>

        <div id="advanced-settings-analytics" class="advanced-settings-content">
            ${renderAnalyticsTab()}
        </div>
    `;
}

// Renderizar Aba de Configurações
function renderSettingsTab() {
    return `
        <div class="advanced-settings-card">
            <div class="advanced-settings-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">⚙️ Lista de Configurações</h3>
                <div style="display: flex; gap: 0.5rem;">
                    <select class="form-select" id="settingFilter" onchange="filterSettings(this.value)">
                        <option value="all">Todos</option>
                        <option value="active">Ativas</option>
                        <option value="warning">Avisos</option>
                        <option value="error">Erros</option>
                    </select>
                    <button class="btn-primary-advanced-settings" onclick="exportSettings()">📤 Exportar</button>
                </div>
            </div>
            
            <div id="settingsList" style="display: grid; gap: 1rem;">
                ${AdvancedSettingsState.settings.map(renderSettingCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Temas
function renderThemesTab() {
    return `
        <div class="advanced-settings-card">
            <div class="advanced-settings-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">🎨 Gestão de Temas</h3>
                <button class="btn-success-advanced-settings" onclick="showNewThemeForm()">➕ Novo Tema</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                ${AdvancedSettingsState.themes.map(renderThemeCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Permissões
function renderPermissionsTab() {
    return `
        <div class="advanced-settings-card">
            <div class="advanced-settings-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">🔒 Gestão de Permissões</h3>
                <button class="btn-warning-advanced-settings" onclick="showNewPermissionForm()">➕ Nova Permissão</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                ${AdvancedSettingsState.permissions.map(renderPermissionCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Backups
function renderBackupsTab() {
    return `
        <div class="advanced-settings-card">
            <div class="advanced-settings-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">💾 Gestão de Backups</h3>
                <button class="btn-primary-advanced-settings" onclick="showNewBackupForm()">➕ Novo Backup</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                ${AdvancedSettingsState.backups.map(renderBackupCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Analytics
function renderAnalyticsTab() {
    return `
        <div class="analytics-card">
            <div class="advanced-settings-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📈 Analytics de Configurações</h3>
                <button class="btn-success-advanced-settings" onclick="generateAdvancedSettingsReport()">📄 Gerar Relatório</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                <div class="analytics-card">
                    <h4 style="margin: 0 0 1rem 0; color: var(--gray-900);">🎯 Performance</h4>
                    <div style="display: grid; gap: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Configurações Ativas</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Total</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${AdvancedSettingsState.settings.filter(s => s.status === 'active').length}
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Temas</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Total</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${AdvancedSettingsState.themes.length}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="analytics-card">
                    <h4 style="margin: 0 0 1rem 0; color: var(--gray-900);">📊 Métricas</h4>
                    <div style="display: grid; gap: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Permissões</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Total</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${AdvancedSettingsState.permissions.length}
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Backups</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Total</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${AdvancedSettingsState.backups.length}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Renderizar Card de Configuração
function renderSettingCard(setting) {
    const cssClass = setting.status === 'active' ? 'active' : setting.status === 'warning' ? 'warning' : 'error';
    const statusClass = `status-${setting.status}`;
    const themes = AdvancedSettingsState.themes.filter(t => t.settingId === setting.id);
    const permissions = AdvancedSettingsState.permissions.filter(p => p.settingId === setting.id);
    const backups = AdvancedSettingsState.backups.filter(b => b.settingId === setting.id);

    return `
        <div class="advanced-settings-card ${cssClass}">
            <div class="advanced-settings-header-info">
                <div class="advanced-settings-info">
                    <div class="advanced-settings-icon">⚙️</div>
                    <div class="advanced-settings-details">
                        <h4>${escapeHTML(setting.name)}</h4>
                        <p>${escapeHTML(setting.description)}</p>
                        <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                            ${setting.type} • ${setting.category} • ${setting.status}
                        </div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <span class="advanced-settings-status ${statusClass}">${setting.status}</span>
                    <div style="font-weight: 700; color: var(--gray-900); margin-top: 0.5rem;">${themes.length} temas</div>
                </div>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Temas da Configuração:</div>
                <div class="setting-list">
                    ${themes.slice(0, 4).map(theme => `
                        <div class="setting-item ${theme.status}">
                            <div class="setting-info">
                                <h6>${escapeHTML(theme.name)}</h6>
                                <p>${theme.type} • ${theme.status}</p>
                            </div>
                            <div class="setting-value" style="color: ${getSettingColor(theme.status)};">
                                ${theme.version || '1.0.0'}
                            </div>
                        </div>
                    `).join('') || '<div style="color: var(--gray-500);">Nenhum tema</div>'}
                </div>
            </div>

            <div class="config-grid">
                <div class="config-card">
                    <h5 style="margin: 0 0 0.5rem 0; color: var(--gray-900);">🎨 Temas</h5>
                    <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Tipos:</span>
                            <span style="font-weight: 700;">${[...new Set(themes.map(t => t.type))].join(', ')}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Permissões:</span>
                            <span style="font-weight: 700;">${permissions.length}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Backups:</span>
                            <span style="font-weight: 700;">${backups.length}</span>
                        </div>
                    </div>
                </div>
                
                <div class="config-card">
                    <h5 style="margin: 0 0 0.5rem 0; color: var(--gray-900);">🎯 Configurações</h5>
                    <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Valor:</span>
                            <span style="font-weight: 700;">${setting.value || 'N/A'}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Data Criação:</span>
                            <span style="font-weight: 700;">${new Date(setting.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Última Atualização:</span>
                            <span style="font-weight: 700;">${new Date(setting.updatedAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="progress-bar-advanced-settings">
                <div class="progress-fill-advanced-settings" style="width: ${Math.min(100, themes.length * 25)}%; background: ${getSettingColor(setting.status)};"></div>
            </div>

            <div class="advanced-settings-actions">
                <button class="btn-advanced-settings btn-primary-advanced-settings" onclick="viewSettingDetails('${setting.id}')">👁️ Detalhes</button>
                <button class="btn-advanced-settings btn-success-advanced-settings" onclick="addThemeToSetting('${setting.id}')">🎨 Tema</button>
                <button class="btn-advanced-settings btn-warning-advanced-settings" onclick="updateSettingStatus('${setting.id}')">✅ Status</button>
                <button class="btn-advanced-settings btn-danger-advanced-settings" onclick="deleteSetting('${setting.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Tema
function renderThemeCard(theme) {
    const cssClass = theme.status === 'active' ? 'active' : theme.status === 'warning' ? 'warning' : 'error';
    const version = theme.version || '1.0.0';

    return `
        <div class="advanced-settings-card ${cssClass}">
            <div class="advanced-settings-header-info">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">🎨 ${escapeHTML(theme.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        ${theme.type} • ${theme.category} • ${theme.status}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">${version}</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">Versão</div>
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Descrição:</div>
                <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                    ${escapeHTML(theme.description)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Tipo:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${theme.type}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Categoria:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${theme.category || 'N/A'}</div>
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Criação:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(theme.createdAt).toLocaleDateString('pt-BR')}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Atualização:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(theme.updatedAt).toLocaleDateString('pt-BR')}</div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-advanced-settings btn-primary-advanced-settings" onclick="editTheme('${theme.id}')">✏️ Editar</button>
                <button class="btn-advanced-settings btn-success-advanced-settings" onclick="updateThemeStatus('${theme.id}')">✅ Status</button>
                <button class="btn-advanced-settings btn-warning-advanced-settings" onclick="updateThemeVersion('${theme.id}')">📦 Versão</button>
                <button class="btn-advanced-settings btn-danger-advanced-settings" onclick="deleteTheme('${theme.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Permissão
function renderPermissionCard(permission) {
    const cssClass = permission.status === 'active' ? 'active' : permission.status === 'warning' ? 'warning' : 'error';

    return `
        <div class="advanced-settings-card ${cssClass}">
            <div class="advanced-settings-header-info">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">🔒 ${escapeHTML(permission.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        ${permission.type} • ${permission.level} • ${permission.status}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">${permission.users || 0} usuários</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">Usuários</div>
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Descrição:</div>
                <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                    ${escapeHTML(permission.description)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Tipo:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${permission.type}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Nível:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${permission.level}</div>
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Criação:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(permission.createdAt).toLocaleDateString('pt-BR')}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Atualização:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(permission.updatedAt).toLocaleDateString('pt-BR')}</div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-advanced-settings btn-primary-advanced-settings" onclick="editPermission('${permission.id}')">✏️ Editar</button>
                <button class="btn-advanced-settings btn-success-advanced-settings" onclick="updatePermissionStatus('${permission.id}')">✅ Status</button>
                <button class="btn-advanced-settings btn-warning-advanced-settings" onclick="updatePermissionUsers('${permission.id}')">👥 Usuários</button>
                <button class="btn-advanced-settings btn-danger-advanced-settings" onclick="deletePermission('${permission.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Backup
function renderBackupCard(backup) {
    const cssClass = backup.status === 'active' ? 'active' : backup.status === 'warning' ? 'warning' : 'error';
    const setting = AdvancedSettingsState.settings.find(s => s.id === backup.settingId);

    return `
        <div class="advanced-settings-card ${cssClass}">
            <div class="advanced-settings-header-info">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">💾 ${escapeHTML(backup.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        ${setting ? setting.name : 'Configuração desconhecida'} • ${backup.type} • ${backup.status}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">${backup.size || 0} MB</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">Tamanho</div>
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Descrição:</div>
                <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                    ${escapeHTML(backup.description)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Tipo:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${backup.type}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Formato:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${backup.format || 'N/A'}</div>
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Criação:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(backup.createdAt).toLocaleDateString('pt-BR')}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Atualização:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(backup.updatedAt).toLocaleDateString('pt-BR')}</div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-advanced-settings btn-primary-advanced-settings" onclick="editBackup('${backup.id}')">✏️ Editar</button>
                <button class="btn-advanced-settings btn-success-advanced-settings" onclick="updateBackupStatus('${backup.id}')">✅ Status</button>
                <button class="btn-advanced-settings btn-warning-advanced-settings" onclick="updateBackupSize('${backup.id}')">📏 Tamanho</button>
                <button class="btn-advanced-settings btn-danger-advanced-settings" onclick="deleteBackup('${backup.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Funções de Controle
function switchAdvancedSettingsTab(tabName) {
    // Atualizar classes das abas
    document.querySelectorAll('.btn-primary-advanced-settings').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');

    // Mostrar/esconder conteúdo
    document.querySelectorAll('.advanced-settings-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`advanced-settings-${tabName}`).classList.add('active');
}

// Funções de Configurações
function showNewSettingForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">⚙️ Nova Configuração</h4>
            <form id="newSettingForm" onsubmit="saveSetting(event)">
                <div class="form-group">
                    <label class="form-label">Nome da Configuração *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição da configuração..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" name="type">
                            <option value="Sistema">Sistema</option>
                            <option value="Usuário">Usuário</option>
                            <option value="Aplicação">Aplicação</option>
                            <option value="Segurança">Segurança</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Categoria</label>
                        <input type="text" class="form-input" name="category" placeholder="Categoria da configuração">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Valor</label>
                        <input type="text" class="form-input" name="value" placeholder="Valor da configuração">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Prioridade</label>
                        <select class="form-select" name="priority">
                            <option value="Baixa">Baixa</option>
                            <option value="Média">Média</option>
                            <option value="Alta">Alta</option>
                        </select>
                    </div>
                </div>
            </form>
        </div>
    `;

    openModal('Nova Configuração', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Configuração', class: 'btn-primary', onclick: "document.getElementById('newSettingForm').requestSubmit()" }
    ]);
}

function saveSetting(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const setting = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        type: formData.get('type') || 'Sistema',
        category: formData.get('category') || '',
        value: formData.get('value') || '',
        priority: formData.get('priority') || 'Média',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    AdvancedSettingsState.settings.push(setting);
    AppState.advancedSettings = AdvancedSettingsState.settings;
    saveToStorage(STORAGE_KEYS.ADVANCED_SETTINGS, AppState.advancedSettings);

    closeModal();
    renderAdvancedSettingsDashboard();
    showNotification(`Configuração "${setting.name}" criada com sucesso!`, 'success');
}

// Funções de Temas
function showNewThemeForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">🎨 Novo Tema</h4>
            <form id="newThemeForm" onsubmit="saveTheme(event)">
                <div class="form-group">
                    <label class="form-label">Nome do Tema *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição do tema..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Configuração</label>
                        <select class="form-select" name="settingId">
                            ${AdvancedSettingsState.settings.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" name="type">
                            <option value="Claro">Claro</option>
                            <option value="Escuro">Escuro</option>
                            <option value="Colorido">Colorido</option>
                            <option value="Minimalista">Minimalista</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Categoria</label>
                        <input type="text" class="form-input" name="category" placeholder="Categoria do tema">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Versão</label>
                        <input type="text" class="form-input" name="version" placeholder="Versão do tema">
                    </div>
                </div>
            </form>
        </div>
    `;

    openModal('Novo Tema', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Tema', class: 'btn-primary', onclick: "document.getElementById('newThemeForm').requestSubmit()" }
    ]);
}

function saveTheme(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const theme = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        settingId: formData.get('settingId'),
        type: formData.get('type') || 'Claro',
        category: formData.get('category') || '',
        version: formData.get('version') || '1.0.0',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    AdvancedSettingsState.themes.push(theme);
    AppState.themes = AdvancedSettingsState.themes;
    saveToStorage(STORAGE_KEYS.THEMES, AppState.themes);

    closeModal();
    renderAdvancedSettingsDashboard();
    showNotification(`Tema "${theme.name}" criado com sucesso!`, 'success');
}

// Funções de Permissões
function showNewPermissionForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">🔒 Nova Permissão</h4>
            <form id="newPermissionForm" onsubmit="savePermission(event)">
                <div class="form-group">
                    <label class="form-label">Nome da Permissão *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição da permissão..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Configuração</label>
                        <select class="form-select" name="settingId">
                            ${AdvancedSettingsState.settings.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" name="type">
                            <option value="Leitura">Leitura</option>
                            <option value="Escrita">Escrita</option>
                            <option value="Administração">Administração</option>
                            <option value="Sistema">Sistema</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Nível</label>
                        <select class="form-select" name="level">
                            <option value="Baixo">Baixo</option>
                            <option value="Médio">Médio</option>
                            <option value="Alto">Alto</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Usuários</label>
                        <input type="number" class="form-input" name="users" min="0" step="1">
                    </div>
                </div>
            </form>
        </div>
    `;

    openModal('Nova Permissão', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Permissão', class: 'btn-primary', onclick: "document.getElementById('newPermissionForm').requestSubmit()" }
    ]);
}

function savePermission(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const permission = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        settingId: formData.get('settingId'),
        type: formData.get('type') || 'Leitura',
        level: formData.get('level') || 'Baixo',
        users: parseInt(formData.get('users')) || 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    AdvancedSettingsState.permissions.push(permission);
    AppState.permissions = AdvancedSettingsState.permissions;
    saveToStorage(STORAGE_KEYS.PERMISSIONS, AppState.permissions);

    closeModal();
    renderAdvancedSettingsDashboard();
    showNotification(`Permissão "${permission.name}" criada com sucesso!`, 'success');
}

// Funções de Backups
function showNewBackupForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">💾 Novo Backup</h4>
            <form id="newBackupForm" onsubmit="saveBackup(event)">
                <div class="form-group">
                    <label class="form-label">Nome do Backup *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição do backup..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Configuração</label>
                        <select class="form-select" name="settingId">
                            ${AdvancedSettingsState.settings.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" name="type">
                            <option value="Completo">Completo</option>
                            <option value="Parcial">Parcial</option>
                            <option value="Incremental">Incremental</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Formato</label>
                        <input type="text" class="form-input" name="format" placeholder="Formato do backup">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Tamanho</label>
                        <input type="number" class="form-input" name="size" min="0" step="0.01">
                    </div>
                </div>
            </form>
        </div>
    `;

    openModal('Novo Backup', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Backup', class: 'btn-primary', onclick: "document.getElementById('newBackupForm').requestSubmit()" }
    ]);
}

function saveBackup(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const backup = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        settingId: formData.get('settingId'),
        type: formData.get('type') || 'Completo',
        format: formData.get('format') || '',
        size: parseFloat(formData.get('size')) || 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    AdvancedSettingsState.backups.push(backup);
    AppState.backups = AdvancedSettingsState.backups;
    saveToStorage(STORAGE_KEYS.BACKUPS, AppState.backups);

    closeModal();
    renderAdvancedSettingsDashboard();
    showNotification(`Backup "${backup.name}" criado com sucesso!`, 'success');
}

// Funções Auxiliares
function calculateAdvancedSettingsStats() {
    const totalSettings = AdvancedSettingsState.settings.length;
    const activeSettings = AdvancedSettingsState.settings.filter(s => s.status === 'active').length;
    const warningSettings = AdvancedSettingsState.settings.filter(s => s.status === 'warning').length;
    const errorSettings = AdvancedSettingsState.settings.filter(s => s.status === 'error').length;

    return {
        totalSettings,
        activeSettings,
        warningSettings,
        errorSettings
    };
}

function getSettingColor(status) {
    if (status === 'active') return '#8b5cf6';
    if (status === 'warning') return '#f59e0b';
    return '#ef4444';
}

function filterSettings(status) {
    const filteredSettings = status === 'all' ?
        AdvancedSettingsState.settings :
        AdvancedSettingsState.settings.filter(s => s.status === status);

    const settingsList = document.getElementById('settingsList');
    settingsList.innerHTML = filteredSettings.map(renderSettingCard).join('');
}

function exportSettings() {
    const csvContent = [
        ['Configuração', 'Status', 'Tipo', 'Categoria', 'Valor', 'Prioridade', 'Data Criação', 'Data Atualização'],
        ...AdvancedSettingsState.settings.map(s => [
            s.name, s.status, s.type, s.category, s.value, s.priority,
            new Date(s.createdAt).toLocaleDateString('pt-BR'),
            new Date(s.updatedAt).toLocaleDateString('pt-BR')
        ])
    ].map(row => row.join(',')).join('\n');

    downloadFile('configuracoes.csv', csvContent, 'text/csv');
    showNotification('Configurações exportadas com sucesso!', 'success');
}

function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Configurar Eventos
function setupAdvancedSettingsEvents() {
    // Atualizar quando os dados mudarem
    document.addEventListener('advancedSettingsUpdated', () => {
        AdvancedSettingsState.settings = AppState.advancedSettings;
        AdvancedSettingsState.themes = AppState.themes;
        AdvancedSettingsState.permissions = AppState.permissions;
        AdvancedSettingsState.backups = AppState.backups;
        AdvancedSettingsState.logs = AppState.logs;
        AdvancedSettingsState.security = AppState.security;
        AdvancedSettingsState.notifications = AppState.notifications;
        AdvancedSettingsState.customizations = AppState.customizations;
        renderAdvancedSettingsDashboard();
    });
}

// Exportar funções globais
window.initAdvancedSettingsModule = initAdvancedSettingsModule;
window.renderAdvancedSettingsDashboard = renderAdvancedSettingsDashboard;
window.setupAdvancedSettingsEvents = setupAdvancedSettingsEvents;
window.switchAdvancedSettingsTab = switchAdvancedSettingsTab;
window.showNewSettingForm = showNewSettingForm;
window.saveSetting = saveSetting;
window.showNewThemeForm = showNewThemeForm;
window.saveTheme = saveTheme;
window.showNewPermissionForm = showNewPermissionForm;
window.savePermission = savePermission;
window.showNewBackupForm = showNewBackupForm;
window.saveBackup = saveBackup;
window.calculateAdvancedSettingsStats = calculateAdvancedSettingsStats;
window.getSettingColor = getSettingColor;
window.filterSettings = filterSettings;
window.exportSettings = exportSettings;
window.downloadFile = downloadFile;