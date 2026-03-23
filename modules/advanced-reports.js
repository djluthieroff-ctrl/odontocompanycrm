// Relatórios Avançados - CRM Odonto Company
// =============================================

const ReportsState = {
    reports: [],
    dashboards: [],
    charts: [],
    filters: [],
    schedules: [],
    exports: [],
    templates: [],
    analytics: []
};

// Inicializar Módulo de Relatórios Avançados
function initAdvancedReportsModule() {
    ReportsState.reports = AppState.reports || [];
    ReportsState.dashboards = AppState.dashboards || [];
    ReportsState.charts = AppState.charts || [];
    ReportsState.filters = AppState.filters || [];
    ReportsState.schedules = AppState.schedules || [];
    ReportsState.exports = AppState.exports || [];
    ReportsState.templates = AppState.templates || [];
    ReportsState.analytics = AppState.analytics || [];
    renderReportsDashboard();
    setupReportsEvents();
    loadReportsData();
}

// Renderizar Dashboard de Relatórios Avançados
function renderReportsDashboard() {
    const container = document.getElementById('reportsContent');
    if (!container) return;

    const stats = calculateReportsStats();

    container.innerHTML = `
        <style>
            .reports-header {
                background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
                color: white;
                padding: 2rem;
                border-radius: 16px;
                margin-bottom: 2rem;
            }

            .reports-controls {
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                align-items: center;
                margin-bottom: 2rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--gray-200);
            }

            .reports-stats-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .reports-stat-card {
                background: white;
                padding: 1.5rem;
                border-radius: 16px;
                border: 1px solid var(--gray-200);
                text-align: center;
                box-shadow: var(--shadow-md);
            }

            .reports-stat-value {
                font-size: 2rem;
                font-weight: 800;
                color: var(--gray-900);
                margin-bottom: 0.5rem;
            }

            .reports-stat-label {
                font-size: 0.875rem;
                color: var(--gray-600);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .reports-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
                margin-bottom: 1rem;
                box-shadow: var(--shadow-md);
                transition: all 0.3s ease;
                position: relative;
            }

            .reports-card.active {
                border-color: #3b82f6;
                background: linear-gradient(135deg, #f0f9ff, #dbeafe);
            }

            .reports-card.scheduled {
                border-color: #10b981;
                background: linear-gradient(135deg, #f0fdf4, #dcfce7);
            }

            .reports-card.exported {
                border-color: #f59e0b;
                background: linear-gradient(135deg, #fffbeb, #fef3c7);
            }

            .reports-header-info {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 1rem;
            }

            .reports-info {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .reports-icon {
                width: 60px;
                height: 60px;
                border-radius: 12px;
                background: linear-gradient(135deg, #06b6d4, #3b82f6);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 1.5rem;
            }

            .reports-details h4 {
                margin: 0 0 0.25rem 0;
                font-size: 1.25rem;
                color: var(--gray-900);
            }

            .reports-details p {
                margin: 0;
                font-size: 0.9rem;
                color: var(--gray-600);
            }

            .reports-status {
                padding: 4px 12px;
                border-radius: 999px;
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;
            }

            .status-active { background: #dbeafe; color: #1e40af; }
            .status-scheduled { background: #dcfce7; color: #065f46; }
            .status-exported { background: #fef3c7; color: #92400e; }

            .chart-list {
                display: grid;
                gap: 0.5rem;
                margin-bottom: 1.5rem;
            }

            .chart-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                padding: 0.75rem;
                background: var(--gray-50);
                border-radius: 8px;
                border-left: 4px solid #06b6d4;
            }

            .chart-item.active {
                border-left-color: #3b82f6;
                background: #f0f9ff;
            }

            .chart-item.scheduled {
                border-left-color: #10b981;
                background: #f0fdf4;
            }

            .chart-item.exported {
                border-left-color: #f59e0b;
                background: #fffbeb;
            }

            .chart-info h6 {
                margin: 0 0 0.25rem 0;
                font-size: 0.9rem;
                color: var(--gray-900);
            }

            .chart-info p {
                margin: 0;
                font-size: 0.8rem;
                color: var(--gray-600);
            }

            .chart-value {
                font-weight: 700;
                font-size: 0.9rem;
                color: var(--gray-900);
            }

            .progress-bar-reports {
                width: 100%;
                height: 12px;
                background: var(--gray-200);
                border-radius: 999px;
                overflow: hidden;
                margin-top: 0.5rem;
            }

            .progress-fill-reports {
                height: 100%;
                background: linear-gradient(90deg, #06b6d4, #3b82f6);
                transition: width 0.3s ease;
            }

            .filter-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
                margin-bottom: 1.5rem;
            }

            .filter-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
            }

            .filter-card h5 {
                margin: 0 0 0.5rem 0;
                font-size: 1rem;
                color: var(--gray-900);
            }

            .filter-card p {
                margin: 0;
                font-size: 0.9rem;
                color: var(--gray-600);
                line-height: 1.5;
            }

            .reports-actions {
                display: flex;
                gap: 0.5rem;
                margin-top: 1.5rem;
            }

            .btn-reports {
                padding: 0.5rem 1rem;
                border-radius: 8px;
                border: 1px solid var(--gray-300);
                background: white;
                cursor: pointer;
                font-size: 0.875rem;
                transition: all 0.2s;
            }

            .btn-reports:hover {
                background: var(--gray-100);
                transform: translateY(-1px);
            }

            .btn-primary-reports {
                background: #06b6d4;
                color: white;
                border-color: #06b6d4;
            }

            .btn-primary-reports:hover {
                background: #0891b2;
            }

            .btn-success-reports {
                background: #10b981;
                color: white;
                border-color: #10b981;
            }

            .btn-success-reports:hover {
                background: #059669;
            }

            .btn-warning-reports {
                background: #f59e0b;
                color: white;
                border-color: #f59e0b;
            }

            .btn-warning-reports:hover {
                background: #d97706;
            }

            .btn-danger-reports {
                background: #ef4444;
                color: white;
                border-color: #ef4444;
            }

            .btn-danger-reports:hover {
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

        <!-- Header de Relatórios -->
        <div class="reports-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div>
                    <h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; color: white;">📊 Relatórios Avançados</h2>
                    <p style="margin: 0; opacity: 0.9;">Análises, dashboards e visualizações de dados</p>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-primary-reports" onclick="showNewReportForm()">➕ Novo Relatório</button>
                    <button class="btn-success-reports" onclick="showNewDashboardForm()">📈 Novo Dashboard</button>
                    <button class="btn-warning-reports" onclick="showNewChartForm()">📊 Novo Gráfico</button>
                </div>
            </div>
        </div>

        <!-- Estatísticas Gerais -->
        <div class="reports-stats-grid">
            <div class="reports-stat-card">
                <div class="reports-stat-value">${stats.totalReports}</div>
                <div class="reports-stat-label">Relatórios</div>
            </div>

            <div class="reports-stat-card">
                <div class="reports-stat-value" style="color: #3b82f6;">${stats.activeReports}</div>
                <div class="reports-stat-label">Ativos</div>
            </div>

            <div class="reports-stat-card">
                <div class="reports-stat-value" style="color: #10b981;">${stats.scheduledReports}</div>
                <div class="reports-stat-label">Agendados</div>
            </div>

            <div class="reports-stat-card">
                <div class="reports-stat-value" style="color: #f59e0b;">${stats.exportedReports}</div>
                <div class="reports-stat-label">Exportados</div>
            </div>
        </div>

        <!-- Abas de Navegação -->
        <div class="reports-controls">
            <button class="btn-primary-reports active" onclick="switchReportsTab('reports')" id="tab-reports">
                📊 Relatórios
            </button>
            <button class="btn-primary-reports" onclick="switchReportsTab('dashboards')" id="tab-dashboards">
                📈 Dashboards
            </button>
            <button class="btn-primary-reports" onclick="switchReportsTab('charts')" id="tab-charts">
                📊 Gráficos
            </button>
            <button class="btn-primary-reports" onclick="switchReportsTab('schedules')" id="tab-schedules">
                ⏰ Agendamentos
            </button>
            <button class="btn-primary-reports" onclick="switchReportsTab('analytics')" id="tab-analytics">
                📈 Analytics
            </button>
        </div>

        <!-- Conteúdo das Abas -->
        <div id="reports-reports" class="reports-content active">
            ${renderReportsTab()}
        </div>

        <div id="reports-dashboards" class="reports-content">
            ${renderDashboardsTab()}
        </div>

        <div id="reports-charts" class="reports-content">
            ${renderChartsTab()}
        </div>

        <div id="reports-schedules" class="reports-content">
            ${renderSchedulesTab()}
        </div>

        <div id="reports-analytics" class="reports-content">
            ${renderAnalyticsTab()}
        </div>
    `;
}

// Renderizar Aba de Relatórios
function renderReportsTab() {
    return `
        <div class="reports-card">
            <div class="reports-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📊 Lista de Relatórios</h3>
                <div style="display: flex; gap: 0.5rem;">
                    <select class="form-select" id="reportFilter" onchange="filterReports(this.value)">
                        <option value="all">Todos</option>
                        <option value="active">Ativos</option>
                        <option value="scheduled">Agendados</option>
                        <option value="exported">Exportados</option>
                    </select>
                    <button class="btn-primary-reports" onclick="exportReports()">📤 Exportar</button>
                </div>
            </div>
            
            <div id="reportsList" style="display: grid; gap: 1rem;">
                ${ReportsState.reports.map(renderReportCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Dashboards
function renderDashboardsTab() {
    return `
        <div class="reports-card">
            <div class="reports-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📈 Gestão de Dashboards</h3>
                <button class="btn-success-reports" onclick="showNewDashboardForm()">➕ Novo Dashboard</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                ${ReportsState.dashboards.map(renderDashboardCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Gráficos
function renderChartsTab() {
    return `
        <div class="reports-card">
            <div class="reports-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📊 Gestão de Gráficos</h3>
                <button class="btn-warning-reports" onclick="showNewChartForm()">➕ Novo Gráfico</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                ${ReportsState.charts.map(renderChartCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Agendamentos
function renderSchedulesTab() {
    return `
        <div class="reports-card">
            <div class="reports-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">⏰ Gestão de Agendamentos</h3>
                <button class="btn-primary-reports" onclick="showNewScheduleForm()">➕ Novo Agendamento</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                ${ReportsState.schedules.map(renderScheduleCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Analytics
function renderAnalyticsTab() {
    return `
        <div class="analytics-card">
            <div class="reports-header-info">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📈 Analytics de Relatórios</h3>
                <button class="btn-success-reports" onclick="generateReportsReport()">📄 Gerar Relatório</button>
            </div>
            
            <div style="margin-top: 1rem; display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                <div class="analytics-card">
                    <h4 style="margin: 0 0 1rem 0; color: var(--gray-900);">🎯 Performance</h4>
                    <div style="display: grid; gap: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Relatórios Ativos</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Total</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${ReportsState.reports.filter(r => r.status === 'active').length}
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Dashboards</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Total</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${ReportsState.dashboards.length}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="analytics-card">
                    <h4 style="margin: 0 0 1rem 0; color: var(--gray-900);">📊 Métricas</h4>
                    <div style="display: grid; gap: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Gráficos</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Total</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${ReportsState.charts.length}
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-700);">Agendamentos</div>
                                <div style="font-size: 0.8rem; color: var(--gray-600);">Total</div>
                            </div>
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">
                                ${ReportsState.schedules.length}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Renderizar Card de Relatório
function renderReportCard(report) {
    const cssClass = report.status === 'active' ? 'active' : report.status === 'scheduled' ? 'scheduled' : 'exported';
    const statusClass = `status-${report.status}`;
    const charts = ReportsState.charts.filter(c => c.reportId === report.id);
    const filters = ReportsState.filters.filter(f => f.reportId === report.id);
    const schedules = ReportsState.schedules.filter(s => s.reportId === report.id);

    return `
        <div class="reports-card ${cssClass}">
            <div class="reports-header-info">
                <div class="reports-info">
                    <div class="reports-icon">📊</div>
                    <div class="reports-details">
                        <h4>${escapeHTML(report.name)}</h4>
                        <p>${escapeHTML(report.description)}</p>
                        <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                            ${report.type} • ${report.frequency} • ${report.status}
                        </div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <span class="reports-status ${statusClass}">${report.status}</span>
                    <div style="font-weight: 700; color: var(--gray-900); margin-top: 0.5rem;">${charts.length} gráficos</div>
                </div>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Gráficos do Relatório:</div>
                <div class="chart-list">
                    ${charts.slice(0, 4).map(chart => `
                        <div class="chart-item ${chart.status}">
                            <div class="chart-info">
                                <h6>${escapeHTML(chart.name)}</h6>
                                <p>${chart.type} • ${chart.status}</p>
                            </div>
                            <div class="chart-value" style="color: ${getChartColor(chart.status)};">
                                ${chart.dataPoints || 0} pts
                            </div>
                        </div>
                    `).join('') || '<div style="color: var(--gray-500);">Nenhum gráfico</div>'}
                </div>
            </div>

            <div class="filter-grid">
                <div class="filter-card">
                    <h5 style="margin: 0 0 0.5rem 0; color: var(--gray-900);">📊 Gráficos</h5>
                    <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Tipos:</span>
                            <span style="font-weight: 700;">${[...new Set(charts.map(c => c.type))].join(', ')}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Filtros:</span>
                            <span style="font-weight: 700;">${filters.length}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Agendamentos:</span>
                            <span style="font-weight: 700;">${schedules.length}</span>
                        </div>
                    </div>
                </div>
                
                <div class="filter-card">
                    <h5 style="margin: 0 0 0.5rem 0; color: var(--gray-900);">🎯 Configurações</h5>
                    <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Formato:</span>
                            <span style="font-weight: 700;">${report.format || 'PDF'}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span>Data Criação:</span>
                            <span style="font-weight: 700;">${new Date(report.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>Última Atualização:</span>
                            <span style="font-weight: 700;">${new Date(report.updatedAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="progress-bar-reports">
                <div class="progress-fill-reports" style="width: ${Math.min(100, charts.length * 20)}%; background: ${getReportColor(report.status)};"></div>
            </div>

            <div class="reports-actions">
                <button class="btn-reports btn-primary-reports" onclick="viewReportDetails('${report.id}')">👁️ Detalhes</button>
                <button class="btn-reports btn-success-reports" onclick="addChartToReport('${report.id}')">📊 Gráfico</button>
                <button class="btn-reports btn-warning-reports" onclick="updateReportStatus('${report.id}')">✅ Status</button>
                <button class="btn-reports btn-danger-reports" onclick="deleteReport('${report.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Dashboard
function renderDashboardCard(dashboard) {
    const cssClass = dashboard.status === 'active' ? 'active' : dashboard.status === 'scheduled' ? 'scheduled' : 'exported';
    const charts = ReportsState.charts.filter(c => c.dashboardId === dashboard.id);
    const filters = ReportsState.filters.filter(f => f.dashboardId === dashboard.id);

    return `
        <div class="reports-card ${cssClass}">
            <div class="reports-header-info">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📈 ${escapeHTML(dashboard.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        ${dashboard.type} • ${dashboard.layout} • ${dashboard.status}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">${charts.length} gráficos</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">Componentes</div>
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Descrição:</div>
                <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                    ${escapeHTML(dashboard.description)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Layout:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${dashboard.layout}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Tema:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${dashboard.theme || 'Padrão'}</div>
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Criação:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(dashboard.createdAt).toLocaleDateString('pt-BR')}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Atualização:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(dashboard.updatedAt).toLocaleDateString('pt-BR')}</div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-reports btn-primary-reports" onclick="editDashboard('${dashboard.id}')">✏️ Editar</button>
                <button class="btn-reports btn-success-reports" onclick="updateDashboardStatus('${dashboard.id}')">✅ Status</button>
                <button class="btn-reports btn-warning-reports" onclick="updateDashboardLayout('${dashboard.id}')">🎨 Layout</button>
                <button class="btn-reports btn-danger-reports" onclick="deleteDashboard('${dashboard.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Gráfico
function renderChartCard(chart) {
    const cssClass = chart.status === 'active' ? 'active' : chart.status === 'scheduled' ? 'scheduled' : 'exported';
    const dataPoints = chart.dataPoints || 0;

    return `
        <div class="reports-card ${cssClass}">
            <div class="reports-header-info">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📊 ${escapeHTML(chart.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        ${chart.type} • ${chart.category} • ${chart.status}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">${dataPoints} pts</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">Pontos</div>
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Descrição:</div>
                <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                    ${escapeHTML(chart.description)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Tipo:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${chart.type}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Categoria:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${chart.category || 'N/A'}</div>
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Criação:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(chart.createdAt).toLocaleDateString('pt-BR')}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Atualização:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(chart.updatedAt).toLocaleDateString('pt-BR')}</div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-reports btn-primary-reports" onclick="editChart('${chart.id}')">✏️ Editar</button>
                <button class="btn-reports btn-success-reports" onclick="updateChartStatus('${chart.id}')">✅ Status</button>
                <button class="btn-reports btn-warning-reports" onclick="updateChartData('${chart.id}')">📊 Dados</button>
                <button class="btn-reports btn-danger-reports" onclick="deleteChart('${chart.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Renderizar Card de Agendamento
function renderScheduleCard(schedule) {
    const cssClass = schedule.status === 'active' ? 'active' : schedule.status === 'scheduled' ? 'scheduled' : 'exported';
    const report = ReportsState.reports.find(r => r.id === schedule.reportId);

    return `
        <div class="reports-card ${cssClass}">
            <div class="reports-header-info">
                <div>
                    <h4 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">⏰ ${escapeHTML(schedule.name)}</h4>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">
                        ${report ? report.name : 'Relatório desconhecido'} • ${schedule.frequency} • ${schedule.status}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: var(--gray-900);">${schedule.recipients || 0} dest.</div>
                    <div style="font-size: 0.8rem; color: var(--gray-500); margin-top: 0.25rem;">Destinatários</div>
                </div>
            </div>

            <div style="margin-top: 1rem;">
                <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Descrição:</div>
                <div style="color: var(--gray-600); font-size: 0.9rem; line-height: 1.5;">
                    ${escapeHTML(schedule.description)}
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Frequência:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${schedule.frequency}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Formato:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${schedule.format || 'PDF'}</div>
                </div>
            </div>

            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Próxima Execução:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(schedule.nextRun).toLocaleDateString('pt-BR')}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Data de Criação:</div>
                    <div style="color: var(--gray-600); font-size: 0.9rem;">${new Date(schedule.createdAt).toLocaleDateString('pt-BR')}</div>
                </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                <button class="btn-reports btn-primary-reports" onclick="editSchedule('${schedule.id}')">✏️ Editar</button>
                <button class="btn-reports btn-success-reports" onclick="updateScheduleStatus('${schedule.id}')">✅ Status</button>
                <button class="btn-reports btn-warning-reports" onclick="updateScheduleFrequency('${schedule.id}')">⏰ Frequência</button>
                <button class="btn-reports btn-danger-reports" onclick="deleteSchedule('${schedule.id}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
}

// Funções de Controle
function switchReportsTab(tabName) {
    // Atualizar classes das abas
    document.querySelectorAll('.btn-primary-reports').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');

    // Mostrar/esconder conteúdo
    document.querySelectorAll('.reports-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`reports-${tabName}`).classList.add('active');
}

// Funções de Relatórios
function showNewReportForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">📊 Novo Relatório</h4>
            <form id="newReportForm" onsubmit="saveReport(event)">
                <div class="form-group">
                    <label class="form-label">Nome do Relatório *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição do relatório..."></textarea>
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
                        <label class="form-label">Frequência</label>
                        <select class="form-select" name="frequency">
                            <option value="Diário">Diário</option>
                            <option value="Semanal">Semanal</option>
                            <option value="Mensal">Mensal</option>
                            <option value="Trimestral">Trimestral</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Formato</label>
                        <select class="form-select" name="format">
                            <option value="PDF">PDF</option>
                            <option value="Excel">Excel</option>
                            <option value="PowerPoint">PowerPoint</option>
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
            </form>
        </div>
    `;

    openModal('Novo Relatório', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Relatório', class: 'btn-primary', onclick: "document.getElementById('newReportForm').requestSubmit()" }
    ]);
}

function saveReport(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const report = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        type: formData.get('type') || 'Financeiro',
        frequency: formData.get('frequency') || 'Mensal',
        format: formData.get('format') || 'PDF',
        priority: formData.get('priority') || 'Média',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    ReportsState.reports.push(report);
    AppState.reports = ReportsState.reports;
    saveToStorage(STORAGE_KEYS.REPORTS, AppState.reports);

    closeModal();
    renderReportsDashboard();
    showNotification(`Relatório "${report.name}" criado com sucesso!`, 'success');
}

// Funções de Dashboards
function showNewDashboardForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">📈 Novo Dashboard</h4>
            <form id="newDashboardForm" onsubmit="saveDashboard(event)">
                <div class="form-group">
                    <label class="form-label">Nome do Dashboard *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição do dashboard..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" name="type">
                            <option value="Executivo">Executivo</option>
                            <option value="Operacional">Operacional</option>
                            <option value="Financeiro">Financeiro</option>
                            <option value="Comercial">Comercial</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Layout</label>
                        <select class="form-select" name="layout">
                            <option value="Grid">Grid</option>
                            <option value="Vertical">Vertical</option>
                            <option value="Horizontal">Horizontal</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tema</label>
                        <input type="text" class="form-input" name="theme" placeholder="Tema do dashboard">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Responsável</label>
                        <input type="text" class="form-input" name="responsible" placeholder="Responsável pelo dashboard">
                    </div>
                </div>
            </form>
        </div>
    `;

    openModal('Novo Dashboard', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Dashboard', class: 'btn-primary', onclick: "document.getElementById('newDashboardForm').requestSubmit()" }
    ]);
}

function saveDashboard(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const dashboard = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        type: formData.get('type') || 'Executivo',
        layout: formData.get('layout') || 'Grid',
        theme: formData.get('theme') || 'Padrão',
        responsible: formData.get('responsible') || '',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    ReportsState.dashboards.push(dashboard);
    AppState.dashboards = ReportsState.dashboards;
    saveToStorage(STORAGE_KEYS.DASHBOARDS, AppState.dashboards);

    closeModal();
    renderReportsDashboard();
    showNotification(`Dashboard "${dashboard.name}" criado com sucesso!`, 'success');
}

// Funções de Gráficos
function showNewChartForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">📊 Novo Gráfico</h4>
            <form id="newChartForm" onsubmit="saveChart(event)">
                <div class="form-group">
                    <label class="form-label">Nome do Gráfico *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição do gráfico..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tipo</label>
                        <select class="form-select" name="type">
                            <option value="Barra">Barra</option>
                            <option value="Linha">Linha</option>
                            <option value="Pizza">Pizza</option>
                            <option value="Área">Área</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Categoria</label>
                        <input type="text" class="form-input" name="category" placeholder="Categoria do gráfico">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Data Points</label>
                        <input type="number" class="form-input" name="dataPoints" min="0" step="1">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Cor</label>
                        <input type="color" class="form-input" name="color" value="#3b82f6">
                    </div>
                </div>
            </form>
        </div>
    `;

    openModal('Novo Gráfico', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Gráfico', class: 'btn-primary', onclick: "document.getElementById('newChartForm').requestSubmit()" }
    ]);
}

function saveChart(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const chart = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        type: formData.get('type') || 'Barra',
        category: formData.get('category') || '',
        dataPoints: parseInt(formData.get('dataPoints')) || 0,
        color: formData.get('color') || '#3b82f6',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    ReportsState.charts.push(chart);
    AppState.charts = ReportsState.charts;
    saveToStorage(STORAGE_KEYS.CHARTS, AppState.charts);

    closeModal();
    renderReportsDashboard();
    showNotification(`Gráfico "${chart.name}" criado com sucesso!`, 'success');
}

// Funções de Agendamentos
function showNewScheduleForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">⏰ Novo Agendamento</h4>
            <form id="newScheduleForm" onsubmit="saveSchedule(event)">
                <div class="form-group">
                    <label class="form-label">Nome do Agendamento *</label>
                    <input type="text" class="form-input" name="name" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="3" placeholder="Descrição do agendamento..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Relatório</label>
                        <select class="form-select" name="reportId">
                            ${ReportsState.reports.map(r => `<option value="${r.id}">${r.name}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Frequência</label>
                        <select class="form-select" name="frequency">
                            <option value="Diário">Diário</option>
                            <option value="Semanal">Semanal</option>
                            <option value="Mensal">Mensal</option>
                            <option value="Trimestral">Trimestral</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Formato</label>
                        <select class="form-select" name="format">
                            <option value="PDF">PDF</option>
                            <option value="Excel">Excel</option>
                            <option value="PowerPoint">PowerPoint</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Destinatários</label>
                        <input type="number" class="form-input" name="recipients" min="0" step="1">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Próxima Execução</label>
                    <input type="date" class="form-input" name="nextRun">
                </div>
            </form>
        </div>
    `;

    openModal('Novo Agendamento', modalContent, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Criar Agendamento', class: 'btn-primary', onclick: "document.getElementById('newScheduleForm').requestSubmit()" }
    ]);
}

function saveSchedule(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const schedule = {
        id: generateId(),
        name: formData.get('name'),
        description: formData.get('description') || '',
        reportId: formData.get('reportId'),
        frequency: formData.get('frequency') || 'Mensal',
        format: formData.get('format') || 'PDF',
        recipients: parseInt(formData.get('recipients')) || 0,
        nextRun: formData.get('nextRun'),
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    ReportsState.schedules.push(schedule);
    AppState.schedules = ReportsState.schedules;
    saveToStorage(STORAGE_KEYS.SCHEDULES, AppState.schedules);

    closeModal();
    renderReportsDashboard();
    showNotification(`Agendamento "${schedule.name}" criado com sucesso!`, 'success');
}

// Funções Auxiliares
function calculateReportsStats() {
    const totalReports = ReportsState.reports.length;
    const activeReports = ReportsState.reports.filter(r => r.status === 'active').length;
    const scheduledReports = ReportsState.reports.filter(r => r.status === 'scheduled').length;
    const exportedReports = ReportsState.reports.filter(r => r.status === 'exported').length;

    return {
        totalReports,
        activeReports,
        scheduledReports,
        exportedReports
    };
}

function getReportColor(status) {
    if (status === 'active') return '#3b82f6';
    if (status === 'scheduled') return '#10b981';
    return '#f59e0b';
}

function getChartColor(status) {
    if (status === 'active') return '#3b82f6';
    if (status === 'scheduled') return '#10b981';
    return '#f59e0b';
}

function filterReports(status) {
    const filteredReports = status === 'all' ?
        ReportsState.reports :
        ReportsState.reports.filter(r => r.status === status);

    const reportsList = document.getElementById('reportsList');
    reportsList.innerHTML = filteredReports.map(renderReportCard).join('');
}

function exportReports() {
    const csvContent = [
        ['Relatório', 'Status', 'Tipo', 'Frequência', 'Formato', 'Prioridade', 'Data Criação', 'Data Atualização'],
        ...ReportsState.reports.map(r => [
            r.name, r.status, r.type, r.frequency, r.format, r.priority,
            new Date(r.createdAt).toLocaleDateString('pt-BR'),
            new Date(r.updatedAt).toLocaleDateString('pt-BR')
        ])
    ].map(row => row.join(',')).join('\n');

    downloadFile('relatorios.csv', csvContent, 'text/csv');
    showNotification('Relatórios exportados com sucesso!', 'success');
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
function setupReportsEvents() {
    // Atualizar quando os dados mudarem
    document.addEventListener('reportsUpdated', () => {
        ReportsState.reports = AppState.reports;
        ReportsState.dashboards = AppState.dashboards;
        ReportsState.charts = AppState.charts;
        ReportsState.filters = AppState.filters;
        ReportsState.schedules = AppState.schedules;
        ReportsState.exports = AppState.exports;
        ReportsState.templates = AppState.templates;
        ReportsState.analytics = AppState.analytics;
        renderReportsDashboard();
    });
}

// Exportar funções globais
window.initAdvancedReportsModule = initAdvancedReportsModule;
window.renderReportsDashboard = renderReportsDashboard;
window.setupReportsEvents = setupReportsEvents;
window.switchReportsTab = switchReportsTab;
window.showNewReportForm = showNewReportForm;
window.saveReport = saveReport;
window.showNewDashboardForm = showNewDashboardForm;
window.saveDashboard = saveDashboard;
window.showNewChartForm = showNewChartForm;
window.saveChart = saveChart;
window.showNewScheduleForm = showNewScheduleForm;
window.saveSchedule = saveSchedule;
window.calculateReportsStats = calculateReportsStats;
window.getReportColor = getReportColor;
window.getChartColor = getChartColor;
window.filterReports = filterReports;
window.exportReports = exportReports;
window.downloadFile = downloadFile;