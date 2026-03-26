// Metas e KPIs - CRM Odonto Company
// =============================================

const GoalsState = {
    goals: [],
    kpis: [],
    targets: [],
    measurements: [],
    reports: [],
    alerts: [],
    benchmarks: [],
    trends: []
};

// Inicializar Módulo de Metas e KPIs
function initGoalsKpisModule() {
    GoalsState.goals = AppState.goals || [];
    GoalsState.kpis = AppState.kpis || [];
    GoalsState.targets = AppState.targets || [];
    GoalsState.measurements = AppState.measurements || [];
    GoalsState.reports = AppState.reports || [];
    GoalsState.alerts = AppState.alerts || [];
    GoalsState.benchmarks = AppState.benchmarks || [];
    GoalsState.trends = AppState.trends || [];
    renderGoalsDashboard();
    setupGoalsEvents();
    loadGoalsData();
}

// Carregar Dados de Metas
function loadGoalsData() {
    console.log('📦 Usando dados de Metas do AppState...');
}

// Renderizar Dashboard de Metas e KPIs
function renderGoalsDashboard() {
    const container = document.getElementById('goalsContent');
    if (!container) return;

    const stats = calculateGoalsStats();

    container.innerHTML = `
        <style>
            .goals-header {
                background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
                color: white;
                padding: 2rem;
                border-radius: 16px;
                margin-bottom: 2rem;
            }

            .goals-controls {
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                align-items: center;
                margin-bottom: 2rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--gray-200);
            }

            .goals-stats-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .goals-stat-card {
                background: white;
                padding: 1.5rem;
                border-radius: 16px;
                border: 1px solid var(--gray-200);
                text-align: center;
                box-shadow: var(--shadow-md);
            }

            .goals-stat-value {
                font-size: 2rem;
                font-weight: 800;
                color: var(--gray-900);
                margin-bottom: 0.5rem;
            }

            .goals-stat-label {
                font-size: 0.875rem;
                color: var(--gray-600);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .goals-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
                margin-bottom: 1rem;
                box-shadow: var(--shadow-md);
                transition: all 0.3s ease;
                position: relative;
            }

            .goals-card.on-track {
                border-color: #10b981;
                background: linear-gradient(135deg, #f0fdf4, #dcfce7);
            }

            .goals-card.at-risk {
                border-color: #f59e0b;
                background: linear-gradient(135deg, #fffbeb, #fef3c7);
            }

            .goals-card.off-track {
                border-color: #ef4444;
                background: linear-gradient(135deg, #fef2f2, #fee2e2);
            }

            .goals-header-info {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 1rem;
            }

            .goals-info {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .goals-icon {
                width: 60px;
                height: 60px;
                border-radius: 12px;
                background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 1.5rem;
            }

            .goals-details h4 {
                margin: 0 0 0.25rem 0;
                font-size: 1.25rem;
                color: var(--gray-900);
            }

            .goals-details p {
                margin: 0;
                font-size: 0.9rem;
                color: var(--gray-600);
            }

            .goals-status {
                padding: 4px 12px;
                border-radius: 999px;
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;
            }

            .status-on-track { background: #f0fdf4; color: #065f46; }
            .status-at-risk { background: #fffbeb; color: #92400e; }
            .status-off-track { background: #fef2f2; color: #991b1b; }

            .kpi-list {
                display: grid;
                gap: 0.5rem;
                margin-bottom: 1.5rem;
            }

            .kpi-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                padding: 0.75rem;
                background: var(--gray-50);
                border-radius: 8px;
                border-left: 4px solid #3b82f6;
            }

            .kpi-item.on-track {
                border-left-color: #10b981;
                background: #f0fdf4;
            }

            .kpi-item.at-risk {
                border-left-color: #f59e0b;
                background: #fffbeb;
            }

            .kpi-item.off-track {
                border-left-color: #ef4444;
                background: #fef2f2;
            }

            .kpi-info h6 {
                margin: 0 0 0.25rem 0;
                font-size: 0.9rem;
                color: var(--gray-900);
            }

            .kpi-info p {
                margin: 0;
                font-size: 0.8rem;
                color: var(--gray-600);
            }

            .kpi-value {
                font-weight: 700;
                font-size: 0.9rem;
                color: var(--gray-900);
            }

            .progress-bar-goals {
                width: 100%;
                height: 12px;
                background: var(--gray-200);
                border-radius: 999px;
                overflow: hidden;
                margin-top: 0.5rem;
            }

            .progress-fill-goals {
                height: 100%;
                background: linear-gradient(90deg, #3b82f6, #8b5cf6);
                transition: width 0.3s ease;
            }

            .target-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
                margin-bottom: 1.5rem;
            }

            .target-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
            }

            .target-card h5 {
                margin: 0 0 0.5rem 0;
                font-size: 1rem;
                color: var(--gray-900);
            }

            .target-card p {
                margin: 0;
                font-size: 0.9rem;
                color: var(--gray-600);
                line-height: 1.5;
            }

            .goals-actions {
                display: flex;
                gap: 0.5rem;
                margin-top: 1.5rem;
            }

            .btn-goals {
                padding: 0.5rem 1rem;
                border-radius: 8px;
                border: 1px solid var(--gray-300);
                background: white;
                cursor: pointer;
                font-size: 0.875rem;
                transition: all 0.2s;
            }

            .btn-goals:hover {
                background: var(--gray-100);
                transform: translateY(-1px);
            }

            .btn-primary-goals {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }

            .btn-primary-goals:hover {
                background: #2563eb;
            }

            .btn-success-goals {
                background: #10b981;
                color: white;
                border-color: #10b981;
            }

            .btn-success-goals:hover {
                background: #059669;
            }

            .btn-warning-goals {
                background: #f59e0b;
                color: white;
                border-color: #f59e0b;
            }

            .btn-warning-goals:hover {
                background: #d97706;
            }

            .btn-danger-goals {
                background: #ef4444;
                color: white;
                border-color: #ef4444;
            }

            .btn-danger-goals:hover {
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

        <!-- Header de Metas e KPIs -->
        <div class="goals-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div>
                    <h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; color: white;">🎯 Metas & KPIs</h2>
                    <p style="margin: 0; opacity: 0.9;">Gestão de metas, indicadores e performance</p>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-primary-goals" onclick="showNewGoalForm()">➕ Nova Meta</button>
                    <button class="btn-success-goals" onclick="showNewKpiForm()">📊 Novo KPI</button>
                    <button class="btn-warning-goals" onclick="showNewTargetForm()">🎯 Novo Alvo</button>
                </div>
            </div>
        </div>

        <!-- Estatísticas Gerais -->
        <div class="goals-stats-grid">
            <div class="goals-stat-card">
                <div class="goals-stat-value">${stats.totalGoals}</div>
                <div class="goals-stat-label">Metas</div>
            </div>

            <div class="goals-stat-card">
                <div class="goals-stat-value" style="color: #10b981;">${stats.onTrackGoals}</div>
                <div class="goals-stat-label">No Caminho</div>
            </div>

            <div class="goals-stat-card">
                <div class="goals-stat-value" style="color: #f59e0b;">${stats.atRiskGoals}</div>
                <div class="goals-stat-label">Em Risco</div>
            </div>

            <div class="goals-stat-card">
                <div class="goals-stat-value" style="color: #ef4444;">${stats.avgPerformance}%</div>
                <div class="goals-stat-label">Performance Média</div>
            </div>
        </div>

        <!-- Abas de Navegação -->
        <div class="goals-controls">
            <button class="btn-primary-goals active" onclick="switchGoalsTab('goals')" id="tab-goals">
                🎯 Metas
            </button>
            <button class="btn-primary-goals" onclick="switchGoalsTab('kpis')" id="tab-kpis">
                📊 KPIs
            </button>
            <button class="btn-primary-goals" onclick="switchGoalsTab('targets')" id="tab-targets">
                🎯 Alvos
            </button>
            <button class="btn-primary-goals" onclick="switchGoalsTab('measurements')" id="tab-measurements">
                📏 Medidas
            </button>
            <button class="btn-primary-goals" onclick="switchGoalsTab('analytics')" id="tab-analytics">
                📈 Analytics
            </button>
        </div>

        <!-- Conteúdo das Abas -->
        <div id="goals-goals" class="goals-content active">
            ${renderGoalsTab()}
        </div>

        <div id="goals-kpis" class="goals-content">
            ${renderKpisTab()}
        </div>

        <div id="goals-targets" class="goals-content">
            ${renderTargetsTab()}
        </div>

        <div id="goals-measurements" class="goals-content">
            ${renderMeasurementsTab()}
        </div>

        <div id="goals-analytics" class="goals-content">
            ${renderAnalyticsTab()}
        </div>
    `;
}

// Renderizar Aba de Metas
function renderGoalsTab() {
    return `
        <div class="goals-card">
            <div class="goals-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">🎯 Lista de Metas</h3>
                <div style="display: flex; gap: 0.5rem;">
                    <select class="form-select" id="goalFilter" onchange="filterGoals(this.value)">
                        <option value="all">Todos</option>
                        <option value="on-track">No Caminho</option>
                        <option value="at-risk">Em Risco</option>
                        <option value="off-track">Fora do Caminho</option>
                    </select>
                    <button class="btn-primary-goals" onclick="exportGoals()">📤 Exportar</button>
                </div>
            </div>
            
            <div id="goalsList" style="display: grid; gap: 1rem;">
                ${GoalsState.goals.map(renderGoalCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de KPIs
function renderKpisTab() {
    return `
        <div class="goals-card">
            <div class="goals-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📊 Gestão de KPIs</h3>
                <button class="btn-success-goals" onclick="showNewKpiForm()">➕ Novo KPI</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                ${GoalsState.kpis.map(renderKpiCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Alvos
function renderTargetsTab() {
    return `
        <div class="goals-card">
            <div class="goals-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">🎯 Gestão de Alvos</h3>
                <button class="btn-warning-goals" onclick="showNewTargetForm()">➕ Novo Alvo</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                ${GoalsState.targets.map(renderTargetCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Medidas
function renderMeasurementsTab() {
    return `
        <div class="goals-card">
            <div class="goals-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📏 Gestão de Medidas</h3>
                <button class="btn-primary-goals" onclick="showNewMeasurementForm()">➕ Nova Medida</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                ${GoalsState.measurements.map(renderMeasurementCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Analytics
function renderAnalyticsTab() {
    return `
        <div class="analytics-card">
            <div class="goals-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📈 Analytics de Metas</h3>
                <button class="btn-success-goals" onclick="generateGoalsReport()">📄 Gerar Relatório</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                <div class="analytics-card">
                    <h4 style="margin: 0 0 1rem 0; color: var(--gray-900);">🎯 Performance</h4>
                    <div style="display: grid; gap: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Metas Concluídas</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Total</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${GoalsState.goals.filter(g => g.status === 'completed').length}
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">KPIs Ativos</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Total</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${GoalsState.kpis.filter(k => k.status === 'active').length}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="analytics-card">
                    <h4 style="margin: 0 0 1rem 0; color: var(--gray-900);">📊 Métricas</h4>
                    <div style="display: grid; gap: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Tempo Médio</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Conclusão</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${calculateAverageGoalTime()} dias
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Satisfação</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Metas</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${calculateGoalSatisfaction()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Renderizar Card de Meta
function renderGoalCard(goal) {
    const cssClass = goal.status === 'on_track' ? 'on-track' : goal.status === 'at_risk' ? 'at-risk' : 'off-track';
    const statusClass = `status-${goal.status}`;
    const kpis = GoalsState.kpis.filter(k => k.goalId === goal.id);
    const targets = GoalsState.targets.filter(t => t.goalId === goal.id);
    const measurements = GoalsState.measurements.filter(m => kpis.some(k => k.id === m.kpiId));
    const onTrackKpis = kpis.filter(k => k.status === 'on_track').length;
    const progress = calculateGoalProgress(goal.id);

    return `
        <div class="goals-card ${cssClass}">
            <div class="goals-header-info">
                <div class="goals-info">
                    <div class="goals-icon">🎯</div>
                    <div class="goals-details">
                        <h4>${escapeHTML(goal.name)}</h4>
                        <p>${escapeHTML(goal.description)}</p>
                        <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                            ${goal.type} • ${goal.priority} • ${goal.status}
                        </div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <span class="goals-status ${statusClass}">${goal.status}</span>
                    <div style="font-weight: 700; color: var(--gray-900); margin-top: 0.5rem;">${progress}%</div>
                </div>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">KPIs da Meta:</div>
                <div class="kpi-list">
                    ${kpis.slice(0, 4).map(kpi => `
                        <div class="kpi-item ${kpi.status}">
                            <div class="kpi-info">
                                <h6>${escapeHTML(kpi.name)}</h6>
                                <p>${kpi.type} • ${kpi.status}</p>
                            </div>
                            <div class="kpi-value" style="color: ${getKpiColor(kpi.status)};">
                                ${kpi.value || 0}%
                            </div>
                        </div>
                    `).join('') || '<div style="color: var(--gray-500);">Nenhum KPI</div>'}
                </div>
            </div>

            <div class="target-grid">
                <div class="target-card">
                    <h5 style="margin: 0 0 0.5rem 0; color: var(--gray-900);">📊 KPIs</h5>
                    <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>No Caminho:</span>
                            <span style="font-weight: 700;">${onTrackKpis}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Alvos:</span>
                            <span style="font-weight: 700;">${targets.length}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Medidas:</span>
                            <span style="font-weight: 700;">${measurements.length}</span>
                        </div>
                    </div>
                </div>
                
                <div class="target-card">
                    <h5 style="margin: 0 0 0.5rem 0; color: var(--gray-900);">🎯 Configurações</h5>
                    <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Responsável:</span>
                            <span style="font-weight: 700;">${goal.responsible || 'N/A'}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Data Início:</span>
                            <span style="font-weight: 700;">${new Date(goal.startDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Data Fim:</span>
                            <span style="font-weight: 700;">${new Date(goal.endDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="progress-bar-goals">
                <div class="progress-fill-goals" style="width: ${progress}%; background: ${getGoalColor(progress)};"></div>
            </div>

            <div class="goals-actions">
                <button class="btn-goals btn-primary-goals" onclick="viewGoalDetails('${goal.id}')">👁️ Detalhes</button>
                <button class="btn-goals btn-success-goals" onclick="addKpiToGoal('${goal.id}')">📊 KPI</button>
                <button class="btn-goals btn-warning-goals" onclick="updateGoalStatus('${goal.id}')">✅ Status</button>
                <button class="btn-goals btn-danger-goals" onclick="deleteGoal('${goal.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de KPI
function renderKpiCard(kpi) {
    const goal = GoalsState.goals.find(g => g.id === kpi.goalId);
    const cssClass = kpi.status === 'on_track' ? 'on-track' : kpi.status === 'at_risk' ? 'at-risk' : 'off-track';
    const targets = GoalsState.targets.filter(t => t.kpiId === kpi.id);
    const value = kpi.value || 0;

    return `
        <div class="goals-card ${cssClass}">
            <div class="goals-header-info">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📊 ${escapeHTML(kpi.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        ${goal ? goal.name : 'Meta desconhecida'} • ${kpi.type} • ${kpi.status}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">${value}%</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">Valor</div>
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Descrição:</div>
                <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                    ${escapeHTML(kpi.description)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Tipo:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${kpi.type}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Frequência:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${kpi.frequency || 'N/A'}</div>
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Criação:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(kpi.createdAt).toLocaleDateString('pt-BR')}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Atualização:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(kpi.updatedAt).toLocaleDateString('pt-BR')}</div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-goals btn-primary-goals" onclick="editKpi('${kpi.id}')">✏️ Editar</button>
                <button class="btn-goals btn-success-goals" onclick="updateKpiStatus('${kpi.id}')">✅ Status</button>
                <button class="btn-goals btn-warning-goals" onclick="updateKpiValue('${kpi.id}')">📊 Valor</button>
                <button class="btn-goals btn-danger-goals" onclick="deleteKpi('${kpi.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Alvo
function renderTargetCard(target) {
    const goal = GoalsState.goals.find(g => g.id === target.goalId);
    const kpi = GoalsState.kpis.find(k => k.id === target.kpiId);
    const cssClass = target.status === 'on_track' ? 'on-track' : target.status === 'at_risk' ? 'at-risk' : 'off-track';

    return `
        <div class="goals-card ${cssClass}">
            <div class="goals-header-info">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">🎯 ${escapeHTML(target.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        ${goal ? goal.name : 'Meta desconhecida'} • ${kpi ? kpi.name : 'KPI desconhecido'} • ${target.status}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">${target.targetValue || 0}%</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">Alvo</div>
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Descrição:</div>
                <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                    ${escapeHTML(target.description)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Valor Alvo:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${target.targetValue || 0}%</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Valor Atual:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${target.currentValue || 0}%</div>
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Criação:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(target.createdAt).toLocaleDateString('pt-BR')}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Atualização:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(target.updatedAt).toLocaleDateString('pt-BR')}</div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-goals btn-primary-goals" onclick="editTarget('${target.id}')">✏️ Editar</button>
                <button class="btn-goals btn-success-goals" onclick="updateTargetStatus('${target.id}')">✅ Status</button>
                <button class="btn-goals btn-warning-goals" onclick="updateTargetValue('${target.id}')">🎯 Valor</button>
                <button class="btn-goals btn-danger-goals" onclick="deleteTarget('${target.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Medida
function renderMeasurementCard(measurement) {
    const kpi = GoalsState.kpis.find(k => k.id === measurement.kpiId);
    const goal = GoalsState.goals.find(g => g.id === kpi.goalId);
    const cssClass = measurement.status === 'on_track' ? 'on-track' : measurement.status === 'at_risk' ? 'at-risk' : 'off-track';

    return `
        <div class="goals-card ${cssClass}">
            <div class="goals-header-info">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📏 ${escapeHTML(measurement.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        ${goal ? goal.name : 'Meta desconhecida'} • ${kpi ? kpi.name : 'KPI desconhecido'} • ${measurement.status}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">${measurement.value || 0}%</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">Medição</div>
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Descrição:</div>
                <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                    ${escapeHTML(measurement.description)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Valor:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${measurement.value || 0}%</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Unidade:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${measurement.unit || 'N/A'}</div>
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Medição:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(measurement.measuredAt).toLocaleDateString('pt-BR')}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Atualização:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(measurement.updatedAt).toLocaleDateString('pt-BR')}</div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-goals btn-primary-goals" onclick="editMeasurement('${measurement.id}')">✏️ Editar</button>
                <button class="btn-goals btn-success-goals" onclick="updateMeasurementStatus('${measurement.id}')">✅ Status</button>
                <button class="btn-goals btn-warning-goals" onclick="updateMeasurementValue('${measurement.id}')">📏 Valor</button>
                <button class="btn-goals btn-danger-goals" onclick="deleteMeasurement('${measurement.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Funções de Controle
function switchGoalsTab(tabName) {
    // Atualizar classes das abas
    document.querySelectorAll('.btn-primary-goals').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');

    // Mostrar/esconder conteúdo
    document.querySelectorAll('.goals-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`goals-${tabName}`).classList.add('active');
}

// Funções de Metas
function showNewGoalForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">🎯 Nova Meta</h4>
            <form id="newGoalForm" onsubmit="saveGoal(event)">
                <div class="form-group">
                    <label class="form-label">Nome da Meta *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição da meta..."></textarea>
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
                        <label class="form-label">Prioridade</label>
                        <select class="form-select" name="priority">
                            <option value="Baixa">Baixa</option>
                            <option value="Média">Média</option>
                            <option value="Alta">Alta</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Responsável</label>
                        <input type="text" class="form-input" name="responsible" placeholder="Responsável pela meta">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Valor Objetivo</label>
                        <input type="number" class="form-input" name="targetValue" min="0" step="0.01">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Data de Início</label>
                        <input type="date" class="form-input" name="startDate">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Data de Fim</label>
                        <input type="date" class="form-input" name="endDate">
                    </div>
                </div>
            </form>
        </div>
    `;

    openModal('Nova Meta', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Meta', class: 'btn-primary', onclick: "document.getElementById('newGoalForm').requestSubmit()" }
    ]);
}

function saveGoal(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const goal = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        type: formData.get('type') || 'Financeiro',
        priority: formData.get('priority') || 'Média',
        responsible: formData.get('responsible') || '',
        targetValue: parseFloat(formData.get('targetValue')) || 0,
        currentValue: 0,
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    GoalsState.goals.push(goal);
    AppState.goals = GoalsState.goals;
    saveToStorage(STORAGE_KEYS.GOALS, AppState.goals);

    closeModal();
    renderGoalsDashboard();
    showNotification(`Meta "${goal.name}" criada com sucesso!`, 'success');
}

// Funções de KPIs
function showNewKpiForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">📊 Novo KPI</h4>
            <form id="newKpiForm" onsubmit="saveKpi(event)">
                <div class="form-group">
                    <label class="form-label">Nome do KPI *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição do KPI..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Meta</label>
                        <select class="form-select" name="goalId">
                            ${GoalsState.goals.map(g => `<option value="${g.id}">${g.name}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" name="type">
                            <option value="Financeiro">Financeiro</option>
                            <option value="Operacional">Operacional</option>
                            <option value="Comercial">Comercial</option>
                            <option value="Tecnológico">Tecnológico</option>
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
                            <option value="Trimestral">Trimestral</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Valor</label>
                        <input type="number" class="form-input" name="value" min="0" max="100" step="0.01">
                    </div>
                </div>
            </form>
        </div>
    `;

    openModal('Novo KPI', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar KPI', class: 'btn-primary', onclick: "document.getElementById('newKpiForm').requestSubmit()" }
    ]);
}

function saveKpi(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const kpi = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        goalId: formData.get('goalId'),
        type: formData.get('type') || 'Financeiro',
        frequency: formData.get('frequency') || 'Mensal',
        value: parseFloat(formData.get('value')) || 0,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    GoalsState.kpis.push(kpi);
    AppState.kpis = GoalsState.kpis;
    saveToStorage(STORAGE_KEYS.KPIS, AppState.kpis);

    closeModal();
    renderGoalsDashboard();
    showNotification(`KPI "${kpi.name}" criado com sucesso!`, 'success');
}

// Funções de Alvos
function showNewTargetForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">🎯 Novo Alvo</h4>
            <form id="newTargetForm" onsubmit="saveTarget(event)">
                <div class="form-group">
                    <label class="form-label">Nome do Alvo *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição do alvo..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Meta</label>
                        <select class="form-select" name="goalId">
                            ${GoalsState.goals.map(g => `<option value="${g.id}">${g.name}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">KPI</label>
                        <select class="form-select" name="kpiId">
                            ${GoalsState.kpis.map(k => `<option value="${k.id}">${k.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Valor Alvo</label>
                        <input type="number" class="form-input" name="targetValue" min="0" max="100" step="0.01">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Valor Atual</label>
                        <input type="number" class="form-input" name="currentValue" min="0" max="100" step="0.01">
                    </div>
                </div>
            </form>
        </div>
    `;

    openModal('Novo Alvo', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Alvo', class: 'btn-primary', onclick: "document.getElementById('newTargetForm').requestSubmit()" }
    ]);
}

function saveTarget(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const target = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        goalId: formData.get('goalId'),
        kpiId: formData.get('kpiId'),
        targetValue: parseFloat(formData.get('targetValue')) || 0,
        currentValue: parseFloat(formData.get('currentValue')) || 0,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    GoalsState.targets.push(target);
    AppState.targets = GoalsState.targets;
    saveToStorage(STORAGE_KEYS.TARGETS, AppState.targets);

    closeModal();
    renderGoalsDashboard();
    showNotification(`Alvo "${target.name}" criado com sucesso!`, 'success');
}

// Funções de Medidas
function showNewMeasurementForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">📏 Nova Medida</h4>
            <form id="newMeasurementForm" onsubmit="saveMeasurement(event)">
                <div class="form-group">
                    <label class="form-label">Nome da Medida *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição da medida..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">KPI</label>
                        <select class="form-select" name="kpiId">
                            ${GoalsState.kpis.map(k => `<option value="${k.id}">${k.name}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Valor</label>
                        <input type="number" class="form-input" name="value" min="0" max="100" step="0.01">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Unidade</label>
                        <input type="text" class="form-input" name="unit" placeholder="Unidade de medida">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Data de Medição</label>
                        <input type="date" class="form-input" name="measuredAt">
                    </div>
                </div>
            </form>
        </div>
    `;

    openModal('Nova Medida', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Medida', class: 'btn-primary', onclick: "document.getElementById('newMeasurementForm').requestSubmit()" }
    ]);
}

function saveMeasurement(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const measurement = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        kpiId: formData.get('kpiId'),
        value: parseFloat(formData.get('value')) || 0,
        unit: formData.get('unit') || '',
        measuredAt: formData.get('measuredAt'),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    GoalsState.measurements.push(measurement);
    AppState.measurements = GoalsState.measurements;
    saveToStorage(STORAGE_KEYS.MEASUREMENTS, AppState.measurements);

    closeModal();
    renderGoalsDashboard();
    showNotification(`Medida "${measurement.name}" criada com sucesso!`, 'success');
}

// Funções Auxiliares
function calculateGoalsStats() {
    const totalGoals = GoalsState.goals.length;
    const onTrackGoals = GoalsState.goals.filter(g => g.status === 'on_track').length;
    const atRiskGoals = GoalsState.goals.filter(g => g.status === 'at_risk').length;
    const avgPerformance = GoalsState.measurements.length > 0 ?
        Math.round(GoalsState.measurements.reduce((sum, m) => sum + (m.value || 0), 0) / GoalsState.measurements.length) : 0;

    return {
        totalGoals,
        onTrackGoals,
        atRiskGoals,
        avgPerformance
    };
}

function getGoalColor(progress) {
    if (progress >= 90) return '#10b981';
    if (progress >= 70) return '#3b82f6';
    if (progress >= 50) return '#f59e0b';
    return '#ef4444';
}

function getKpiColor(status) {
    if (status === 'on_track') return '#10b981';
    if (status === 'at_risk') return '#f59e0b';
    return '#ef4444';
}

function calculateGoalProgress(goalId) {
    const kpis = GoalsState.kpis.filter(k => k.goalId === goalId);
    if (kpis.length === 0) return 0;

    const totalValue = kpis.reduce((sum, kpi) => sum + (kpi.value || 0), 0);
    return Math.round(totalValue / kpis.length);
}

function calculateAverageGoalTime() {
    const completedGoals = GoalsState.goals.filter(g => g.status === 'completed');
    if (completedGoals.length === 0) return 0;

    const totalDays = completedGoals.reduce((sum, g) => {
        const started = new Date(g.startDate);
        const completed = new Date(g.endDate);
        return sum + Math.ceil((completed - started) / (1000 * 60 * 60 * 24));
    }, 0);

    return Math.round(totalDays / completedGoals.length);
}

function calculateGoalSatisfaction() {
    const avgPerformance = GoalsState.measurements.length > 0 ?
        Math.round(GoalsState.measurements.reduce((sum, m) => sum + (m.value || 0), 0) / GoalsState.measurements.length) : 0;
    return Math.max(0, 100 - avgPerformance);
}

function filterGoals(status) {
    const filteredGoals = status === 'all' ?
        GoalsState.goals :
        GoalsState.goals.filter(g => g.status === status);

    const goalsList = document.getElementById('goalsList');
    goalsList.innerHTML = filteredGoals.map(renderGoalCard).join('');
}

function exportGoals() {
    const csvContent = [
        ['Meta', 'Status', 'Progresso', 'Tipo', 'Prioridade', 'Responsável', 'Valor Objetivo', 'Data Início', 'Data Fim'],
        ...GoalsState.goals.map(g => [
            g.name, g.status, `${calculateGoalProgress(g.id)}%`, g.type, g.priority, g.responsible, `${g.targetValue}%`,
            new Date(g.startDate).toLocaleDateString('pt-BR'),
            new Date(g.endDate).toLocaleDateString('pt-BR')
        ])
    ].map(row => row.join(',')).join('\n');

    downloadFile('metas.csv', csvContent, 'text/csv');
    showNotification('Metas exportadas com sucesso!', 'success');
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
function setupGoalsEvents() {
    // Atualizar quando os dados mudarem
    document.addEventListener('goalsUpdated', () => {
        GoalsState.goals = AppState.goals;
        GoalsState.kpis = AppState.kpis;
        GoalsState.targets = AppState.targets;
        GoalsState.measurements = AppState.measurements;
        GoalsState.reports = AppState.reports;
        GoalsState.alerts = AppState.alerts;
        GoalsState.benchmarks = AppState.benchmarks;
        GoalsState.trends = AppState.trends;
        renderGoalsDashboard();
    });
}

// Exportar funções globais
window.initGoalsKpisModule = initGoalsKpisModule;
window.renderGoalsDashboard = renderGoalsDashboard;
window.setupGoalsEvents = setupGoalsEvents;
window.switchGoalsTab = switchGoalsTab;
window.showNewGoalForm = showNewGoalForm;
window.saveGoal = saveGoal;
window.showNewKpiForm = showNewKpiForm;
window.saveKpi = saveKpi;
window.showNewTargetForm = showNewTargetForm;
window.saveTarget = saveTarget;
window.showNewMeasurementForm = showNewMeasurementForm;
window.saveMeasurement = saveMeasurement;
window.calculateGoalsStats = calculateGoalsStats;
window.getGoalColor = getGoalColor;
window.getKpiColor = getKpiColor;
window.calculateGoalProgress = calculateGoalProgress;
window.calculateAverageGoalTime = calculateAverageGoalTime;
window.calculateGoalSatisfaction = calculateGoalSatisfaction;
window.filterGoals = filterGoals;
window.exportGoals = exportGoals;
window.downloadFile = downloadFile;