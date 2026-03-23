// Integrações Externas - CRM Odonto Company
// =============================================

const IntegrationsState = {
    integrations: [],
    apis: [],
    webhooks: [],
    syncs: [],
    connections: [],
    logs: [],
    errors: [],
    configurations: []
};

// Inicializar Módulo de Integrações Externas
function initExternalIntegrationsModule() {
    IntegrationsState.integrations = AppState.integrations || [];
    IntegrationsState.apis = AppState.apis || [];
    IntegrationsState.webhooks = AppState.webhooks || [];
    IntegrationsState.syncs = AppState.syncs || [];
    IntegrationsState.connections = AppState.connections || [];
    IntegrationsState.logs = AppState.logs || [];
    IntegrationsState.errors = AppState.errors || [];
    IntegrationsState.configurations = AppState.configurations || [];
    renderIntegrationsDashboard();
    setupIntegrationsEvents();
    loadIntegrationsData();
}

// Renderizar Dashboard de Integrações Externas
function renderIntegrationsDashboard() {
    const container = document.getElementById('integrationsContent');
    if (!container) return;

    const stats = calculateIntegrationsStats();

    container.innerHTML = `
        <style>
            .integrations-header {
                background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
                color: white;
                padding: 2rem;
                border-radius: 16px;
                margin-bottom: 2rem;
            }

            .integrations-controls {
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                align-items: center;
                margin-bottom: 2rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--gray-200);
            }

            .integrations-stats-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .integrations-stat-card {
                background: white;
                padding: 1.5rem;
                border-radius: 16px;
                border: 1px solid var(--gray-200);
                text-align: center;
                box-shadow: var(--shadow-md);
            }

            .integrations-stat-value {
                font-size: 2rem;
                font-weight: 800;
                color: var(--gray-900);
                margin-bottom: 0.5rem;
            }

            .integrations-stat-label {
                font-size: 0.875rem;
                color: var(--gray-600);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .integrations-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
                margin-bottom: 1rem;
                box-shadow: var(--shadow-md);
                transition: all 0.3s ease;
                position: relative;
            }

            .integrations-card.active {
                border-color: #10b981;
                background: linear-gradient(135deg, #f0fdf4, #dcfce7);
            }

            .integrations-card.error {
                border-color: #ef4444;
                background: linear-gradient(135deg, #fef2f2, #fee2e2);
            }

            .integrations-card.syncing {
                border-color: #f59e0b;
                background: linear-gradient(135deg, #fffbeb, #fef3c7);
            }

            .integrations-header-info {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 1rem;
            }

            .integrations-info {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .integrations-icon {
                width: 60px;
                height: 60px;
                border-radius: 12px;
                background: linear-gradient(135deg, #10b981, #06b6d4);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 1.5rem;
            }

            .integrations-details h4 {
                margin: 0 0 0.25rem 0;
                font-size: 1.25rem;
                color: var(--gray-900);
            }

            .integrations-details p {
                margin: 0;
                font-size: 0.9rem;
                color: var(--gray-600);
            }

            .integrations-status {
                padding: 4px 12px;
                border-radius: 999px;
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;
            }

            .status-active { background: #dcfce7; color: #065f46; }
            .status-error { background: #fee2e2; color: #991b1b; }
            .status-syncing { background: #fef3c7; color: #92400e; }

            .api-list {
                display: grid;
                gap: 0.5rem;
                margin-bottom: 1.5rem;
            }

            .api-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                padding: 0.75rem;
                background: var(--gray-50);
                border-radius: 8px;
                border-left: 4px solid #10b981;
            }

            .api-item.active {
                border-left-color: #10b981;
                background: #f0fdf4;
            }

            .api-item.error {
                border-left-color: #ef4444;
                background: #fef2f2;
            }

            .api-item.syncing {
                border-left-color: #f59e0b;
                background: #fffbeb;
            }

            .api-info h6 {
                margin: 0 0 0.25rem 0;
                font-size: 0.9rem;
                color: var(--gray-900);
            }

            .api-info p {
                margin: 0;
                font-size: 0.8rem;
                color: var(--gray-600);
            }

            .api-value {
                font-weight: 700;
                font-size: 0.9rem;
                color: var(--gray-900);
            }

            .progress-bar-integrations {
                width: 100%;
                height: 12px;
                background: var(--gray-200);
                border-radius: 999px;
                overflow: hidden;
                margin-top: 0.5rem;
            }

            .progress-fill-integrations {
                height: 100%;
                background: linear-gradient(90deg, #10b981, #06b6d4);
                transition: width 0.3s ease;
            }

            .connection-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
                margin-bottom: 1.5rem;
            }

            .connection-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
            }

            .connection-card h5 {
                margin: 0 0 0.5rem 0;
                font-size: 1rem;
                color: var(--gray-900);
            }

            .connection-card p {
                margin: 0;
                font-size: 0.9rem;
                color: var(--gray-600);
                line-height: 1.5;
            }

            .integrations-actions {
                display: flex;
                gap: 0.5rem;
                margin-top: 1.5rem;
            }

            .btn-integrations {
                padding: 0.5rem 1rem;
                border-radius: 8px;
                border: 1px solid var(--gray-300);
                background: white;
                cursor: pointer;
                font-size: 0.875rem;
                transition: all 0.2s;
            }

            .btn-integrations:hover {
                background: var(--gray-100);
                transform: translateY(-1px);
            }

            .btn-primary-integrations {
                background: #10b981;
                color: white;
                border-color: #10b981;
            }

            .btn-primary-integrations:hover {
                background: #059669;
            }

            .btn-success-integrations {
                background: #06b6d4;
                color: white;
                border-color: #06b6d4;
            }

            .btn-success-integrations:hover {
                background: #0891b2;
            }

            .btn-warning-integrations {
                background: #f59e0b;
                color: white;
                border-color: #f59e0b;
            }

            .btn-warning-integrations:hover {
                background: #d97706;
            }

            .btn-danger-integrations {
                background: #ef4444;
                color: white;
                border-color: #ef4444;
            }

            .btn-danger-integrations:hover {
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

        <!-- Header de Integrações -->
        <div class="integrations-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div>
                    <h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; color: white;">🔗 Integrações Externas</h2>
                    <p style="margin: 0; opacity: 0.9;">Conexões, APIs e sincronização de dados</p>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-primary-integrations" onclick="showNewIntegrationForm()">➕ Nova Integração</button>
                    <button class="btn-success-integrations" onclick="showNewApiForm()">🌐 Nova API</button>
                    <button class="btn-warning-integrations" onclick="showNewWebhookForm()">🔗 Novo Webhook</button>
                </div>
            </div>
        </div>

        <!-- Estatísticas Gerais -->
        <div class="integrations-stats-grid">
            <div class="integrations-stat-card">
                <div class="integrations-stat-value">${stats.totalIntegrations}</div>
                <div class="integrations-stat-label">Integrações</div>
            </div>

            <div class="integrations-stat-card">
                <div class="integrations-stat-value" style="color: #10b981;">${stats.activeIntegrations}</div>
                <div class="integrations-stat-label">Ativas</div>
            </div>

            <div class="integrations-stat-card">
                <div class="integrations-stat-value" style="color: #ef4444;">${stats.errorIntegrations}</div>
                <div class="integrations-stat-label">Erros</div>
            </div>

            <div class="integrations-stat-card">
                <div class="integrations-stat-value" style="color: #f59e0b;">${stats.syncingIntegrations}</div>
                <div class="integrations-stat-label">Sincronizando</div>
            </div>
        </div>

        <!-- Abas de Navegação -->
        <div class="integrations-controls">
            <button class="btn-primary-integrations active" onclick="switchIntegrationsTab('integrations')" id="tab-integrations">
                🔗 Integrações
            </button>
            <button class="btn-primary-integrations" onclick="switchIntegrationsTab('apis')" id="tab-apis">
                🌐 APIs
            </button>
            <button class="btn-primary-integrations" onclick="switchIntegrationsTab('webhooks')" id="tab-webhooks">
                🔗 Webhooks
            </button>
            <button class="btn-primary-integrations" onclick="switchIntegrationsTab('syncs')" id="tab-syncs">
                🔄 Sincronizações
            </button>
            <button class="btn-primary-integrations" onclick="switchIntegrationsTab('analytics')" id="tab-analytics">
                📈 Analytics
            </button>
        </div>

        <!-- Conteúdo das Abas -->
        <div id="integrations-integrations" class="integrations-content active">
            ${renderIntegrationsTab()}
        </div>

        <div id="integrations-apis" class="integrations-content">
            ${renderApisTab()}
        </div>

        <div id="integrations-webhooks" class="integrations-content">
            ${renderWebhooksTab()}
        </div>

        <div id="integrations-syncs" class="integrations-content">
            ${renderSyncsTab()}
        </div>

        <div id="integrations-analytics" class="integrations-content">
            ${renderAnalyticsTab()}
        </div>
    `;
}

// Renderizar Aba de Integrações
function renderIntegrationsTab() {
    return `
        <div class="integrations-card">
            <div class="integrations-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">🔗 Lista de Integrações</h3>
                <div style="display: flex; gap: 0.5rem;">
                    <select class="form-select" id="integrationFilter" onchange="filterIntegrations(this.value)">
                        <option value="all">Todos</option>
                        <option value="active">Ativas</option>
                        <option value="error">Erros</option>
                        <option value="syncing">Sincronizando</option>
                    </select>
                    <button class="btn-primary-integrations" onclick="exportIntegrations()">📤 Exportar</button>
                </div>
            </div>
            
            <div id="integrationsList" style="display: grid; gap: 1rem;">
                ${IntegrationsState.integrations.map(renderIntegrationCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de APIs
function renderApisTab() {
    return `
        <div class="integrations-card">
            <div class="integrations-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">🌐 Gestão de APIs</h3>
                <button class="btn-success-integrations" onclick="showNewApiForm()">➕ Nova API</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                ${IntegrationsState.apis.map(renderApiCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Webhooks
function renderWebhooksTab() {
    return `
        <div class="integrations-card">
            <div class="integrations-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">🔗 Gestão de Webhooks</h3>
                <button class="btn-warning-integrations" onclick="showNewWebhookForm()">➕ Novo Webhook</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                ${IntegrationsState.webhooks.map(renderWebhookCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Sincronizações
function renderSyncsTab() {
    return `
        <div class="integrations-card">
            <div class="integrations-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">🔄 Gestão de Sincronizações</h3>
                <button class="btn-primary-integrations" onclick="showNewSyncForm()">➕ Nova Sincronização</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                ${IntegrationsState.syncs.map(renderSyncCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Analytics
function renderAnalyticsTab() {
    return `
        <div class="analytics-card">
            <div class="integrations-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📈 Analytics de Integrações</h3>
                <button class="btn-success-integrations" onclick="generateIntegrationsReport()">📄 Gerar Relatório</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                <div class="analytics-card">
                    <h4 style="margin: 0 0 1rem 0; color: var(--gray-900);">🎯 Performance</h4>
                    <div style="display: grid; gap: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Integrações Ativas</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Total</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${IntegrationsState.integrations.filter(i => i.status === 'active').length}
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Webhooks</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Total</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${IntegrationsState.webhooks.length}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="analytics-card">
                    <h4 style="margin: 0 0 1rem 0; color: var(--gray-900);">📊 Métricas</h4>
                    <div style="display: grid; gap: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Sincronizações</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Total</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${IntegrationsState.syncs.length}
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Erros</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Total</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${IntegrationsState.errors.length}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Renderizar Card de Integração
function renderIntegrationCard(integration) {
    const cssClass = integration.status === 'active' ? 'active' : integration.status === 'error' ? 'error' : 'syncing';
    const statusClass = `status-${integration.status}`;
    const apis = IntegrationsState.apis.filter(a => a.integrationId === integration.id);
    const webhooks = IntegrationsState.webhooks.filter(w => w.integrationId === integration.id);
    const syncs = IntegrationsState.syncs.filter(s => s.integrationId === integration.id);

    return `
        <div class="integrations-card ${cssClass}">
            <div class="integrations-header-info">
                <div class="integrations-info">
                    <div class="integrations-icon">🔗</div>
                    <div class="integrations-details">
                        <h4>${escapeHTML(integration.name)}</h4>
                        <p>${escapeHTML(integration.description)}</p>
                        <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                            ${integration.type} • ${integration.provider} • ${integration.status}
                        </div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <span class="integrations-status ${statusClass}">${integration.status}</span>
                    <div style="font-weight: 700; color: var(--gray-900); margin-top: 0.5rem;">${apis.length} APIs</div>
                </div>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">APIs da Integração:</div>
                <div class="api-list">
                    ${apis.slice(0, 4).map(api => `
                        <div class="api-item ${api.status}">
                            <div class="api-info">
                                <h6>${escapeHTML(api.name)}</h6>
                                <p>${api.method} • ${api.status}</p>
                            </div>
                            <div class="api-value" style="color: ${getApiColor(api.status)};">
                                ${api.endpoints || 0} endpoints
                            </div>
                        </div>
                    `).join('') || '<div style="color: var(--gray-500);">Nenhuma API</div>'}
                </div>
            </div>

            <div class="connection-grid">
                <div class="connection-card">
                    <h5 style="margin: 0 0 0.5rem 0; color: var(--gray-900);">🌐 APIs</h5>
                    <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Métodos:</span>
                            <span style="font-weight: 700;">${[...new Set(apis.map(a => a.method))].join(', ')}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Webhooks:</span>
                            <span style="font-weight: 700;">${webhooks.length}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Sincronizações:</span>
                            <span style="font-weight: 700;">${syncs.length}</span>
                        </div>
                    </div>
                </div>
                
                <div class="connection-card">
                    <h5 style="margin: 0 0 0.5rem 0; color: var(--gray-900);">🎯 Configurações</h5>
                    <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Chave API:</span>
                            <span style="font-weight: 700;">${integration.apiKey ? 'Configurada' : 'Não configurada'}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Data Criação:</span>
                            <span style="font-weight: 700;">${new Date(integration.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Última Atualização:</span>
                            <span style="font-weight: 700;">${new Date(integration.updatedAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="progress-bar-integrations">
                <div class="progress-fill-integrations" style="width: ${Math.min(100, apis.length * 25)}%; background: ${getIntegrationColor(integration.status)};"></div>
            </div>

            <div class="integrations-actions">
                <button class="btn-integrations btn-primary-integrations" onclick="viewIntegrationDetails('${integration.id}')">👁️ Detalhes</button>
                <button class="btn-integrations btn-success-integrations" onclick="addApiToIntegration('${integration.id}')">🌐 API</button>
                <button class="btn-integrations btn-warning-integrations" onclick="updateIntegrationStatus('${integration.id}')">✅ Status</button>
                <button class="btn-integrations btn-danger-integrations" onclick="deleteIntegration('${integration.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de API
function renderApiCard(api) {
    const cssClass = api.status === 'active' ? 'active' : api.status === 'error' ? 'error' : 'syncing';
    const endpoints = api.endpoints || 0;

    return `
        <div class="integrations-card ${cssClass}">
            <div class="integrations-header-info">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">🌐 ${escapeHTML(api.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        ${api.method} • ${api.type} • ${api.status}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">${endpoints} endpoints</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">Endpoints</div>
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Descrição:</div>
                <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                    ${escapeHTML(api.description)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Método:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${api.method}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Tipo:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${api.type}</div>
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">URL Base:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${api.baseUrl || 'N/A'}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Criação:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(api.createdAt).toLocaleDateString('pt-BR')}</div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-integrations btn-primary-integrations" onclick="editApi('${api.id}')">✏️ Editar</button>
                <button class="btn-integrations btn-success-integrations" onclick="updateApiStatus('${api.id}')">✅ Status</button>
                <button class="btn-integrations btn-warning-integrations" onclick="updateApiEndpoints('${api.id}')">🔗 Endpoints</button>
                <button class="btn-integrations btn-danger-integrations" onclick="deleteApi('${api.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Webhook
function renderWebhookCard(webhook) {
    const cssClass = webhook.status === 'active' ? 'active' : webhook.status === 'error' ? 'error' : 'syncing';

    return `
        <div class="integrations-card ${cssClass}">
            <div class="integrations-header-info">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">🔗 ${escapeHTML(webhook.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        ${webhook.event} • ${webhook.method} • ${webhook.status}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">${webhook.retries || 0} tentativas</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">Retries</div>
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Descrição:</div>
                <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                    ${escapeHTML(webhook.description)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Evento:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${webhook.event}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Método:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${webhook.method}</div>
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">URL:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${webhook.url || 'N/A'}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Criação:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(webhook.createdAt).toLocaleDateString('pt-BR')}</div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-integrations btn-primary-integrations" onclick="editWebhook('${webhook.id}')">✏️ Editar</button>
                <button class="btn-integrations btn-success-integrations" onclick="updateWebhookStatus('${webhook.id}')">✅ Status</button>
                <button class="btn-integrations btn-warning-integrations" onclick="updateWebhookUrl('${webhook.id}')">🔗 URL</button>
                <button class="btn-integrations btn-danger-integrations" onclick="deleteWebhook('${webhook.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Sincronização
function renderSyncCard(sync) {
    const cssClass = sync.status === 'active' ? 'active' : sync.status === 'error' ? 'error' : 'syncing';
    const integration = IntegrationsState.integrations.find(i => i.id === sync.integrationId);

    return `
        <div class="integrations-card ${cssClass}">
            <div class="integrations-header-info">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">🔄 ${escapeHTML(sync.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        ${integration ? integration.name : 'Integração desconhecida'} • ${sync.frequency} • ${sync.status}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">${sync.records || 0} registros</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">Processados</div>
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Descrição:</div>
                <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                    ${escapeHTML(sync.description)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Frequência:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${sync.frequency}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Tipo:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${sync.type}</div>
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Próxima Execução:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(sync.nextRun).toLocaleDateString('pt-BR')}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Criação:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(sync.createdAt).toLocaleDateString('pt-BR')}</div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-integrations btn-primary-integrations" onclick="editSync('${sync.id}')">✏️ Editar</button>
                <button class="btn-integrations btn-success-integrations" onclick="updateSyncStatus('${sync.id}')">✅ Status</button>
                <button class="btn-integrations btn-warning-integrations" onclick="updateSyncFrequency('${sync.id}')">⏰ Frequência</button>
                <button class="btn-integrations btn-danger-integrations" onclick="deleteSync('${sync.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Funções de Controle
function switchIntegrationsTab(tabName) {
    // Atualizar classes das abas
    document.querySelectorAll('.btn-primary-integrations').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');

    // Mostrar/esconder conteúdo
    document.querySelectorAll('.integrations-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`integrations-${tabName}`).classList.add('active');
}

// Funções de Integrações
function showNewIntegrationForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">🔗 Nova Integração</h4>
            <form id="newIntegrationForm" onsubmit="saveIntegration(event)">
                <div class="form-group">
                    <label class="form-label">Nome da Integração *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição da integração..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" name="type">
                            <option value="Financeiro">Financeiro</option>
                            <option value="Operacional">Operacional</option>
                            <option value="Comercial">Comercial</option>
                            <option value="Tecnológico">Tecnológico</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Provedor</label>
                        <input type="text" class="form-input" name="provider" placeholder="Provedor da integração">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Chave API</label>
                        <input type="text" class="form-input" name="apiKey" placeholder="Chave API">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Secret</label>
                        <input type="password" class="form-input" name="secret" placeholder="Secret">
                    </div>
                </div>
            </form>
        </div>
    `;

    openModal('Nova Integração', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Integração', class: 'btn-primary', onclick: "document.getElementById('newIntegrationForm').requestSubmit()" }
    ]);
}

function saveIntegration(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const integration = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        type: formData.get('type') || 'Financeiro',
        provider: formData.get('provider') || '',
        apiKey: formData.get('apiKey') || '',
        secret: formData.get('secret') || '',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    IntegrationsState.integrations.push(integration);
    AppState.integrations = IntegrationsState.integrations;
    saveToStorage(STORAGE_KEYS.INTEGRATIONS, AppState.integrations);

    closeModal();
    renderIntegrationsDashboard();
    showNotification(`Integração "${integration.name}" criada com sucesso!`, 'success');
}

// Funções de APIs
function showNewApiForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">🌐 Nova API</h4>
            <form id="newApiForm" onsubmit="saveApi(event)">
                <div class="form-group">
                    <label class="form-label">Nome da API *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição da API..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Integração</label>
                        <select class="form-select" name="integrationId">
                            ${IntegrationsState.integrations.map(i => `<option value="${i.id}">${i.name}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Método</label>
                        <select class="form-select" name="method">
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" name="type">
                            <option value="REST">REST</option>
                            <option value="GraphQL">GraphQL</option>
                            <option value="SOAP">SOAP</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">URL Base</label>
                        <input type="url" class="form-input" name="baseUrl" placeholder="URL base da API">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Endpoints</label>
                    <input type="number" class="form-input" name="endpoints" min="0" step="1">
                </div>
            </form>
        </div>
    `;

    openModal('Nova API', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar API', class: 'btn-primary', onclick: "document.getElementById('newApiForm').requestSubmit()" }
    ]);
}

function saveApi(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const api = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        integrationId: formData.get('integrationId'),
        method: formData.get('method') || 'GET',
        type: formData.get('type') || 'REST',
        baseUrl: formData.get('baseUrl') || '',
        endpoints: parseInt(formData.get('endpoints')) || 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    IntegrationsState.apis.push(api);
    AppState.apis = IntegrationsState.apis;
    saveToStorage(STORAGE_KEYS.APIS, AppState.apis);

    closeModal();
    renderIntegrationsDashboard();
    showNotification(`API "${api.name}" criada com sucesso!`, 'success');
}

// Funções de Webhooks
function showNewWebhookForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">🔗 Novo Webhook</h4>
            <form id="newWebhookForm" onsubmit="saveWebhook(event)">
                <div class="form-group">
                    <label class="form-label">Nome do Webhook *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição do webhook..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Integração</label>
                        <select class="form-select" name="integrationId">
                            ${IntegrationsState.integrations.map(i => `<option value="${i.id}">${i.name}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Evento</label>
                        <input type="text" class="form-input" name="event" placeholder="Evento do webhook">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Método</label>
                        <select class="form-select" name="method">
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">URL</label>
                        <input type="url" class="form-input" name="url" placeholder="URL do webhook">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Tentativas</label>
                    <input type="number" class="form-input" name="retries" min="0" step="1">
                </div>
            </form>
        </div>
    `;

    openModal('Novo Webhook', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Webhook', class: 'btn-primary', onclick: "document.getElementById('newWebhookForm').requestSubmit()" }
    ]);
}

function saveWebhook(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const webhook = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        integrationId: formData.get('integrationId'),
        event: formData.get('event') || '',
        method: formData.get('method') || 'POST',
        url: formData.get('url') || '',
        retries: parseInt(formData.get('retries')) || 0,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    IntegrationsState.webhooks.push(webhook);
    AppState.webhooks = IntegrationsState.webhooks;
    saveToStorage(STORAGE_KEYS.WEBHOOKS, AppState.webhooks);

    closeModal();
    renderIntegrationsDashboard();
    showNotification(`Webhook "${webhook.name}" criado com sucesso!`, 'success');
}

// Funções de Sincronizações
function showNewSyncForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">🔄 Nova Sincronização</h4>
            <form id="newSyncForm" onsubmit="saveSync(event)">
                <div class="form-group">
                    <label class="form-label">Nome da Sincronização *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição da sincronização..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Integração</label>
                        <select class="form-select" name="integrationId">
                            ${IntegrationsState.integrations.map(i => `<option value="${i.id}">${i.name}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" name="type">
                            <option value="Completa">Completa</option>
                            <option value="Incremental">Incremental</option>
                            <option value="Diferencial">Diferencial</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Frequência</label>
                        <select class="form-select" name="frequency">
                            <option value="Diária">Diária</option>
                            <option value="Semanal">Semanal</option>
                            <option value="Mensal">Mensal</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Registros</label>
                        <input type="number" class="form-input" name="records" min="0" step="1">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Próxima Execução</label>
                    <input type="date" class="form-input" name="nextRun">
                </div>
            </form>
        </div>
    `;

    openModal('Nova Sincronização', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Sincronização', class: 'btn-primary', onclick: "document.getElementById('newSyncForm').requestSubmit()" }
    ]);
}

function saveSync(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const sync = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        integrationId: formData.get('integrationId'),
        type: formData.get('type') || 'Completa',
        frequency: formData.get('frequency') || 'Diária',
        records: parseInt(formData.get('records')) || 0,
        nextRun: formData.get('nextRun'),
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    IntegrationsState.syncs.push(sync);
    AppState.syncs = IntegrationsState.syncs;
    saveToStorage(STORAGE_KEYS.SYNCS, AppState.syncs);

    closeModal();
    renderIntegrationsDashboard();
    showNotification(`Sincronização "${sync.name}" criada com sucesso!`, 'success');
}

// Funções Auxiliares
function calculateIntegrationsStats() {
    const totalIntegrations = IntegrationsState.integrations.length;
    const activeIntegrations = IntegrationsState.integrations.filter(i => i.status === 'active').length;
    const errorIntegrations = IntegrationsState.integrations.filter(i => i.status === 'error').length;
    const syncingIntegrations = IntegrationsState.integrations.filter(i => i.status === 'syncing').length;

    return {
        totalIntegrations,
        activeIntegrations,
        errorIntegrations,
        syncingIntegrations
    };
}

function getIntegrationColor(status) {
    if (status === 'active') return '#10b981';
    if (status === 'error') return '#ef4444';
    return '#f59e0b';
}

function getApiColor(status) {
    if (status === 'active') return '#10b981';
    if (status === 'error') return '#ef4444';
    return '#f59e0b';
}

function filterIntegrations(status) {
    const filteredIntegrations = status === 'all' ?
        IntegrationsState.integrations :
        IntegrationsState.integrations.filter(i => i.status === status);

    const integrationsList = document.getElementById('integrationsList');
    integrationsList.innerHTML = filteredIntegrations.map(renderIntegrationCard).join('');
}

function exportIntegrations() {
    const csvContent = [
        ['Integração', 'Status', 'Tipo', 'Provedor', 'Data Criação', 'Data Atualização'],
        ...IntegrationsState.integrations.map(i => [
            i.name, i.status, i.type, i.provider,
            new Date(i.createdAt).toLocaleDateString('pt-BR'),
            new Date(i.updatedAt).toLocaleDateString('pt-BR')
        ])
    ].map(row => row.join(',')).join('\n');

    downloadFile('integracoes.csv', csvContent, 'text/csv');
    showNotification('Integrações exportadas com sucesso!', 'success');
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
function setupIntegrationsEvents() {
    // Atualizar quando os dados mudarem
    document.addEventListener('integrationsUpdated', () => {
        IntegrationsState.integrations = AppState.integrations;
        IntegrationsState.apis = AppState.apis;
        IntegrationsState.webhooks = AppState.webhooks;
        IntegrationsState.syncs = AppState.syncs;
        IntegrationsState.connections = AppState.connections;
        IntegrationsState.logs = AppState.logs;
        IntegrationsState.errors = AppState.errors;
        IntegrationsState.configurations = AppState.configurations;
        renderIntegrationsDashboard();
    });
}

// Exportar funções globais
window.initExternalIntegrationsModule = initExternalIntegrationsModule;
window.renderIntegrationsDashboard = renderIntegrationsDashboard;
window.setupIntegrationsEvents = setupIntegrationsEvents;
window.switchIntegrationsTab = switchIntegrationsTab;
window.showNewIntegrationForm = showNewIntegrationForm;
window.saveIntegration = saveIntegration;
window.showNewApiForm = showNewApiForm;
window.saveApi = saveApi;
window.showNewWebhookForm = showNewWebhookForm;
window.saveWebhook = saveWebhook;
window.showNewSyncForm = showNewSyncForm;
window.saveSync = saveSync;
window.calculateIntegrationsStats = calculateIntegrationsStats;
window.getIntegrationColor = getIntegrationColor;
window.getApiColor = getApiColor;
window.filterIntegrations = filterIntegrations;
window.exportIntegrations = exportIntegrations;
window.downloadFile = downloadFile;