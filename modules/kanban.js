// Kanban Module - CRM Odonto Company
// ====================================
// Uses Leads as the source of truth

// Columns definition aligned with NEW Leads Pipeline
const KANBAN_COLUMNS = [
    { id: 'new', title: 'Novo Lead', icon: '🆕', color: '#3b82f6' },
    { id: 'in-contact', title: 'Em Contato', icon: '📞', color: '#2563eb' },
    { id: 'scheduled', title: 'Agendado', icon: '📅', color: '#10b981' },
    { id: 'visit', title: 'Visita / Fechamento', icon: '🏥', color: '#8b5cf6' } // New Column
];

// Initialize Kanban Module
function initKanbanModule() {
    renderKanbanBoard();
    initDragAndDrop();
}

// Render Kanban Board
function renderKanbanBoard() {
    const container = document.getElementById('kanbanBoard');

    // Safety check
    if (!container) return;

    // Apply Container Styles (Flexbox)
    container.style.display = 'flex';
    container.style.flexDirection = 'row';
    container.style.overflowX = 'auto';
    container.style.overflowY = 'hidden';
    container.style.height = 'calc(100vh - 180px)';
    container.style.gap = '16px';
    container.style.paddingBottom = '16px';
    container.style.alignItems = 'flex-start';
    container.style.width = '100%';

    // Create columns layout
    const columnsHTML = KANBAN_COLUMNS.map(column => `
        <div class="kanban-column" data-column-id="${column.id}" style="
            min-width: 300px;
            max-width: 300px;
            background: #f1f5f9;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            max-height: 100%;
            border: 1px solid #e2e8f0;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            flex-shrink: 0;
        ">
            <div class="kanban-header" style="
                padding: 12px 16px;
                background: transparent;
                border-bottom: 1px solid #e2e8f0;
                position: sticky;
                top: 0;
                z-index: 10;
            ">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span style="font-weight: 600; font-size: 14px; color: #334155; display: flex; align-items: center; gap: 6px;">
                        ${column.icon} ${column.title}
                    </span>
                    <span style="background: #e2e8f0; color: #475569; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 700;">
                        ${countLeadsInStatus(column.id)}
                    </span>
                </div>
            </div>
            <div class="kanban-body" style="
                flex: 1;
                overflow-y: auto;
                padding: 12px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            ">
                ${renderCardsForColumn(column.id)}
            </div>
        </div>
    `).join('');

    container.innerHTML = columnsHTML;

    // Re-attach event listeners for drag and drop
    initDragAndDrop();
}

// Count leads in a specific status
function countLeadsInStatus(status) {
    return AppState.leads.filter(l => l.status === status).length;
}

// Render cards for a specific column
function renderCardsForColumn(status) {
    // Filter leads by status and sort by date (newest first)
    const leads = AppState.leads
        .filter(l => l.status === status)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (leads.length === 0) {
        return `
            <div style="padding: 32px 16px; text-align: center; color: #94a3b8; font-size: 13px; border: 2px dashed #e2e8f0; border-radius: 8px; font-style: italic;">
                Vazio
            </div>
        `;
    }

    return leads.map(lead => {
        // Calculate days since creation
        const days = Math.floor((new Date() - new Date(lead.createdAt)) / (1000 * 60 * 60 * 24));
        const daysBadge = days === 0 ? 'Hoje' : `${days}d atrás`;
        const isUrgent = days > 3 && status !== 'scheduled' && status !== 'completed' && status !== 'visit'; // Urgent logic

        // Colors & Badges
        const statusColors = {
            'new': '#3b82f6',
            'in-contact': '#2563eb',
            'scheduled': '#10b981',
            'visit': '#8b5cf6'
        };
        const borderColor = statusColors[status] || '#cbd5e1';

        // Badge Styles
        let badgeBg = '#f1f5f9'; let badgeColor = '#475569'; let badgeBorder = 'none';
        if (isUrgent) { badgeBg = '#fee2e2'; badgeColor = '#991b1b'; badgeBorder = '1px solid #fca5a5'; }

        // WhatsApp Link
        const message = `Olá ${lead.name.split(' ')[0]}, tudo bem? Sou da Odonto Company.`;
        const waLink = typeof generateWhatsAppLink === 'function' ? generateWhatsAppLink(lead.phone, message) : '#';

        // Sales Status (Only for Visit Column)
        let salesActions = '';
        if (status === 'visit') {
            salesActions = `
                <div style="display: flex; gap: 8px; margin-top: 8px; padding-top: 8px; border-top: 1px solid #f1f5f9;">
                    <button onclick="event.stopPropagation(); markSale('${lead.id}', true)" style="
                        flex: 1; font-size: 11px; padding: 6px; border-radius: 4px; border: none; cursor: pointer; font-weight: 600;
                        background: ${lead.saleStatus === 'sold' ? '#166534' : '#dcfce7'}; 
                        color: ${lead.saleStatus === 'sold' ? 'white' : '#166534'};
                        display: flex; align-items: center; justify-content: center; gap: 4px;
                    ">
                        💰 ${lead.saleStatus === 'sold' ? 'Venda Fechada' : 'Fechou?'}
                    </button>
                    <button onclick="event.stopPropagation(); markSale('${lead.id}', false)" style="
                        flex: 1; font-size: 11px; padding: 6px; border-radius: 4px; border: none; cursor: pointer; font-weight: 600;
                        background: ${lead.saleStatus === 'lost' ? '#991b1b' : '#fee2e2'}; 
                        color: ${lead.saleStatus === 'lost' ? 'white' : '#991b1b'};
                        display: flex; align-items: center; justify-content: center; gap: 4px;
                    ">
                        ❌ Não
                    </button>
                </div>
            `;
        }

        return `
            <div class="kanban-card" draggable="true" data-lead-id="${lead.id}" onclick="showLeadDetails('${lead.id}')" style="
                background: white;
                border-radius: 8px;
                padding: 12px;
                box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
                border: 1px solid #e2e8f0;
                cursor: grab;
                position: relative;
                border-left: 4px solid ${borderColor};
                display: flex;
                flex-direction: column;
                gap: 8px;
            " onmouseover="this.querySelector('.card-actions').style.opacity = '1'" onmouseout="this.querySelector('.card-actions').style.opacity = '0'">
                
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                    <span style="
                        font-size: 11px;
                        padding: 2px 8px;
                        border-radius: 99px;
                        font-weight: 600;
                        text-transform: uppercase;
                        background: ${badgeBg};
                        color: ${badgeColor};
                        border: ${badgeBorder};
                    ">
                        ${isUrgent ? '🔥 ' : '🕒 '}${daysBadge}
                    </span>
                    ${lead.channel ? `
                    <span style="
                        font-size: 11px;
                        padding: 2px 8px;
                        border-radius: 99px;
                        font-weight: 600;
                        text-transform: uppercase;
                        background: #eff6ff;
                        color: #1e40af;
                        border: 1px solid #dbeafe;
                    ">
                        ${lead.channel}
                    </span>` : ''}
                    
                    ${lead.saleStatus === 'sold' ? '<span style="font-size: 11px; padding: 2px 8px; border-radius: 99px; background: #dcfce7; color: #15803d; border: 1px solid #86efac; font-weight: 700;">💰 Venda</span>' : ''}
                    ${lead.saleStatus === 'lost' ? '<span style="font-size: 11px; padding: 2px 8px; border-radius: 99px; background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; font-weight: 700;">❌ Perdido</span>' : ''}
                </div>

                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <h4 style="font-size: 14px; font-weight: 600; color: #1e293b; margin: 0; line-height: 1.4;">${lead.name}</h4>
                </div>
                
                <div style="font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 4px;">
                    <span>📱 ${formatPhoneNumber(lead.phone)}</span>
                </div>

                ${salesActions}

                <div class="card-actions" style="
                    display: flex;
                    gap: 8px;
                    padding-top: 8px;
                    border-top: 1px solid #f1f5f9;
                    margin-top: ${status === 'visit' ? '0' : '4px'}; 
                    opacity: 0; 
                    transition: opacity 0.2s;
                ">
                    <a href="${waLink}" target="_blank" onclick="event.stopPropagation()" style="
                        flex: 1; font-size: 11px; padding: 6px; border-radius: 4px; cursor: pointer; font-weight: 500;
                        display: flex; align-items: center; justify-content: center; gap: 4px; text-decoration: none;
                        background: #dcfce7; color: #166534;
                    ">
                        💬 WhatsApp
                    </a>
                    <button onclick="event.stopPropagation(); openEditLeadModal('${lead.id}')" style="
                        flex: 1; font-size: 11px; padding: 6px; border-radius: 4px; border: none; cursor: pointer; font-weight: 500;
                        display: flex; align-items: center; justify-content: center; gap: 4px;
                        background: #f1f5f9; color: #475569;
                    ">
                        ✏️ Editar
                    </button>
                    ${status === 'scheduled' ? `
                         <button onclick="event.stopPropagation(); showAppointmentDetails('${lead.id}')" style="
                            flex: 1; font-size: 11px; padding: 6px; border-radius: 4px; border: none; cursor: pointer; font-weight: 500;
                            display: flex; align-items: center; justify-content: center; gap: 4px;
                            background: #e0e7ff; color: #3730a3;
                         " title="Ver Agendamento">
                            📅 Ver
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Mark sale status
function markSale(leadId, isSold) {
    const lead = AppState.leads.find(l => l.id === leadId);
    if (!lead) return;

    lead.saleStatus = isSold ? 'sold' : 'lost';
    lead.updatedAt = new Date().toISOString();

    // If sold, maybe create a patient record if not exists? (Already done in scheduling usually)

    saveToStorage(STORAGE_KEYS.LEADS, AppState.leads);
    renderKanbanBoard();
    showNotification(isSold ? 'Venda registrada! 🎉' : 'Venda marcada como perdida.', isSold ? 'success' : 'info');
}

// Helper: Format Phone
function formatPhoneNumber(phone) {
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
}

// Show Appointment Details 
function showAppointmentDetails(leadId) {
    const patient = AppState.patients.find(p => p.name.toLowerCase() === AppState.leads.find(l => l.id === leadId)?.name.toLowerCase());
    if (patient) {
        switchTab('appointments');
    }
}

// Show Lead Details
function showLeadDetails(leadId) {
    // 1. Reset Filters to ensure visibility
    if (typeof filterLeads === 'function') filterLeads('all');
    if (typeof searchLeads === 'function') searchLeads('');

    // 2. Switch Tab
    switchTab('leads');

    // 3. Expand and Scroll
    setTimeout(() => {
        if (typeof expandLead === 'function') {
            expandLead(leadId);

            // Wait for render
            setTimeout(() => {
                const leadCard = document.querySelector(`.lead-card[data-lead-id="${leadId}"]`);
                if (leadCard) {
                    leadCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    leadCard.style.border = '2px solid var(--primary-500)'; // Highlight
                    setTimeout(() => leadCard.style.border = '', 2000);
                }
            }, 100);
        }
    }, 100);
}

// Drag and Drop Logic
function initDragAndDrop() {
    const cards = document.querySelectorAll('.kanban-card');
    const columns = document.querySelectorAll('.kanban-body');

    cards.forEach(card => {
        card.addEventListener('dragstart', dragStart);
        card.addEventListener('dragend', dragEnd);
    });

    columns.forEach(column => {
        column.addEventListener('dragover', dragOver);
        column.addEventListener('dragleave', dragLeave);
        column.addEventListener('drop', drop);
    });
}

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.leadId);
    e.target.classList.add('dragging');
    e.target.style.opacity = '0.4';
}

function dragEnd(e) {
    e.target.classList.remove('dragging');
    e.target.style.opacity = '1';
}

function dragOver(e) {
    e.preventDefault();
    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
}

function dragLeave(e) {
    e.currentTarget.style.background = 'transparent';
}

function drop(e) {
    e.preventDefault();
    const column = e.currentTarget;
    column.style.background = 'transparent';

    const leadId = e.dataTransfer.getData('text/plain');
    const newStatus = column.parentElement.dataset.columnId;

    if (leadId && newStatus) {
        updateLeadStatusViaKanban(leadId, newStatus);
    }
}

// Update via Kanban
function updateLeadStatusViaKanban(leadId, newStatus) {
    const lead = AppState.leads.find(l => l.id === leadId);
    if (!lead) return;

    if (lead.status === newStatus) return;

    // If dragging to Scheduled, fail safe to Modal
    if (newStatus === 'scheduled') {
        if (typeof showScheduleAppointmentModal === 'function') {
            showScheduleAppointmentModal(leadId);
        } else {
            alert('Erro: Função de agendamento não disponível.');
        }
        renderKanbanBoard();
        return;
    }

    // Update status
    lead.status = newStatus;
    lead.updatedAt = new Date().toISOString();

    if (newStatus === 'in-contact' && !lead.contactedAt) {
        lead.contactedAt = new Date().toISOString();
    }

    saveToStorage(STORAGE_KEYS.LEADS, AppState.leads);
    renderKanbanBoard();

    // Notify
    if (newStatus === 'visit') {
        showNotification('Lead movido para Visita! Marque se fechou venda.', 'info');
    } else {
        showNotification('Status atualizado!', 'success');
    }
}

// Export
window.initKanbanModule = initKanbanModule;
window.renderKanbanBoard = renderKanbanBoard;
window.markSale = markSale;
