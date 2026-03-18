// campaigns-part3.js — Criação de Campanhas, Envio Real Z-API, Detalhes, Exports
// Carregado após campaigns-part2.js

// ===================
// CRIAR CAMPANHA
// ===================
function showCreateCampaignForm(preSelectedType = '') {
    const typeOptions = Object.entries(CAMPAIGN_TYPES).map(([k,t]) =>
        `<div class="campaign-type-option ${preSelectedType===k?'selected':''}" onclick="selectCampaignType('${k}')">
            <input type="radio" name="campaignType" id="type-${k}" value="${k}" ${preSelectedType===k?'checked':''} style="display:none;">
            <div style="font-size:1.5rem;">${t.icon}</div>
            <div style="font-size:.8rem; font-weight:600; color:var(--gray-800);">${t.label}</div>
        </div>`
    ).join('');

    const listOptions = CampaignsState.contactLists.length > 0
        ? CampaignsState.contactLists.map(l => `<option value="${l.id}">${escapeHTML(l.name)} (${l.valid_contacts} contatos)</option>`).join('')
        : '<option value="">Nenhuma lista disponível — importe primeiro</option>';

    openModal('📢 Nova Campanha', `
        <div style="display:grid; gap:1.5rem;">
            <!-- Nome -->
            <div class="form-group">
                <label class="form-label">Nome da Campanha *</label>
                <input type="text" id="campaignName" class="form-input" placeholder="Ex: Cobrança Março 2026">
            </div>

            <!-- Tipo -->
            <div class="form-group">
                <label class="form-label">Tipo de Campanha *</label>
                <div class="campaign-types-grid">${typeOptions}</div>
            </div>

            <!-- Template -->
            <div class="form-group">
                <label class="form-label">Template de Mensagem *</label>
                <select id="campaignTemplate" class="form-input" onchange="onTemplateSelected(this.value)">
                    <option value="">Selecione um template...</option>
                    ${CampaignsState.templates.map(t => {
                        const tp = CAMPAIGN_TYPES[t.type] || CAMPAIGN_TYPES.marketing;
                        return `<option value="${t.id}">${tp.icon} ${escapeHTML(t.name)}</option>`;
                    }).join('')}
                </select>
            </div>

            <!-- Preview template -->
            <div id="templatePreviewArea" style="display:none;">
                <label class="form-label" style="color:var(--gray-500); font-size:.8rem;">Preview da mensagem</label>
                <div id="templatePreviewContent" class="whatsapp-preview-container" style="max-height:200px; overflow-y:auto;"></div>
            </div>

            <!-- Lista de contatos -->
            <div class="form-group">
                <label class="form-label">Lista de Contatos *</label>
                <select id="campaignContactList" class="form-input">
                    <option value="">Selecione uma lista...</option>
                    ${listOptions}
                </select>
                <p style="font-size:.75rem; color:var(--gray-400); margin-top:.25rem;">
                    Sem lista? <a onclick="importContactsFromSystem(); closeModal();" style="cursor:pointer; color:var(--primary-500); text-decoration:underline;">Importar contatos do sistema</a>
                </p>
            </div>

            <!-- Agendamento -->
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Agendar para (opcional)</label>
                    <input type="datetime-local" id="campaignSchedule" class="form-input">
                    <p style="font-size:.75rem; color:var(--gray-400); margin-top:.25rem;">Deixe vazio para iniciar manualmente</p>
                </div>
                <div class="form-group">
                    <label class="form-label">Limite Diário</label>
                    <input type="number" id="campaignDailyLimit" class="form-input" value="${AppState?.settings?.zapiMsgDelay || 300}" min="1" max="1000">
                    <p style="font-size:.75rem; color:var(--gray-400); margin-top:.25rem;">Mensagens por dia</p>
                </div>
            </div>

            <!-- Ações -->
            <div style="display:flex; gap:1rem; justify-content:flex-end;">
                <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                <button class="btn btn-primary" onclick="saveCampaign()">💾 Criar Campanha</button>
            </div>
        </div>
    `, []);

    if (preSelectedType) selectCampaignType(preSelectedType);
}

function showCreateCampaignWithTemplate(templateId) {
    const tpl = CampaignsState.templates.find(t => t.id === templateId);
    showCreateCampaignForm(tpl ? tpl.type : '');
    setTimeout(() => {
        const sel = document.getElementById('campaignTemplate');
        if (sel) { sel.value = templateId; onTemplateSelected(templateId); }
    }, 100);
}

function selectCampaignType(type) {
    document.querySelectorAll('.campaign-type-option').forEach(el => el.classList.remove('selected'));
    const el = document.querySelector(`.campaign-type-option:has(#type-${type})`);
    if (el) el.classList.add('selected');
    const radio = document.getElementById(`type-${type}`);
    if (radio) radio.checked = true;
}

function onTemplateSelected(templateId) {
    if (!templateId) {
        document.getElementById('templatePreviewArea').style.display = 'none';
        return;
    }
    const tpl = CampaignsState.templates.find(t => t.id === templateId);
    if (!tpl) return;
    const preview = tpl.content.replace(/\n/g, '<br>').replace(/{{(\w+)}}/g, '<span style="color:#3b82f6; font-style:italic;">[$1]</span>');
    document.getElementById('templatePreviewArea').style.display = 'block';
    document.getElementById('templatePreviewContent').innerHTML = `
        <div class="whatsapp-screen" style="max-width:300px;">
            <div class="whatsapp-header"><div class="whatsapp-avatar">OC</div><div><div class="whatsapp-name">Odonto Company</div><div class="whatsapp-status">online</div></div></div>
            <div class="whatsapp-body"><div class="whatsapp-bubble">${preview}<div class="whatsapp-time">agora ✓✓</div></div></div>
        </div>`;
}

function saveCampaign() {
    const name = document.getElementById('campaignName').value.trim();
    const type = document.querySelector('input[name="campaignType"]:checked')?.value;
    const templateId = document.getElementById('campaignTemplate').value;
    const contactListId = document.getElementById('campaignContactList').value;
    const scheduledAt = document.getElementById('campaignSchedule').value;
    const dailyLimit = parseInt(document.getElementById('campaignDailyLimit').value) || 300;

    if (!name || !type || !templateId || !contactListId) {
        showNotification('Preencha todos os campos obrigatórios', 'error'); return;
    }

    const campaign = {
        id: generateId(), name, type,
        status: scheduledAt ? 'scheduled' : 'draft',
        template_id: templateId, contact_list_id: contactListId,
        scheduled_at: scheduledAt || null,
        timezone: 'America/Sao_Paulo', daily_limit: dailyLimit,
        current_day_count: 0, interval_min: AppState?.settings?.zapiMsgDelay || 8,
        interval_max: (AppState?.settings?.zapiMsgDelay || 8) + 7,
        total_sent: 0, total_delivered: 0, total_read: 0, total_failed: 0,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        started_at: null, completed_at: null
    };

    CampaignsState.campaigns.push(campaign);
    saveCampaignsData(); closeModal(); switchCampaignTab('campaigns');
    showNotification('✅ Campanha criada com sucesso!', 'success');
}

// ===================
// DETALHES DA CAMPANHA
// ===================
function showCampaignDetails(campaignId) {
    const campaign = CampaignsState.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    const t = CAMPAIGN_TYPES[campaign.type] || CAMPAIGN_TYPES.marketing;
    const template = CampaignsState.templates.find(tp => tp.id === campaign.template_id);
    const contactList = CampaignsState.contactLists.find(cl => cl.id === campaign.contact_list_id);
    const deliveryRate = campaign.total_sent > 0 ? Math.round((campaign.total_delivered/campaign.total_sent)*100) : 0;
    const readRate = campaign.total_delivered > 0 ? Math.round((campaign.total_read/campaign.total_delivered)*100) : 0;
    const failRate = campaign.total_sent > 0 ? Math.round((campaign.total_failed/campaign.total_sent)*100) : 0;

    openModal(`${t.icon} ${escapeHTML(campaign.name)}`, `
        <div style="display:grid; gap:1.5rem;">
            <div style="display:flex; align-items:center; gap:1rem; padding:1rem; background:var(--gray-50); border-radius:12px;">
                <div style="font-size:2.5rem;">${t.icon}</div>
                <div>
                    <div style="font-size:1.1rem; font-weight:700; color:var(--gray-900);">${escapeHTML(campaign.name)}</div>
                    <div style="font-size:.8rem; color:var(--gray-500);">${t.label} • ${getStatusLabel(campaign.status)} • Criada ${formatDate(campaign.created_at)}</div>
                </div>
                <span class="badge ${getStatusBadgeClass(campaign.status)}" style="margin-left:auto;">${getStatusLabel(campaign.status)}</span>
            </div>

            <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; text-align:center;">
                <div style="padding:1rem; background:var(--gray-50); border-radius:12px;">
                    <div style="font-size:1.5rem; font-weight:700; color:var(--primary-600);">${contactList?.valid_contacts||0}</div>
                    <div style="font-size:.75rem; color:var(--gray-500);">Contatos</div>
                </div>
                <div style="padding:1rem; background:var(--gray-50); border-radius:12px;">
                    <div style="font-size:1.5rem; font-weight:700; color:var(--primary-600);">${campaign.total_sent}</div>
                    <div style="font-size:.75rem; color:var(--gray-500);">Enviados</div>
                </div>
                <div style="padding:1rem; background:var(--gray-50); border-radius:12px;">
                    <div style="font-size:1.5rem; font-weight:700; color:var(--success-600);">${campaign.total_delivered}</div>
                    <div style="font-size:.75rem; color:var(--gray-500);">Entregues</div>
                </div>
                <div style="padding:1rem; background:var(--gray-50); border-radius:12px;">
                    <div style="font-size:1.5rem; font-weight:700; color:#ef4444;">${campaign.total_failed}</div>
                    <div style="font-size:.75rem; color:var(--gray-500);">Falhas</div>
                </div>
            </div>

            <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:1rem;">
                ${[['Taxa de Entrega', deliveryRate, 'var(--primary-500)'],['Taxa de Leitura', readRate, 'var(--success-500)'],['Taxa de Falha', failRate, '#ef4444']].map(([label, val, color]) => `
                <div style="padding:1rem; background:white; border:1px solid var(--gray-200); border-radius:12px;">
                    <div style="font-size:.75rem; color:var(--gray-500); margin-bottom:.5rem;">${label}</div>
                    <div style="font-size:1.5rem; font-weight:700; color:${color};">${val}%</div>
                    <div style="height:6px; background:var(--gray-100); border-radius:6px; overflow:hidden; margin-top:.5rem;">
                        <div style="height:100%; background:${color}; width:${val}%; transition:width .5s;"></div>
                    </div>
                </div>`).join('')}
            </div>

            ${template ? `
            <div>
                <h4 style="font-size:.85rem; font-weight:600; color:var(--gray-600); margin-bottom:.75rem;">Template da Mensagem</h4>
                <div style="background:var(--gray-50); padding:1rem; border-radius:10px; font-size:.875rem; white-space:pre-wrap; color:var(--gray-700); max-height:150px; overflow-y:auto;">${escapeHTML(template.content)}</div>
            </div>` : ''}

            <div style="display:flex; gap:1rem; justify-content:space-between; flex-wrap:wrap;">
                <div style="display:flex; gap:.75rem;">
                    ${campaign.status==='draft' ? `<button class="btn btn-primary" onclick="startCampaign('${campaign.id}'); closeModal()">▶️ Iniciar Campanha</button>` : ''}
                    ${campaign.status==='running' ? `<button class="btn btn-secondary" onclick="pauseCampaign('${campaign.id}'); closeModal()">⏸️ Pausar</button>` : ''}
                    ${campaign.status==='paused' ? `<button class="btn btn-primary" onclick="resumeCampaign('${campaign.id}'); closeModal()">▶️ Retomar</button>` : ''}
                    ${['running','paused'].includes(campaign.status) ? `<button class="btn btn-error" onclick="cancelCampaign('${campaign.id}'); closeModal()">❌ Cancelar</button>` : ''}
                </div>
                <div style="display:flex; gap:.75rem;">
                    <button class="btn btn-error" onclick="deleteCampaign('${campaign.id}'); closeModal()">🗑️ Excluir</button>
                    <button class="btn btn-secondary" onclick="closeModal()">Fechar</button>
                </div>
            </div>
        </div>
    `, []);
}

// ===================
// AÇÕES DE CAMPANHA (com envio real Z-API)
// ===================
function startCampaign(campaignId) {
    const campaign = CampaignsState.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    // Verifica Z-API configurada
    const zapiOk = !!(AppState?.settings?.zapiInstance && AppState?.settings?.zapiToken);
    if (!zapiOk) {
        showNotification('Configure a Z-API em Configurações antes de iniciar campanhas.', 'error');
        return;
    }

    const contactList = CampaignsState.contactLists.find(cl => cl.id === campaign.contact_list_id);
    const contacts = CampaignsState.contacts.filter(c => c.contact_list_id === campaign.contact_list_id && !c.is_blacklisted);

    if (!contactList || contacts.length === 0) {
        showNotification('Nenhum contato válido nesta lista.', 'error'); return;
    }

    campaign.status = 'running';
    campaign.started_at = new Date().toISOString();
    campaign.updated_at = new Date().toISOString();
    saveCampaignsData();

    switchCampaignTab('dashboard');
    showNotification(`🚀 Campanha "${campaign.name}" iniciada! ${contacts.length} mensagens para enviar.`, 'success');

    // Inicia o envio assíncrono
    executeCampaignSending(campaign, contacts);
}

let _sendingAborted = false;

async function executeCampaignSending(campaign, contacts) {
    _sendingAborted = false;
    const template = CampaignsState.templates.find(t => t.id === campaign.template_id);
    if (!template) { showNotification('Template não encontrado', 'error'); return; }

    const settings = AppState?.settings || {};
    const delaySec = settings.zapiMsgDelay || 8;
    const sendFrom = settings.zapiSendFrom || '08:00';
    const sendUntil = settings.zapiSendUntil || '20:00';

    CampaignsState.activeSend = { campaignId: campaign.id, total: contacts.length, sent: 0, failed: 0 };

    // Atualiza dashboard em tempo real
    const refreshDash = () => {
        if (CampaignsState.currentTab === 'dashboard') {
            const tc = document.getElementById('campaignTabContent');
            if (tc) tc.innerHTML = renderDashboardTab();
        }
    };
    refreshDash();

    for (let i = 0; i < contacts.length; i++) {
        if (_sendingAborted) break;

        // Verifica janela horária
        const now = new Date();
        const [fromH, fromM] = sendFrom.split(':').map(Number);
        const [untilH, untilM] = sendUntil.split(':').map(Number);
        const fromTotal = fromH * 60 + fromM;
        const untilTotal = untilH * 60 + untilM;
        const nowTotal = now.getHours() * 60 + now.getMinutes();

        if (nowTotal < fromTotal || nowTotal > untilTotal) {
            showNotification('⏰ Fora da janela de horário. Disparo pausado automaticamente.', 'warning');
            campaign.status = 'paused';
            campaign.updated_at = new Date().toISOString();
            CampaignsState.activeSend = null;
            saveCampaignsData();
            return;
        }

        const contact = contacts[i];
        const msg = buildMessage(template.content, contact);

        const result = await sendWhatsAppMessageZAPI(contact.phone, msg);

        const currentCampaign = CampaignsState.campaigns.find(c => c.id === campaign.id);
        if (!currentCampaign || currentCampaign.status === 'cancelled') break;

        if (result.success) {
            currentCampaign.total_sent = (currentCampaign.total_sent || 0) + 1;
            currentCampaign.total_delivered = (currentCampaign.total_delivered || 0) + 1;
            if (CampaignsState.activeSend) CampaignsState.activeSend.sent++;
        } else {
            currentCampaign.total_sent = (currentCampaign.total_sent || 0) + 1;
            currentCampaign.total_failed = (currentCampaign.total_failed || 0) + 1;
            if (CampaignsState.activeSend) { CampaignsState.activeSend.sent++; CampaignsState.activeSend.failed++; }
            console.warn('Falha ao enviar para', contact.phone, result.error);
        }

        saveCampaignsData();
        refreshDash();

        // Verifica se estava pausado
        if (currentCampaign.status === 'paused') {
            CampaignsState.activeSend = null; return;
        }

        // Delay randômico entre envios
        if (i < contacts.length - 1) {
            const randomDelay = (delaySec + Math.floor(Math.random() * 5)) * 1000;
            await new Promise(r => setTimeout(r, randomDelay));
        }
    }

    // Finaliza
    const finalCampaign = CampaignsState.campaigns.find(c => c.id === campaign.id);
    if (finalCampaign && finalCampaign.status !== 'cancelled' && finalCampaign.status !== 'paused') {
        finalCampaign.status = 'completed';
        finalCampaign.completed_at = new Date().toISOString();
        finalCampaign.updated_at = new Date().toISOString();
        saveCampaignsData();
        showNotification(`✅ Campanha "${campaign.name}" concluída! ${finalCampaign.total_sent} mensagens enviadas.`, 'success');
    }
    CampaignsState.activeSend = null;
    refreshDash();
}

function buildMessage(content, contact) {
    const vars = {
        nome: contact.name || 'Cliente',
        telefone: contact.phone,
        email: contact.email || '',
        ...(contact.variables || {})
    };
    let msg = content;
    Object.entries(vars).forEach(([k, v]) => {
        msg = msg.replace(new RegExp(`{{${k}}}`, 'g'), v);
    });
    return msg;
}

function stopActiveSending() {
    _sendingAborted = true;
    const campaign = CampaignsState.campaigns.find(c => c.id === CampaignsState.activeSend?.campaignId);
    if (campaign) {
        campaign.status = 'paused';
        campaign.updated_at = new Date().toISOString();
        saveCampaignsData();
    }
    CampaignsState.activeSend = null;
    switchCampaignTab('dashboard');
    showNotification('Campanha pausada manualmente', 'info');
}

function pauseCampaign(campaignId) {
    const campaign = CampaignsState.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    campaign.status = 'paused'; campaign.updated_at = new Date().toISOString();
    _sendingAborted = true;
    saveCampaignsData();
    switchCampaignTab('campaigns');
    showNotification('Campanha pausada', 'info');
}

function resumeCampaign(campaignId) {
    const campaign = CampaignsState.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    campaign.status = 'running'; campaign.updated_at = new Date().toISOString();
    saveCampaignsData();
    const contacts = CampaignsState.contacts.filter(c =>
        c.contact_list_id === campaign.contact_list_id && !c.is_blacklisted
    );
    const remaining = contacts.slice(campaign.total_sent || 0);
    switchCampaignTab('dashboard');
    showNotification('Campanha retomada!', 'success');
    if (remaining.length > 0) executeCampaignSending(campaign, remaining);
}

function cancelCampaign(campaignId) {
    if (!confirm('Cancelar esta campanha?')) return;
    const campaign = CampaignsState.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    campaign.status = 'cancelled'; campaign.updated_at = new Date().toISOString();
    _sendingAborted = true;
    CampaignsState.activeSend = null;
    saveCampaignsData();
    switchCampaignTab('campaigns');
    showNotification('Campanha cancelada', 'info');
}

function deleteCampaign(campaignId) {
    if (!confirm('Excluir esta campanha? Esta ação não pode ser desfeita.')) return;
    CampaignsState.campaigns = CampaignsState.campaigns.filter(c => c.id !== campaignId);
    saveCampaignsData();
    switchCampaignTab('campaigns');
    showNotification('Campanha excluída', 'success');
}

// ===================
// STATUS HELPERS
// ===================
function getStatusLabel(status) {
    const map = { draft:'Rascunho', scheduled:'Agendada', running:'Em Andamento', completed:'Concluída', cancelled:'Cancelada', paused:'Pausada' };
    return map[status] || status;
}

function getStatusBadgeClass(status) {
    const map = { draft:'badge-gray', scheduled:'badge-warning', running:'badge-primary', completed:'badge-success', cancelled:'badge-error', paused:'badge-warning' };
    return map[status] || 'badge-gray';
}

// ===================
// EXPORTS GLOBAIS
// ===================
window.initCampaignsModule = initCampaignsModule;
window.renderCampaignsModule = renderCampaignsModule;
window.switchCampaignTab = switchCampaignTab;
window.renderCampaignTabContent = renderCampaignTabContent;
window.renderDashboardTab = renderDashboardTab;
window.showCreateCampaignForm = showCreateCampaignForm;
window.showCreateCampaignWithTemplate = showCreateCampaignWithTemplate;
window.selectCampaignType = selectCampaignType;
window.onTemplateSelected = onTemplateSelected;
window.saveCampaign = saveCampaign;
window.showCampaignDetails = showCampaignDetails;
window.startCampaign = startCampaign;
window.pauseCampaign = pauseCampaign;
window.resumeCampaign = resumeCampaign;
window.cancelCampaign = cancelCampaign;
window.deleteCampaign = deleteCampaign;
window.stopActiveSending = stopActiveSending;
window.getStatusLabel = getStatusLabel;
window.getStatusBadgeClass = getStatusBadgeClass;
window.buildMessage = buildMessage;
