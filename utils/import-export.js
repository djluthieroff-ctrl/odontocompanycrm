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
 * Export data to XLSX with styling and column widths
 */
function exportToXLSX(data, filename, sheetName = 'Sheet1') {
    try {
        if (typeof XLSX === 'undefined') {
            alert('A biblioteca de exportação (XLSX) não foi carregada corretamente. Por favor, verifique sua conexão com a internet e atualize a página.');
            console.error('XLSX library not found');
            return;
        }

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(data);

        // Autofit columns (Simplified heuristic)
        const cols = Object.keys(data[0] || {}).map(key => {
            let maxLen = key.length;
            data.forEach(row => {
                const val = row[key];
                if (val != null) {
                    const len = val.toString().length;
                    if (len > maxLen) maxLen = len;
                }
            });
            return { wch: maxLen + 2 };
        });
        worksheet['!cols'] = cols;

        // Apply Styles
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                if (!worksheet[cellAddress]) continue;

                // Header styling
                if (R === 0) {
                    worksheet[cellAddress].s = {
                        font: { bold: true, color: { rgb: "FFFFFF" } },
                        fill: { fgColor: { rgb: "4A5568" } },
                        alignment: { horizontal: "center" }
                    };
                    continue;
                }

                // Conditional styling based on Status or Resultado
                // Status is typically column C (index 2) or Outcome is D (index 3)
                // We'll search for specific keywords in the row
                let rowIsVenda = false;
                let rowIsCompareceu = false;

                // Look ahead in the row to determine styling
                for (let CC = range.s.c; CC <= range.e.c; ++CC) {
                    const checkAddr = XLSX.utils.encode_cell({ r: R, c: CC });
                    const val = worksheet[checkAddr]?.v;
                    if (val === 'Venda Fechada') rowIsVenda = true;
                    if (val === 'Compareceu' || val === 'Comparecimento') rowIsCompareceu = true;
                }

                let bgColor = null;
                if (rowIsVenda) bgColor = "C6F6D5"; // Light Green
                else if (rowIsCompareceu) bgColor = "BEE3F8"; // Light Blue

                if (bgColor) {
                    worksheet[cellAddress].s = {
                        fill: { fgColor: { rgb: bgColor } },
                        border: {
                            top: { style: "thin", color: { rgb: "E2E8F0" } },
                            bottom: { style: "thin", color: { rgb: "E2E8F0" } },
                            left: { style: "thin", color: { rgb: "E2E8F0" } },
                            right: { style: "thin", color: { rgb: "E2E8F0" } }
                        }
                    };
                }
            }
        }

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
 * Export monthly detailed report to XLSX
 */
function exportMonthlyDetailedReportXLSX(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const reportData = [];

    // Iterate through each day of the month
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const displayDate = d.toLocaleDateString('pt-BR');

        // 1. Get all appointments for this day (Scheduled)
        const dayAppts = AppState.appointments.filter(a =>
            a.date.startsWith(dateStr) && a.status !== 'cancelled'
        );

        // Track people already added for this day to avoid duplicates
        const peopleAddedToday = new Set();

        // Add scheduled/attended people from Agenda
        dayAppts.forEach(apt => {
            const status = apt.attended || apt.status === 'completed' ? 'Compareceu' : 'Agendado';
            const action = apt.isSale ? 'Venda Fechada' : (apt.attended || apt.status === 'completed' ? 'Comparecimento' : 'Agendamento');

            const patient = AppState.patients.find(p => p.id === apt.patientId);
            const phone = patient ? patient.phone : '';

            reportData.push({
                'Data': displayDate,
                'Nome': apt.patientName,
                'Status': status,
                'Ação/Resultado': action,
                'Procedimento/Interesse': apt.procedure,
                'Valor Venda': apt.isSale ? (apt.saleValue || 0) : 0
            });
            peopleAddedToday.add(apt.patientId);
        });

        // 2. Add people from Leads (who might not have a formal appointment object but have visit/sale status)
        AppState.leads.forEach(lead => {
            const lDate = lead.visitDate || lead.createdAt;
            if (lDate.startsWith(dateStr)) {
                const patient = AppState.patients.find(p => p.convertedFrom === lead.id);
                const entityId = patient ? patient.id : lead.id;

                if (peopleAddedToday.has(entityId)) {
                    if (lead.saleStatus === 'sold') {
                        const existingEntry = reportData.find(r => r.Data === displayDate && (r.Nome === lead.name || (patient && r.Nome === patient.name)));
                        if (existingEntry && existingEntry['Ação/Resultado'] !== 'Venda Fechada') {
                            existingEntry['Ação/Resultado'] = 'Venda Fechada';
                            existingEntry['Status'] = 'Compareceu';
                            existingEntry['Valor Venda'] = lead.saleValue || 0;
                        }
                    }
                    return;
                }

                if (lead.status === 'visit' || ['sold', 'lost'].includes(lead.saleStatus)) {
                    let status = 'Compareceu';
                    let action = lead.saleStatus === 'sold' ? 'Venda Fechada' : 'Comparecimento';

                    reportData.push({
                        'Data': displayDate,
                        'Nome': lead.name,
                        'Status': status,
                        'Ação/Resultado': action,
                        'Procedimento/Interesse': lead.interest || 'Avaliação',
                        'Valor Venda': lead.saleStatus === 'sold' ? (lead.saleValue || 0) : 0
                    });
                    peopleAddedToday.add(entityId);
                }
            }
        });
    }

    if (reportData.length === 0) {
        alert('Não há dados detalhados para exportar neste mês.');
        return;
    }

    const monthName = new Date(year, month).toLocaleDateString('pt-BR', { month: 'long' });
    const filename = `relatorio_detalhado_${monthName}_${year}.xlsx`;
    exportToXLSX(reportData, filename, 'Relatório Detalhado');
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

/**
 * Import Full System Backup (JSON)
 */
function importBackupJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const backup = JSON.parse(event.target.result);

                // Basic validation
                if (!backup.data || (!backup.data.leads && !backup.data.patients)) {
                    throw new Error('Formato de backup inválido.');
                }

                if (!confirm(`⚠️ ATENÇÃO: Importar este backup substituirá TODOS os dados atuais. Deseja continuar?`)) {
                    return;
                }

                // Update AppState
                if (backup.data.leads) AppState.leads = backup.data.leads;
                if (backup.data.patients) AppState.patients = backup.data.patients;
                if (backup.data.appointments) AppState.appointments = backup.data.appointments;
                if (backup.data.kanbanCards) AppState.kanbanCards = backup.data.kanbanCards;
                if (backup.data.settings) AppState.settings = backup.data.settings;

                // Save to Storage
                saveToStorage(STORAGE_KEYS.LEADS, AppState.leads);
                saveToStorage(STORAGE_KEYS.PATIENTS, AppState.patients);
                saveToStorage(STORAGE_KEYS.APPOINTMENTS, AppState.appointments);
                saveToStorage(STORAGE_KEYS.KANBAN, AppState.kanbanCards);
                saveToStorage(STORAGE_KEYS.SETTINGS, AppState.settings);

                showNotification('Backup importado com sucesso! O sistema será reiniciado.', 'success');

                setTimeout(() => {
                    location.reload();
                }, 1500);

            } catch (error) {
                console.error('Error importing backup:', error);
                alert('Erro ao importar backup: ' + error.message);
            }
        };

        reader.readAsText(file);
    };

    input.click();
}

// Export to global scope
window.importLeadsFromXLSX = importLeadsFromXLSX;
window.showImportPreview = showImportPreview;
window.confirmImportLeads = confirmImportLeads;
window.exportToXLSX = exportToXLSX;
window.exportLeads = exportLeads;
window.exportAppointments = exportAppointments;
window.exportDailyReportXLSX = exportDailyReportXLSX;
window.exportMonthlyDetailedReportXLSX = exportMonthlyDetailedReportXLSX;
window.exportFullBackup = exportFullBackup;
window.importBackupJSON = importBackupJSON;
