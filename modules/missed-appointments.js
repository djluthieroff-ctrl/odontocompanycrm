// Module: Missed Appointments (Leads que não compareceram)
// ==========================================================

function initMissedAppointmentsModule() {
    renderMissedAppointments();
}

function getMissedAppointments() {
    const now = new Date();
    return AppState.appointments.filter(appt => {
        const apptDate = new Date(appt.date);
        // Regra: Data no passado e status ainda como 'scheduled' (não confirmado nem cancelado)
        return apptDate < now && apptDate.toDateString() !== now.toDateString() && appt.status === 'scheduled' && !appt.attended;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderMissedAppointments() {
    const container = document.getElementById('missedAppointmentsContent');
    if (!container) return;

    const missed = getMissedAppointments();
    updateMissedBadge(missed.length);

    if (missed.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">✅</div>
                <h3>Nenhuma falta pendente</h3>
                <p>Todos os agendamentos passados foram processados ou não há faltas registradas.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem;">
            ${missed.map(appt => renderMissedCard(appt)).join('')}
        </div>
    `;
}

function renderMissedCard(appt) {
    const apptDate = new Date(appt.date);
    const dateStr = apptDate.toLocaleDateString('pt-BR');
    const timeStr = apptDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    // Busca informações de contato do paciente ou lead
    const patient = AppState.patients.find(p => p.id === appt.patientId);
    const phone = appt.patientPhone || (patient && patient.phone) || '';

    return `
        <div class="card" style="border-left: 4px solid #ea580c; display: flex; flex-direction: column; gap: 1rem;">
            <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <h4 style="margin: 0; font-size: 1.1rem; font-weight: 700;">${escapeHTML(appt.patientName)}</h4>
                    <span class="badge" style="background: #fff7ed; color: #ea580c; font-weight: 700;">FALTA</span>
                </div>
                <div style="margin-top: 0.5rem; font-size: 0.85rem; color: var(--gray-600); display: flex; flex-direction: column; gap: 4px;">
                    <span>📅 Agendado para: <strong>${dateStr} às ${timeStr}</strong></span>
                    <span>🦷 Procedimento: ${escapeHTML(appt.procedure || 'Avaliação')}</span>
                    ${phone ? `<span>📱 WhatsApp: ${phone}</span>` : '<span style="color:var(--error-500);">⚠️ Sem telefone</span>'}
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; padding-top: 1rem; border-top: 1px solid var(--gray-100);">
                <button class="btn btn-whatsapp" onclick="sendMissedFollowUp('${appt.id}')" ${!phone ? 'disabled' : ''}>
                    📱 Recontato
                </button>
                <button class="btn btn-primary" onclick="rescheduleMissed('${appt.id}')">
                    🔄 Reagendar
                </button>
                <button class="btn btn-secondary" onclick="markAsAttendedManual('${appt.id}')" style="grid-column: span 2;">
                    ✅ Marcar como Compareceu
                </button>
            </div>
        </div>
    `;
}

function updateMissedBadge(count) {
    const badge = document.getElementById('missedAppointmentsBadge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

// Actions
function sendMissedFollowUp(apptId) {
    const appt = AppState.appointments.find(a => a.id === apptId);
    if (!appt) return;
    
    const patient = AppState.patients.find(p => p.id === appt.patientId);
    const phone = (patient && patient.phone) || '';
    if (!phone) {
        showNotification('Telefone não encontrado!', 'error');
        return;
    }

    const message = `Olá ${appt.patientName}, tudo bem? Notamos que você não conseguiu comparecer ao seu agendamento hoje às ${new Date(appt.date).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}. Gostaria de reagendar para outro dia?`;
    
    if (typeof window.openWhatsApp === 'function') {
        window.openWhatsApp(phone, message);
    } else {
        const url = `https://wa.me/55${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }
}

function rescheduleMissed(apptId) {
    const appt = AppState.appointments.find(a => a.id === apptId);
    if (!appt) return;
    
    // Abre o modal de agendamento pré-preenchido do módulo appointments.js
    if (typeof window.rescheduleAppointment === 'function') {
        window.rescheduleAppointment(apptId);
    } else {
        showNotification('Funcionalidade de reagendamento não encontrada.', 'error');
    }
}

async function markAsAttendedManual(apptId) {
    const appt = AppState.appointments.find(a => a.id === apptId);
    if (!appt) return;

    if (!confirm(`Confirmar que ${appt.patientName} compareceu retroativamente?`)) return;

    appt.status = 'completed';
    appt.attended = true;
    appt.updatedAt = new Date().toISOString();

    await saveToStorage(STORAGE_KEYS.APPOINTMENTS, AppState.appointments);
    showNotification('Status atualizado com sucesso!', 'success');
    renderMissedAppointments();
}

// Auto-update badge on app load
window.refreshMissedBadge = function() {
    const count = getMissedAppointments().length;
    updateMissedBadge(count);
};

// Exports
window.initMissedAppointmentsModule = initMissedAppointmentsModule;
window.renderMissedAppointments = renderMissedAppointments;
window.sendMissedFollowUp = sendMissedFollowUp;
window.rescheduleMissed = rescheduleMissed;
window.markAsAttendedManual = markAsAttendedManual;
