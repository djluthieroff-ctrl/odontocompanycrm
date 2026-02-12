// Weekly Goals Utilities - Enhanced for Monthly View
// ===================================================

/**
 * Get all weeks for the current month
 * Returns an array of objects { label, start, end }
 */
function getWeeksOfMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const weeks = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let current = new Date(firstDay);

    // If the month doesn't start on a Monday, find the first Monday? 
    // Or just treat the first partial week as Week 1?
    // Let's standard: Week 1 starts from the 1st until the first Sunday.
    // Week 2 starts from the next Monday, etc.

    let weekNum = 1;

    while (current <= lastDay) {
        let startOfWeek = new Date(current);

        // Find end of this week (next Sunday or end of month)
        let endOfWeek = new Date(current);
        const dayOfWeek = current.getDay(); // 0 is Sunday
        const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

        endOfWeek.setDate(current.getDate() + daysToSunday);

        // Cap at end of month
        if (endOfWeek > lastDay) {
            endOfWeek = new Date(lastDay);
        }

        // Set times
        startOfWeek.setHours(0, 0, 0, 0);
        endOfWeek.setHours(23, 59, 59, 999);

        // Format label dates
        const startStr = startOfWeek.getDate();
        const endStr = endOfWeek.toLocaleString('pt-BR', { month: 'long', day: 'numeric' });

        weeks.push({
            label: `Semana ${weekNum}`,
            dateRange: `Dia ${startStr} ao dia ${endStr}`,
            start: startOfWeek,
            end: endOfWeek
        });

        // Move to next Monday
        current = new Date(endOfWeek);
        current.setDate(current.getDate() + 1);
        weekNum++;
    }

    return weeks;
}

/**
 * Count appointments created within a specific date range
 */
function getAppointmentsForRange(start, end) {
    return AppState.appointments.filter(a => {
        const dateStr = a.saleDate || a.createdAt;
        if (!dateStr) return false;

        const saleDate = new Date(dateStr);
        return saleDate >= start && saleDate <= end;
    }).length;
}

/**
 * Count visits (attended) within a specific date range
 * Aligned with Dashboard "Comparecimentos" logic (Lead Status) + Appointment Status
 */
function getVisitsForRange(start, end) {
    return AppState.appointments.filter(a => {
        const visitDate = new Date(a.date);
        if (visitDate < start || visitDate > end) return false;

        // 1. Check strict Appointment status
        if (a.attended || a.status === 'completed') return true;

        // 2. Check linked Lead status (Dashboard Logic "Comparecimentos")
        // Find patient
        const patient = AppState.patients.find(p => p.id === a.patientId);
        if (patient) {
            // Find lead by ID (convertedFrom) or Name fallback
            const lead = AppState.leads.find(l =>
                (patient.convertedFrom && l.id === patient.convertedFrom) ||
                l.name.toLowerCase() === patient.name.toLowerCase()
            );

            // If lead is in 'visit', 'sold', or 'lost' (implies visit occurred)
            if (lead && ['visit', 'sale', 'sold', 'lost'].includes(lead.status)) {
                return true; // Count as visit
            }

            // Also check saleStatus property independent of status
            if (lead && ['sold', 'lost'].includes(lead.saleStatus)) {
                return true;
            }
        }

        return false;
    }).length;
}

/**
 * Calculate progress percentage
 */
function calculateProgress(current, goal) {
    if (goal === 0) return 0;
    return Math.min(Math.round((current / goal) * 100), 100);
}

/**
 * Render the Monthly Goals View
 */
function renderMonthlyGoals() {
    console.log('Rendering Monthly Goals...');
    const container = document.getElementById('monthlyGoalsContainer');
    if (!container) {
        console.error('Monthly Goals Container NOT found!');
        return;
    }

    const weeks = getWeeksOfMonth();
    console.log('Weeks found:', weeks);

    const appointmentsGoal = AppState.settings?.weeklyAppointmentsGoal || 80;
    const visitsGoal = AppState.settings?.weeklyVisitsGoal || 40;

    let html = '';

    if (weeks.length === 0) {
        html = '<p style="text-align: center; color: var(--gray-500);">Nenhuma semana encontrada para este mês.</p>';
    } else {
        weeks.forEach(week => {
            const apptCount = getAppointmentsForRange(week.start, week.end);
            const visitCount = getVisitsForRange(week.start, week.end);

            console.log(`Week ${week.label}: Appts=${apptCount}, Visits=${visitCount}`);

            html += createWeekCard(week, apptCount, visitCount, appointmentsGoal, visitsGoal);
        });
    }

    container.innerHTML = html;
    console.log('Monthly Goals Rendered.');
}

/**
 * Create HTML for a single Week Card containing both metrics
 */
function createWeekCard(week, apptCount, visitCount, apptGoal, visitGoal) {
    const apptProgress = calculateProgress(apptCount, apptGoal);
    const visitProgress = calculateProgress(visitCount, visitGoal);

    return `
        <div class="week-goal-card" style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); border: 1px solid var(--gray-200); margin-bottom: 1.5rem;">
            <div style="margin-bottom: 1.25rem; border-bottom: 1px solid var(--gray-100); padding-bottom: 0.75rem;">
                <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--primary-700); margin: 0;">${week.label}</h4>
                <p style="font-size: 0.9rem; color: var(--gray-500); margin: 4px 0 0 0;">📅 ${week.dateRange}</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <!-- Appointments -->
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; align-items: center;">
                        <span style="font-weight: 600; color: var(--gray-700); font-size: 0.9rem;">Agendamentos</span>
                        <span style="font-weight: 700; color: #3b82f6; font-size: 0.85rem; background: #eff6ff; padding: 2px 8px; border-radius: 12px;">${apptProgress}%</span>
                    </div>
                    <div style="display: flex; align-items: baseline; gap: 4px; margin-bottom: 6px;">
                        <span style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">${apptCount}</span>
                        <span style="font-size: 0.85rem; color: var(--gray-500);">/ ${apptGoal}</span>
                    </div>
                    <div style="background: var(--gray-100); height: 8px; border-radius: 999px; overflow: hidden;">
                        <div style="background: #3b82f6; height: 100%; width: ${apptProgress}%; transition: width 1s ease; border-radius: 999px;"></div>
                    </div>
                </div>
                
                <!-- Visits -->
                <div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; align-items: center;">
                        <span style="font-weight: 600; color: var(--gray-700); font-size: 0.9rem;">Visitas</span>
                        <span style="font-weight: 700; color: #8b5cf6; font-size: 0.85rem; background: #f5f3ff; padding: 2px 8px; border-radius: 12px;">${visitProgress}%</span>
                    </div>
                    <div style="display: flex; align-items: baseline; gap: 4px; margin-bottom: 6px;">
                        <span style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">${visitCount}</span>
                        <span style="font-size: 0.85rem; color: var(--gray-500);">/ ${visitGoal}</span>
                    </div>
                    <div style="background: var(--gray-100); height: 8px; border-radius: 999px; overflow: hidden;">
                        <div style="background: #8b5cf6; height: 100%; width: ${visitProgress}%; transition: width 1s ease; border-radius: 999px;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Keeping legacy exports for safety, but primary is renderMonthlyGoals
function getWeeklyAppointmentsCount() { return 0; } // Deprecated 
function getWeeklyVisitsCount() { return 0; } // Deprecated

// Export to global scope
window.renderMonthlyGoals = renderMonthlyGoals;
// Re-export helpers if needed elsewhere (unlikely)
window.getWeeksOfMonth = getWeeksOfMonth;

