// Module: Pasta Vermelha (Red Folder)
// Pacientes que vieram à avaliação mas não fecharam tratamento
// Dividido em 2 seções: recentes (< 60 dias) e antigos (> 60 dias)

const RED_FOLDER_RECENT_DAYS = 60;
let redFolderFilter = 'all'; // 'all' | 'recent' | 'old'

function initRedFolderModule() {
    renderRedFolder();
}

// Coleta todos os pacientes/leads que visitaram mas não fecharam
function getRedFolderEntries() {
    const now = new Date();
    const entries = [];
    const seenIds = new Set();

    // 1. Appointments completed sem venda
    AppState.appointments.forEach(apt => {
        if ((apt.status === 'completed' || apt.attended) && apt.patientId) {
            // Verifica se existe venda para esse paciente
            const lead = AppState.leads.find(l =>
                l.convertedFrom === apt.patientId ||
                AppState.patients.find(p => p.id === apt.patientId && (p.phone === l.phone || p.name === l.name))
            );
            const isSold = lead && lead.saleStatus === 'sold';
            if (isSold) return;

            // Evita duplicatas por paciente
            const key = apt.patientId;
            if (seenIds.has(key)) return;
            seenIds.add(key);

            const patient = AppState.patients.find(p => p.id === apt.patientId);
            const aptDate = new Date(apt.date || apt.createdAt);
            const daysSince = Math.floor((now - aptDate) / (1000 * 60 * 60 * 24));

            entries.push({
                id: apt.patientId,
                name: apt.patientName || (patient && patient.name) || 'Paciente',
                phone: (patient && patient.phone) || '',
                lastVisit: aptDate,
                daysSince,
                procedure: apt.procedure || 'Avaliação',
                type: 'appointment',
                patientId: apt.patientId,
                leadId: lead ? lead.id : null
            });
        }
    });

    // 2. Leads com status 'visit' mas sem venda (sem appointment formal)
    AppState.leads.forEach(lead => {
        if ((lead.status === 'visit' || lead.status === 'in-contact') && lead.saleStatus !== 'sold') {
            const visitDate = new Date(lead.visitDate || lead.createdAt);
            const daysSince = Math.floor((now - visitDate) / (1000 * 60 * 60 * 24));

            // Evitar duplicar com entries do appointment
            const alreadyIn = entries.some(e => e.leadId === lead.id || e.phone === lead.phone);
            if (alreadyIn) return;

            entries.push({
                id: lead.id,
                name: lead.name,
                phone: lead.phone || '',
                lastVisit: visitDate,
                daysSince,
                procedure: lead.interest || 'Avaliação',
                type: 'lead',
                patientId: null,
                leadId: lead.id
            });
        }
    });

    // Ordena por mais urgente (mais dias primeiro)
    entries.sort((a, b) => b.daysSince - a.daysSince);
    return entries;
}

function renderRedFolder() {
    const container = document.getElementById('redFolderContent');
    if (!container) return;

    const all = getRedFolderEntries();
    const recent = all.filter(e => e.daysSince <= RED_FOLDER_RECENT_DAYS);
    const old = all.filter(e => e.daysSince > RED_FOLDER_RECENT_DAYS);

    // Taxa de fechamento estimada
    const totalVisited = AppState.leads.filter(l => l.status === 'visit' || l.saleStatus === 'sold' || l.saleStatus === 'lost').length;
    const totalSold = AppState.leads.filter(l => l.saleStatus === 'sold').length;
    const closingRate = totalVisited > 0 ? Math.round((totalSold / totalVisited) * 100) : 0;

    container.innerHTML = `
        <!-- Resumo no topo -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
            <div class="stat-card" style="cursor:default;">
                <div class="stat-icon" style="background:#fee2e2;color:#dc2626;">📅</div>
                <div class="stat-content">
                    <h3>Recentes</h3>
                    <p class="stat-number" style="color:#dc2626;">${recent.length}</p>
                    <small style="color:var(--gray-500);">Últimos 60 dias</small>
                </div>
            </div>
            <div class="stat-card" style="cursor:default;">
                <div class="stat-icon" style="background:#fff7ed;color:#ea580c;">🕰️</div>
                <div class="stat-content">
                    <h3>Antigas</h3>
                    <p class="stat-number" style="color:#ea580c;">${old.length}</p>
                    <small style="color:var(--gray-500);">Acima de 60 dias</small>
                </div>
            </div>
            <div class="stat-card" style="cursor:default;">
                <div class="stat-icon" style="background:#dcfce7;color:#16a34a;">📊</div>
                <div class="stat-content">
                    <h3>Taxa de Fechamento</h3>
                    <p class="stat-number" style="color:#16a34a;">${closingRate}%</p>
                    <small style="color:var(--gray-500);">Visitas que fecharam</small>
                </div>
            </div>
        </div>

        <!-- Filtro -->
        <div style="display:flex;gap:0.5rem;margin-bottom:1.5rem;flex-wrap:wrap;">
            <button class="btn ${redFolderFilter === 'all' ? 'btn-primary' : 'btn-secondary'} btn-small" onclick="setRedFolderFilter('all')">
                📁 Todos (${all.length})
            </button>
            <button class="btn ${redFolderFilter === 'recent' ? 'btn-primary' : 'btn-secondary'} btn-small" onclick="setRedFolderFilter('recent')">
                📅 Recentes (${recent.length})
            </button>
            <button class="btn ${redFolderFilter === 'old' ? 'btn-primary' : 'btn-secondary'} btn-small" onclick="setRedFolderFilter('old')">
                🕰️ Antigos (${old.length})
            </button>
        </div>

        ${all.length === 0 ? `
            <div class="empty-state">
                <div class="empty-state-icon">🎉</div>
                <h3>Pasta Vermelha Vazia!</h3>
                <p>Nenhum paciente pendente de fechamento. Ótimo trabalho!</p>
            </div>
        ` : ''}

        <!-- Seção: Agendamentos Recentes -->
        ${(redFolderFilter === 'all' || redFolderFilter === 'recent') && recent.length > 0 ? `
        <div style="margin-bottom:2rem;">
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem;">
                <div style="width:4px;height:24px;background:#dc2626;border-radius:2px;"></div>
                <h3 style="margin:0;font-weight:700;color:var(--gray-900);">📅 Agendamentos Recentes — Não Fechados</h3>
                <span class="badge" style="background:#fee2e2;color:#dc2626;font-weight:700;">${recent.length}</span>
            </div>
            <p style="color:var(--gray-500);font-size:0.85rem;margin-bottom:1rem;">Vieram nos últimos 60 dias e ainda não fecharam tratamento. Prioridade máxima!</p>
            <div style="display:flex;flex-direction:column;gap:0.75rem;">
                ${recent.map(e => renderRedFolderCard(e)).join('')}
            </div>
        </div>
        ` : ''}

        <!-- Divisor -->
        ${redFolderFilter === 'all' && recent.length > 0 && old.length > 0 ? `
        <div style="border-top:2px dashed var(--gray-200);margin:1.5rem 0;"></div>
        ` : ''}

        <!-- Seção: Avaliações Antigas -->
        ${(redFolderFilter === 'all' || redFolderFilter === 'old') && old.length > 0 ? `
        <div>
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem;">
                <div style="width:4px;height:24px;background:#ea580c;border-radius:2px;"></div>
                <h3 style="margin:0;font-weight:700;color:var(--gray-900);">🕰️ Avaliações Antigas — Sem Retorno</h3>
                <span class="badge" style="background:#fff7ed;color:#ea580c;font-weight:700;">${old.length}</span>
            </div>
            <p style="color:var(--gray-500);font-size:0.85rem;margin-bottom:1rem;">Vieram há mais de 60 dias. Vale tentar reativar com uma proposta especial.</p>
            <div style="display:flex;flex-direction:column;gap:0.75rem;">
                ${old.map(e => renderRedFolderCard(e)).join('')}
            </div>
        </div>
        ` : ''}
    `;
}

function renderRedFolderCard(entry) {
    const urgencyColor = entry.daysSince > 180 ? '#7c3aed' :
        entry.daysSince > 90 ? '#ea580c' :
            entry.daysSince > 30 ? '#dc2626' : '#2563eb';
    const urgencyBg = entry.daysSince > 180 ? '#ede9fe' :
        entry.daysSince > 90 ? '#fff7ed' :
            entry.daysSince > 30 ? '#fee2e2' : '#eff6ff';

    const lastVisitStr = entry.lastVisit.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return `
        <div class="list-item" style="border-left: 4px solid ${urgencyColor}; padding: 1rem 1.25rem;">
            <div class="list-item-content" style="flex:1;">
                <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;margin-bottom:0.35rem;">
                    <h4 style="margin:0;font-weight:700;">${escapeHTML(entry.name)}</h4>
                    <span style="background:${urgencyBg};color:${urgencyColor};padding:2px 8px;border-radius:12px;font-size:0.75rem;font-weight:700;">
                        ⏱️ ${entry.daysSince} dias sem retorno
                    </span>
                    ${entry.procedure ? `<span class="badge badge-gray" style="font-size:0.7rem;">${escapeHTML(entry.procedure)}</span>` : ''}
                </div>
                <div style="display:flex;gap:1.25rem;font-size:0.82rem;color:var(--gray-500);flex-wrap:wrap;">
                    <span>📱 ${escapeHTML(entry.phone || 'Sem telefone')}</span>
                    <span>📅 Última visita: ${lastVisitStr}</span>
                </div>
            </div>
            <div class="list-item-actions" style="flex-shrink:0;">
                ${entry.phone ? `
                <button class="btn btn-whatsapp btn-small" onclick="window.openWhatsApp('${escapeHTML(entry.phone)}')">
                    📱 WhatsApp
                </button>
                ` : ''}
                ${entry.patientId ? `
                <button class="btn btn-secondary btn-small" onclick="navigateToPatient('${entry.patientId}')">
                    👤 Ver Ficha
                </button>
                ` : ''}
                ${entry.leadId ? `
                <button class="btn btn-secondary btn-small" onclick="markRedFolderAsSold('${entry.leadId}')">
                    ✅ Fechou!
                </button>
                ` : ''}
            </div>
        </div>
    `;
}

function setRedFolderFilter(filter) {
    redFolderFilter = filter;
    renderRedFolder();
}

async function markRedFolderAsSold(leadId) {
    const lead = AppState.leads.find(l => l.id === leadId);
    if (!lead) return;
    if (!confirm(`Confirmar que "${lead.name}" fechou tratamento?`)) return;

    const idx = AppState.leads.indexOf(lead);
    AppState.leads[idx] = { ...lead, saleStatus: 'sold', status: 'converted' };

    await saveToStorage(STORAGE_KEYS.LEADS, AppState.leads);
    if (typeof isCloudConnected === 'function' && isCloudConnected()) {
        await updateRecord('leads', leadId, { saleStatus: 'sold', status: 'converted' });
    }

    showNotification(`✅ ${lead.name} marcado como fechado!`, 'success');
    renderRedFolder();
}

// Tornar disponível globalmente
window.initRedFolderModule = initRedFolderModule;
window.renderRedFolder = renderRedFolder;
window.setRedFolderFilter = setRedFolderFilter;
window.markRedFolderAsSold = markRedFolderAsSold;
