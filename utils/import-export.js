// Import/Export Utilities using SheetJS
// ======================================

/**
 * Import leads from XLSX file
 */
function importLeadsFromXLSX() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Get first sheet
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    alert('A planilha está vazia!');
                    return;
                }

                // Show preview modal
                showImportPreview(jsonData);

            } catch (error) {
                console.error('Error reading file:', error);
                alert('Erro ao ler arquivo. Certifique-se de que é um arquivo Excel válido.');
            }
        };

        reader.readAsArrayBuffer(file);
    };

    input.click();
}

/**
 * Show import preview and mapping
 */
function showImportPreview(data) {
    const sampleRows = data.slice(0, 5);
    const columns = Object.keys(data[0]);

    const previewHTML = `
        <div style="margin-bottom: var(--spacing-lg);">
            <p style="color: var(--gray-600); margin-bottom: var(--spacing-md);">
                Foram encontradas <strong>${data.length} linhas</strong> no arquivo.
                Confirme o mapeamento das colunas:
            </p>
            
            <div class="form-group">
                <label class="form-label">Coluna de Nome *</label>
                <select id="nameColumn" class="form-select">
                    ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Coluna de Telefone *</label>
                <select id="phoneColumn" class="form-select">
                    ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Coluna de Canal (opcional)</label>
                <select id="channelColumn" class="form-select">
                    <option value="">Nenhuma</option>
                    ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Coluna de Agendamento (opcional)</label>
                <select id="appointmentColumn" class="form-select">
                    <option value="">Nenhuma</option>
                    ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                </select>
                <small class="form-text text-muted">Formato esperado: DD/MM/AAAA - HH:MM</small>
            </div>
            
            <h4 style="margin-top: var(--spacing-lg); margin-bottom: var(--spacing-sm);">Preview (primeiras 5 linhas):</h4>
            <div style="overflow-x: auto; max-height: 300px; border: 1px solid var(--gray-200); border-radius: var(--radius-md);">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
                    <thead style="background: var(--gray-100); position: sticky; top: 0;">
                        <tr>
                            ${columns.map(col => `<th style="padding: 0.5rem; text-align: left; border-bottom: 2px solid var(--gray-300);">${col}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${sampleRows.map(row => `
                            <tr>
                                ${columns.map(col => `<td style="padding: 0.5rem; border-bottom: 1px solid var(--gray-200);">${row[col] || ''}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    openModal('Importar Leads', previewHTML, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        {
            label: `Importar ${data.length} Leads`,
            class: 'btn-primary',
            onclick: `confirmImportLeads(${JSON.stringify(data).replace(/"/g, '&quot;')})`
        }
    ]);
}

/**
 * Parse date/time from Brazilian format: DD/MM/AAAA - HH:00
 */
function parseAppointmentDateTime(dateTimeStr) {
    if (!dateTimeStr) return null;

    try {
        // Expected format: "15/02/2026 - 14:00" or "15/02/2026 14:00"
        const cleaned = dateTimeStr.toString().trim();
        const parts = cleaned.split(/[\s-]+/); // Split by space or dash

        if (parts.length < 2) return null;

        const datePart = parts[0]; // DD/MM/AAAA
        const timePart = parts[parts.length - 1]; // HH:00

        const [day, month, year] = datePart.split('/');
        const [hour, minute] = timePart.split(':');

        if (!day || !month || !year || !hour) return null;

        // Create date object (month is 0-indexed in JS)
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute) || 0);

        // Validate
        if (isNaN(date.getTime())) return null;

        return date.toISOString();
    } catch (e) {
        console.error('Error parsing date:', dateTimeStr, e);
        return null;
    }
}

/**
 * Confirm and process lead import with smart duplicate handling and auto-scheduling
 */
function confirmImportLeads(data) {
    const nameCol = document.getElementById('nameColumn').value;
    const phoneCol = document.getElementById('phoneColumn').value;
    const channelCol = document.getElementById('channelColumn').value;
    const appointmentCol = document.getElementById('appointmentColumn').value;

    let imported = 0;
    let updated = 0;
    let scheduled = 0;
    let skipped = 0;

    data.forEach(row => {
        const name = row[nameCol];
        const phone = row[phoneCol];

        // Validate required fields
        if (!name || !phone) {
            skipped++;
            return;
        }

        const cleanName = name.toString().trim();
        const cleanPhone = phone.toString().trim();

        // Check if lead already exists (by name)
        const existingLead = AppState.leads.find(l =>
            l.name.toLowerCase() === cleanName.toLowerCase()
        );

        const appointmentDateTime = appointmentCol ? parseAppointmentDateTime(row[appointmentCol]) : null;

        if (existingLead) {
            // UPDATE existing lead with new information
            existingLead.phone = cleanPhone;
            if (channelCol && row[channelCol]) {
                existingLead.channel = row[channelCol].toString().trim();
            }
            existingLead.updatedAt = new Date().toISOString();

            // If has appointment date, convert to patient and schedule
            if (appointmentDateTime) {
                // Update status
                existingLead.status = 'scheduled';

                // Convert to patient if not already
                let patient = AppState.patients.find(p => p.name.toLowerCase() === cleanName.toLowerCase());

                if (!patient) {
                    patient = {
                        id: generateId(),
                        name: cleanName,
                        phone: cleanPhone,
                        email: existingLead.email || '',
                        birthdate: '',
                        address: '',
                        createdAt: new Date().toISOString(),
                        convertedFrom: existingLead.id
                    };
                    AppState.patients.push(patient);

                    // Add to kanban
                    const kanbanCard = {
                        id: generateId(),
                        patientId: patient.id,
                        patientName: patient.name,
                        status: 'waiting',
                        createdAt: new Date().toISOString()
                    };
                    AppState.kanbanCards.push(kanbanCard);
                }

                // Create appointment
                const appointment = {
                    id: generateId(),
                    patientId: patient.id,
                    patientName: patient.name,
                    date: appointmentDateTime,
                    procedure: 'Avaliação',
                    duration: 60,
                    notes: `Importado de planilha - Canal: ${existingLead.channel || 'N/A'}`,
                    status: 'scheduled',
                    attended: false,
                    createdAt: new Date().toISOString()
                };
                AppState.appointments.push(appointment);
                scheduled++;
            }

            updated++;
        } else {
            // CREATE new lead
            const lead = {
                id: generateId(),
                name: cleanName,
                phone: cleanPhone,
                email: '',
                channel: channelCol ? (row[channelCol] || '').toString().trim() : '',
                source: 'importacao',
                message: '',
                interest: '',
                status: appointmentDateTime ? 'scheduled' : 'new',
                createdAt: new Date().toISOString()
            };

            AppState.leads.push(lead);

            // If has appointment date, convert to patient and schedule
            if (appointmentDateTime) {
                const patient = {
                    id: generateId(),
                    name: cleanName,
                    phone: cleanPhone,
                    email: '',
                    birthdate: '',
                    address: '',
                    createdAt: new Date().toISOString(),
                    convertedFrom: lead.id
                };
                AppState.patients.push(patient);

                // Add to kanban
                const kanbanCard = {
                    id: generateId(),
                    patientId: patient.id,
                    patientName: patient.name,
                    status: 'waiting',
                    createdAt: new Date().toISOString()
                };
                AppState.kanbanCards.push(kanbanCard);

                // Create appointment
                const appointment = {
                    id: generateId(),
                    patientId: patient.id,
                    patientName: patient.name,
                    date: appointmentDateTime,
                    procedure: 'Avaliação',
                    duration: 60,
                    notes: `Importado de planilha - Canal: ${lead.channel || 'N/A'}`,
                    status: 'scheduled',
                    attended: false,
                    createdAt: new Date().toISOString()
                };
                AppState.appointments.push(appointment);
                scheduled++;
            }

            imported++;
        }
    });

    // Save all changes
    saveToStorage(STORAGE_KEYS.LEADS, AppState.leads);
    saveToStorage(STORAGE_KEYS.PATIENTS, AppState.patients);
    saveToStorage(STORAGE_KEYS.APPOINTMENTS, AppState.appointments);
    saveToStorage(STORAGE_KEYS.KANBAN, AppState.kanbanCards);

    closeModal();

    if (typeof renderLeadsList === 'function') {
        renderLeadsList();
    }

    let message = `✅ Importação concluída!\n\n`;
    message += `Novos leads: ${imported}\n`;
    message += `Leads atualizados: ${updated}\n`;
    if (scheduled > 0) {
        message += `Agendamentos criados: ${scheduled}\n`;
    }
    if (skipped > 0) {
        message += `Ignorados (sem nome/telefone): ${skipped}`;
    }

    alert(message);
}

/**
 * Export data to XLSX
 */
function exportToXLSX(data, filename, sheetName = 'Sheet1') {
    try {
        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(data);

        // Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        // Generate file
        XLSX.writeFile(workbook, filename);

        showNotification(`Arquivo ${filename} exportado com sucesso!`, 'success');
    } catch (error) {
        console.error('Error exporting:', error);
        alert('Erro ao exportar arquivo.');
    }
}

/**
 * Export leads to XLSX
 */
function exportLeads() {
    if (AppState.leads.length === 0) {
        alert('Não há leads para exportar.');
        return;
    }

    const data = AppState.leads.map(lead => ({
        'Nome': lead.name,
        'Telefone': lead.phone,
        'Email': lead.email || '',
        'Canal': lead.channel || '',
        'Origem': lead.source,
        'Status': lead.status,
        'Interesse': lead.interest || '',
        'Mensagem': lead.message || '',
        'Data de Cadastro': formatDateTime(lead.createdAt)
    }));

    const filename = `leads_${new Date().toISOString().split('T')[0]}.xlsx`;
    exportToXLSX(data, filename, 'Leads');
}

/**
 * Export appointments to XLSX
 */
function exportAppointments() {
    if (AppState.appointments.length === 0) {
        alert('Não há agendamentos para exportar.');
        return;
    }

    const data = AppState.appointments.map(apt => {
        const patient = AppState.patients.find(p => p.id === apt.patientId);
        return {
            'Paciente': patient?.name || apt.patientName || '',
            'Telefone': patient?.phone || '',
            'Data': formatDate(apt.date),
            'Hora': new Date(apt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            'Procedimento': apt.procedure,
            'Status': apt.status,
            'Compareceu': apt.attended ? 'Sim' : 'Não',
            'Criado em': formatDateTime(apt.createdAt)
        };
    });

    const filename = `agendamentos_${new Date().toISOString().split('T')[0]}.xlsx`;
    exportToXLSX(data, filename, 'Agendamentos');
}

/**
 * Export daily report to XLSX
 */
function exportDailyReportXLSX(date) {
    const dateStr = new Date(date).toDateString();

    const appointmentsCreated = AppState.appointments.filter(a =>
        a.createdAt && new Date(a.createdAt).toDateString() === dateStr
    );

    if (appointmentsCreated.length === 0) {
        alert('Não há agendamentos para exportar nesta data.');
        return;
    }

    const data = appointmentsCreated.map(apt => {
        const patient = AppState.patients.find(p => p.id === apt.patientId);
        return {
            'Data do Agendamento': formatDate(apt.date),
            'Hora': new Date(apt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            'Paciente': patient?.name || apt.patientName || '',
            'Telefone': patient?.phone || '',
            'Procedimento': apt.procedure,
            'Duração': apt.duration + ' min',
            'Observações': apt.notes || ''
        };
    });

    const filename = `relatorio_${date.split('T')[0]}.xlsx`;
    exportToXLSX(data, filename, 'Relatório CRC');
}

/**
 * Full System Backup (JSON)
 * Required for migration to Vercel/Supabase
 */
function exportFullBackup() {
    const backup = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        data: {
            leads: AppState.leads,
            patients: AppState.patients,
            appointments: AppState.appointments,
            kanbanCards: AppState.kanbanCards,
            settings: AppState.settings
        }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `backup_crm_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    showNotification('Backup completo gerado!', 'success');
}

// Export to global scope
window.importLeadsFromXLSX = importLeadsFromXLSX;
window.showImportPreview = showImportPreview;
window.confirmImportLeads = confirmImportLeads;
window.exportToXLSX = exportToXLSX;
window.exportLeads = exportLeads;
window.exportAppointments = exportAppointments;
window.exportDailyReportXLSX = exportDailyReportXLSX;
window.exportFullBackup = exportFullBackup;
