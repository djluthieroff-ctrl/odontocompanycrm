// CRM Odonto Company - Core Application
// =======================================

// State Management
const AppState = {
    currentModule: 'dashboard',
    leads: [],
    patients: [],
    appointments: [],
    kanbanCards: [],
    settings: {
        crcName: '',
        dailyGoal: 5,
        commissionValue: 50,
        weeklyAppointmentsGoal: 80,
        weeklyVisitsGoal: 40
    }
};

// LocalStorage Keys
const STORAGE_KEYS = {
    LEADS: 'odontocrm_leads',
    PATIENTS: 'odontocrm_patients',
    APPOINTMENTS: 'odontocrm_appointments',
    KANBAN: 'odontocrm_kanban',
    SETTINGS: 'odontocrm_settings'
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Ensure data is loaded
    loadDataFromStorage();

    // Initialize systems
    initializeNavigation();
    initializeGlobalSearch();
    initializeLoadingOverlay();

    // Force initial dashboard update
    updateDashboard();

    // Check for backup reminder
    setTimeout(checkBackupReminder, 2000);

    console.log('🦷 CRM Odonto Company Initialized');

    // Recovery check: If leads are empty, try loading again after a small delay
    if (AppState.leads.length === 0) {
        setTimeout(() => {
            console.log('Retry loading data...');
            loadDataFromStorage();
            if (AppState.leads.length > 0) {
                updateDashboard();
                // If we are in leads module, render list
                if (typeof renderLeadsList === 'function') renderLeadsList();
            }
        }, 500);
    }
});

// Load Data from LocalStorage
function loadDataFromStorage() {
    try {
        console.log('Attempting to load data from Storage...');
        const leadsData = localStorage.getItem(STORAGE_KEYS.LEADS);
        const patientsData = localStorage.getItem(STORAGE_KEYS.PATIENTS);
        const appointmentsData = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
        const kanbanData = localStorage.getItem(STORAGE_KEYS.KANBAN);
        const settingsData = localStorage.getItem(STORAGE_KEYS.SETTINGS);

        // Only parse if data exists, otherwise default to empty array/object
        if (leadsData) AppState.leads = JSON.parse(leadsData);
        if (patientsData) AppState.patients = JSON.parse(patientsData);
        if (appointmentsData) AppState.appointments = JSON.parse(appointmentsData);
        if (kanbanData) AppState.kanbanCards = JSON.parse(kanbanData);
        if (settingsData) AppState.settings = JSON.parse(settingsData);

        // DEFAULT SETTINGS IF MISSING
        if (!AppState.settings || Object.keys(AppState.settings).length === 0) {
            AppState.settings = {
                crcName: '',
                dailyGoal: 5,
                commissionValue: 50,
                weeklyAppointmentsGoal: 80,
                weeklyVisitsGoal: 40
            };
        }

        // Validate data types to prevent crashing
        if (!Array.isArray(AppState.leads)) AppState.leads = [];
        if (!Array.isArray(AppState.patients)) AppState.patients = [];
        if (!Array.isArray(AppState.appointments)) AppState.appointments = [];

        console.log('✅ Data loaded successfully:', {
            leads: AppState.leads.length,
            patients: AppState.patients.length,
            appointments: AppState.appointments.length
        });

    } catch (error) {
        console.error('❌ CRITICAL ERROR loading data:', error);
    }
}

// Save Data to LocalStorage
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        updateDashboard();
    } catch (error) {
        console.error('Error saving data:', error);
        showNotification('Erro ao salvar dados', 'error');
    }
}

// Navigation System
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const module = item.dataset.module;
            switchModule(module);
        });
    });
}

function switchModule(moduleName) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.module === moduleName) {
            item.classList.add('active');
        }
    });

    // Update active module content
    document.querySelectorAll('.module').forEach(module => {
        module.classList.remove('active');
    });

    const activeModule = document.getElementById(`${moduleName}-module`);
    if (activeModule) {
        activeModule.classList.add('active');
        AppState.currentModule = moduleName;

        // Trigger module-specific initialization
        if (typeof window[`init${capitalize(moduleName)}Module`] === 'function') {
            window[`init${capitalize(moduleName)}Module`]();
        }
    }
}

// Global Search
function initializeGlobalSearch() {
    const searchInput = document.getElementById('globalSearch');
    if (!searchInput) return;

    // Create results container if it doesn't exist
    let resultsContainer = document.getElementById('search-results-dropdown');
    if (!resultsContainer) {
        resultsContainer = document.createElement('div');
        resultsContainer.id = 'search-results-dropdown';
        resultsContainer.className = 'search-results-dropdown';
        // Position it below the search input
        searchInput.parentElement.style.position = 'relative';
        searchInput.parentElement.appendChild(resultsContainer);
    }

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();

        if (query.length < 2) {
            resultsContainer.style.display = 'none';
            return;
        }

        // Search in patients
        const patientResults = AppState.patients.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.cpf?.includes(query) ||
            p.phone?.includes(query)
        );

        // Search in leads
        const leadResults = AppState.leads.filter(l =>
            l.name.toLowerCase().includes(query) ||
            l.phone?.includes(query)
        );

        if (patientResults.length === 0 && leadResults.length === 0) {
            resultsContainer.innerHTML = '<div class="search-result-item">Nenhum resultado encontrado</div>';
        } else {
            let html = '';

            if (patientResults.length > 0) {
                html += '<div class="search-category">Pacientes</div>';
                patientResults.slice(0, 5).forEach(p => {
                    html += `
                        <div class="search-result-item" onclick="navigateToPatient('${p.id}')">
                            <span class="result-icon">👤</span>
                            <div class="result-info">
                                <div class="result-name">${escapeHTML(p.name)}</div>
                                <div class="result-detail">${escapeHTML(p.phone || 'Sem telefone')}</div>
                            </div>
                        </div>
                    `;
                });
            }

            if (leadResults.length > 0) {
                html += '<div class="search-category">Leads</div>';
                leadResults.slice(0, 5).forEach(l => {
                    html += `
                        <div class="search-result-item" onclick="navigateToLead('${l.id}')">
                            <span class="result-icon">💬</span>
                            <div class="result-info">
                                <div class="result-name">${escapeHTML(l.name)}</div>
                                <div class="result-detail">${escapeHTML(l.phone || 'Sem telefone')}</div>
                            </div>
                        </div>
                    `;
                });
            }

            resultsContainer.innerHTML = html;
        }

        resultsContainer.style.display = 'block';
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.style.display = 'none';
        }
    });
}

// Global search navigation helpers
window.navigateToPatient = (id) => {
    document.getElementById('search-results-dropdown').style.display = 'none';
    document.getElementById('globalSearch').value = '';
    switchModule('patients');
    setTimeout(() => {
        if (typeof showPatientDetails === 'function') {
            showPatientDetails(id);
        }
    }, 100);
};

window.navigateToLead = (id) => {
    document.getElementById('search-results-dropdown').style.display = 'none';
    document.getElementById('globalSearch').value = '';
    switchModule('leads');
    setTimeout(() => {
        if (typeof expandLead === 'function') {
            expandLead(id);
            // Scroll to the lead card if possible
            const element = document.querySelector(`[data-lead-id="${id}"]`);
            if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 300);
};

// Dashboard Updates
function updateDashboard() {
    const metrics = calculateMetrics();
    const today = new Date().toDateString();

    // Populate Top Stats
    const todayLeads = AppState.leads.filter(l => new Date(l.createdAt).toDateString() === today).length;
    // Agendados Hoje (Marcados hoje para qualquer data)
    const scheduledToday = AppState.appointments.filter(a => a.createdAt && new Date(a.createdAt).toDateString() === today).length;
    const conversionRate = metrics.totalLeads > 0 ? Math.round((metrics.scheduled / metrics.totalLeads) * 100) : 0;

    const elTodayLeads = document.getElementById('dashTodayLeads');
    const elScheduledToday = document.getElementById('dashScheduledToday');
    const elConvRate = document.getElementById('dashConvRate');

    if (elTodayLeads) elTodayLeads.textContent = todayLeads;
    if (elScheduledToday) elScheduledToday.textContent = scheduledToday;
    if (elConvRate) elConvRate.textContent = conversionRate + '%';

    // Populate Funnel Visual
    renderDashboardFunnel(metrics);

    // Populate Today's Timeline
    renderDashboardTimeline();

    // Populate Weekly Commission & Goals
    renderDashboardWeeklyPerf();

    // CRM Metrics Compatibility (Legacy badges if any)
    const leadsBadge = document.getElementById('leadsBadge');
    if (leadsBadge) {
        const newLeads = AppState.leads.filter(l => l.status === 'new').length;
        leadsBadge.textContent = newLeads;
        leadsBadge.style.display = newLeads > 0 ? 'block' : 'none';
    }

    // If Reports module is active, update it too
    if (AppState.currentModule === 'reports' && typeof updateReportsStats === 'function') {
        updateReportsStats();
    }
}

function renderDashboardFunnel(metrics) {
    const container = document.getElementById('funnelVisualContainer');
    if (!container) return;

    const stages = [
        { label: 'Leads Totais', count: metrics.totalLeads, color: '#3b82f6' },
        { label: 'Em Contato', count: metrics.contacted, color: '#2563eb' },
        { label: 'Agendados', count: metrics.scheduled, color: '#10b981' },
        { label: 'Compareceram', count: metrics.visits, color: '#8b5cf6' },
        { label: 'Vendas', count: metrics.sales, color: '#166534' }
    ];

    const max = metrics.totalLeads || 1;
    container.innerHTML = stages.map(stage => {
        const width = Math.max((stage.count / max) * 100, 5);
        return `
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 120px; font-size: 0.8rem; font-weight: 500; color: var(--gray-600);">${stage.label}</div>
                <div style="flex: 1; height: 24px; background: var(--gray-100); border-radius: 4px; overflow: hidden; position: relative;">
                    <div style="width: ${width}%; height: 100%; background: ${stage.color}; transition: width 0.5s ease;"></div>
                    <span style="position: absolute; right: 8px; top: 2px; font-size: 0.75rem; font-weight: 700; color: ${width > 50 ? 'white' : 'var(--gray-700)'}">${stage.count}</span>
                </div>
            </div>
        `;
    }).join('');
}

function renderDashboardTimeline() {
    const container = document.getElementById('dashAppointmentsTimeline');
    if (!container) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const todays = AppState.appointments
        .filter(a => a.date.startsWith(todayStr))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 4); // Show only top 4

    if (todays.length === 0) {
        container.innerHTML = '<p style="color: var(--gray-400); text-align: center; padding: 1rem; border: 1px dashed var(--gray-200); border-radius: 8px;">Nenhum agendamento para hoje.</p>';
        return;
    }

    container.innerHTML = todays.map(apt => {
        const time = new Date(apt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const patient = AppState.patients.find(p => p.id === apt.patientId);
        const name = patient ? patient.name : apt.patientName;
        return `
            <div style="display: flex; align-items: center; gap: 12px; padding: 10px; background: var(--gray-50); border-radius: 8px; border-left: 3px solid var(--primary-500);">
                <div style="font-weight: 700; color: var(--primary-700); font-size: 0.9rem; min-width: 45px;">${time}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; font-size: 0.9rem; color: var(--gray-900);">${escapeHTML(name)}</div>
                    <div style="font-size: 0.75rem; color: var(--gray-500);">${escapeHTML(apt.procedure)}</div>
                </div>
                <div class="badge" style="font-size: 0.7rem;">${apt.status}</div>
            </div>
        `;
    }).join('');
}

function renderDashboardWeeklyPerf() {
    const weeklyPerf = calculateWeeklyPerformance();
    const aptGoal = AppState.settings?.weeklyAppointmentsGoal || 80;
    const visitGoal = AppState.settings?.weeklyVisitsGoal || 40;

    let commission = 0;
    let metGoals = 0;
    if (weeklyPerf.appointments >= aptGoal) { commission += 100; metGoals++; }
    if (weeklyPerf.visits >= visitGoal) { commission += 100; metGoals++; }

    // Update Commission UI
    const elCommission = document.getElementById('dashWeeklyCommission');
    const elBonus = document.getElementById('dashCommissionBonus');
    if (elCommission) elCommission.textContent = `R$ ${commission.toFixed(2)}`;
    if (elBonus) {
        if (metGoals === 2) elBonus.textContent = "🚀 Parabéns! Metas batidas!";
        else if (metGoals === 1) elBonus.textContent = "🎯 Metade do caminho! Falta só uma.";
        else elBonus.textContent = "📈 Faltam R$ 200,00 de bônus! Vamos lá!";
    }

    // Update Goals Progress
    const container = document.getElementById('dashWeeklyGoalsProgress');
    if (!container) return;

    const renderGoalBar = (label, current, goal, color) => {
        const percent = Math.min((current / goal) * 100, 100);
        return `
            <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 4px;">
                    <span style="font-weight: 600; color: var(--gray-700);">${label}</span>
                    <span style="color: var(--gray-500); font-weight: 700;">${current}/${goal}</span>
                </div>
                <div style="height: 10px; background: var(--gray-100); border-radius: 10px; overflow: hidden;">
                    <div style="width: ${percent}%; height: 100%; background: ${color}; transition: width 0.5s ease;"></div>
                </div>
            </div>
        `;
    };

    container.innerHTML = `
        ${renderGoalBar('🛒 Agendamentos (Novos Leads)', weeklyPerf.appointments, aptGoal, '#3b82f6')}
        ${renderGoalBar('👥 Comparecimentos (Visitas)', weeklyPerf.visits, visitGoal, '#8b5cf6')}
    `;
}

// Unified Metrics Calculation
function calculateMetrics() {
    const totalLeads = AppState.leads.length;

    // Funnel Logic:
    // Scheduled = Status is 'scheduled' OR any future state ('visit', 'sold', 'lost')
    const scheduled = AppState.leads.filter(l => ['scheduled', 'visit'].includes(l.status) || ['sold', 'lost'].includes(l.saleStatus)).length;

    // Visits = Status is 'visit' OR 'sold' OR 'lost' (Assuming to get to sold/lost you visited)
    // Note: This relies on the Kanban flow.
    const visits = AppState.leads.filter(l => l.status === 'visit' || ['sold', 'lost'].includes(l.saleStatus)).length;

    // Sales
    const sales = AppState.leads.filter(l => l.saleStatus === 'sold').length;

    // Contacted (assuming any lead not 'new' has been contacted)
    const contacted = AppState.leads.filter(l => l.status !== 'new').length;

    return {
        totalLeads,
        scheduled,
        visits,
        sales,
        contacted
    };
}

// CRC Metrics for Dashboard (Legacy/Consistency)
function updateCRCMetrics(metrics) {
    if (!metrics) metrics = calculateMetrics();
    // Use the values already calculated in updateDashboard or recalculate if needed
    // This is now slightly redundant but keeps compatibility

    const today = new Date().toDateString();

    // Appointments scheduled today (created today)
    const scheduledToday = AppState.appointments.filter(a =>
        a.createdAt && new Date(a.createdAt).toDateString() === today
    ).length;

    // Conversion rate (Agendados / Total Leads)
    const conversionRate = metrics.totalLeads > 0
        ? Math.round((metrics.scheduled / metrics.totalLeads) * 100)
        : 0;

    // New Weekly Commission Logic
    const weeklyPerf = calculateWeeklyPerformance();
    let totalCommission = 0;

    // Check if goals were met this week
    if (weeklyPerf.appointments >= (AppState.settings?.weeklyAppointmentsGoal || 80)) {
        totalCommission += 100;
    }
    if (weeklyPerf.visits >= (AppState.settings?.weeklyVisitsGoal || 40)) {
        totalCommission += 100;
    }

    // Add previous commissions if we wanted historical, but user said "ganho 200" per week logic.
    // For now let's show the current week "potential" or "accrued" commission.

    // Update UI if elements exist
    const conversionEl = document.getElementById('conversionRate');
    const scheduledTodayEl = document.getElementById('scheduledToday');
    const attendedEl = document.getElementById('totalAttended');
    const commissionEl = document.getElementById('totalCommission');

    if (conversionEl) conversionEl.textContent = conversionRate + '%';
    if (scheduledTodayEl) scheduledTodayEl.textContent = scheduledToday;
    if (attendedEl) attendedEl.textContent = weeklyPerf.visits;
    if (commissionEl) commissionEl.textContent = 'R$ ' + totalCommission.toFixed(2);

    // Weekly Goals
    updateWeeklyGoals();
}

// Calculate Weekly Performance (Appointments Created and Visits Completed)
function calculateWeeklyPerformance() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust to start of week (Monday)
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // 1. Agendamentos (Created In Week) - Tracks intent/sales performance
    const weeklyAppointmentsCount = AppState.appointments.filter(a => {
        const d = new Date(a.createdAt);
        return d >= startOfWeek && d <= endOfWeek;
    }).length;

    // 2. Visitas (Attended In Week) - Tracks clinic movement
    // Uses a Set to deduplicate by patientId + date
    const uniqueVisitKeys = new Set();
    let totalVisitsCount = 0;

    // A. From Agenda (The primary source)
    AppState.appointments.forEach(a => {
        const d = new Date(a.date);
        if (d >= startOfWeek && d <= endOfWeek && (a.status === 'completed' || a.attended)) {
            const key = `${a.patientId}_${d.toDateString()}`;
            if (!uniqueVisitKeys.has(key)) {
                uniqueVisitKeys.add(key);
                totalVisitsCount++;
            }
        }
    });

    // B. From Leads (For leads that reached visit/sold stages without a formal agenda entry)
    AppState.leads.forEach(l => {
        // Fallback Priority: Locked visitDate > createdAt (Legacy)
        const d = new Date(l.visitDate || l.createdAt);
        if (d >= startOfWeek && d <= endOfWeek) { // Use startOfWeek and endOfWeek for this function
            if (l.status === 'visit' || ['sold', 'lost'].includes(l.saleStatus)) {
                const patient = AppState.patients.find(p => p.convertedFrom === l.id);
                const entityId = patient ? patient.id : l.id;
                const key = `${entityId}_${d.toDateString()}`;

                if (!uniqueVisitKeys.has(key)) {
                    uniqueVisitKeys.add(key);
                    totalVisitsCount++; // Keep original variable name
                }
            }
        }
    });

    return {
        appointments: weeklyAppointmentsCount,
        visits: totalVisitsCount,
        start: startOfWeek,
        end: endOfWeek
    };
}

// Update Weekly Goals
function updateWeeklyGoals() {
    if (typeof renderMonthlyGoals === 'function') {
        renderMonthlyGoals();
    }
}

// Modal System
function openModal(title, content, actions = []) {
    const modalContainer = document.getElementById('modalContainer');

    const actionsHTML = actions.map(action =>
        `<button class="btn ${action.class || 'btn-secondary'}" onclick="${action.onclick}">${action.label}</button>`
    ).join('');

    modalContainer.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="closeModal()">✕</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            ${actions.length > 0 ? `
                <div class="modal-footer">
                    ${actionsHTML}
                </div>
            ` : ''}
        </div>
    `;

    modalContainer.classList.add('active');

    // Initialize masks for the new content
    if (typeof initMasks === 'function') {
        initMasks(modalContainer);
    }

    // Close on background click
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            closeModal();
        }
    });
}

function closeModal() {
    const modalContainer = document.getElementById('modalContainer');
    modalContainer.classList.remove('active');
    setTimeout(() => {
        modalContainer.innerHTML = '';
    }, 300);
}

// Utilities
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Helper to sync Lead Visit to Agenda
function syncLeadVisitToAppointment(leadId) {
    const lead = AppState.leads.find(l => l.id === leadId);
    if (!lead) return;

    // 1. Ensure Patient exists
    let patient = AppState.patients.find(p => p.convertedFrom === leadId || p.name.toLowerCase() === lead.name.toLowerCase());
    if (!patient) {
        patient = {
            id: generateId(),
            name: lead.name,
            phone: lead.phone,
            email: lead.email || '',
            birthdate: '',
            address: '',
            createdAt: new Date().toISOString(),
            convertedFrom: leadId
        };
        AppState.patients.push(patient);
        saveToStorage(STORAGE_KEYS.PATIENTS, AppState.patients);
    }

    // 2. Check for an open appointment to "give low" (dar baixa)
    // Priority: Most recent non-completed/non-cancelled appointment
    const openAppts = AppState.appointments.filter(a =>
        a.patientId === patient.id &&
        a.status !== 'completed' &&
        a.status !== 'cancelled'
    ).sort((a, b) => new Date(b.date) - new Date(a.date));

    if (openAppts.length > 0) {
        // Use the most relevant open appointment
        const apt = openAppts[0];
        apt.status = 'completed';
        apt.attended = true;
        // Keep the original appointment date, but mark as completed today
        apt.notes = (apt.notes || '') + `\n⚠️ Baixa automática via Lead (Visita em ${new Date().toLocaleDateString('pt-BR')})`;

        saveToStorage(STORAGE_KEYS.APPOINTMENTS, AppState.appointments);
        showNotification(`Agenda atualizada: Agendamento de ${patient.name} marcado como concluído.`, 'success');
    } else {
        // Only create a new one if NO open appointment exists
        const todayStr = new Date().toISOString().split('T')[0];
        const alreadyHasCompletedToday = AppState.appointments.find(a =>
            a.patientId === patient.id &&
            a.date.startsWith(todayStr) &&
            a.status === 'completed'
        );

        if (!alreadyHasCompletedToday) {
            const appointment = {
                id: generateId(),
                patientId: patient.id,
                patientName: patient.name,
                date: new Date().toISOString(),
                procedure: lead.interest || 'Avaliação',
                duration: 60,
                notes: `⚠️ Sincronizado automaticamente (Lead: ${lead.source})`,
                status: 'completed',
                attended: true,
                createdAt: new Date().toISOString()
            };
            AppState.appointments.push(appointment);
            saveToStorage(STORAGE_KEYS.APPOINTMENTS, AppState.appointments);
        }
    }

    if (typeof renderAppointmentsView === 'function') renderAppointmentsView();
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function showNotification(message, type = 'info') {
    // Create toast container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000; display: flex; flex-direction: column; gap: 10px; max-width: 400px;';
        document.body.appendChild(container);
    }

    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const colors = {
        success: { bg: '#f0fdf4', border: '#86efac', text: '#166534' },
        error: { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b' },
        info: { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af' },
        warning: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e' }
    };
    const c = colors[type] || colors.info;

    const toast = document.createElement('div');
    toast.style.cssText = `background: ${c.bg}; border: 1px solid ${c.border}; color: ${c.text}; padding: 12px 16px; border-radius: 10px; font-size: 0.9rem; font-weight: 500; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 10px; animation: toastSlideIn 0.3s ease; cursor: pointer; font-family: 'Inter', sans-serif;`;
    toast.innerHTML = `<span style="font-size: 1.2em;">${icons[type] || icons.info}</span><span>${escapeHTML(message)}</span>`;
    toast.onclick = () => { toast.style.animation = 'toastSlideOut 0.3s ease forwards'; setTimeout(() => toast.remove(), 300); };

    container.appendChild(toast);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'toastSlideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);
}

// Export to global scope
window.AppState = AppState;
window.STORAGE_KEYS = STORAGE_KEYS;
window.saveToStorage = saveToStorage;
window.openModal = openModal;
window.closeModal = closeModal;
window.switchModule = switchModule;
window.updateDashboard = updateDashboard;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.generateId = generateId;
window.showNotification = showNotification;
window.capitalize = capitalize;
window.showLoading = (message = 'Carregando...') => {
    const overlay = document.getElementById('loadingOverlay');
    const text = document.getElementById('loadingText');
    if (overlay && text) {
        text.textContent = message;
        overlay.style.display = 'flex';
    }
};
window.hideLoading = () => {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
};

function initializeLoadingOverlay() {
    if (!document.getElementById('loadingOverlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="spinner"></div>
            <p id="loadingText" style="font-weight: 600; color: var(--primary-800);">Carregando...</p>
        `;
        document.body.appendChild(overlay);
    }
}

function checkBackupReminder() {
    const lastBackup = localStorage.getItem('last_backup_date');
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    if (!lastBackup || (now - parseInt(lastBackup)) > threeDays) {
        showNotification('🚀 Lembrete: Faça um backup dos seus dados nas configurações!', 'warning');
    }
}

