// Integração de Módulos Avançados - CRM Odonto Company
// =============================================

// Módulo de Integração de Módulos Avançados
const AdvancedModulesIntegration = {
    modules: {
        teamManagement: null,
        trainingKnowledge: null,
        goalsKpis: null,
        qualityAudit: null,
        advancedReports: null,
        externalIntegrations: null,
        advancedSettings: null
    },

    state: {
        activeModule: null,
        moduleData: {},
        permissions: {},
        notifications: []
    }
};

// Inicializar Integração de Módulos Avançados
function initAdvancedModulesIntegration() {
    console.log('🔧 Inicializando Integração de Módulos Avançados...');

    // Carregar módulos
    loadAdvancedModules();

    // Configurar eventos globais
    setupGlobalEvents();

    // Verificar permissões
    checkModulePermissions();

    // Renderizar interface de módulos avançados
    renderAdvancedModulesInterface();

    console.log('✅ Integração de Módulos Avançados inicializada com sucesso!');
}

// Carregar Módulos Avançados
function loadAdvancedModules() {
    try {
        // Verificar se os módulos estão disponíveis
        if (typeof initTeamManagementModule === 'function') {
            AdvancedModulesIntegration.modules.teamManagement = initTeamManagementModule();
            console.log('✅ Módulo de Gestão de Equipes carregado');
        }

        if (typeof initTrainingKnowledgeModule === 'function') {
            AdvancedModulesIntegration.modules.trainingKnowledge = initTrainingKnowledgeModule();
            console.log('✅ Módulo de Treinamento e Conhecimento carregado');
        }

        if (typeof initGoalsKpisModule === 'function') {
            AdvancedModulesIntegration.modules.goalsKpis = initGoalsKpisModule();
            console.log('✅ Módulo de Metas e KPIs carregado');
        }

        if (typeof initQualityAuditModule === 'function') {
            AdvancedModulesIntegration.modules.qualityAudit = initQualityAuditModule();
            console.log('✅ Módulo de Auditoria de Qualidade carregado');
        }

        if (typeof initAdvancedReportsModule === 'function') {
            AdvancedModulesIntegration.modules.advancedReports = initAdvancedReportsModule();
            console.log('✅ Módulo de Relatórios Avançados carregado');
        }

        if (typeof initExternalIntegrationsModule === 'function') {
            AdvancedModulesIntegration.modules.externalIntegrations = initExternalIntegrationsModule();
            console.log('✅ Módulo de Integrações Externas carregado');
        }

        if (typeof initAdvancedSettingsModule === 'function') {
            AdvancedModulesIntegration.modules.advancedSettings = initAdvancedSettingsModule();
            console.log('✅ Módulo de Configurações Avançadas carregado');
        }

    } catch (error) {
        console.error('❌ Erro ao carregar módulos avançados:', error);
        showNotification('Erro ao carregar módulos avançados', 'error');
    }
}

// Configurar Eventos Globais
function setupGlobalEvents() {
    // Evento de atualização de módulos
    document.addEventListener('moduleUpdated', (event) => {
        const { moduleName, data } = event.detail;
        updateModuleData(moduleName, data);
    });

    // Evento de notificação de módulos
    document.addEventListener('moduleNotification', (event) => {
        const { message, type, module } = event.detail;
        addModuleNotification(message, type, module);
    });

    // Evento de erro de módulos
    document.addEventListener('moduleError', (event) => {
        const { error, module } = event.detail;
        handleModuleError(error, module);
    });
}

// Verificar Permissões de Módulos
function checkModulePermissions() {
    const userRole = AppState.currentUser?.role || 'user';

    // Definir permissões por módulo
    const modulePermissions = {
        teamManagement: ['admin', 'manager'],
        trainingKnowledge: ['admin', 'manager', 'trainer'],
        goalsKpis: ['admin', 'manager'],
        qualityAudit: ['admin', 'manager', 'auditor'],
        advancedReports: ['admin', 'manager'],
        externalIntegrations: ['admin'],
        advancedSettings: ['admin']
    };

    // Verificar permissões do usuário
    Object.keys(modulePermissions).forEach(moduleName => {
        const requiredRoles = modulePermissions[moduleName];
        AdvancedModulesIntegration.state.permissions[moduleName] = requiredRoles.includes(userRole);
    });

    console.log('🔐 Permissões de módulos verificadas:', AdvancedModulesIntegration.state.permissions);
}

// Renderizar Interface de Módulos Avançados
function renderAdvancedModulesInterface() {
    const container = document.getElementById('advancedModulesContainer');
    if (!container) return;

    container.innerHTML = `
        <style>
            .advanced-modules-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 2rem;
                border-radius: 16px;
                margin-bottom: 2rem;
            }

            .advanced-modules-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }

            .advanced-module-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
                box-shadow: var(--shadow-md);
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }

            .advanced-module-card:hover {
                transform: translateY(-4px);
                box-shadow: var(--shadow-lg);
            }

            .advanced-module-card.disabled {
                opacity: 0.5;
                pointer-events: none;
                filter: grayscale(1);
            }

            .module-icon {
                width: 60px;
                height: 60px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 1.5rem;
                margin-bottom: 1rem;
            }

            .module-info h4 {
                margin: 0 0 0.5rem 0;
                font-size: 1.25rem;
                color: var(--gray-900);
            }

            .module-info p {
                margin: 0;
                font-size: 0.9rem;
                color: var(--gray-600);
                line-height: 1.5;
            }

            .module-actions {
                display: flex;
                gap: 0.5rem;
                margin-top: 1.5rem;
            }

            .btn-module {
                padding: 0.5rem 1rem;
                border-radius: 8px;
                border: 1px solid var(--gray-300);
                background: white;
                cursor: pointer;
                font-size: 0.875rem;
                transition: all 0.2s;
                flex: 1;
            }

            .btn-module:hover {
                background: var(--gray-100);
                transform: translateY(-1px);
            }

            .btn-primary-module {
                background: #667eea;
                color: white;
                border-color: #667eea;
            }

            .btn-primary-module:hover {
                background: #5a6fd8;
            }

            .btn-secondary-module {
                background: #f3f4f6;
                color: #374151;
                border-color: #e5e7eb;
            }

            .btn-secondary-module:hover {
                background: #e5e7eb;
            }

            .module-status {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.25rem 0.75rem;
                border-radius: 999px;
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;
            }

            .status-active { background: #dcfce7; color: #065f46; }
            .status-loading { background: #e0f2fe; color: #0e7490; }
            .status-error { background: #fee2e2; color: #991b1b; }
            .status-disabled { background: #f3f4f6; color: #6b7280; }

            .module-badge {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: #f3f4f6;
                color: #6b7280;
                padding: 0.25rem 0.5rem;
                border-radius: 999px;
                font-size: 0.75rem;
                font-weight: 700;
            }

            .module-stats {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin-top: 1rem;
                padding-top: 1rem;
                border-top: 1px solid var(--gray-200);
            }

            .stat-item {
                text-align: center;
                padding: 0.5rem;
                background: var(--gray-50);
                border-radius: 8px;
            }

            .stat-value {
                font-size: 1.25rem;
                font-weight: 700;
                color: var(--gray-900);
            }

            .stat-label {
                font-size: 0.75rem;
                color: var(--gray-600);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
        </style>

        <!-- Header de Módulos Avançados -->
        <div class="advanced-modules-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div>
                    <h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; color: white;">🚀 Módulos Avançados</h2>
                    <p style="margin: 0; opacity: 0.9;">Funcionalidades premium para gestão avançada</p>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-secondary-module" onclick="refreshAdvancedModules()">
                        🔄 Atualizar
                    </button>
                    <button class="btn-secondary-module" onclick="exportAdvancedModulesData()">
                        📤 Exportar Dados
                    </button>
                </div>
            </div>
        </div>

        <!-- Grid de Módulos -->
        <div class="advanced-modules-grid">
            ${renderModuleCard('teamManagement', '👥', 'Gestão de Equipes', 'Gerencie sua equipe, cargos e permissões')}
            ${renderModuleCard('trainingKnowledge', '🎓', 'Treinamento & Conhecimento', 'Sistema de treinamento e base de conhecimento')}
            ${renderModuleCard('goalsKpis', '🎯', 'Metas & KPIs', 'Defina e acompanhe metas e indicadores')}
            ${renderModuleCard('qualityAudit', '✅', 'Auditoria de Qualidade', 'Auditorias e controle de qualidade')}
            ${renderModuleCard('advancedReports', '📊', 'Relatórios Avançados', 'Relatórios detalhados e análises')}
            ${renderModuleCard('externalIntegrations', '🔗', 'Integrações Externas', 'Conexões com sistemas externos')}
            ${renderModuleCard('advancedSettings', '⚙️', 'Configurações Avançadas', 'Personalização e configurações avançadas')}
        </div>

        <!-- Área de Conteúdo do Módulo -->
        <div id="advancedModuleContent" style="display: none;">
            <!-- Conteúdo do módulo será carregado aqui -->
        </div>
    `;
}

// Renderizar Card de Módulo
function renderModuleCard(moduleName, icon, title, description) {
    const isAvailable = AdvancedModulesIntegration.state.permissions[moduleName];
    const status = isAvailable ? 'active' : 'disabled';
    const stats = getModuleStats(moduleName);

    return `
        <div class="advanced-module-card ${!isAvailable ? 'disabled' : ''}">
            <div class="module-badge">${isAvailable ? 'Disponível' : 'Restrito'}</div>
            
            <div class="module-icon" style="background: ${getModuleColor(moduleName)};">
                ${icon}
            </div>
            
            <div class="module-info">
                <h4>${title}</h4>
                <p>${description}</p>
            </div>
            
            <div class="module-stats">
                <div class="stat-item">
                    <div class="stat-value">${stats.total || 0}</div>
                    <div class="stat-label">Total</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" style="color: ${getModuleColor(moduleName)};">${stats.active || 0}</div>
                    <div class="stat-label">Ativos</div>
                </div>
            </div>
            
            <div class="module-actions">
                <button class="btn-module btn-primary-module" onclick="openAdvancedModule('${moduleName}')">
                    🚀 Abrir Módulo
                </button>
                <button class="btn-module btn-secondary-module" onclick="viewModuleDetails('${moduleName}')">
                    ℹ️ Detalhes
                </button>
            </div>
        </div>
    `;
}

// Obter Cor do Módulo
function getModuleColor(moduleName) {
    const colors = {
        teamManagement: '#667eea',
        trainingKnowledge: '#10b981',
        goalsKpis: '#f59e0b',
        qualityAudit: '#ef4444',
        advancedReports: '#8b5cf6',
        externalIntegrations: '#06b6d4',
        advancedSettings: '#8b5cf6'
    };

    return colors[moduleName] || '#667eea';
}

// Obter Estatísticas do Módulo
function getModuleStats(moduleName) {
    const stats = {
        teamManagement: {
            total: AppState.teamMembers?.length || 0,
            active: AppState.teamMembers?.filter(m => m.status === 'active').length || 0
        },
        trainingKnowledge: {
            total: AppState.trainingModules?.length || 0,
            active: AppState.trainingModules?.filter(m => m.status === 'active').length || 0
        },
        goalsKpis: {
            total: AppState.goals?.length || 0,
            active: AppState.goals?.filter(g => g.status === 'active').length || 0
        },
        qualityAudit: {
            total: AppState.audits?.length || 0,
            active: AppState.audits?.filter(a => a.status === 'active').length || 0
        },
        advancedReports: {
            total: AppState.reports?.length || 0,
            active: AppState.reports?.filter(r => r.status === 'active').length || 0
        },
        externalIntegrations: {
            total: AppState.integrations?.length || 0,
            active: AppState.integrations?.filter(i => i.status === 'active').length || 0
        },
        advancedSettings: {
            total: AppState.advancedSettings?.length || 0,
            active: AppState.advancedSettings?.filter(s => s.status === 'active').length || 0
        }
    };

    return stats[moduleName] || { total: 0, active: 0 };
}

// Abrir Módulo Avançado
function openAdvancedModule(moduleName) {
    if (!AdvancedModulesIntegration.state.permissions[moduleName]) {
        showNotification('Acesso negado: Permissões insuficientes', 'error');
        return;
    }

    AdvancedModulesIntegration.state.activeModule = moduleName;

    const contentContainer = document.getElementById('advancedModuleContent');
    contentContainer.style.display = 'block';

    // Carregar conteúdo do módulo
    switch (moduleName) {
        case 'teamManagement':
            if (typeof renderTeamManagementDashboard === 'function') {
                contentContainer.innerHTML = '<div id="teamManagementContent"></div>';
                renderTeamManagementDashboard();
            }
            break;

        case 'trainingKnowledge':
            if (typeof renderTrainingKnowledgeDashboard === 'function') {
                contentContainer.innerHTML = '<div id="trainingKnowledgeContent"></div>';
                renderTrainingKnowledgeDashboard();
            }
            break;

        case 'goalsKpis':
            if (typeof renderGoalsKpisDashboard === 'function') {
                contentContainer.innerHTML = '<div id="goalsKpisContent"></div>';
                renderGoalsKpisDashboard();
            }
            break;

        case 'qualityAudit':
            if (typeof renderQualityAuditDashboard === 'function') {
                contentContainer.innerHTML = '<div id="qualityAuditContent"></div>';
                renderQualityAuditDashboard();
            }
            break;

        case 'advancedReports':
            if (typeof renderAdvancedReportsDashboard === 'function') {
                contentContainer.innerHTML = '<div id="advancedReportsContent"></div>';
                renderAdvancedReportsDashboard();
            }
            break;

        case 'externalIntegrations':
            if (typeof renderIntegrationsDashboard === 'function') {
                contentContainer.innerHTML = '<div id="integrationsContent"></div>';
                renderIntegrationsDashboard();
            }
            break;

        case 'advancedSettings':
            if (typeof renderAdvancedSettingsDashboard === 'function') {
                contentContainer.innerHTML = '<div id="advancedSettingsContent"></div>';
                renderAdvancedSettingsDashboard();
            }
            break;
    }

    showNotification(`Módulo ${moduleName} aberto com sucesso!`, 'success');
}

// Ver Detalhes do Módulo
function viewModuleDetails(moduleName) {
    const moduleInfo = {
        teamManagement: {
            name: 'Gestão de Equipes',
            description: 'Sistema completo para gerenciar sua equipe, cargos, permissões e desempenho.',
            features: ['Cadastro de membros', 'Gestão de cargos', 'Controle de permissões', 'Avaliação de desempenho'],
            benefits: ['Organização da equipe', 'Controle de acesso', 'Acompanhamento de metas', 'Gestão de férias']
        },
        trainingKnowledge: {
            name: 'Treinamento & Conhecimento',
            description: 'Plataforma de treinamento e base de conhecimento para capacitação da equipe.',
            features: ['Cursos e treinamentos', 'Base de conhecimento', 'Certificações', 'Acompanhamento de progresso'],
            benefits: ['Capacitação contínua', 'Padronização de processos', 'Aumento da produtividade', 'Redução de erros']
        },
        goalsKpis: {
            name: 'Metas & KPIs',
            description: 'Sistema de definição e acompanhamento de metas e indicadores de performance.',
            features: ['Definição de metas', 'Indicadores KPIs', 'Acompanhamento em tempo real', 'Relatórios de performance'],
            benefits: ['Foco nos objetivos', 'Mensuração de resultados', 'Tomada de decisão', 'Motivação da equipe']
        },
        qualityAudit: {
            name: 'Auditoria de Qualidade',
            description: 'Sistema de auditoria e controle de qualidade para garantir excelência nos processos.',
            features: ['Checklists de auditoria', 'Gestão de não conformidades', 'Planos de ação', 'Relatórios de qualidade'],
            benefits: ['Padronização de processos', 'Melhoria contínua', 'Controle de qualidade', 'Redução de retrabalho']
        },
        advancedReports: {
            name: 'Relatórios Avançados',
            description: 'Sistema de relatórios detalhados e análises para tomada de decisão estratégica.',
            features: ['Relatórios personalizados', 'Dashboards interativos', 'Exportação de dados', 'Análises preditivas'],
            benefits: ['Visão estratégica', 'Tomada de decisão', 'Identificação de oportunidades', 'Monitoramento de resultados']
        },
        externalIntegrations: {
            name: 'Integrações Externas',
            description: 'Conexões com sistemas externos e APIs para integração de dados e processos.',
            features: ['Conexões API', 'Webhooks', 'Sincronização de dados', 'Gestão de integrações'],
            benefits: ['Automatização de processos', 'Integração de sistemas', 'Redução de retrabalho', 'Aumento de eficiência']
        },
        advancedSettings: {
            name: 'Configurações Avançadas',
            description: 'Configurações avançadas para personalização e controle total do sistema.',
            features: ['Personalização de interface', 'Configurações de segurança', 'Gestão de backups', 'Controle de permissões'],
            benefits: ['Personalização total', 'Segurança avançada', 'Controle administrativo', 'Flexibilidade de uso']
        }
    };

    const info = moduleInfo[moduleName];
    if (!info) return;

    const modalContent = `
        <div style="padding: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                <div style="width: 50px; height: 50px; border-radius: 12px; background: ${getModuleColor(moduleName)}; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.25rem;">
                    ${moduleName === 'teamManagement' ? '👥' :
            moduleName === 'trainingKnowledge' ? '🎓' :
                moduleName === 'goalsKpis' ? '🎯' :
                    moduleName === 'qualityAudit' ? '✅' :
                        moduleName === 'advancedReports' ? '📊' :
                            moduleName === 'externalIntegrations' ? '🔗' : '⚙️'}
                </div>
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">${info.name}</h4>
                    <p style="margin: 0; color: var(--gray-600);">${info.description}</p>
                </div>
            </div>
            
            <div style="margin-top: 1.5rem;">
                <h5 style="margin: 0 0 1rem 0; color: var(--gray-900);">🔍 Funcionalidades</h5>
                <ul style="margin: 0; padding-left: 1.5rem; color: var(--gray-600);">
                    ${info.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </div>
            
            <div style="margin-top: 1.5rem;">
                <h5 style="margin: 0 0 1rem 0; color: var(--gray-900);">✅ Benefícios</h5>
                <ul style="margin: 0; padding-left: 1.5rem; color: var(--gray-600);">
                    ${info.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;

    openModal('Detalhes do Módulo', modalContent, [
        { label: 'Fechar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Abrir Módulo', class: 'btn-primary', onclick: `openAdvancedModule('${moduleName}')` }
    ]);
}

// Atualizar Dados do Módulo
function updateModuleData(moduleName, data) {
    AdvancedModulesIntegration.state.moduleData[moduleName] = data;

    // Atualizar estatísticas na interface
    const stats = getModuleStats(moduleName);
    const statElements = document.querySelectorAll(`.advanced-module-card .stat-value`);

    if (statElements.length > 0) {
        renderAdvancedModulesInterface();
    }

    console.log(`📊 Dados do módulo ${moduleName} atualizados`);
}

// Adicionar Notificação de Módulo
function addModuleNotification(message, type, module) {
    const notification = {
        id: Date.now(),
        message,
        type,
        module,
        timestamp: new Date().toISOString()
    };

    AdvancedModulesIntegration.state.notifications.unshift(notification);

    // Mostrar notificação na interface
    showNotification(`${module}: ${message}`, type);

    console.log(`📢 Notificação do módulo ${module}: ${message}`);
}

// Tratar Erro de Módulo
function handleModuleError(error, module) {
    console.error(`❌ Erro no módulo ${module}:`, error);
    showNotification(`Erro no módulo ${module}: ${error.message}`, 'error');

    // Tentar recarregar o módulo
    setTimeout(() => {
        if (AdvancedModulesIntegration.state.activeModule === module) {
            openAdvancedModule(module);
        }
    }, 2000);
}

// Atualizar Módulos Avançados
function refreshAdvancedModules() {
    showNotification('Atualizando módulos avançados...', 'info');

    // Recarregar permissões
    checkModulePermissions();

    // Re-renderizar interface
    renderAdvancedModulesInterface();

    showNotification('Módulos avançados atualizados!', 'success');
}

// Exportar Dados dos Módulos
function exportAdvancedModulesData() {
    const exportData = {
        timestamp: new Date().toISOString(),
        modules: Object.keys(AdvancedModulesIntegration.modules),
        permissions: AdvancedModulesIntegration.state.permissions,
        notifications: AdvancedModulesIntegration.state.notifications,
        moduleData: AdvancedModulesIntegration.state.moduleData
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    downloadFile('advanced-modules-data.json', jsonContent, 'application/json');

    showNotification('Dados dos módulos avançados exportados!', 'success');
}

// Funções Globais
window.initAdvancedModulesIntegration = initAdvancedModulesIntegration;
window.loadAdvancedModules = loadAdvancedModules;
window.setupGlobalEvents = setupGlobalEvents;
window.checkModulePermissions = checkModulePermissions;
window.renderAdvancedModulesInterface = renderAdvancedModulesInterface;
window.renderModuleCard = renderModuleCard;
window.getModuleColor = getModuleColor;
window.getModuleStats = getModuleStats;
window.openAdvancedModule = openAdvancedModule;
window.viewModuleDetails = viewModuleDetails;
window.updateModuleData = updateModuleData;
window.addModuleNotification = addModuleNotification;
window.handleModuleError = handleModuleError;
window.refreshAdvancedModules = refreshAdvancedModules;
window.exportAdvancedModulesData = exportAdvancedModulesData;