// Reports Module - CRM Odonto Company
// =====================================

// Charts reference
const charts = {};

// Report State for Monthly Detailed Report
const reportState = {
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth()
};

// Initialize Reports Module
function initReportsModule() {
    renderReportsView();
}

// Render Reports View
function renderReportsView() {
    const container = document.getElementById('reportsContent');
    if (!container) return;

    const today = new Date().toISOString().split('T')[0];
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    container.innerHTML = `
        <!-- Filtro de Período -->
        <div style="display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; align-items: flex-end;">
            <div class="form-group" style="margin: 0;">
                <label class="form-label">Data Início</label>
                <input type="date" class="form-input" id="reportDateStart" value="${firstOfMonth}" onchange="updateReportsStats()">
            </div>
            <div class="form-group" style="margin: 0;">
                <label class="form-label">Data Fim</label>
                <input type="date" class="form-input" id="reportDateEnd" value="${today}" onchange="updateReportsStats()">
            </div>
            <button class="btn btn-secondary" onclick="resetReportDates()">🔄 Período Completo</button>
            <button class="btn btn-secondary" onclick="exportAppointments()">📤 Exportar Agendamentos</button>
            <button class="btn btn-secondary" style="background: var(--error-600); color: white;" onclick="exportReportsToPDF()">📄 Exportar Relatório PDF</button>
        </div>

        <!-- KPIs Linha 1: Métricas base -->
        <div class="dashboard-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 1rem;">
            <div class="stat-card">
                <div class="stat-icon" style="background: var(--primary-100); color: var(--primary-600);">💬</div>
                <div class="stat-content">
                    <h3>Total de Leads</h3>
                    <p class="stat-number" id="kpiTotalLeads">0</p>
                    <small id="kpiLeadsTrend" style="color:var(--gray-400);"></small>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: var(--purple-100); color: var(--purple-600);">📅</div>
                <div class="stat-content">
                    <h3>Agendamentos</h3>
                    <p class="stat-number" id="kpiAppointments">0</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: #dcfce7; color: #166534;">✅</div>
                <div class="stat-content">
                    <h3>Comparecimentos</h3>
                    <p class="stat-number" id="kpiAttended">0</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: #fef9c3; color: #a16207;">💰</div>
                <div class="stat-content">
                    <h3>Vendas</h3>
                    <p class="stat-number" id="kpiSales">0</p>
                </div>
            </div>
        </div>

        <!-- KPIs Linha 2: Taxas e indicadores avançados -->
        <div class="dashboard-grid" style="grid-template-columns: repeat(5, 1fr); margin-bottom: 2rem;">
            <div class="stat-card" style="border-top: 3px solid #3b82f6;">
                <div class="stat-icon" style="background: #eff6ff; color: #1d4ed8; font-size:1.1rem;">📊</div>
                <div class="stat-content">
                    <h3 style="font-size:0.75rem;">Taxa de Comparecimento</h3>
                    <p class="stat-number" id="kpiShowRate" style="font-size:1.4rem;">—%</p>
                </div>
            </div>
            <div class="stat-card" style="border-top: 3px solid #22c55e;">
                <div class="stat-icon" style="background: #f0fdf4; color: #15803d; font-size:1.1rem;">🎯</div>
                <div class="stat-content">
                    <h3 style="font-size:0.75rem;">Taxa de Fechamento</h3>
                    <p class="stat-number" id="kpiCloseRate" style="font-size:1.4rem;">—%</p>
                </div>
            </div>
            <div class="stat-card" style="border-top: 3px solid #f59e0b;">
                <div class="stat-icon" style="background: #fff9ed; color: #d97706; font-size:1.1rem;">💵</div>
                <div class="stat-content">
                    <h3 style="font-size:0.75rem;">Ticket Médio</h3>
                    <p class="stat-number" id="kpiAvgTicket" style="font-size:1.2rem;">R$ 0,00</p>
                    <small style="color:var(--gray-400);">Vendas / Qtd</small>
                </div>
            </div>
            <div class="stat-card" style="border-top: 3px solid #8b5cf6;">
                <div class="stat-icon" style="background: #f5f3ff; color: #6d28d9; font-size:1.1rem;">🧩</div>
                <div class="stat-content">
                    <h3 style="font-size:0.75rem;">Leads este Mês</h3>
                    <p class="stat-number" id="kpiMonthLeads" style="font-size:1.4rem;">0</p>
                    <small id="kpiMonthLeadsDiff" style="color:var(--gray-400);font-size:0.7rem;"></small>
                </div>
            </div>
            <div class="stat-card" style="border-top: 3px solid #ef4444; cursor:pointer;" onclick="switchModule('red-folder')">
                <div class="stat-icon" style="background: #fef2f2; color: #dc2626; font-size:1.1rem;">📁</div>
                <div class="stat-content">
                    <h3 style="font-size:0.75rem;">Pasta Vermelha</h3>
                    <p class="stat-number" id="kpiRedFolder" style="font-size:1.4rem;">0</p>
                    <small style="color:#dc2626;font-size:0.7rem;">↗ Ver pasta</small>
                </div>
            </div>
        </div>

        <!-- Central de Observação: Tabelas e Gráficos -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; margin-bottom: 2rem;">
            <div class="stat-card" style="padding: 1.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                    <h3 style="margin:0; font-size:1.1rem;">📡 Desempenho por Canal de Origem</h3>
                    <span class="badge badge-gray">Este Período</span>
                </div>
                <div id="channelPerformanceTableContainer">
                     <p style="text-align:center; padding:2rem; color:var(--gray-400);">Carregando dados por canal...</p>
                </div>
            </div>
            
            <div class="stat-card" style="padding: 1.5rem;">
                <h3 style="margin:0 0 1rem 0; font-size:1.1rem;">💡 Insight de Gestão</h3>
                <div id="smartInsightContainer" style="font-size:0.9rem; color:var(--gray-600); line-height:1.5;">
                    Aguardando análise de dados...
                </div>
            </div>
        </div>

        <!-- Alertas e Oportunidades -->
        <div id="reportsAlertsBlock" class="card" style="padding:1.25rem;margin-bottom:2rem;border-left:4px solid #f59e0b;background:linear-gradient(135deg,#fffbeb 0%,#fff 100%);">
            <h3 style="margin:0 0 1rem 0;font-weight:700;color:#92400e;display:flex;align-items:center;gap:8px;">
                ⚠️ Alertas e Oportunidades
            </h3>
            <div id="reportsAlertsList" style="display:flex;flex-direction:column;gap:0.5rem;"></div>
        </div>

        <!-- Gráficos 1ª linha: Funil + Canal -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
            <div class="card" style="padding: 1.5rem;">
                <h3 style="margin-bottom: 1.5rem; font-weight: 600; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.25rem;">📊</span> Funil de Vendas
                </h3>
                <div style="height: 300px; position: relative;">
                    <canvas id="statusChart"></canvas>
                </div>
            </div>
            <div class="card" style="padding: 1.5rem;">
                <h3 style="margin-bottom: 1.5rem; font-weight: 600; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.25rem;">📡</span> Origem dos Leads
                </h3>
                <div style="height: 300px; position: relative;">
                    <canvas id="channelChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Gráfico: Performance Diária -->
        <div class="card" style="padding: 1.5rem; margin-bottom: 2rem;">
            <h3 style="margin-bottom: 1.5rem; font-weight: 600; display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.25rem;">📈</span> Performance Diária de Agendamentos
            </h3>
            <div style="height: 300px; position: relative;">
                <canvas id="dailyPerformanceChart"></canvas>
            </div>
        </div>

        <!-- Gráficos 2ª linha: Evolução Mensal + Funil de Conversão -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
            <div class="card" style="padding: 1.5rem;">
                <h3 style="margin-bottom: 1.5rem; font-weight: 600; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.25rem;">📉</span> Evolução dos Últimos 6 Meses
                </h3>
                <div style="height: 300px; position: relative;">
                    <canvas id="monthlyEvolutionChart"></canvas>
                </div>
            </div>
            <div class="card" style="padding: 1.5rem;">
                <h3 style="margin-bottom: 1.5rem; font-weight: 600; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.25rem;">🎯</span> Funil de Conversão por Etapa
                </h3>
                <div id="conversionFunnelContainer" style="padding: 0.5rem 0;"></div>
            </div>
        </div>

        <!-- Ranking por Canal -->
        <div class="card" style="padding: 1.5rem; margin-bottom: 2rem;">
            <h3 style="margin-bottom: 1.25rem; font-weight: 700; display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.25rem;">🏆</span> Ranking de Leads por Canal / Origem
            </h3>
            <div id="channelRankingTable"></div>
        </div>

        <!-- Relatório Mensal Detalhado (preservado) -->
        <div class="card" style="padding: 2rem; background: var(--gray-50); border: 1px solid var(--gray-200);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <div style="display: flex; align-items: center; gap: 1.5rem;">
                    <h2 style="margin: 0; font-weight: 700; color: var(--gray-900);">🗓️ Relatório Mensal Detalhado</h2>
                    <div style="display: flex; gap: 4px;">
                        <button class="report-nav-btn" onclick="changeReportMonth(-1)">◀</button>
                        <div id="reportMonthDisplay" style="min-width: 140px; text-align: center; font-weight: 700; font-size: 1.1rem; color: var(--primary-700);">Carregando...</div>
                        <button class="report-nav-btn" onclick="changeReportMonth(1)">▶</button>
                    </div>
                </div>
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <div style="display: flex; gap: 1.5rem; font-size: 0.85rem; font-weight: 600;">
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span style="width: 12px; height: 12px; border-radius: 50%; background: #10b981; box-shadow: 0 0 0 2px #dcfce7;"></span>
                            <span style="color: var(--gray-600);">Meta Batida</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span style="width: 12px; height: 12px; border-radius: 50%; background: #ef4444; box-shadow: 0 0 0 2px #fee2e2;"></span>
                            <span style="color: var(--gray-600);">Pendente</span>
                        </div>
                    </div>
                    <button class="btn btn-secondary btn-small" onclick="exportMonthlyDetailedReportXLSX(reportState.currentYear, reportState.currentMonth)">
                        📤 Exportar Mensal (.xlsx)
                    </button>
                </div>
            </div>
            
            <div id="weeklyDetailedReportContainer">
                <!-- Populated by renderWeeklyDetailedReport -->
            </div>
        </div>
    `;

    updateReportsStats();
}


// Get date range from filter inputs
function getReportDateRange() {
    const startInput = document.getElementById('reportDateStart');
    const endInput = document.getElementById('reportDateEnd');

    let start = null, end = null;

    if (startInput && startInput.value) {
        start = new Date(startInput.value + 'T00:00:00');
    }
    if (endInput && endInput.value) {
        end = new Date(endInput.value + 'T23:59:59');
    }

    return { start, end };
}

// Reset date range to show all data
function resetReportDates() {
    const startInput = document.getElementById('reportDateStart');
    const endInput = document.getElementById('reportDateEnd');
    if (startInput) startInput.value = '';
    if (endInput) endInput.value = '';
    updateReportsStats();
}

// Filter data by date range
function filterByDateRange(items, dateField, start, end) {
    return items.filter(item => {
        const d = item[dateField];
        if (!d) return !start && !end;
        const date = new Date(d);
        if (start && date < start) return false;
        if (end && date > end) return false;
        return true;
    });
}

// Update Report Stats and Charts
function updateReportsStats() {
    const { start, end } = getReportDateRange();

    // 1. Leads
    const filteredLeads = filterByDateRange(AppState.leads, 'createdAt', start, end);
    const totalLeads = filteredLeads.length;

    // 2. Appointments
    const filteredApptsCreated = filterByDateRange(AppState.appointments, 'createdAt', start, end);
    const totalApptsCount = filteredApptsCreated.length;

    // 3. Visits — Unified & Deduplicated
    const uniqueVisitKeys = new Set();
    let attendedCount = 0;

    filterByDateRange(AppState.appointments, 'date', start, end).forEach(a => {
        if (a.attended || a.status === 'completed') {
            const key = `${a.patientId}_${new Date(a.date).toDateString()} `;
            if (!uniqueVisitKeys.has(key)) { uniqueVisitKeys.add(key); attendedCount++; }
        }
    });

    AppState.leads.forEach(l => {
        const d = new Date(l.visitDate || l.createdAt);
        if ((!start || d >= start) && (!end || d <= end)) {
            if (l.status === 'visit' || ['sold', 'lost'].includes(l.saleStatus)) {
                const patient = AppState.patients.find(p => p.convertedFrom === l.id);
                const entityId = patient ? patient.id : l.id;
                const key = `${entityId}_${d.toDateString()} `;
                if (!uniqueVisitKeys.has(key)) { uniqueVisitKeys.add(key); attendedCount++; }
            }
        }
    });

    // 4. Sales
    const soldLeads = filteredLeads.filter(l => l.saleStatus === 'sold' || l.status === 'sold');
    const salesCount = soldLeads.length;
    const totalSaleValue = soldLeads.reduce((sum, l) => sum + (parseFloat(l.saleValue) || 0), 0);

    // 5. Taxa comparecimento e fechamento
    const showRate = totalApptsCount > 0 ? Math.round((attendedCount / totalApptsCount) * 100) : null;
    const closeRate = attendedCount > 0 ? Math.round((salesCount / attendedCount) * 100) : null;
    const avgTicket = salesCount > 0 ? totalSaleValue / salesCount : null;

    // 6. Leads este mês vs mês anterior
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const thisMonthLeads = AppState.leads.filter(l => new Date(l.createdAt) >= thisMonthStart).length;
    const lastMonthLeads = AppState.leads.filter(l => {
        const d = new Date(l.createdAt);
        return d >= lastMonthStart && d <= lastMonthEnd;
    }).length;
    const monthDiff = thisMonthLeads - lastMonthLeads;

    // 7. Pasta Vermelha count (simplified)
    const redFolderCount = AppState.appointments.filter(a =>
        (a.status === 'completed' || a.attended) &&
        !AppState.leads.some(l => l.saleStatus === 'sold' &&
            AppState.patients.some(p => p.id === a.patientId && (p.phone === l.phone || p.name === l.name)))
    ).length;

    // 8. Update UI KPIs
    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setEl('kpiTotalLeads', totalLeads);
    setEl('kpiAppointments', totalApptsCount);
    setEl('kpiAttended', attendedCount);
    setEl('kpiSales', salesCount);
    setEl('kpiShowRate', showRate !== null ? showRate + '%' : '—');
    setEl('kpiCloseRate', closeRate !== null ? closeRate + '%' : '—');
    setEl('kpiAvgTicket', avgTicket !== null ? 'R$' + avgTicket.toFixed(0) : '—');
    setEl('kpiMonthLeads', thisMonthLeads);
    setEl('kpiRedFolder', redFolderCount);

    const diffEl = document.getElementById('kpiMonthLeadsDiff');
    if (diffEl) {
        if (monthDiff > 0) diffEl.innerHTML = `<span style="color:#16a34a;">↑ +${monthDiff} vs mês ant.</span>`;
        else if (monthDiff < 0) diffEl.innerHTML = `<span style="color:#dc2626;">↓ ${monthDiff} vs mês ant.</span>`;
        else diffEl.textContent = '= igual ao mês ant.';
    }

    // 9. Channel Performance Table
    renderChannelPerformance(filteredLeads);

    // 10. Smart Insights
    generateSmartInsights(closeRate, showRate, avgTicket);

    // 11. Renderizar outros componentes
    renderReportAlerts(filteredLeads, totalApptsCount, redFolderCount);
    renderConversionFunnel(totalLeads, totalApptsCount, attendedCount, salesCount);
    renderChannelRanking(filteredLeads);
    renderCharts(filteredLeads, filteredApptsCreated);
    renderMonthlyEvolutionChart();
    renderWeeklyDetailedReport();
}

// Alertas e Oportunidades
function renderReportAlerts(filteredLeads, totalAppts, redFolderCount) {
    const alertsEl = document.getElementById('reportsAlertsList');
    if (!alertsEl) return;

    const alerts = [];
    const now = new Date();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    // Leads sem contato há 7+ dias
    const staleLeads = AppState.leads.filter(l =>
        l.status === 'new' && new Date(l.createdAt) <= sevenDaysAgo
    ).length;
    if (staleLeads > 0) {
        alerts.push({
            icon: '⏰', color: '#dc2626', bg: '#fee2e2',
            msg: `<strong>${staleLeads} leads novos</strong> há mais de 7 dias sem contato.`,
            action: `onclick="switchModule('leads')"`, label: 'Ver Leads'
        });
    }

    // Pasta Vermelha há 30+ dias
    if (redFolderCount > 0) {
        alerts.push({
            icon: '📁', color: '#ea580c', bg: '#fff7ed',
            msg: `<strong>${redFolderCount} pacientes</strong> na Pasta Vermelha sem fechamento.`,
            action: `onclick="switchModule('red-folder')"`, label: 'Abrir Pasta'
        });
    }

    // Meta semanal de agendamentos
    const weeklyGoal = AppState.settings?.weeklyAppointmentsGoal || 80;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);
    const thisWeekAppts = AppState.appointments.filter(a => new Date(a.createdAt) >= weekStart).length;
    const remaining = weeklyGoal - thisWeekAppts;
    if (remaining > 0) {
        alerts.push({
            icon: '🎯', color: '#7c3aed', bg: '#f5f3ff',
            msg: `Meta semanal: faltam <strong>${remaining} agendamentos</strong> para bater a meta de ${weeklyGoal}.`,
            action: '', label: ''
        });
    }

    // Taxa de fechamento baixa
    const totalVisited = AppState.leads.filter(l => l.status === 'visit' || l.saleStatus === 'sold' || l.saleStatus === 'lost').length;
    const totalSold = AppState.leads.filter(l => l.saleStatus === 'sold').length;
    const rate = totalVisited > 0 ? Math.round((totalSold / totalVisited) * 100) : 0;
    if (totalVisited >= 5 && rate < 30) {
        alerts.push({
            icon: '📉', color: '#991b1b', bg: '#fef2f2',
            msg: `Taxa de fechamento em <strong>${rate}%</strong>. Meta sugerida: acima de 30%.`,
            action: '', label: ''
        });
    }

    if (alerts.length === 0) {
        alertsEl.innerHTML = `<p style="color:#16a34a;font-weight:600;">✅ Nenhum alerta no momento. Ótimo resultado!</p>`;
        return;
    }

    alertsEl.innerHTML = alerts.map(a => `
        <div style="display:flex;align-items:center;gap:0.75rem;padding:0.6rem 0.9rem;background:${a.bg};border-radius:8px;">
            <span style="font-size:1.1rem;">${a.icon}</span>
            <span style="flex:1;font-size:0.875rem;color:var(--gray-700);">${a.msg}</span>
            ${a.action && a.label ? `<button class="btn btn-secondary btn-small" style="color:${a.color};border-color:${a.color};" ${a.action}>${a.label}</button>` : ''}
        </div>
        `).join('');
}

// Funil de conversão por etapa — barras horizontais
function renderConversionFunnel(leads, appts, visits, sales) {
    const el = document.getElementById('conversionFunnelContainer');
    if (!el) return;

    const steps = [
        { label: '💬 Leads Captados', value: leads, color: '#3b82f6', bg: '#eff6ff' },
        { label: '📅 Agendamentos', value: appts, color: '#8b5cf6', bg: '#f5f3ff' },
        { label: '👥 Compareceram', value: visits, color: '#10b981', bg: '#f0fdf4' },
        { label: '💰 Fecharam', value: sales, color: '#f59e0b', bg: '#fffbeb' }
    ];

    const max = Math.max(leads, 1);

    el.innerHTML = steps.map((s, i) => {
        const pct = Math.round((s.value / max) * 100);
        const convPct = i > 0 && steps[i - 1].value > 0
            ? Math.round((s.value / steps[i - 1].value) * 100) + '%'
            : '';
        return `
        <div style="margin-bottom:1rem;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;font-size:0.82rem;font-weight:600;">
                    <span style="color:var(--gray-700);">${s.label}</span>
                    <div style="display:flex;gap:0.75rem;align-items:center;">
                        ${convPct ? `<span style="font-size:0.72rem;color:var(--gray-400);">conv. ${convPct}</span>` : ''}
                        <span style="color:${s.color};font-size:1rem;font-weight:800;">${s.value}</span>
                    </div>
                </div>
                <div style="height:28px;background:var(--gray-100);border-radius:6px;overflow:hidden;position:relative;">
                    <div style="width:${pct}%;height:100%;background:${s.color};border-radius:6px;transition:width 0.6s ease;display:flex;align-items:center;justify-content:flex-end;padding-right:8px;">
                        ${pct > 15 ? `<span style="color:white;font-size:0.75rem;font-weight:700;">${pct}%</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Ranking por Canal
function renderChannelRanking(filteredLeads) {
    const el = document.getElementById('channelRankingTable');
    if (!el) return;

    const channels = {};
    filteredLeads.forEach(l => {
        const ch = l.channel || l.source || 'Outros';
        if (!channels[ch]) channels[ch] = { leads: 0, appts: 0, sales: 0 };
        channels[ch].leads++;
        if (['scheduled', 'visit', 'converted'].includes(l.status)) channels[ch].appts++;
        if (l.saleStatus === 'sold') channels[ch].sales++;
    });

    const rows = Object.entries(channels).sort((a, b) => b[1].leads - a[1].leads);

    if (rows.length === 0) {
        el.innerHTML = `<p style="color:var(--gray-400);text-align:center;padding:1rem;">Sem dados para o período selecionado.</p>`;
        return;
    }

    el.innerHTML = `
        <table style="width:100%;border-collapse:collapse;font-size:0.875rem;">
            <thead>
                <tr style="border-bottom:2px solid var(--gray-200);">
                    <th style="text-align:left;padding:8px 12px;color:var(--gray-600);font-weight:600;">#</th>
                    <th style="text-align:left;padding:8px 12px;color:var(--gray-600);font-weight:600;">Canal</th>
                    <th style="text-align:center;padding:8px 12px;color:var(--gray-600);font-weight:600;">Leads</th>
                    <th style="text-align:center;padding:8px 12px;color:var(--gray-600);font-weight:600;">Agendados</th>
                    <th style="text-align:center;padding:8px 12px;color:var(--gray-600);font-weight:600;">Vendas</th>
                    <th style="text-align:center;padding:8px 12px;color:var(--gray-600);font-weight:600;">Conv. %</th>
                </tr>
            </thead>
            <tbody>
                ${rows.map(([ch, d], i) => {
        const conv = d.leads > 0 ? Math.round((d.sales / d.leads) * 100) : 0;
        const convColor = conv >= 20 ? '#16a34a' : conv >= 10 ? '#d97706' : '#dc2626';
        return `
                        <tr style="border-bottom:1px solid var(--gray-100);${i % 2 === 0 ? 'background:var(--gray-50);' : ''}">
                            <td style="padding:10px 12px;color:var(--gray-400);font-weight:700;">${i + 1}</td>
                            <td style="padding:10px 12px;font-weight:600;color:var(--gray-800);">${escapeHTML(ch)}</td>
                            <td style="padding:10px 12px;text-align:center;font-weight:700;color:var(--primary-700);">${d.leads}</td>
                            <td style="padding:10px 12px;text-align:center;color:var(--purple-700);font-weight:600;">${d.appts}</td>
                            <td style="padding:10px 12px;text-align:center;color:#16a34a;font-weight:700;">${d.sales}</td>
                            <td style="padding:10px 12px;text-align:center;">
                                <span style="background:${conv >= 20 ? '#dcfce7' : conv >= 10 ? '#fef9c3' : '#fee2e2'};color:${convColor};padding:2px 8px;border-radius:10px;font-size:0.75rem;font-weight:700;">
                                    ${conv}%
                                </span>
                            </td>
                        </tr>
                    `;
    }).join('')}
            </tbody>
        </table>
        `;
}

// Navigation for the detailed report
function changeReportMonth(delta) {
    let newMonth = reportState.currentMonth + delta;
    let newYear = reportState.currentYear;

    if (newMonth < 0) { newMonth = 11; newYear--; }
    else if (newMonth > 11) { newMonth = 0; newYear++; }

    reportState.currentMonth = newMonth;
    reportState.currentYear = newYear;

    renderWeeklyDetailedReport();
}

function renderWeeklyDetailedReport() {
    const container = document.getElementById('weeklyDetailedReportContainer');
    const display = document.getElementById('reportMonthDisplay');
    if (!container || !display) return;

    const dateDisplay = new Date(reportState.currentYear, reportState.currentMonth, 1);
    const monthName = dateDisplay.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    display.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    const weeks = getWeeksOfMonth(reportState.currentYear, reportState.currentMonth);

    const aptGoal = AppState.settings?.weeklyAppointmentsGoal || 80;
    const visitGoal = AppState.settings?.weeklyVisitsGoal || 40;

    if (weeks.length === 0) {
        container.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--gray-400);">Sem dados para este período</div>`;
        return;
    }

    container.innerHTML = weeks.map((week, index) => {
        const weekStats = calculateWeekStats(week.start, week.end);
        const aptMet = weekStats.totalAppointments >= aptGoal;
        const visitMet = weekStats.totalVisits >= visitGoal;

        const aptPercent = Math.min(Math.round((weekStats.totalAppointments / aptGoal) * 100), 100);
        const visitPercent = Math.min(Math.round((weekStats.totalVisits / visitGoal) * 100), 100);

        return `
        <div class="report-week-card">
                <div class="report-week-header">
                    <div>
                        <h4 style="margin: 0; color: var(--gray-900); font-size: 1.1rem;">Semana ${index + 1}</h4>
                        <span style="font-size: 0.8rem; color: var(--gray-500);">${week.start.toLocaleDateString('pt-BR')} até ${week.end.toLocaleDateString('pt-BR')}</span>
                    </div>
                    
                    <div style="display: flex; gap: 2rem;">
                        <div style="min-width: 140px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 0.75rem;">
                                <span style="color: var(--gray-500);">🛒 Agendamentos</span>
                                <span style="font-weight: 700; color: ${aptMet ? '#10b981' : '#ef4444'}">${weekStats.totalAppointments}/${aptGoal}</span>
                            </div>
                            <div style="height: 6px; background: var(--gray-200); border-radius: 3px; overflow: hidden;">
                                <div style="width: ${aptPercent}%; height: 100%; background: ${aptMet ? '#10b981' : '#3b82f6'}; border-radius: 3px;"></div>
                            </div>
                        </div>
                        
                        <div style="min-width: 140px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 0.75rem;">
                                <span style="color: var(--gray-500);">👥 Visitas</span>
                                <span style="font-weight: 700; color: ${visitMet ? '#10b981' : '#ef4444'}">${weekStats.totalVisits}/${visitGoal}</span>
                            </div>
                            <div style="height: 6px; background: var(--gray-200); border-radius: 3px; overflow: hidden;">
                                <div style="width: ${visitPercent}%; height: 100%; background: ${visitMet ? '#10b981' : '#8b5cf6'}; border-radius: 3px;"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="report-day-grid">
                    ${week.days.map(day => {
            const dayData = weekStats.days[day.toDateString()] || { appointments: 0, scheduledTotal: 0, visits: 0, sales: 0 };
            const isToday = day.toDateString() === new Date().toDateString();
            const isMainMonth = day.getMonth() === reportState.currentMonth;

            return `
                            <div class="report-day-cell ${isToday ? 'today' : ''}" 
                                 onclick="showDayDetails('${day.toISOString()}')"
                                 style="opacity: ${isMainMonth ? 1 : 0.4}; cursor: pointer;">
                                <div style="font-size: 0.65rem; font-weight: 800; color: var(--gray-400); text-transform: uppercase; margin-bottom: 4px;">
                                    ${day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                                </div>
                                <div style="font-size: 1.1rem; font-weight: 700; color: ${isToday ? 'var(--primary-700)' : 'var(--gray-800)'}; margin-bottom: 12px;">
                                    ${day.getDate()}
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 6px;">
                                    <div class="report-stat-pill" style="background: var(--blue-50); color: var(--blue-700);" title="Comparecimentos Agendados (Agenda)">
                                        <span style="font-size: 0.8rem;">📅</span> ${dayData.scheduledTotal}
                                    </div>
                                    <div class="report-stat-pill" style="background: var(--primary-50); color: var(--primary-700);" title="Novos Agendamentos Criados">
                                        <span style="font-size: 0.8rem;">🛒</span> ${dayData.appointments}
                                    </div>
                                    <div class="report-stat-pill" style="background: var(--purple-50); color: var(--purple-700);" title="Visitas Realizadas (Compareceram)">
                                        <span style="font-size: 0.8rem;">👥</span> ${dayData.visits}
                                    </div>
                                    <div class="report-stat-pill" style="background: var(--success-50); color: var(--success-700); border: 1px solid var(--success-100);" title="Vendas Realizadas (Fechou)">
                                        <span style="font-size: 0.8rem;">💰</span> ${dayData.sales || 0}
                                    </div>
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function getWeeksOfMonth(year, month) {
    const weeks = [];
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);

    let currentDay = new Date(firstOfMonth);
    const dayOfWeek = currentDay.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    currentDay.setDate(currentDay.getDate() + diffToMonday);

    while (currentDay <= lastOfMonth || (weeks.length < 5 && weeks.length < 6)) {
        const week = { start: new Date(currentDay), end: null, days: [] };
        for (let i = 0; i < 7; i++) {
            week.days.push(new Date(currentDay));
            if (i === 6) week.end = new Date(currentDay);
            currentDay.setDate(currentDay.getDate() + 1);
        }
        weeks.push(week);
        if (currentDay > lastOfMonth && weeks.length >= 4) break;
    }
    return weeks;
}

function calculateWeekStats(start, end) {
    const s = new Date(start); s.setHours(0, 0, 0, 0);
    const e = new Date(end); e.setHours(23, 59, 59, 999);

    const stats = { totalAppointments: 0, totalVisits: 0, days: {} };
    const uniqueVisitKeys = new Set();

    AppState.appointments.forEach(apt => {
        const createDate = new Date(apt.createdAt);
        const aptDate = new Date(apt.date);

        if (createDate >= s && createDate <= e) {
            const dayKey = createDate.toDateString();
            if (!stats.days[dayKey]) stats.days[dayKey] = { appointments: 0, scheduledTotal: 0, visits: 0, sales: 0 };
            stats.days[dayKey].appointments++;
            stats.totalAppointments++;
        }

        if (aptDate >= s && aptDate <= e && apt.status !== 'cancelled') {
            const dayKey = aptDate.toDateString();
            if (!stats.days[dayKey]) stats.days[dayKey] = { appointments: 0, scheduledTotal: 0, visits: 0, sales: 0 };
            stats.days[dayKey].scheduledTotal++;
        }

        if (aptDate >= s && aptDate <= e && (apt.status === 'completed' || apt.attended)) {
            const dayKey = aptDate.toDateString();
            if (!stats.days[dayKey]) stats.days[dayKey] = { appointments: 0, scheduledTotal: 0, visits: 0, sales: 0 };
            const visitKey = `${apt.patientId}_${dayKey} `;
            if (!uniqueVisitKeys.has(visitKey)) {
                stats.days[dayKey].visits++;
                stats.totalVisits++;
                uniqueVisitKeys.add(visitKey);
            }
        }
    });

    AppState.leads.forEach(lead => {
        const d = new Date(lead.visitDate || lead.createdAt);
        if (d >= s && d <= e) {
            const dayKey = d.toDateString();
            if (!stats.days[dayKey]) stats.days[dayKey] = { appointments: 0, scheduledTotal: 0, visits: 0, sales: 0 };

            if (lead.status === 'visit' || ['sold', 'lost'].includes(lead.saleStatus)) {
                const patient = AppState.patients.find(p => p.convertedFrom === lead.id);
                const entityId = patient ? patient.id : lead.id;
                const visitKey = `${entityId}_${dayKey} `;

                if (!uniqueVisitKeys.has(visitKey)) {
                    stats.days[dayKey].visits++;
                    stats.days[dayKey].scheduledTotal++;
                    stats.totalVisits++;
                    uniqueVisitKeys.add(visitKey);
                }
            }

            if (lead.saleStatus === 'sold') {
                stats.days[dayKey].sales++;
            }
        }
    });

    return stats;
}

// Render Charts
function renderCharts(filteredLeads, filteredAppointments) {
    Object.values(charts).forEach(chart => { if (chart && chart.destroy) chart.destroy(); });

    // --- Status Doughnut Chart ---
    const ctxStatus = document.getElementById('statusChart');
    if (ctxStatus) {
        const statusCounts = {};
        const statusLabels = {
            'new': 'Novo', 'in-contact': 'Em Contato', 'scheduled': 'Agendado',
            'visit': 'Visita', 'converted': 'Convertido', 'not-converted': 'Não Convertido'
        };
        filteredLeads.forEach(l => {
            const s = l.status || 'new';
            statusCounts[s] = (statusCounts[s] || 0) + 1;
        });

        const labels = Object.keys(statusCounts).map(k => statusLabels[k] || k);
        const data = Object.values(statusCounts);
        const bgColors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#06b6d4', '#ef4444', '#6b7280'];

        charts.status = new Chart(ctxStatus.getContext('2d'), {
            type: 'doughnut',
            data: { labels, datasets: [{ data, backgroundColor: bgColors.slice(0, data.length), borderWidth: 2, borderColor: '#fff' }] },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { padding: 15, font: { family: "'Inter', sans-serif" } } } }
            }
        });
    }

    // --- Channel Pie Chart ---
    const ctxChannel = document.getElementById('channelChart');
    if (ctxChannel) {
        const channels = {};
        filteredLeads.forEach(l => {
            const ch = l.channel || l.source || 'Outros';
            channels[ch] = (channels[ch] || 0) + 1;
        });

        const channelColors = ['#6366f1', '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#06b6d4', '#a855f7', '#64748b'];

        charts.channel = new Chart(ctxChannel.getContext('2d'), {
            type: 'pie',
            data: { labels: Object.keys(channels), datasets: [{ data: Object.values(channels), backgroundColor: channelColors.slice(0, Object.keys(channels).length), borderWidth: 2, borderColor: '#fff' }] },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { padding: 15, font: { family: "'Inter', sans-serif" } } } }
            }
        });
    }

    // --- Daily Performance Bar Chart ---
    const ctxDaily = document.getElementById('dailyPerformanceChart');
    if (ctxDaily) {
        const dailyCounts = {};
        filteredAppointments.forEach(a => {
            const day = a.createdAt ? new Date(a.createdAt).toISOString().split('T')[0] : null;
            if (day) dailyCounts[day] = (dailyCounts[day] || 0) + 1;
        });

        const sortedDays = Object.keys(dailyCounts).sort();
        const dailyGoal = AppState.settings?.dailyGoal || 5;

        charts.daily = new Chart(ctxDaily.getContext('2d'), {
            type: 'bar',
            data: {
                labels: sortedDays.map(d => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })),
                datasets: [
                    {
                        label: 'Agendamentos Criados',
                        data: sortedDays.map(d => dailyCounts[d]),
                        backgroundColor: sortedDays.map(d => dailyCounts[d] >= dailyGoal ? '#10b981' : '#3b82f6'),
                        borderRadius: 6, borderSkipped: false
                    },
                    {
                        label: `Meta Diária(${dailyGoal})`,
                        data: sortedDays.map(() => dailyGoal),
                        type: 'line', borderColor: '#ef4444', borderDash: [5, 5],
                        borderWidth: 2, pointRadius: 0, fill: false
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1, font: { family: "'Inter', sans-serif" } }, grid: { color: 'rgba(0,0,0,0.05)' } },
                    x: { ticks: { font: { family: "'Inter', sans-serif", size: 11 } }, grid: { display: false } }
                },
                plugins: { legend: { position: 'bottom', labels: { padding: 15, font: { family: "'Inter', sans-serif" } } } }
            }
        });
    }
}

// Novo gráfico: Evolução dos últimos 6 Meses
function renderMonthlyEvolutionChart() {
    const ctxEvol = document.getElementById('monthlyEvolutionChart');
    if (!ctxEvol) return;
    if (charts.evolution) { charts.evolution.destroy(); delete charts.evolution; }

    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
            label: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
            start: new Date(d.getFullYear(), d.getMonth(), 1),
            end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
        });
    }

    const datasets = {
        leads: [], appts: [], visits: [], sales: []
    };

    months.forEach(m => {
        const mLeads = AppState.leads.filter(l => { const d = new Date(l.createdAt); return d >= m.start && d <= m.end; });
        const mAppts = AppState.appointments.filter(a => { const d = new Date(a.createdAt); return d >= m.start && d <= m.end; });
        const mSales = mLeads.filter(l => l.saleStatus === 'sold').length;

        // Count unique visits in month
        const visitKeys = new Set();
        AppState.appointments.filter(a => {
            const d = new Date(a.date); return d >= m.start && d <= m.end && (a.status === 'completed' || a.attended);
        }).forEach(a => visitKeys.add(a.patientId + '_' + new Date(a.date).toDateString()));
        mLeads.filter(l => l.status === 'visit' || l.saleStatus === 'sold' || l.saleStatus === 'lost').forEach(l => {
            const d = new Date(l.visitDate || l.createdAt);
            if (d >= m.start && d <= m.end) visitKeys.add((l.convertedFrom || l.id) + '_' + d.toDateString());
        });

        datasets.leads.push(mLeads.length);
        datasets.appts.push(mAppts.length);
        datasets.visits.push(visitKeys.size);
        datasets.sales.push(mSales);
    });

    charts.evolution = new Chart(ctxEvol.getContext('2d'), {
        type: 'line',
        data: {
            labels: months.map(m => m.label),
            datasets: [
                { label: '💬 Leads', data: datasets.leads, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', tension: 0.4, borderWidth: 2.5, pointRadius: 4 },
                { label: '📅 Agendamentos', data: datasets.appts, borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.08)', tension: 0.4, borderWidth: 2.5, pointRadius: 4 },
                { label: '👥 Visitas', data: datasets.visits, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)', tension: 0.4, borderWidth: 2.5, pointRadius: 4 },
                { label: '💰 Vendas', data: datasets.sales, borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.08)', tension: 0.4, borderWidth: 2.5, pointRadius: 4 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1, font: { family: "'Inter', sans-serif" } }, grid: { color: 'rgba(0,0,0,0.05)' } },
                x: { ticks: { font: { family: "'Inter', sans-serif", size: 11 } }, grid: { display: false } }
            },
            plugins: { legend: { position: 'bottom', labels: { padding: 12, font: { family: "'Inter', sans-serif", size: 12 } } } }
        }
    });
}

// Export functions
window.initReportsModule = initReportsModule;
window.updateReportsStats = updateReportsStats;
window.resetReportDates = resetReportDates;
window.changeReportMonth = changeReportMonth;
window.showDayDetails = showDayDetails;

// Show Detailed Breakdown for a Specific Day (preserved)
function showDayDetails(isoDate) {
    const targetDate = new Date(isoDate);
    const dateStr = targetDate.toISOString().split('T')[0];
    const displayDate = targetDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

    const createdLeads = AppState.leads.filter(l => l.createdAt.startsWith(dateStr));
    const createdAppts = AppState.appointments.filter(a => a.createdAt && a.createdAt.startsWith(dateStr));
    const scheduledAppts = AppState.appointments.filter(a => a.date.startsWith(dateStr) && a.status !== 'cancelled');

    const uniqueVisits = new Map();
    const salesList = [];

    scheduledAppts.forEach(a => {
        if (a.attended || a.status === 'completed') {
            uniqueVisits.set(a.patientId + '_' + dateStr, { name: a.patientName, type: 'Agenda', detail: a.procedure });
        }
        if (a.isSale) salesList.push({ name: a.patientName, detail: `💰 R$ ${a.saleValue?.toFixed(2) || '0,00'} ` });
    });

    AppState.leads.forEach(l => {
        const d = l.visitDate || l.createdAt;
        if (d.startsWith(dateStr)) {
            if (l.status === 'visit' || ['sold', 'lost'].includes(l.saleStatus)) {
                const patient = AppState.patients.find(p => p.convertedFrom === l.id);
                const entityId = patient ? patient.id : l.id;
                const key = entityId + '_' + dateStr;
                if (!uniqueVisits.has(key)) uniqueVisits.set(key, { name: l.name, type: 'Lead', detail: l.saleStatus === 'sold' ? '💰 Venda' : 'Visita' });
            }
            if (l.saleStatus === 'sold') salesList.push({ name: l.name, detail: `💰 Venda(${l.interest || 'Avaliação'})` });
        }
    });

    const formatList = (items, emptyMsg) => {
        if (items.length === 0) return `<p style="color: var(--gray-400); font-style: italic; font-size: 0.9rem;">${emptyMsg}</p>`;
        return `<ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;">
        ${items.map(item => `
                <li style="padding: 8px 12px; background: white; border-radius: 6px; border: 1px solid var(--gray-100); font-size: 0.9rem; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 500; color: var(--gray-700);">${escapeHTML(item.name || item.patientName)}</span>
                    <span class="badge" style="font-size: 0.7rem;">${escapeHTML(item.detail || item.source || item.status || 'Agendamento')}</span>
                </li>
            `).join('')
            }
        </ul>`;
    };

    openModal(`Detalhamento: ${capitalize(displayDate)}`, `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <section>
                <h4 style="color: var(--blue-700); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 8px;">
                    <span style="background: var(--blue-100); padding: 4px; border-radius: 4px;">🛒</span> Agendamentos Feitos (Novos Registros)
                </h4>
                ${formatList([...createdLeads, ...createdAppts], 'Nenhum agendamento criado neste dia.')}
            </section>
            <section>
                <h4 style="color: var(--primary-700); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 8px;">
                    <span style="background: var(--primary-100); padding: 4px; border-radius: 4px;">📅</span> Esperados para o Dia (Total Agendado)
                </h4>
                ${formatList(scheduledAppts, 'Ninguém agendado para este dia.')}
            </section>
            <section>
                <h4 style="color: var(--purple-700); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 8px;">
                    <span style="background: var(--purple-100); padding: 4px; border-radius: 4px;">👥</span> Comparecimentos (Visitas Reais)
                </h4>
                ${formatList(Array.from(uniqueVisits.values()), 'Nenhum comparecimento registrado.')}
            </section>
            <section>
                <h4 style="color: var(--success-700); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 8px;">
                    <span style="background: var(--success-100); padding: 4px; border-radius: 4px;">💰</span> Vendas Realizadas
                </h4>
                ${formatList(salesList, 'Nenhuma venda fechada neste dia.')}
            </section>
        </div>
        `, [{ label: 'Fechar', class: 'btn-secondary', onclick: 'closeModal()' }]);
}

function calculateMetrics(start, end) {
    const s = start ? new Date(start + 'T00:00:00') : null;
    const e = end ? new Date(end + 'T23:59:59') : null;

    const leads = filterByDateRange(AppState.leads, 'createdAt', s, e);
    const appts = filterByDateRange(AppState.appointments, 'createdAt', s, e);
    const sold = leads.filter(l => l.saleStatus === 'sold');

    return {
        totalLeads: leads.length,
        scheduled: appts.length,
        visits: appts.filter(a => a.attended || a.status === 'completed').length,
        salesCount: sold.length,
        totalSalesValue: sold.reduce((sum, l) => sum + (parseFloat(l.saleValue) || 0), 0),
        conversionRate: leads.length > 0 ? Math.round((sold.length / leads.length) * 100) : 0,
        averageTicket: sold.length > 0 ? sold.reduce((sum, l) => sum + (parseFloat(l.saleValue) || 0), 0) / sold.length : 0
    };
}

function exportReportsToPDF() {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        showNotification('Biblioteca PDF não carregada. Verifique a conexão.', 'error');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const start = document.getElementById('reportDateStart')?.value || '';
    const end = document.getElementById('reportDateEnd')?.value || '';

    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235);
    doc.text('Relatório de Desempenho CRM', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Período: ${start || 'Início'} até ${end || 'Fim'} `, 14, 30);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')} `, 14, 35);

    const metrics = calculateMetrics(start, end);
    const kpiData = [
        ['Métrica', 'Valor'],
        ['Total de Leads', metrics.totalLeads.toString()],
        ['Agendamentos', metrics.scheduled.toString()],
        ['Comparecimentos', metrics.visits.toString()],
        ['Vendas Fechadas', metrics.salesCount.toString()],
        ['Taxa de Conversão', metrics.conversionRate + '%'],
        ['Ticket Médio', new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.averageTicket)],
        ['Total em Vendas', new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.totalSalesValue)]
    ];

    if (doc.autoTable) {
        doc.autoTable({
            startY: 45,
            head: [kpiData[0]],
            body: kpiData.slice(1),
            theme: 'striped',
            headStyles: { fillColor: [37, 99, 235] }
        });
    }

    doc.save(`Relatorio_CRM_${start || 'Geral'}.pdf`);
    showNotification('PDF gerado com sucesso!', 'success');
}

function renderChannelPerformance(leads) {
    const tableContainer = document.getElementById('channelPerformanceTableContainer');
    if (!tableContainer) return;

    const channels = {};
    leads.forEach(l => {
        const source = l.source || 'Indefinido';
        if (!channels[source]) channels[source] = { leads: 0, sales: 0, saleValue: 0 };
        channels[source].leads++;
        if (l.saleStatus === 'sold') {
            channels[source].sales++;
            channels[source].saleValue += (parseFloat(l.saleValue) || 0);
        }
    });

    const sortedChannels = Object.entries(channels).sort((a, b) => b[1].leads - a[1].leads);

    tableContainer.innerHTML = `
        <table style="width:100%; border-collapse: collapse; font-size:0.85rem;">
            <thead>
                <tr style="text-align:left; border-bottom:1px solid var(--gray-100); color:var(--gray-500);">
                    <th style="padding:8px 0;">Origem</th>
                    <th style="padding:8px 0; text-align:center;">Leads</th>
                    <th style="padding:8px 0; text-align:center;">Vendas</th>
                    <th style="padding:8px 0; text-align:right;">Conv.</th>
                </tr>
            </thead>
            <tbody>
                ${sortedChannels.map(([name, data]) => {
        const conv = data.leads > 0 ? Math.round((data.sales / data.leads) * 100) : 0;
        return `
                        <tr style="border-bottom:1px solid var(--gray-50);">
                            <td style="padding:10px 0; font-weight:600;">${escapeHTML(name)}</td>
                            <td style="padding:10px 0; text-align:center;">${data.leads}</td>
                            <td style="padding:10px 0; text-align:center;">${data.sales}</td>
                            <td style="padding:10px 0; text-align:right; font-weight:700; color:var(--primary-600);">${conv}%</td>
                        </tr>
                    `;
    }).join('')}
                ${sortedChannels.length === 0 ? '<tr><td colspan="4" style="text-align:center; padding:2rem; color:var(--gray-400);">Nenhum dado de origem disponível</td></tr>' : ''}
            </tbody>
        </table>
        `;
}

function generateSmartInsights(closeRate, showRate, avgTicket) {
    const container = document.getElementById('smartInsightContainer');
    if (!container) return;

    let insight = '';
    if (closeRate < 10 && closeRate !== null) insight = "🚨 **Foco em Fechamento:** Sua taxa de conversão está baixa. Revise os argumentos de venda no momento da avaliação.";
    else if (showRate < 40 && showRate !== null) insight = "⚠️ **Foco em Comparecimento:** Muitos agendados estão faltando. Tente reforçar os lembretes de WhatsApp.";
    else if (avgTicket < 1000 && (avgTicket > 0 && avgTicket !== null)) insight = "💡 **Ticket Médio:** Você está fechando muitos tratamentos, mas de valor baixo. Tente oferecer planos de tratamento mais completos.";
    else insight = "🌟 **Ótimo Desempenho:** Seus indicadores estão equilibrados. Continue o bom trabalho de follow-up e captação!";

    container.innerHTML = insight;
}

