// Dashboard Executivo - CRM Odonto Company
// =============================================

const DashboardState = {
    timeRange: 'month',
    metrics: {},
    charts: {}
};

// Inicializar Dashboard Executivo
function initExecutiveDashboardModule() {
    renderExecutiveDashboard();
    setupDashboardEvents();
    loadDashboardData();
}

// Renderizar Dashboard Executivo
function renderExecutiveDashboard() {
    const container = document.getElementById('dashboardContent');
    if (!container) return;

    const metrics = DashboardState.metrics;

    container.innerHTML = `
        <style>
            .executive-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 2rem;
                border-radius: 16px;
                margin-bottom: 2rem;
                position: relative;
                overflow: hidden;
            }

            .executive-header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="80" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="60" r="1.5" fill="rgba(255,255,255,0.1)"/></svg>');
                pointer-events: none;
            }

            .header-content {
                position: relative;
                z-index: 2;
            }

            .header-title {
                margin: 0 0 0.5rem 0;
                font-size: 2rem;
                font-weight: 800;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }

            .header-subtitle {
                margin: 0;
                font-size: 1rem;
                opacity: 0.9;
                font-weight: 300;
            }

            .time-range-selector {
                display: flex;
                gap: 0.5rem;
                margin-top: 1.5rem;
            }

            .time-btn {
                background: rgba(255,255,255,0.2);
                border: 1px solid rgba(255,255,255,0.3);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                cursor: pointer;
                font-size: 0.875rem;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }

            .time-btn:hover {
                background: rgba(255,255,255,0.3);
                transform: translateY(-1px);
            }

            .time-btn.active {
                background: white;
                color: #667eea;
                font-weight: 700;
            }

            .kpi-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 1.5rem;
                margin-bottom: 2rem;
            }

            .kpi-card {
                background: white;
                border-radius: 16px;
                padding: 1.5rem;
                box-shadow: var(--shadow-lg);
                border: 1px solid var(--gray-200);
                position: relative;
                overflow: hidden;
                transition: all 0.3s ease;
            }

            .kpi-card:hover {
                transform: translateY(-4px);
                box-shadow: var(--shadow-xl);
            }

            .kpi-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
            }

            .kpi-title {
                font-size: 0.875rem;
                font-weight: 700;
                color: var(--gray-600);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .kpi-icon {
                width: 40px;
                height: 40px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.25rem;
            }

            .kpi-value {
                font-size: 2.5rem;
                font-weight: 800;
                color: var(--gray-900);
                margin-bottom: 0.5rem;
            }

            .kpi-change {
                font-size: 0.875rem;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .kpi-change.positive {
                color: #10b981;
            }

            .kpi-change.negative {
                color: #ef4444;
            }

            .kpi-change.neutral {
                color: #9ca3af;
            }

            .charts-grid {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 2rem;
                margin-bottom: 2rem;
            }

            .chart-card {
                background: white;
                border-radius: 16px;
                padding: 1.5rem;
                box-shadow: var(--shadow-lg);
                border: 1px solid var(--gray-200);
                min-height: 400px;
            }

            .chart-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--gray-200);
            }

            .chart-title {
                font-size: 1.125rem;
                font-weight: 700;
                color: var(--gray-900);
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .chart-container {
                width: 100%;
                height: 300px;
                position: relative;
            }

            .performance-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 1.5rem;
                margin-bottom: 2rem;
            }

            .performance-card {
                background: white;
                border-radius: 16px;
                padding: 1.5rem;
                box-shadow: var(--shadow-lg);
                border: 1px solid var(--gray-200);
            }

            .progress-section {
                margin-top: 1.5rem;
            }

            .progress-item {
                margin-bottom: 1.5rem;
            }

            .progress-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
                font-weight: 600;
                color: var(--gray-700);
            }

            .progress-bar {
                width: 100%;
                height: 12px;
                background: var(--gray-200);
                border-radius: 999px;
                overflow: hidden;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #3b82f6, #8b5cf6);
                transition: width 0.3s ease;
            }

            .insights-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1.5rem;
            }

            .insight-card {
                background: linear-gradient(135deg, #f8fafc, #e2e8f0);
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
            }

            .insight-title {
                font-size: 1.125rem;
                font-weight: 700;
                color: var(--gray-900);
                margin-bottom: 1rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .insight-content {
                font-size: 0.95rem;
                color: var(--gray-700);
                line-height: 1.6;
            }

            .trend-arrow {
                font-size: 1.5rem;
                margin-right: 0.5rem;
            }
        </style>

        <!-- Header Executivo -->
        <div class="executive-header">
            <div class="header-content">
                <h1 class="header-title">📊 Dashboard Executivo</h1>
                <p class="header-subtitle">Visão estratégica do desempenho da clínica</p>
                
                <div class="time-range-selector">
                    <button class="time-btn ${DashboardState.timeRange === 'week' ? 'active' : ''}" onclick="setTimeRange('week')">Semana</button>
                    <button class="time-btn ${DashboardState.timeRange === 'month' ? 'active' : ''}" onclick="setTimeRange('month')">Mês</button>
                    <button class="time-btn ${DashboardState.timeRange === 'quarter' ? 'active' : ''}" onclick="setTimeRange('quarter')">Trimestre</button>
                    <button class="time-btn ${DashboardState.timeRange === 'year' ? 'active' : ''}" onclick="setTimeRange('year')">Ano</button>
                </div>
            </div>
        </div>

        <!-- KPIs Principais -->
        <div class="kpi-grid">
            ${renderKPICard('receita', 'Receita Total', metrics.totalRevenue, metrics.revenueChange, '💰')}
            ${renderKPICard('pacientes', 'Novos Pacientes', metrics.newPatients, metrics.patientsChange, '👥')}
            ${renderKPICard('ocupacao', 'Taxa de Ocupação', metrics.occupancyRate, metrics.occupancyChange, '📈')}
            ${renderKPICard('satisfacao', 'Satisfação', metrics.satisfaction, metrics.satisfactionChange, '⭐')}
        </div>

        <!-- Gráficos Principais -->
        <div class="charts-grid">
            <div class="chart-card">
                <div class="chart-header">
                    <div class="chart-title">📈 Evolução de Receita</div>
                    <div style="font-size: 0.875rem; color: var(--gray-500);">Últimos 12 meses</div>
                </div>
                <div class="chart-container" id="revenueChart"></div>
            </div>
            
            <div class="chart-card">
                <div class="chart-header">
                    <div class="chart-title">🥧 Distribuição de Procedimentos</div>
                    <div style="font-size: 0.875rem; color: var(--gray-500);">Por especialidade</div>
                </div>
                <div class="chart-container" id="proceduresChart"></div>
            </div>
        </div>

        <!-- Métricas de Performance -->
        <div class="performance-grid">
            <div class="performance-card">
                <div class="chart-title">🎯 Metas do Mês</div>
                <div class="progress-section">
                    ${renderProgressItem('Meta de Receita', metrics.revenueTarget, metrics.totalRevenue, '#3b82f6')}
                    ${renderProgressItem('Meta de Pacientes', metrics.patientsTarget, metrics.newPatients, '#10b981')}
                    ${renderProgressItem('Meta de Procedimentos', metrics.proceduresTarget, metrics.totalProcedures, '#f59e0b')}
                </div>
            </div>
            
            <div class="performance-card">
                <div class="chart-title">🏆 Desempenho da Equipe</div>
                <div style="margin-top: 1.5rem;">
                    ${renderTeamPerformance()}
                </div>
            </div>
            
            <div class="performance-card">
                <div class="chart-title">📊 Indicadores de Qualidade</div>
                <div style="margin-top: 1.5rem; display: grid; gap: 1rem;">
                    ${renderQualityIndicator('Taxa de Retorno', metrics.returnRate, '#8b5cf6')}
                    ${renderQualityIndicator('Tempo Médio de Espera', metrics.avgWaitTime, '#ef4444')}
                    ${renderQualityIndicator('Cancelamentos', metrics.cancellationRate, '#f59e0b')}
                </div>
            </div>
        </div>

        <!-- Insights Estratégicos -->
        <div class="insights-grid">
            <div class="insight-card">
                <div class="insight-title">💡 Insights de Negócio</div>
                <div class="insight-content">
                    ${generateBusinessInsights()}
                </div>
            </div>
            
            <div class="insight-card">
                <div class="insight-title">⚠️ Alertas Estratégicos</div>
                <div class="insight-content">
                    ${generateStrategicAlerts()}
                </div>
            </div>
        </div>
    `;
}

// Renderizar Card KPI
function renderKPICard(id, title, value, change, icon) {
    const changeClass = change >= 0 ? 'positive' : 'negative';
    const changeIcon = change >= 0 ? '▲' : '▼';
    const formattedValue = typeof value === 'number' ?
        (value >= 1000 ? `R$ ${value.toLocaleString('pt-BR')}` : value.toLocaleString('pt-BR')) : value;

    return `
        <div class="kpi-card">
            <div class="kpi-header">
                <div class="kpi-title">${title}</div>
                <div class="kpi-icon" style="background: ${getKPIIconColor(id)};">
                    ${icon}
                </div>
            </div>
            <div class="kpi-value">${formattedValue}</div>
            <div class="kpi-change ${changeClass}">
                <span class="trend-arrow">${changeIcon}</span>
                <span>${Math.abs(change)}% vs período anterior</span>
            </div>
        </div>
    `;
}

// Renderizar Item de Progresso
function renderProgressItem(title, target, current, color) {
    const percentage = Math.min(100, Math.round((current / target) * 100));

    return `
        <div class="progress-item">
            <div class="progress-header">
                <span>${title}</span>
                <span style="color: var(--gray-600);">${current} / ${target}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percentage}%; background: ${color};"></div>
            </div>
        </div>
    `;
}

// Renderizar Desempenho da Equipe
function renderTeamPerformance() {
    const teamData = calculateTeamPerformance();

    return `
        <div style="display: grid; gap: 1rem;">
            ${teamData.map(member => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border-bottom: 1px solid var(--gray-100);">
                    <div>
                        <div style="font-weight: 600; color: var(--gray-900);">${member.name}</div>
                        <div style="font-size: 0.8rem; color: var(--gray-500);">${member.specialty}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: 700; color: var(--gray-900);">${member.procedures} procedimentos</div>
                        <div style="font-size: 0.8rem; color: var(--gray-500);">R$ ${member.revenue.toLocaleString('pt-BR')}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Renderizar Indicador de Qualidade
function renderQualityIndicator(title, value, color) {
    return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border: 1px solid var(--gray-200); border-radius: 12px;">
            <div>
                <div style="font-weight: 600; color: var(--gray-900);">${title}</div>
                <div style="font-size: 0.8rem; color: var(--gray-500);">Indicador de qualidade</div>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: 700; color: ${color}; font-size: 1.25rem;">${value}</div>
            </div>
        </div>
    `;
}

// Funções de Cálculo de Métricas
function loadDashboardData() {
    const now = new Date();
    const timeRange = DashboardState.timeRange;

    // Calcular métricas baseadas no período selecionado
    const startDate = getStartDate(timeRange);

    // Receita
    const revenueData = calculateRevenueMetrics(startDate, now);

    // Pacientes
    const patientData = calculatePatientMetrics(startDate, now);

    // Ocupação
    const occupancyData = calculateOccupancyMetrics(startDate, now);

    // Satisfação (simulação)
    const satisfactionData = calculateSatisfactionMetrics();

    DashboardState.metrics = {
        totalRevenue: revenueData.total,
        revenueChange: revenueData.change,
        revenueTarget: 50000,

        newPatients: patientData.new,
        patientsChange: patientData.change,
        patientsTarget: 50,

        occupancyRate: occupancyData.rate,
        occupancyChange: occupancyData.change,

        satisfaction: satisfactionData.rate,
        satisfactionChange: satisfactionData.change,

        returnRate: 75,
        avgWaitTime: '15 min',
        cancellationRate: '5%',

        totalProcedures: revenueData.procedures,
        proceduresTarget: 200
    };

    renderExecutiveDashboard();
}

function getStartDate(timeRange) {
    const now = new Date();
    const start = new Date(now);

    switch (timeRange) {
        case 'week':
            start.setDate(now.getDate() - 7);
            break;
        case 'month':
            start.setMonth(now.getMonth() - 1);
            break;
        case 'quarter':
            start.setMonth(now.getMonth() - 3);
            break;
        case 'year':
            start.setFullYear(now.getFullYear() - 1);
            break;
    }

    return start;
}

function calculateRevenueMetrics(startDate, endDate) {
    const appointments = AppState.appointments.filter(a => {
        const date = new Date(a.date);
        return date >= startDate && date <= endDate;
    });

    // Valores médios por procedimento
    const procedureValues = {
        'Avaliação': 100,
        'Consulta': 150,
        'Limpeza': 200,
        'Restauração': 300,
        'Extração': 250,
        'Canal': 800,
        'Clareamento': 600,
        'Implante': 2500,
        'Ortodontia': 1500,
        'Prótese': 1200,
        'Urgência': 200,
        'Outros': 150
    };

    const total = appointments.reduce((sum, apt) => {
        return sum + (procedureValues[apt.procedure] || 150);
    }, 0);

    const procedures = appointments.length;

    // Calcular variação
    const prevStartDate = new Date(startDate);
    const prevEndDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - (endDate - startDate) / (1000 * 60 * 60 * 24));

    const prevTotal = AppState.appointments.filter(a => {
        const date = new Date(a.date);
        return date >= prevStartDate && date <= prevEndDate;
    }).reduce((sum, apt) => {
        return sum + (procedureValues[apt.procedure] || 150);
    }, 0);

    const change = prevTotal > 0 ? Math.round(((total - prevTotal) / prevTotal) * 100) : 0;

    return { total, change, procedures };
}

function calculatePatientMetrics(startDate, endDate) {
    const newPatients = AppState.patients.filter(p => {
        const date = new Date(p.createdAt);
        return date >= startDate && date <= endDate;
    }).length;

    // Calcular variação
    const prevStartDate = new Date(startDate);
    const prevEndDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - (endDate - startDate) / (1000 * 60 * 60 * 24));

    const prevNewPatients = AppState.patients.filter(p => {
        const date = new Date(p.createdAt);
        return date >= prevStartDate && date <= prevEndDate;
    }).length;

    const change = prevNewPatients > 0 ? Math.round(((newPatients - prevNewPatients) / prevNewPatients) * 100) : 0;

    return { new: newPatients, change };
}

function calculateOccupancyMetrics(startDate, endDate) {
    // Simulação de capacidade máxima (8 horas por dia, 22 dias úteis)
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const maxAppointments = days * 22 * 16; // 16 consultas por dia (30min cada)

    const currentAppointments = AppState.appointments.filter(a => {
        const date = new Date(a.date);
        return date >= startDate && date <= endDate;
    }).length;

    const rate = Math.round((currentAppointments / maxAppointments) * 100);

    // Calcular variação
    const prevStartDate = new Date(startDate);
    const prevEndDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - days);

    const prevAppointments = AppState.appointments.filter(a => {
        const date = new Date(a.date);
        return date >= prevStartDate && date <= prevEndDate;
    }).length;

    const prevRate = Math.round((prevAppointments / maxAppointments) * 100);
    const change = prevRate > 0 ? rate - prevRate : 0;

    return { rate, change };
}

function calculateSatisfactionMetrics() {
    // Simulação de métricas de satisfação
    const baseRate = 85;
    const change = Math.floor(Math.random() * 10) - 5; // Variação entre -5 e +5

    return { rate: baseRate + change, change };
}

function calculateTeamPerformance() {
    // Simulação de desempenho da equipe
    return [
        { name: 'Dr. Ana Silva', specialty: 'Ortodontia', procedures: 45, revenue: 67500 },
        { name: 'Dr. Carlos Santos', specialty: 'Endodontia', procedures: 32, revenue: 25600 },
        { name: 'Dra. Maria Oliveira', specialty: 'Periodontia', procedures: 58, revenue: 11600 },
        { name: 'Dr. João Pereira', specialty: 'Implantodontia', procedures: 12, revenue: 30000 }
    ];
}

// Funções de Insights e Alertas
function generateBusinessInsights() {
    const metrics = DashboardState.metrics;
    const insights = [];

    if (metrics.totalRevenue > metrics.revenueTarget * 0.8) {
        insights.push('✅ Excelente performance de receita! A clínica está alcançando 80% ou mais da meta mensal.');
    }

    if (metrics.newPatients > metrics.patientsTarget * 0.5) {
        insights.push('👥 Bom fluxo de novos pacientes. Estratégias de captação estão funcionando.');
    }

    if (metrics.occupancyRate < 60) {
        insights.push('⚠️ Taxa de ocupação abaixo do ideal. Considere campanhas de marketing ou promoções.');
    }

    if (metrics.satisfaction > 80) {
        insights.push('⭐ Alta satisfação dos pacientes. Continue investindo na qualidade do atendimento.');
    }

    if (insights.length === 0) {
        insights.push('📊 Métricas dentro da média esperada. Monitorar continuamente para identificar oportunidades.');
    }

    return insights.map(insight => `<div style="margin-bottom: 1rem; padding: 1rem; background: white; border-radius: 8px; border-left: 4px solid var(--primary-500);">${insight}</div>`).join('');
}

function generateStrategicAlerts() {
    const metrics = DashboardState.metrics;
    const alerts = [];

    if (metrics.occupancyRate < 50) {
        alerts.push('🚨 Taxa de ocupação crítica (< 50%). Necessário plano de ação urgente.');
    }

    if (metrics.cancellationRate > 10) {
        alerts.push('⚠️ Alta taxa de cancelamentos. Revisar políticas de remarcação e confirmação.');
    }

    if (metrics.satisfaction < 70) {
        alerts.push('🔴 Satisfação dos pacientes abaixo do aceitável. Investigar causas e tomar medidas.');
    }

    if (metrics.newPatients < 10) {
        alerts.push('📈 Baixo fluxo de novos pacientes. Avaliar estratégias de marketing e captação.');
    }

    if (alerts.length === 0) {
        alerts.push('✅ Nenhum alerta crítico no momento. Continue monitorando as métricas.');
    }

    return alerts.map(alert => `<div style="margin-bottom: 1rem; padding: 1rem; background: white; border-radius: 8px; border-left: 4px solid var(--error-500);">${alert}</div>`).join('');
}

// Funções de Controle
function setTimeRange(range) {
    DashboardState.timeRange = range;
    loadDashboardData();

    // Atualizar classes dos botões
    document.querySelectorAll('.time-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

function getKPIIconColor(id) {
    const colors = {
        'receita': 'linear-gradient(135deg, #10b981, #3b82f6)',
        'pacientes': 'linear-gradient(135deg, #f59e0b, #ef4444)',
        'ocupacao': 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
        'satisfacao': 'linear-gradient(135deg, #f43f5e, #a78bfa)'
    };
    return colors[id] || 'linear-gradient(135deg, #6366f1, #8b5cf6)';
}

// Configurar Eventos
function setupDashboardEvents() {
    // Atualizar quando os dados mudarem
    document.addEventListener('dashboardUpdated', () => {
        loadDashboardData();
    });
}

// Exportar funções globais
window.initExecutiveDashboardModule = initExecutiveDashboardModule;
window.renderExecutiveDashboard = renderExecutiveDashboard;
window.setupDashboardEvents = setupDashboardEvents;
window.loadDashboardData = loadDashboardData;
window.setTimeRange = setTimeRange;
window.getKPIIconColor = getKPIIconColor;
window.renderKPICard = renderKPICard;
window.renderProgressItem = renderProgressItem;
window.renderTeamPerformance = renderTeamPerformance;
window.renderQualityIndicator = renderQualityIndicator;
window.generateBusinessInsights = generateBusinessInsights;
window.generateStrategicAlerts = generateStrategicAlerts;
window.calculateRevenueMetrics = calculateRevenueMetrics;
window.calculatePatientMetrics = calculatePatientMetrics;
window.calculateOccupancyMetrics = calculateOccupancyMetrics;
window.calculateSatisfactionMetrics = calculateSatisfactionMetrics;
window.calculateTeamPerformance = calculateTeamPerformance;