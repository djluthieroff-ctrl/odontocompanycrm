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
        </div>

        <div class="dashboard-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 2rem;">
            <div class="stat-card">
                <div class="stat-icon" style="background: var(--primary-100); color: var(--primary-600);">💬</div>
                <div class="stat-content">
                    <h3>Total de Leads</h3>
                    <p class="stat-number" id="kpiTotalLeads">0</p>
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

        <div class="card" style="padding: 1.5rem; margin-bottom: 2rem;">
            <h3 style="margin-bottom: 1.5rem; font-weight: 600; display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.25rem;">📈</span> Performance Diária de Agendamentos
            </h3>
            <div style="height: 300px; position: relative;">
                <canvas id="dailyPerformanceChart"></canvas>
            </div>
        </div>

        <!-- Detailed navigatable Monthly Report -->
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
        if (!d) return !start && !end; // include only if no filter
        const date = new Date(d);
        if (start && date < start) return false;
        if (end && date > end) return false;
        return true;
    });
}

// Update Report Stats and Charts
function updateReportsStats() {
    const { start, end } = getReportDateRange();

    // 1. Leads Created in Period
    const filteredLeads = filterByDateRange(AppState.leads, 'createdAt', start, end);
    const totalLeads = filteredLeads.length;

    // 2. Appointments Created in Period (Bookings)
    const filteredApptsCreated = filterByDateRange(AppState.appointments, 'createdAt', start, end);
    const totalApptsCount = filteredApptsCreated.length;

    // 3. Visits (Attended) In Period - Unified & Deduplicated
    const uniqueVisitKeys = new Set();
    let attendedCount = 0;

    // A. From Agenda
    filterByDateRange(AppState.appointments, 'date', start, end).forEach(a => {
        if (a.attended || a.status === 'completed') {
            const key = `${a.patientId}_${new Date(a.date).toDateString()}`;
            if (!uniqueVisitKeys.has(key)) {
                uniqueVisitKeys.add(key);
                attendedCount++;
            }
        }
    });

    // B. From Leads (Visit/Sold status)
    AppState.leads.forEach(l => {
        // Fallback Priority: Locked visitDate > createdAt (Legacy)
        // NEVER use updatedAt as a fallback for historical metrics as it changes on every edit.
        const d = new Date(l.visitDate || l.createdAt);
        if ((!start || d >= start) && (!end || d <= end)) {
            if (l.status === 'visit' || ['sold', 'lost'].includes(l.saleStatus)) {
                const patient = AppState.patients.find(p => p.convertedFrom === l.id);
                const entityId = patient ? patient.id : l.id;
                const key = `${entityId}_${d.toDateString()}`;

                if (!uniqueVisitKeys.has(key)) {
                    uniqueVisitKeys.add(key);
                    attendedCount++;
                }
            }
        }
    });

    // 4. Sales Count
    const salesCount = filteredLeads.filter(l => l.saleStatus === 'sold' || l.status === 'sold').length;

    // Update KPI displays
    const elLeads = document.getElementById('kpiTotalLeads');
    const elAppts = document.getElementById('kpiAppointments');
    const elAttended = document.getElementById('kpiAttended');
    const elSales = document.getElementById('kpiSales');

    if (elLeads) elLeads.textContent = totalLeads;
    if (elAppts) elAppts.textContent = totalApptsCount;
    if (elAttended) elAttended.textContent = attendedCount;
    if (elSales) elSales.textContent = salesCount;

    renderCharts(filteredLeads, filteredApptsCreated);
    renderWeeklyDetailedReport();
}

// Navigation for the detailed report
function changeReportMonth(delta) {
    let newMonth = reportState.currentMonth + delta;
    let newYear = reportState.currentYear;

    if (newMonth < 0) {
        newMonth = 11;
        newYear--;
    } else if (newMonth > 11) {
        newMonth = 0;
        newYear++;
    }

    reportState.currentMonth = newMonth;
    reportState.currentYear = newYear;

    renderWeeklyDetailedReport();
}

function renderWeeklyDetailedReport() {
    const container = document.getElementById('weeklyDetailedReportContainer');
    const display = document.getElementById('reportMonthDisplay');
    if (!container || !display) return;

    // Update Month Display
    const dateDisplay = new Date(reportState.currentYear, reportState.currentMonth, 1);
    const monthName = dateDisplay.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    display.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    // Get weeks of selected month
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

    // Start with the Monday of the week containing the 1st of the month
    let currentDay = new Date(firstOfMonth);
    const dayOfWeek = currentDay.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    currentDay.setDate(currentDay.getDate() + diffToMonday);

    // Keep adding weeks until we pass the end of the month
    // We want to show 4 to 6 weeks depending on the layout
    while (currentDay <= lastOfMonth || (weeks.length < 5 && weeks.length < 6)) {
        const week = { start: new Date(currentDay), end: null, days: [] };
        for (let i = 0; i < 7; i++) {
            week.days.push(new Date(currentDay));
            if (i === 6) week.end = new Date(currentDay);
            currentDay.setDate(currentDay.getDate() + 1);
        }
        weeks.push(week);

        // Stop if we've passed the month and have enough weeks
        if (currentDay > lastOfMonth && weeks.length >= 4) break;
    }
    return weeks;
}

function calculateWeekStats(start, end) {
    const s = new Date(start); s.setHours(0, 0, 0, 0);
    const e = new Date(end); e.setHours(23, 59, 59, 999);

    const stats = {
        totalAppointments: 0,
        totalVisits: 0,
        days: {}
    };

    // Use a Set to avoid double counting visits from Lead + Appointment
    const uniqueVisitKeys = new Set();

    // 1. Process Appointments
    AppState.appointments.forEach(apt => {
        const createDate = new Date(apt.createdAt);
        const aptDate = new Date(apt.date);

        // A. Novos Agendamentos (Created In Week)
        if (createDate >= s && createDate <= e) {
            const dayKey = createDate.toDateString();
            if (!stats.days[dayKey]) stats.days[dayKey] = { appointments: 0, scheduledTotal: 0, visits: 0, sales: 0 };
            stats.days[dayKey].appointments++;
            stats.totalAppointments++;
        }

        // B. Agendados para o dia (Total scheduled for that day, excluding cancelled)
        if (aptDate >= s && aptDate <= e && apt.status !== 'cancelled') {
            const dayKey = aptDate.toDateString();
            if (!stats.days[dayKey]) stats.days[dayKey] = { appointments: 0, scheduledTotal: 0, visits: 0, sales: 0 };
            stats.days[dayKey].scheduledTotal++;
        }

        // C. Visitas (Attended In Week from Agenda)
        if (aptDate >= s && aptDate <= e && (apt.status === 'completed' || apt.attended)) {
            const dayKey = aptDate.toDateString();
            if (!stats.days[dayKey]) stats.days[dayKey] = { appointments: 0, scheduledTotal: 0, visits: 0 };

            const visitKey = `${apt.patientId}_${dayKey}`;
            if (!uniqueVisitKeys.has(visitKey)) {
                stats.days[dayKey].visits++;
                stats.totalVisits++;
                uniqueVisitKeys.add(visitKey);
            }
        }
    });

    // 2. Process Leads (for visits that might not have a formal appointment object)
    AppState.leads.forEach(lead => {
        // Fallback Priority: Locked visitDate > createdAt (Legacy)
        const d = new Date(lead.visitDate || lead.createdAt);
        if (d >= s && d <= e) {
            const dayKey = d.toDateString();
            if (!stats.days[dayKey]) stats.days[dayKey] = { appointments: 0, scheduledTotal: 0, visits: 0, sales: 0 };

            if (lead.status === 'visit' || ['sold', 'lost'].includes(lead.saleStatus)) {
                const patient = AppState.patients.find(p => p.convertedFrom === lead.id);
                const entityId = patient ? patient.id : lead.id;
                const visitKey = `${entityId}_${dayKey}`;

                if (!uniqueVisitKeys.has(visitKey)) {
                    stats.days[dayKey].visits++;

                    // CRITICAL: Any visit is ALSO a scheduled event for that day
                    // This ensures "Show-up" rate is at least what was reached.
                    stats.days[dayKey].scheduledTotal++;

                    stats.totalVisits++;
                    uniqueVisitKeys.add(visitKey);
                }
            }

            // D. Vendas (Closed In Week)
            if (lead.saleStatus === 'sold') {
                stats.days[dayKey].sales++;
            }
        }
    });

    return stats;
}

// Render Charts
function renderCharts(filteredLeads, filteredAppointments) {
    // Destroy old charts
    Object.values(charts).forEach(chart => { if (chart && chart.destroy) chart.destroy(); });

    // --- Status Doughnut Chart ---
    const ctxStatus = document.getElementById('statusChart');
    if (ctxStatus) {
        const statusCounts = {};
        const statusLabels = {
            'new': 'Novo', 'contacted': 'Contactado', 'scheduled': 'Agendado',
            'visit': 'Visita', 'sold': 'Venda', 'lost': 'Perdido'
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
            data: {
                labels: labels,
                datasets: [{ data: data, backgroundColor: bgColors.slice(0, data.length), borderWidth: 2, borderColor: '#fff' }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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
            data: {
                labels: Object.keys(channels),
                datasets: [{ data: Object.values(channels), backgroundColor: channelColors.slice(0, Object.keys(channels).length), borderWidth: 2, borderColor: '#fff' }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { padding: 15, font: { family: "'Inter', sans-serif" } } } }
            }
        });
    }

    // --- Daily Performance Chart (Bar Chart) ---
    const ctxDaily = document.getElementById('dailyPerformanceChart');
    if (ctxDaily) {
        // Group appointments by creation date
        const dailyCounts = {};
        filteredAppointments.forEach(a => {
            const day = a.createdAt ? new Date(a.createdAt).toISOString().split('T')[0] : null;
            if (day) {
                dailyCounts[day] = (dailyCounts[day] || 0) + 1;
            }
        });

        // Sort by date
        const sortedDays = Object.keys(dailyCounts).sort();
        const dailyGoal = AppState.settings?.dailyGoal || 5;

        charts.daily = new Chart(ctxDaily.getContext('2d'), {
            type: 'bar',
            data: {
                labels: sortedDays.map(d => {
                    const dt = new Date(d + 'T12:00:00');
                    return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                }),
                datasets: [
                    {
                        label: 'Agendamentos Criados',
                        data: sortedDays.map(d => dailyCounts[d]),
                        backgroundColor: sortedDays.map(d => dailyCounts[d] >= dailyGoal ? '#10b981' : '#3b82f6'),
                        borderRadius: 6,
                        borderSkipped: false
                    },
                    {
                        label: `Meta Diária (${dailyGoal})`,
                        data: sortedDays.map(() => dailyGoal),
                        type: 'line',
                        borderColor: '#ef4444',
                        borderDash: [5, 5],
                        borderWidth: 2,
                        pointRadius: 0,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, font: { family: "'Inter', sans-serif" } },
                        grid: { color: 'rgba(0,0,0,0.05)' }
                    },
                    x: {
                        ticks: { font: { family: "'Inter', sans-serif", size: 11 } },
                        grid: { display: false }
                    }
                },
                plugins: {
                    legend: { position: 'bottom', labels: { padding: 15, font: { family: "'Inter', sans-serif" } } }
                }
            }
        });
    }
}

// Export functions
window.initReportsModule = initReportsModule;
window.updateReportsStats = updateReportsStats;
window.resetReportDates = resetReportDates;
window.changeReportMonth = changeReportMonth;
window.showDayDetails = showDayDetails;

// Show Detailed Breakdown for a Specific Day
function showDayDetails(isoDate) {
    const targetDate = new Date(isoDate);
    const dateStr = targetDate.toISOString().split('T')[0];
    const displayDate = targetDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

    // 1. Agendamentos Feitos (Created on this day)
    const createdLeads = AppState.leads.filter(l => l.createdAt.startsWith(dateStr));
    const createdAppts = AppState.appointments.filter(a => a.createdAt && a.createdAt.startsWith(dateStr));

    // 2. Agendados para o Dia (Scheduled for this date)
    const scheduledAppts = AppState.appointments.filter(a => a.date.startsWith(dateStr) && a.status !== 'cancelled');

    // 3. Comparecimentos (Attended/Completed on this date)
    const uniqueVisits = new Map();
    const salesList = [];

    // A. From Agenda
    scheduledAppts.forEach(a => {
        if (a.attended || a.status === 'completed') {
            uniqueVisits.set(a.patientId + '_' + dateStr, { name: a.patientName, type: 'Agenda', detail: a.procedure });
        }
        if (a.isSale) {
            salesList.push({ name: a.patientName, detail: `💰 R$ ${a.saleValue?.toFixed(2) || '0,00'}` });
        }
    });

    // B. From Leads
    AppState.leads.forEach(l => {
        const d = l.visitDate || l.createdAt;
        if (d.startsWith(dateStr)) {
            if (l.status === 'visit' || ['sold', 'lost'].includes(l.saleStatus)) {
                const patient = AppState.patients.find(p => p.convertedFrom === l.id);
                const entityId = patient ? patient.id : l.id;
                const key = entityId + '_' + dateStr;
                if (!uniqueVisits.has(key)) {
                    uniqueVisits.set(key, { name: l.name, type: 'Lead', detail: l.saleStatus === 'sold' ? '💰 Venda' : 'Visita' });
                }
            }
            if (l.saleStatus === 'sold') {
                salesList.push({ name: l.name, detail: `💰 Venda (${l.interest || 'Avaliação'})` });
            }
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
            `).join('')}
        </ul>`;
    };

    const modalHTML = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <section>
                <h4 style="color: var(--blue-700); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 8px;">
                    <span style="background: var(--blue-100); padding: 4px; border-radius: 4px;">🛒</span> 
                    Agendamentos Feitos (Novos Registros)
                </h4>
                ${formatList([...createdLeads, ...createdAppts], 'Nenhum agendamento criado neste dia.')}
            </section>

            <section>
                <h4 style="color: var(--primary-700); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 8px;">
                    <span style="background: var(--primary-100); padding: 4px; border-radius: 4px;">📅</span> 
                    Esperados para o Dia (Total Agendado)
                </h4>
                ${formatList(scheduledAppts, 'Ninguém agendado para este dia.')}
            </section>

            <section>
                <h4 style="color: var(--purple-700); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 8px;">
                    <span style="background: var(--purple-100); padding: 4px; border-radius: 4px;">👥</span> 
                    Comparecimentos (Visitas Reais)
                </h4>
                ${formatList(Array.from(uniqueVisits.values()), 'Nenhum comparecimento registrado.')}
            </section>

            <section>
                <h4 style="color: var(--success-700); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 8px;">
                    <span style="background: var(--success-100); padding: 4px; border-radius: 4px;">💰</span> 
                    Vendas Realizadas
                </h4>
                ${formatList(salesList, 'Nenhuma venda fechada neste dia.')}
            </section>
        </div>
    `;

    openModal(`Detalhamento: ${capitalize(displayDate)}`, modalHTML, [
        { label: 'Fechar', class: 'btn-secondary', onclick: 'closeModal()' }
    ]);
}
