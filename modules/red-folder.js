// Module: Pasta Vermelha (Red Folder)
// Patients who attended but didn't close treatment

function initRedFolderModule() {
    renderRedFolder();
}

function renderRedFolder() {
    const container = document.getElementById('redFolderContent');
    if (!container) return;

    // Filter logic: Patients with at least one completed appointment 
    // AND who don't have a lead marked as 'sold'
    const redFolderPatients = AppState.patients.filter(patient => {
        const hasCompletedAppointment = AppState.appointments.some(apt =>
            apt.patientId === patient.id && apt.status === 'completed'
        );

        // Find associated lead
        const lead = AppState.leads.find(l => l.phone === patient.phone || l.name === patient.name);
        const isSold = lead && lead.saleStatus === 'sold';

        return hasCompletedAppointment && !isSold;
    });

    if (redFolderPatients.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📁</div>
                <h3>Pasta Vermelha Vazia</h3>
                <p>Nenhum paciente pendente de fechamento no momento.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="list-container">
            <div style="margin-bottom: 1rem; color: var(--gray-500);">
                Total: <strong>${redFolderPatients.length}</strong> pacientes para acompanhamento.
            </div>
           ${redFolderPatients.map(patient => `
                <div class="list-item">
                    <div class="list-item-content">
                        <h4>${patient.name}</h4>
                        <p>${patient.phone || 'Sem telefone'}</p>
                        <small>Último contato via Leads ou Agendamento pendente</small>
                    </div>
                    <div class="list-item-actions">
                        <button class="btn btn-whatsapp btn-small" onclick="window.openWhatsApp('${patient.phone}')">
                            <span>📱</span> WhatsApp
                        </button>
                        <button class="btn btn-secondary btn-small" onclick="navigateToPatient('${patient.id}')">
                            <span>👤</span> Ver Ficha
                        </button>
                    </div>
                </div>
           `).join('')}
        </div>
    `;
}

window.initRedFolderModule = initRedFolderModule;
window.renderRedFolder = renderRedFolder;
