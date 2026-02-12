// Reports Module - CRM Odonto Company
// =====================================

// Initialize Reports Module
function initReportsModule() {
    renderReportsView();
}

// Render Reports View with KPI and Charts (Chart.js)
function renderReportsView() {
    const container = document.getElementById('reportsContent');

    container.innerHTML = `
        <div class="reports-container" style="padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2 style="font-size: 1.5rem; font-weight: 700; color: #1e293b;">📊 Relatórios de Performance</h2>
                <div style="display: flex; gap: 10px;">
                     <input type="date" id="dateStart" class="form-input" style="width: auto;">
                     <input type="date" id="dateEnd" class="form-input" style="width: auto;">
                     <input type="date" id="dateEnd" class="form-input" style="width: auto;">
                     <button class="btn btn-primary" onclick="updateReportsStats()">Atualizar</button>
                </div>
            </div>

            <!-- ... content ... -->
            <!-- KPI Cards and Charts container starts here (abbreviated in replace logic) -->
            <!-- We need to ensure we don't delete the content between lines 24 and 80. -->
            <!-- The replace_file_content tool replaces the RANGE. So I need to be careful. -->
            <!-- Actually, I just need to replace the button line and the timeout line. -->
            <!-- I will do two small replacements to be safe. -->

                </div>
            </div>

            <!-- KPI Cards -->
            <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                <div class="stat-card">
                    <div class="stat-icon">📈</div>
                    <div class="stat-content">
                        <h3>Total de Leads</h3>
                        <p class="stat-number" id="kpiTotalLeads">0</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📅</div>
                    <div class="stat-content">
                        <h3>Agendamentos</h3>
                        <p class="stat-number" id="kpiAppointments">0</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🏥</div>
                    <div class="stat-content">
                        <h3>Visitas</h3>
                        <p class="stat-number" id="kpiVisits">0</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-content">
                        <h3>Vendas</h3>
                        <p class="stat-number" id="kpiSales">0</p>
                    </div>
                </div>
            </div>

            <!-- Charts Row 1 -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
                <div class="card" style="padding: 1.5rem; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <h4 style="margin-bottom: 1rem; color: #334155;">Funil de Vendas (Status)</h4>
                    <div style="height: 300px;">
                        <canvas id="leadsStatusChart"></canvas>
                    </div>
                </div>
                <div class="card" style="padding: 1.5rem; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <h4 style="margin-bottom: 1rem; color: #334155;">Origem dos Leads (Canais)</h4>
                    <div style="height: 300px;">
                        <canvas id="leadsChannelChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Charts Row 2 -->
             <div class="card" style="padding: 1.5rem; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem; color: #334155;">Performance de Agendamentos (Últimos 7 dias)</h4>
                <div style="height: 300px;">
                    <canvas id="dailyPerformanceChart"></canvas>
                </div>
            </div>
        </div>
    `;

    setTimeout(updateReportsStats, 100);
}

// Update Reports Stats Logic
function updateReportsStats() {
    // 1. Calculate KPIs using Unified Logic
    // Ensure calculateMetrics is available (it should be since app.js is loaded)
    let metrics;
    if (typeof calculateMetrics === 'function') {
        metrics = calculateMetrics();
    } else {
        // Fallback if not available yet
        metrics = {
            totalLeads: AppState.leads.length,
            scheduled: AppState.leads.filter(l => ['scheduled', 'visit'].includes(l.status) || ['sold', 'lost'].includes(l.saleStatus)).length,
            visits: AppState.leads.filter(l => l.status === 'visit' || ['sold', 'lost'].includes(l.saleStatus)).length,
            sales: AppState.leads.filter(l => l.saleStatus === 'sold').length
        };
    }

    const totalLeadsEl = document.getElementById('kpiTotalLeads');
    if (totalLeadsEl) totalLeadsEl.textContent = metrics.totalLeads;

    const kpiAppointmentsEl = document.getElementById('kpiAppointments');
    if (kpiAppointmentsEl) kpiAppointmentsEl.textContent = metrics.scheduled;

    const kpiVisitsEl = document.getElementById('kpiVisits');
    if (kpiVisitsEl) kpiVisitsEl.textContent = metrics.visits;

    const kpiSalesEl = document.getElementById('kpiSales');
    if (kpiSalesEl) kpiSalesEl.textContent = metrics.sales;

    // 2. Charts Data
    renderCharts();
}

// Render Charts using Chart.js (unchanged, just ensuring context)
let charts = {};

function renderCharts() {
    // ... existing logic ...
    // Note: Re-implementing renderCharts fully to ensure no closure issues, 
    // but typically we can just leave it if it wasn't modified. 
    // However, since I'm in a replace block, I need to be careful not to cut it off if I didn't include it in Context.
    // The previous view_file showed renderCharts right below updateDashboard.
    // Destroy old charts if exist
    Object.values(charts).forEach(chart => chart.destroy());

    // --- Status Pie Chart ---
    const statuses = ['new', 'in-contact', 'scheduled', 'visit'];
    const statusLabels = ['Novos', 'Em Contato', 'Agendados', 'Visitas'];
    const statusData = statuses.map(s => AppState.leads.filter(l => l.status === s).length);

    const ctxStatus = document.getElementById('leadsStatusChart');
    if (ctxStatus) {
        charts.status = new Chart(ctxStatus.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: statusLabels,
                datasets: [{
                    data: statusData,
                    backgroundColor: ['#3b82f6', '#2563eb', '#10b981', '#8b5cf6']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    // --- Channel Pie Chart ---
    const channels = {};
    AppState.leads.forEach(l => {
        const c = l.channel || 'Outros';
        channels[c] = (channels[c] || 0) + 1;
    });

    const ctxChannel = document.getElementById('leadsChannelChart');
    if (ctxChannel) {
        charts.channel = new Chart(ctxChannel.getContext('2d'), {
            type: 'pie',
            data: {
                labels: Object.keys(channels),
                datasets: [{
                    data: Object.values(channels),
                    backgroundColor: ['#f59e0b', '#ec4899', '#6366f1', '#14b8a6', '#84cc16']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
}

// Export functions
window.initReportsModule = initReportsModule;
window.renderReportsView = renderReportsView;
window.updateReportsStats = updateReportsStats;
