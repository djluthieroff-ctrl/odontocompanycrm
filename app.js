// CRM Odonto Company - Core Application
// =======================================

// State Management
const AppState = {
    currentModule: 'dashboard',
    leads: [],
    patients: [],
    appointments: [],
    oldPatients: [], // Pacientes Antigos (Fichas Físicas)
    settings: {
        crcName: '',
        dailyGoal: 5,
        commissionValue: 50,
        weeklyAppointmentsGoal: 80,
        weeklyVisitsGoal: 40
    },
    finances: {
        receivedPayments: [],
        deviceMaintenances: [],
        debtorQueue: []
    }
};

// LocalStorage Keys
const STORAGE_KEYS = {
    LEADS: 'odontocrm_leads',
    PATIENTS: 'odontocrm_patients',
    APPOINTMENTS: 'odontocrm_appointments',
    SETTINGS: 'odontocrm_settings',
    OLD_PATIENTS: 'odontocrm_old_patients',
    FINANCE_PAYMENTS: 'odontocrm_finance_payments',
    FINANCE_MAINTENANCE: 'odontocrm_finance_maintenance',
    FINANCE_DEBTORS: 'odontocrm_finance_debtors'
};

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    initializeLoadingOverlay();

    // Tenta inicializar Supabase
    const supabaseOk = typeof initSupabase === 'function' && initSupabase();

    if (supabaseOk) {
        console.log('☁️ Modo Nuvem — Iniciando fluxo de autenticação');
    } else {
        console.warn('⚠️ Modo Local — Supabase não configurado ou inacessível');
    }

    // Inicia fluxo de Auth (que já trata o caso offline internamente)
    if (typeof initAuth === 'function') {
        initAuth();
    }

    console.log('🦷 CRM Odonto Company Initialized');
});

// Initialize App UI
function initializeAppUI() {
    // Initialize accessibility features
    if (typeof initAccessibility === 'function') {
        initAccessibility();
    }

    initializeNavigation();
    initializeGlobalSearch();

    updateDashboard();
    checkStaleLeads();

    // Initialize Tippy Tooltips
    if (window.tippy) {
        tippy('[title]', {
            animation: 'shift-away',
            theme: 'light-border',
            arrow: true
        });
    }

    if (typeof updateConnectionIndicator === 'function') {
        updateConnectionIndicator();
    }

    initializeDarkMode();
    initializeKeyboardShortcuts();
    startTodayWidgetPolling();

    // Initialize Logout Button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.onclick = async () => {
            if (confirm('Deseja realmente sair?')) {
                if (typeof supabaseSignOut === 'function') {
                    await supabaseSignOut();
                    location.reload();
                }
            }
        };
    }

    // Start external sync loop (Unisoft/n8n)
    setTimeout(() => {
        if (typeof processUnprocessedSyncRecords === 'function') {
            processUnprocessedSyncRecords();
            setInterval(processUnprocessedSyncRecords, 5 * 60 * 1000);
        }
    }, 5000);
}

function initializeDarkMode() {
    const darkModeBtn = document.getElementById('darkModeToggle');
    const isDark = localStorage.getItem('darkMode') === 'true';

    if (isDark) {
        document.body.classList.add('dark-mode');
        if (darkModeBtn) darkModeBtn.textContent = '☀️';
    }

    if (darkModeBtn) {
        darkModeBtn.onclick = () => {
            const isNowDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', isNowDark);
            darkModeBtn.textContent = isNowDark ? '☀️' : '🌓';

            // Re-render charts if they depend on colors
            if (typeof updateDashboard === 'function') updateDashboard();
        };
    }
}

function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ignorar se o usuário estiver digitando em um input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
            if (e.key === 'Escape') {
                closeAllModals();
            }
            return;
        }

        const key = e.key.toLowerCase();

        if (key === 'n') {
            e.preventDefault();
            if (typeof showNewLeadForm === 'function') showNewLeadForm();
        } else if (key === 'a') {
            e.preventDefault();
            if (typeof switchModule === 'function') switchModule('appointments');
        } else if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal, .modal-overlay');
    modals.forEach(m => {
        m.style.display = 'none';
        // Se houver overlay do modal antigo
        if (m.classList.contains('active')) m.classList.remove('active');
    });
}

function startTodayWidgetPolling() {
    updateTodayWidget();
    // Atualiza a cada 2 minutos como sugerido no print
    setInterval(updateTodayWidget, 2 * 60 * 1000);
}

function updateTodayWidget() {
    if (!AppState.appointments) return;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Filtrar agendamentos de hoje
    const todayAppts = AppState.appointments.filter(a => {
        const aDate = new Date(a.date).toISOString().split('T')[0];
        return aDate === todayStr;
    });

    const expected = todayAppts.length;
    const attended = todayAppts.filter(a => a.attended || a.status === 'completed').length;
    const rate = expected > 0 ? Math.round((attended / expected) * 100) : 0;

    const elExpected = document.getElementById('todayExpectedCount');
    const elAttended = document.getElementById('todayAttendedCount');
    const elProgress = document.getElementById('todayProgressFill');
    const elRateText = document.getElementById('todayPresenceRate');

    if (elExpected) elExpected.textContent = expected;
    if (elAttended) elAttended.textContent = attended;
    if (elProgress) elProgress.style.width = `${rate}%`;
    if (elRateText) elRateText.textContent = `${rate}% de presença`;
}



// Load Data from LocalStorage
function loadDataFromStorage() {
    try {
        console.log('Attempting to load data from Storage...');
        const leadsData = localStorage.getItem(STORAGE_KEYS.LEADS);
        const patientsData = localStorage.getItem(STORAGE_KEYS.PATIENTS);
        const appointmentsData = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
        const settingsData = localStorage.getItem(STORAGE_KEYS.SETTINGS);

        // Only parse if data exists, otherwise default to empty array/object
        if (leadsData) AppState.leads = JSON.parse(leadsData);
        if (patientsData) AppState.patients = JSON.parse(patientsData);
        if (appointmentsData) AppState.appointments = JSON.parse(appointmentsData);
        if (settingsData) AppState.settings = JSON.parse(settingsData);
        const oldPatientsData = localStorage.getItem(STORAGE_KEYS.OLD_PATIENTS);
        if (oldPatientsData) AppState.oldPatients = JSON.parse(oldPatientsData);
        const paymentsData = localStorage.getItem(STORAGE_KEYS.FINANCE_PAYMENTS);
        const maintenanceData = localStorage.getItem(STORAGE_KEYS.FINANCE_MAINTENANCE);
        const debtorsData = localStorage.getItem(STORAGE_KEYS.FINANCE_DEBTORS);
        if (!AppState.finances) {
            AppState.finances = {
                receivedPayments: [],
                deviceMaintenances: [],
                debtorQueue: []
            };
        }
        if (paymentsData) AppState.finances.receivedPayments = JSON.parse(paymentsData);
        if (maintenanceData) AppState.finances.deviceMaintenances = JSON.parse(maintenanceData);
        if (debtorsData) AppState.finances.debtorQueue = JSON.parse(debtorsData);

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
        if (!Array.isArray(AppState.finances.receivedPayments)) AppState.finances.receivedPayments = [];
        if (!Array.isArray(AppState.finances.deviceMaintenances)) AppState.finances.deviceMaintenances = [];
        if (!Array.isArray(AppState.finances.debtorQueue)) AppState.finances.debtorQueue = [];

        console.log('✅ Data loaded successfully:', {
            leads: AppState.leads.length,
            patients: AppState.patients.length,
            appointments: AppState.appointments.length
        });

        // 🚀 CRITICAL: Fix any legacy IDs to standard UUIDs for cloud synchronization
        if (typeof fixAllIdsToUUIDs === 'function') {
            fixAllIdsToUUIDs();
        }

        return true;

    } catch (error) {
        console.error('❌ CRITICAL ERROR loading data:', error);
    }
}

// Save Data to LocalStorage (with Supabase sync)
function saveToStorage(key, data) {
    try {
        // Always save to localStorage as cache/backup
        localStorage.setItem(key, JSON.stringify(data));

        // If cloud connected, also save to Supabase
        if (typeof isCloudConnected === 'function' && isCloudConnected()) {
            const tableMap = {};
            tableMap[STORAGE_KEYS.LEADS] = 'leads';
            tableMap[STORAGE_KEYS.PATIENTS] = 'patients';
            tableMap[STORAGE_KEYS.APPOINTMENTS] = 'appointments';
            tableMap[STORAGE_KEYS.SETTINGS] = 'settings';
            tableMap[STORAGE_KEYS.OLD_PATIENTS] = 'old_patients';
            tableMap[STORAGE_KEYS.FINANCE_PAYMENTS] = 'received_payments';
            tableMap[STORAGE_KEYS.FINANCE_MAINTENANCE] = 'device_maintenances';
            tableMap[STORAGE_KEYS.FINANCE_DEBTORS] = 'debtor_notifications';
            const table = tableMap[key];
            if (table) {
                // Fire-and-forget async save to Supabase
                saveToSupabase(table, data).catch(err => {
                    console.warn('Supabase sync failed, local data preserved:', err);
                });
            }
        }

        // updateDashboard(); // BUG 7: Removido daqui para evitar repintura excessiva. Chamar apenas quando necessário.
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
        // BUG 6: Fix para módulos com hífen (red-folder -> initRedFolderModule)
        const funcName = `init${moduleName.split('-').map(s => capitalize(s)).join('')}Module`;
        if (typeof window[funcName] === 'function') {
            window[funcName]();
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
    const dropdown = document.getElementById('search-results-dropdown');
    if (dropdown) dropdown.style.display = 'none';
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) searchInput.value = '';

    switchModule('patients');
    setTimeout(() => {
        if (typeof window.showPatientDetails === 'function') {
            window.showPatientDetails(id);
        }
    }, 100);
};

window.navigateToLead = (id) => {
    const dropdown = document.getElementById('search-results-dropdown');
    if (dropdown) dropdown.style.display = 'none';
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) searchInput.value = '';

    switchModule('leads');
    // Scroll to lead or open it if possible
    setTimeout(() => {
        const leadEl = document.querySelector(`[data-id="${id}"]`);
        if (leadEl) leadEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
};

// Helper for manual sale recording (used by appointments.js)
window.saveManualAptSale = (aptId) => {
    const input = document.getElementById('manualSaleValue');
    if (!input) return;

    const valStr = input.value.trim().replace(',', '.');
    const value = parseFloat(valStr) || 0;

    const apt = AppState.appointments.find(a => a.id === aptId);
    if (apt) {
        apt.saleValue = value;
        apt.isSale = true;
        apt.updatedAt = new Date().toISOString();
        saveToStorage(STORAGE_KEYS.APPOINTMENTS, AppState.appointments);
        showNotification(`Venda de R$ ${value.toFixed(2)} registrada!`, 'success');
        closeModal();
        if (typeof window.renderAppointmentsView === 'function') window.renderAppointmentsView();
    }
};

// Dashboard Updates
function updateDashboard() {
    const startDateInput = document.getElementById('dashStartDate');
    const endDateInput = document.getElementById('dashEndDate');

    let startDate = null;
    let endDate = null;

    if (startDateInput && startDateInput.value) {
        startDate = new Date(startDateInput.value + 'T00:00:00');
    }
    if (endDateInput && endDateInput.value) {
        endDate = new Date(endDateInput.value + 'T23:59:59');
    }

    const metrics = calculateMetrics(startDate, endDate);

    // If no filter, "Today" logic applies for some stats
    const isFiltered = !!(startDate || endDate);
    const today = new Date().toDateString();

    // Populate Top Stats
    const totalLeads = metrics.totalLeads;

    // Scheduled: If filtered, show appointments CREATED in period. If not, show created TODAY.
    const scheduledCount = isFiltered
        ? AppState.appointments.filter(a => {
            const d = new Date(a.createdAt);
            if (startDate && d < startDate) return false;
            if (endDate && d > endDate) return false;
            return true;
        }).length
        : AppState.appointments.filter(a => a.createdAt && new Date(a.createdAt).toDateString() === today).length;

    const conversionRate = metrics.totalLeads > 0 ? Math.round((metrics.scheduled / metrics.totalLeads) * 100) : 0;

    const elTotalLeads = document.getElementById('dashTodayLeads');
    const elScheduledToday = document.getElementById('dashScheduledToday');
    const elConvRate = document.getElementById('dashConvRate');

    // Update labels if filtered
    const labelLeads = document.querySelector('[id="dashTodayLeads"]').previousElementSibling;
    const labelScheduled = document.querySelector('[id="dashScheduledToday"]').previousElementSibling;

    if (labelLeads) labelLeads.textContent = isFiltered ? 'Leads no Período' : 'Total de Leads';
    if (labelScheduled) labelScheduled.textContent = isFiltered ? 'Agendados no Período' : 'Agendados Hoje';

    if (elTotalLeads) elTotalLeads.textContent = totalLeads;
    if (elScheduledToday) elScheduledToday.textContent = scheduledCount;
    if (elConvRate) elConvRate.textContent = conversionRate + '%';

    // Add Total Sales Value to Dashboard if possible
    const elTotalSales = document.getElementById('dashTotalSales');
    if (elTotalSales) {
        elTotalSales.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.totalSalesValue);
    }

    // Populate Funnel Visual
    renderDashboardFunnel(metrics);

    // Populate Today's Timeline (Always shows actual today/upcoming)
    renderDashboardTimeline();

    // Populate Weekly Commission & Goals (Always shows current week)
    renderDashboardWeeklyPerf();

    // CRM Metrics Compatibility (Legacy badges if any)
    const leadsBadge = document.getElementById('leadsBadge');
    if (leadsBadge) {
        const totalLeadsCount = AppState.leads.filter(l => l.status === 'new').length;
        leadsBadge.textContent = totalLeadsCount;
        leadsBadge.style.display = totalLeadsCount > 0 ? 'flex' : 'none';
    }

    // Badge: Pasta Vermelha
    const redFolderBadge = document.getElementById('redFolderBadge');
    if (redFolderBadge) {
        if (typeof window.getRedFolderEntries === 'function') {
            const count = window.getRedFolderEntries().length;
            redFolderBadge.textContent = count;
            redFolderBadge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    // If Reports module is active, update it too
    if (AppState.currentModule === 'reports' && typeof updateReportsStats === 'function') {
        updateReportsStats();
    }
}

function clearDashboardFilter() {
    const startDateInput = document.getElementById('dashStartDate');
    const endDateInput = document.getElementById('dashEndDate');
    if (startDateInput) startDateInput.value = '';
    if (endDateInput) endDateInput.value = '';
    updateDashboard();
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
        .slice(0, 6); // Show only top 6

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
function calculateMetrics(startDate = null, endDate = null) {
    let filteredLeads = AppState.leads;

    if (startDate || endDate) {
        filteredLeads = AppState.leads.filter(l => {
            const d = new Date(l.createdAt);
            if (startDate && d < startDate) return false;
            if (endDate && d > endDate) return false;
            return true;
        });
    }

    const totalLeads = filteredLeads.length;

    // Funnel Logic:
    // Scheduled = Status is 'scheduled' OR any future state ('visit', 'sold', 'lost')
    const scheduled = filteredLeads.filter(l => ['scheduled', 'visit'].includes(l.status) || ['sold', 'lost'].includes(l.saleStatus)).length;

    // Visits = Status is 'visit' OR 'sold' OR 'lost' (Assuming to get to sold/lost you visited)
    const visits = filteredLeads.filter(l => l.status === 'visit' || ['sold', 'lost'].includes(l.saleStatus)).length;

    // Sales
    const salesLeads = filteredLeads.filter(l => l.saleStatus === 'sold');
    const sales = salesLeads.length;
    const totalSalesValue = salesLeads.reduce((sum, l) => sum + (l.saleValue || 0), 0);

    // Contacted (assuming any lead not 'new' has been contacted)
    const contacted = filteredLeads.filter(l => l.status !== 'new').length;

    return {
        totalLeads,
        scheduled,
        visits,
        sales,
        totalSalesValue,
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
    const nowForCalc = new Date();
    const day = nowForCalc.getDay();
    const diff = nowForCalc.getDate() - day + (day === 0 ? -6 : 1);
    // BUG 1: Usar uma nova instância para não mutar o objeto original
    const startOfWeek = new Date(nowForCalc);
    startOfWeek.setDate(diff);
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
    const goals = calculateWeeklyPerformance();
    const appointmentsGoal = AppState.settings.weeklyAppointmentsGoal || 80;
    const visitsGoal = AppState.settings.weeklyVisitsGoal || 40;

    const appPercent = Math.min(Math.round((goals.appointments / appointmentsGoal) * 100), 100);
    const visitPercent = Math.min(Math.round((goals.visits / visitsGoal) * 100), 100);

    const appProgress = document.getElementById('appointmentsProgress');
    const visitProgress = document.getElementById('visitsProgress');

    if (appProgress) {
        appProgress.style.width = `${appPercent}%`;
        document.getElementById('appointmentsCount').textContent = goals.appointments;
    }
    if (visitProgress) {
        visitProgress.style.width = `${visitPercent}%`;
        document.getElementById('visitsCount').textContent = goals.visits;
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
    if (!str) return '';
    return str.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
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
            birthDate: '',
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

        // 🔥 Retroactive Fix: If lead has a specific visitDate, use it
        const finalDate = lead.visitDate || new Date().toISOString();
        const dateLabel = new Date(finalDate).toLocaleDateString('pt-BR');

        apt.notes = (apt.notes || '') + `\n⚠️ Baixa automática via Lead (Visita em ${dateLabel})`;

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
            const finalDate = lead.visitDate || new Date().toISOString();

            const appointment = {
                id: generateId(),
                patientId: patient.id,
                patientName: patient.name,
                date: finalDate,
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
    // Use modern randomUUID if available
    if (window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
    }
    // Standard RFC4122 version 4 UUID fallback
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function isValidUUID(str) {
    if (!str || typeof str !== 'string') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}

function fixAllIdsToUUIDs() {
    let changed = false;
    const idMap = new Map();

    // 1. Leads
    AppState.leads.forEach(lead => {
        if (!isValidUUID(lead.id)) {
            const oldId = lead.id;
            const newId = generateId();
            idMap.set(oldId, newId);
            lead.id = newId;
            changed = true;
        }
    });

    // 2. Patients (and fix convertedFrom reference)
    AppState.patients.forEach(patient => {
        if (!isValidUUID(patient.id)) {
            const oldId = patient.id;
            const newId = generateId();
            idMap.set(oldId, newId);
            patient.id = newId;
            changed = true;
        }
        if (patient.convertedFrom && idMap.has(patient.convertedFrom)) {
            patient.convertedFrom = idMap.get(patient.convertedFrom);
            changed = true;
        }
    });

    // 3. Appointments (and fix patientId reference)
    AppState.appointments.forEach(app => {
        if (!isValidUUID(app.id)) {
            app.id = generateId();
            changed = true;
        }
        if (app.patientId && idMap.has(app.patientId)) {
            app.patientId = idMap.get(app.patientId);
            changed = true;
        }
    });

    if (changed) {
        console.log('✨ Data legacy IDs converted to UUIDs for cloud sync');
        saveToStorage(STORAGE_KEYS.LEADS, AppState.leads);
        saveToStorage(STORAGE_KEYS.PATIENTS, AppState.patients);
        saveToStorage(STORAGE_KEYS.APPOINTMENTS, AppState.appointments);
    }
}

function showNotification(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; bottom: 30px; right: 30px; z-index: 10000; display: flex; flex-direction: column; gap: 12px; max-width: 420px;';
        document.body.appendChild(container);
    }

    const configs = {
        success: { icon: '✨', bg: 'var(--primary-600)', color: '#fff' },
        error: { icon: '🛑', bg: 'var(--error-500)', color: '#fff' },
        info: { icon: 'ℹ️', bg: 'var(--gray-800)', color: '#fff' },
        warning: { icon: '⚠️', bg: 'var(--warning-500)', color: '#fff' }
    };
    const c = configs[type] || configs.info;

    const toast = document.createElement('div');
    toast.style.cssText = `background: ${c.bg}; color: ${c.color}; padding: 14px 20px; border-radius: 14px; font-size: 0.95rem; font-weight: 600; box-shadow: var(--shadow-xl); display: flex; align-items: center; gap: 12px; animation: toastSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); cursor: pointer; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(8px);`;
    toast.innerHTML = `<span style="font-size: 1.25rem;">${c.icon}</span><span style="flex:1;">${escapeHTML(message)}</span>`;

    toast.onclick = () => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => toast.remove(), 400);
    };

    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100px)';
            toast.style.transition = 'all 0.4s ease';
            setTimeout(() => toast.remove(), 400);
        }
    }, 5000);
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

function checkBackupReminder() {
    const lastBackup = localStorage.getItem('last_backup_date');
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    if (!lastBackup || (now - parseInt(lastBackup)) > threeDays) {
        showNotification('🚀 Lembrete: Faça um backup dos seus dados nas configurações!', 'warning');
    }
}

function checkStaleLeads() {
    const now = new Date();
    const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000);

    if (!AppState.leads || AppState.leads.length === 0) return;

    const staleCount = AppState.leads.filter(l =>
        l.status === 'new' && new Date(l.createdAt) < threeDaysAgo
    ).length;

    if (staleCount > 0) {
        setTimeout(() => {
            if (typeof showNotification === 'function') {
                showNotification(`📢 Atenção: Você tem ${staleCount} leads novos há mais de 3 dias sem contato!`, 'warning');
            }
        }, 3000);
    }
}



