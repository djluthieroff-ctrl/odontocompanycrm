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

    // Force initial dashboard update
    updateDashboard();

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

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();

        if (query.length < 2) return;

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

        console.log('Search results:', { patients: patientResults.length, leads: leadResults.length });
    });
}

// Dashboard Updates
function updateDashboard() {
    const metrics = calculateMetrics();

    // Total leads
    const totalLeadsEl = document.getElementById('totalLeads');
    if (totalLeadsEl) totalLeadsEl.textContent = metrics.totalLeads;

    // Today's leads
    const today = new Date().toDateString();
    const todayLeads = AppState.leads.filter(l =>
        new Date(l.createdAt).toDateString() === today
    ).length;
    const todayLeadsEl = document.getElementById('todayLeads');
    if (todayLeadsEl) todayLeadsEl.textContent = todayLeads;

    // Leads badge
    const leadsBadge = document.getElementById('leadsBadge');
    if (leadsBadge) {
        const newLeads = AppState.leads.filter(l => l.status === 'new').length;
        leadsBadge.textContent = newLeads;
        leadsBadge.style.display = newLeads > 0 ? 'block' : 'none';
    }

    // Total patients
    const totalPatientsEl = document.getElementById('totalPatients');
    if (totalPatientsEl) totalPatientsEl.textContent = AppState.patients.length;

    // Total appointments
    const totalAppointmentsEl = document.getElementById('totalAppointments');
    if (totalAppointmentsEl) totalAppointmentsEl.textContent = AppState.appointments.length;

    // Today's appointments (Keep as Created At or Date? Logic said Created At for 'Agendados Hoje' context usually, but let's stick to standard)
    const todayAppointments = AppState.appointments.filter(a =>
        new Date(a.date).toDateString() === today
    ).length;
    const todayAppointmentsEl = document.getElementById('todayAppointments');
    if (todayAppointmentsEl) todayAppointmentsEl.textContent = todayAppointments;

    // In progress (from kanban)
    const inProgress = AppState.kanbanCards.filter(k =>
        k.status === 'in-treatment' || k.status === 'in-service'
    ).length;
    const inProgressEl = document.getElementById('inProgress');
    if (inProgressEl) inProgressEl.textContent = inProgress;

    // CRC Metrics
    updateCRCMetrics(metrics);

    // If Reports module is active, update it too
    if (AppState.currentModule === 'reports' && typeof updateReportsStats === 'function') {
        updateReportsStats();
    }
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

    return {
        totalLeads,
        scheduled,
        visits,
        sales
    };
}

// CRC Metrics for Dashboard
function updateCRCMetrics(metrics) {
    if (!metrics) metrics = calculateMetrics();

    const today = new Date().toDateString();

    // Appointments scheduled today (created today)
    const scheduledToday = AppState.appointments.filter(a =>
        a.createdAt && new Date(a.createdAt).toDateString() === today
    ).length;

    // Conversion rate (Agendados / Total Leads)
    const conversionRate = metrics.totalLeads > 0
        ? Math.round((metrics.scheduled / metrics.totalLeads) * 100)
        : 0;

    // Commission (Based on Visits)
    const commission = metrics.visits * (AppState.settings?.commissionValue || 50);

    // Update UI if elements exist
    const conversionEl = document.getElementById('conversionRate');
    const scheduledTodayEl = document.getElementById('scheduledToday');
    const attendedEl = document.getElementById('totalAttended');
    const commissionEl = document.getElementById('totalCommission');

    if (conversionEl) conversionEl.textContent = conversionRate + '%';
    if (scheduledTodayEl) scheduledTodayEl.textContent = scheduledToday;
    if (attendedEl) attendedEl.textContent = metrics.visits; // Use Visits from Funnel for Consistency
    if (commissionEl) commissionEl.textContent = 'R$ ' + commission.toFixed(2);

    // Weekly Goals
    updateWeeklyGoals();
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

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function showNotification(message, type = 'info') {
    // Simple console notification for now
    console.log(`[${type.toUpperCase()}] ${message}`);

    // TODO: Implement toast notifications
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
