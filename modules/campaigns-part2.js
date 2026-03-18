// campaigns-part2.js — Lista, Templates, Contatos, Blacklist, Criação
// Carregado após campaigns.js principal

// ===================
// CAMPAIGNS LIST TAB
// ===================
function renderCampaignListTab() {
    let filtered = [...CampaignsState.campaigns];
    if (CampaignsState.filterStatus !== 'all') filtered = filtered.filter(c => c.status === CampaignsState.filterStatus);
    if (CampaignsState.filterType !== 'all') filtered = filtered.filter(c => c.type === CampaignsState.filterType);
    if (CampaignsState.searchTerm) {
        const term = CampaignsState.searchTerm.toLowerCase();
        filtered = filtered.filter(c => c.name.toLowerCase().includes(term));
    }
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem;">
            <div style="display:flex; gap:.5rem; flex-wrap:wrap;">
                ${['all','draft','scheduled','running','paused','completed','cancelled'].map(s =>
                    `<button class="btn btn-small ${CampaignsState.filterStatus===s?'btn-primary':'btn-secondary'}" onclick="filterCampaigns('${s}','${CampaignsState.filterType}')">${s==='all'?'Todas':getStatusLabel(s)}</button>`
                ).join('')}
            </div>
            <div style="display:flex; gap:.75rem;">
                <input type="text" class="form-input" style="width:200px;" placeholder="🔍 Buscar..." value="${CampaignsState.searchTerm}" oninput="CampaignsState.searchTerm=this.value;document.getElementById('campaignTabContent').innerHTML=renderCampaignTabContent()">
                <button class="btn btn-primary" onclick="showCreateCampaignForm()">➕ Nova Campanha</button>
            </div>
        </div>
        <div style="display:flex; flex-direction:column; gap:1rem;">
            ${filtered.length === 0 ? `
                <div class="empty-state">
                    <div class="empty-state-icon">📢</div>
                    <h3>Nenhuma campanha encontrada</h3>
                    <p>${CampaignsState.searchTerm ? 'Ajuste o filtro ou busca.' : 'Crie sua primeira campanha!'}</p>
                    <button class="btn btn-primary" onclick="showCreateCampaignForm()" style="margin-top:1rem;">➕ Criar Campanha</button>
                </div>
            ` : filtered.map(campaign => {
                const t = CAMPAIGN_TYPES[campaign.type] || CAMPAIGN_TYPES.marketing;
                const progress = campaign.total_sent > 0 ? Math.round((campaign.total_delivered/campaign.total_sent)*100) : 0;
                const contactList = CampaignsState.contactLists.find(cl => cl.id === campaign.contact_list_id);
                return `
                <div class="campaign-card-premium" onclick="showCampaignDetails('${campaign.id}')">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <div style="display:flex; align-items:center; gap:1rem;">
                            <div class="campaign-type-badge" style="background:${t.gradient};">${t.icon}</div>
                            <div>
                                <h4 style="margin:0; font-size:1rem; color:var(--gray-900);">${escapeHTML(campaign.name)}</h4>
                                <p style="margin:.25rem 0 0; font-size:.8rem; color:var(--gray-500);">
                                    ${t.label} • Criada em ${formatDate(campaign.created_at)}
                                    ${campaign.scheduled_at ? ` • ⏰ ${formatDateTime(campaign.scheduled_at)}` : ''}
                                    ${contactList ? ` • 👥 ${escapeHTML(contactList.name)}` : ''}
                                </p>
                            </div>
                        </div>
                        <div style="display:flex; align-items:center; gap:.75rem;" onclick="event.stopPropagation()">
                            <span class="badge ${getStatusBadgeClass(campaign.status)}">${getStatusLabel(campaign.status)}</span>
                            ${campaign.status === 'draft' ? `<button class="btn btn-primary btn-small" onclick="startCampaign('${campaign.id}')">▶️ Iniciar</button>` : ''}
                            ${campaign.status === 'running' ? `<button class="btn btn-secondary btn-small" onclick="pauseCampaign('${campaign.id}')">⏸️ Pausar</button>` : ''}
                            ${campaign.status === 'paused' ? `<button class="btn btn-primary btn-small" onclick="resumeCampaign('${campaign.id}')">▶️ Retomar</button>` : ''}
                            <button class="btn btn-error btn-small" onclick="deleteCampaign('${campaign.id}')">🗑️</button>
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:.75rem; margin-top:1rem; text-align:center;">
                        <div class="cstat-mini"><div>${contactList ? contactList.valid_contacts : 0}</div><div>Contatos</div></div>
                        <div class="cstat-mini"><div style="color:var(--primary-600)">${campaign.total_sent}</div><div>Enviados</div></div>
                        <div class="cstat-mini"><div style="color:var(--success-600)">${campaign.total_delivered}</div><div>Entregues</div></div>
                        <div class="cstat-mini"><div style="color:#ef4444">${campaign.total_failed}</div><div>Falhas</div></div>
                    </div>
                    ${campaign.total_sent > 0 ? `
                    <div style="margin-top:.75rem;">
                        <div style="display:flex; justify-content:space-between; font-size:.7rem; color:var(--gray-500); margin-bottom:3px;">
                            <span>Taxa de Entrega</span><span>${progress}%</span>
                        </div>
                        <div style="height:6px; background:var(--gray-100); border-radius:6px; overflow:hidden;">
                            <div style="height:100%; background:${t.gradient}; width:${progress}%; transition:width .5s;"></div>
                        </div>
                    </div>` : ''}
                </div>`;
            }).join('')}
        </div>
    `;
}

function filterCampaigns(status, type='all') {
    CampaignsState.filterStatus = status;
    CampaignsState.filterType = type;
    const tabContent = document.getElementById('campaignTabContent');
    if (tabContent) tabContent.innerHTML = renderCampaignTabContent();
}

// ===================
// TEMPLATES TAB
// ===================
function renderTemplatesTab() {
    const categories = [...new Set(CampaignsState.templates.map(t => t.category || 'Outros'))];
    return `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
            <div>
                <h3 style="margin:0; font-size:1rem; color:var(--gray-800);">📝 Biblioteca de Templates</h3>
                <p style="margin:.25rem 0 0; font-size:.8rem; color:var(--gray-500);">${CampaignsState.templates.length} templates disponíveis</p>
            </div>
            <button class="btn btn-primary" onclick="showCreateTemplateForm()">➕ Novo Template</button>
        </div>
        ${categories.map(cat => `
            <div style="margin-bottom:2rem;">
                <h4 style="font-size:.85rem; font-weight:700; color:var(--gray-600); text-transform:uppercase; letter-spacing:.05em; margin-bottom:1rem; padding-bottom:.5rem; border-bottom:2px solid var(--gray-100);">${cat}</h4>
                <div class="templates-grid">
                    ${CampaignsState.templates.filter(t => (t.category || 'Outros') === cat).map(tpl => {
                        const tp = CAMPAIGN_TYPES[tpl.type] || CAMPAIGN_TYPES.marketing;
                        return `
                        <div class="template-card" onclick="previewTemplate('${tpl.id}')">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:.75rem;">
                                <div style="display:flex; align-items:center; gap:.5rem;">
                                    <span style="font-size:1.25rem;">${tp.icon}</span>
                                    <span style="font-size:.7rem; padding:.2rem .5rem; background:${tp.color}20; color:${tp.color}; border-radius:20px; font-weight:600;">${tp.label}</span>
                                </div>
                                <div style="display:flex; gap:.25rem;" onclick="event.stopPropagation()">
                                    <button class="btn btn-small btn-secondary" onclick="editTemplate('${tpl.id}')" title="Editar">✏️</button>
                                    <button class="btn btn-small btn-error" onclick="deleteTemplate('${tpl.id}')" title="Excluir">🗑️</button>
                                </div>
                            </div>
                            <div style="font-weight:600; font-size:.875rem; color:var(--gray-900); margin-bottom:.5rem;">${escapeHTML(tpl.name)}</div>
                            <div style="font-size:.8rem; color:var(--gray-600); line-height:1.5;">${escapeHTML(tpl.content.substring(0,120))}${tpl.content.length>120?'...':''}</div>
                            <div style="margin-top:.75rem; font-size:.7rem; color:var(--primary-500);">
                                ${(tpl.variables||[]).map(v => `<code style="background:#eff6ff;padding:1px 4px;border-radius:3px;">{{${v}}}</code>`).join(' ')}
                            </div>
                            <button class="btn btn-primary btn-small" style="width:100%; margin-top:.75rem;" onclick="event.stopPropagation(); showCreateCampaignWithTemplate('${tpl.id}')">📢 Usar Template</button>
                        </div>`;
                    }).join('')}
                </div>
            </div>
        `).join('')}
    `;
}

function previewTemplate(templateId) {
    const tpl = CampaignsState.templates.find(t => t.id === templateId);
    if (!tpl) return;
    const tp = CAMPAIGN_TYPES[tpl.type] || CAMPAIGN_TYPES.marketing;
    const samples = { nome:'Ana Silva', unidade:'Odonto Company', valor:'150,00', data_vencimento:'25/03/2026',
        horario:'14:30', dentista:'Dr. João', desconto:'20', chave_pix:'11999999999',
        endereco:'Rua das Flores, 100', link_agendamento:'bit.ly/agendar',
        telefone_clinica:'(11) 99999-9999', meses_ausente:'6', nome_atendente:'Carlos',
        tratamento:'Aparelho Fixo', data_validade:'30/03/2026', valor_bonus:'100,00',
        valor_aparelho:'299,00', valor_original:'800,00', valor_promocional:'600,00' };
    let preview = tpl.content;
    (tpl.variables||[]).forEach(v => {
        preview = preview.replace(new RegExp(`{{${v}}}`, 'g'), samples[v] || `[${v}]`);
    });

    openModal(`📝 ${escapeHTML(tpl.name)}`, `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:2rem;">
            <div>
                <h4 style="font-size:.85rem; font-weight:600; color:var(--gray-600); margin-bottom:.75rem;">Template Original</h4>
                <div style="background:var(--gray-50); padding:1rem; border-radius:10px; font-size:.875rem; white-space:pre-wrap; color:var(--gray-700); border:1px solid var(--gray-200); max-height:300px; overflow-y:auto;">${escapeHTML(tpl.content)}</div>
                <div style="margin-top:.75rem; font-size:.75rem; color:var(--gray-500);">
                    Tipo: <span style="color:${tp.color}; font-weight:600;">${tp.icon} ${tp.label}</span>
                </div>
            </div>
            <div>
                <h4 style="font-size:.85rem; font-weight:600; color:var(--gray-600); margin-bottom:.75rem;">Preview WhatsApp</h4>
                <div class="whatsapp-preview-container">
                    <div class="whatsapp-screen">
                        <div class="whatsapp-header">
                            <div class="whatsapp-avatar">OC</div>
                            <div><div class="whatsapp-name">Odonto Company</div><div class="whatsapp-status">online</div></div>
                        </div>
                        <div class="whatsapp-body">
                            <div class="whatsapp-bubble">${preview.replace(/\n/g,'<br>')}<div class="whatsapp-time">13:42 ✓✓</div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div style="display:flex; gap:1rem; margin-top:1.5rem; justify-content:flex-end;">
            <button class="btn btn-secondary" onclick="editTemplate('${tpl.id}'); closeModal()">✏️ Editar</button>
            <button class="btn btn-primary" onclick="showCreateCampaignWithTemplate('${tpl.id}'); closeModal()">📢 Criar Campanha</button>
            <button class="btn btn-secondary" onclick="closeModal()">Fechar</button>
        </div>
    `, []);
}

function showCreateTemplateForm(tplId=null) {
    const existing = tplId ? CampaignsState.templates.find(t => t.id === tplId) : null;
    const typeOptions = Object.entries(CAMPAIGN_TYPES).map(([k,t]) =>
        `<option value="${k}" ${existing?.type===k?'selected':''}>${t.icon} ${t.label}</option>`
    ).join('');
    openModal(existing ? 'Editar Template' : 'Novo Template', `
        <div style="display:grid; gap:1.25rem;">
            <div class="form-group"><label class="form-label">Nome *</label>
                <input type="text" id="tplName" class="form-input" value="${escapeHTML(existing?.name||'')}" placeholder="Ex: Cobrança Suave"></div>
            <div class="form-row">
                <div class="form-group"><label class="form-label">Tipo *</label>
                    <select id="tplType" class="form-input"><option value="">Selecione...</option>${typeOptions}</select></div>
                <div class="form-group"><label class="form-label">Categoria</label>
                    <input type="text" id="tplCategory" class="form-input" value="${escapeHTML(existing?.category||'')}" placeholder="Ex: Cobranças"></div>
            </div>
            <div class="form-group">
                <label class="form-label">Mensagem *</label>
                <p style="font-size:.75rem; color:var(--gray-500); margin-bottom:.5rem;">Use {{nome}}, {{unidade}}, {{valor}} para variáveis dinâmicas</p>
                <textarea id="tplContent" class="form-input" rows="8" placeholder="Olá {{nome}}! ...">${escapeHTML(existing?.content||'')}</textarea>
            </div>
            <div style="display:flex; gap:1rem; justify-content:flex-end;">
                <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                <button class="btn btn-primary" onclick="saveTemplate('${tplId||''}')">💾 Salvar Template</button>
            </div>
        </div>
    `, []);
}

function editTemplate(id) { showCreateTemplateForm(id); }

function saveTemplate(tplId) {
    const name = document.getElementById('tplName').value.trim();
    const type = document.getElementById('tplType').value;
    const content = document.getElementById('tplContent').value.trim();
    const category = document.getElementById('tplCategory').value.trim();
    if (!name||!type||!content) { showNotification('Preencha todos os campos obrigatórios','error'); return; }
    const variables = [...new Set([...content.matchAll(/{{(\w+)}}/g)].map(m => m[1]))];
    if (tplId) {
        const idx = CampaignsState.templates.findIndex(t => t.id === tplId);
        if (idx>-1) CampaignsState.templates[idx] = {...CampaignsState.templates[idx], name, type, content, category, variables};
    } else {
        CampaignsState.templates.push({id:generateId(), name, type, category, content, variables, is_active:true, created_at:new Date().toISOString()});
    }
    saveCampaignsData(); closeModal(); switchCampaignTab('templates');
    showNotification('Template salvo!','success');
}

function deleteTemplate(id) {
    if (!confirm('Excluir este template?')) return;
    CampaignsState.templates = CampaignsState.templates.filter(t => t.id !== id);
    saveCampaignsData(); switchCampaignTab('templates');
    showNotification('Template excluído','success');
}

// ===================
// CONTACTS TAB
// ===================
function renderContactsTab() {
    return `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem;">
            <div>
                <h3 style="margin:0; font-size:1rem; color:var(--gray-800);">👥 Listas de Contatos</h3>
                <p style="margin:.25rem 0 0; font-size:.8rem; color:var(--gray-500);">${CampaignsState.contactLists.length} listas • ${CampaignsState.contacts.length} contatos</p>
            </div>
            <div style="display:flex; gap:.75rem; flex-wrap:wrap;">
                <button class="btn btn-secondary" onclick="importContactsFromSystem()">🔗 Importar do Sistema</button>
                <button class="btn btn-secondary" onclick="showImportContactsModal()">📥 Importar CSV</button>
                <button class="btn btn-primary" onclick="showCreateContactListForm()">➕ Nova Lista</button>
            </div>
        </div>
        ${CampaignsState.contactLists.length === 0 ? `
            <div class="empty-state"><div class="empty-state-icon">👥</div><h3>Nenhuma lista de contatos</h3>
                <p>Importe do sistema ou crie manualmente.</p>
                <button class="btn btn-primary" style="margin-top:1rem;" onclick="importContactsFromSystem()">🔗 Importar do Sistema</button></div>
        ` : `
            <div style="display:grid; gap:1rem;">
                ${CampaignsState.contactLists.map(list => {
                    const contacts = CampaignsState.contacts.filter(c => c.contact_list_id === list.id);
                    const valid = contacts.filter(c => !c.is_blacklisted).length;
                    return `
                    <div class="card" style="padding:1.25rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
                        <div>
                            <div style="font-weight:700; font-size:.95rem; color:var(--gray-900);">${escapeHTML(list.name)}</div>
                            <div style="font-size:.8rem; color:var(--gray-500); margin-top:.25rem;">${escapeHTML(list.description||'')}</div>
                            <div style="display:flex; gap:1rem; margin-top:.5rem;">
                                <span style="font-size:.8rem; color:var(--gray-600);">👥 ${contacts.length} total</span>
                                <span style="font-size:.8rem; color:var(--success-600);">✅ ${valid} válidos</span>
                                <span style="font-size:.8rem; color:#ef4444;">🚫 ${contacts.length-valid} bloqueados</span>
                            </div>
                        </div>
                        <div style="display:flex; gap:.5rem;">
                            <button class="btn btn-secondary btn-small" onclick="viewContactList('${list.id}')">👁️ Ver</button>
                            <button class="btn btn-error btn-small" onclick="deleteContactList('${list.id}')">🗑️</button>
                        </div>
                    </div>`;
                }).join('')}
            </div>
        `}
    `;
}

function importContactsFromSystem() {
    const p = AppState?.patients?.length||0, l = AppState?.leads?.length||0;
    const rf = AppState?.patients?.filter(pt=>pt.status==='red_folder')?.length||0;
    const today = new Date();
    const bday = AppState?.patients?.filter(pt => { if(!pt.phone||!pt.birthdate) return false; try{return new Date(pt.birthdate).getMonth()===today.getMonth();}catch(e){return false;} })?.length||0;

    openModal('🔗 Importar Contatos do Sistema', `
        <p style="color:var(--gray-600); margin-bottom:1.5rem; font-size:.875rem;">Selecione o grupo para importar como lista:</p>
        <div style="display:flex; flex-direction:column; gap:1rem;">
            <div class="import-source-card" onclick="executeImportFromSystem('patients')">
                <div style="font-size:2rem;">👥</div>
                <div><strong>Todos os Pacientes</strong><br><span style="font-size:.8rem; color:var(--gray-500);">${p} pacientes cadastrados</span></div>
                <span class="badge badge-primary">${p}</span>
            </div>
            <div class="import-source-card" onclick="executeImportFromSystem('leads')">
                <div style="font-size:2rem;">💬</div>
                <div><strong>Todos os Leads</strong><br><span style="font-size:.8rem; color:var(--gray-500);">${l} leads no CRM</span></div>
                <span class="badge badge-primary">${l}</span>
            </div>
            <div class="import-source-card" onclick="executeImportFromSystem('red_folder')">
                <div style="font-size:2rem;">🚩</div>
                <div><strong>Pasta Vermelha</strong><br><span style="font-size:.8rem; color:var(--gray-500);">${rf} que não fecharam</span></div>
                <span class="badge badge-error">${rf}</span>
            </div>
            <div class="import-source-card" onclick="executeImportFromSystem('birthdays')">
                <div style="font-size:2rem;">🎂</div>
                <div><strong>Aniversariantes do Mês</strong><br><span style="font-size:.8rem; color:var(--gray-500);">${bday} aniversariam este mês</span></div>
                <span class="badge badge-warning">${bday}</span>
            </div>
        </div>
        <div style="display:flex; justify-content:flex-end; margin-top:1.5rem;">
            <button class="btn btn-secondary" onclick="closeModal()">Fechar</button>
        </div>
    `, []);
}

function executeImportFromSystem(source) {
    let contacts = [], listName = '';
    const today = new Date();
    const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    if (source==='patients') {
        contacts=(AppState?.patients||[]).filter(p=>p.phone).map(p=>({id:generateId(),name:p.name||'Paciente',phone:p.phone,email:p.email||'',status:'valid',is_blacklisted:false,variables:{unidade:'Odonto Company São José'},created_at:new Date().toISOString()}));
    } else if (source==='leads') {
        listName='Leads — '+new Date().toLocaleDateString('pt-BR');
        contacts=(AppState?.leads||[]).filter(l=>l.phone).map(l=>({id:generateId(),name:l.name||'Lead',phone:l.phone,email:l.email||'',status:'valid',is_blacklisted:false,variables:{unidade:'Odonto Company São José'},created_at:new Date().toISOString()}));
    } else if (source==='red_folder') {
        listName='Pasta Vermelha — '+new Date().toLocaleDateString('pt-BR');
        contacts=(AppState?.patients||[]).filter(p=>p.status==='red_folder'&&p.phone).map(p=>({id:generateId(),name:p.name||'Paciente',phone:p.phone,email:p.email||'',status:'valid',is_blacklisted:false,variables:{unidade:'Odonto Company São José'},created_at:new Date().toISOString()}));
    } else if (source==='birthdays') {
        listName=`Aniversariantes de ${months[today.getMonth()]} ${today.getFullYear()}`;
        contacts=(AppState?.patients||[]).filter(p=>{if(!p.phone||!p.birthdate)return false;try{return new Date(p.birthdate).getMonth()===today.getMonth();}catch(e){return false;}}).map(p=>({id:generateId(),name:p.name||'Paciente',phone:p.phone,email:p.email||'',status:'valid',is_blacklisted:false,variables:{unidade:'Odonto Company São José'},created_at:new Date().toISOString()}));
    }
    contacts=contacts.filter(c=>!CampaignsState.blacklist.find(b=>b.phone===c.phone));
    if (contacts.length===0){showNotification('Nenhum contato com telefone encontrado.','warning');return;}
    const listId=generateId();
    const newList={id:listId,name:listName,description:`Importado — ${source}`,total_contacts:contacts.length,valid_contacts:contacts.length,created_at:new Date().toISOString(),updated_at:new Date().toISOString()};
    contacts.forEach(c=>c.contact_list_id=listId);
    CampaignsState.contactLists.push(newList);
    CampaignsState.contacts.push(...contacts);
    saveCampaignsData(); closeModal(); switchCampaignTab('contacts');
    showNotification(`✅ ${contacts.length} contatos importados como "${listName}"!`,'success');
}

function showCreateContactListForm() {
    openModal('Nova Lista de Contatos', `
        <div style="display:grid; gap:1rem;">
            <div class="form-group"><label class="form-label">Nome *</label><input type="text" id="listName" class="form-input" placeholder="Ex: Pacientes Inativos 2026"></div>
            <div class="form-group"><label class="form-label">Descrição</label><input type="text" id="listDesc" class="form-input" placeholder="Opcional"></div>
            <div style="display:flex; gap:1rem; justify-content:flex-end;">
                <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                <button class="btn btn-primary" onclick="saveContactList()">Criar Lista</button>
            </div>
        </div>
    `, []);
}

function saveContactList() {
    const name=document.getElementById('listName').value.trim();
    if(!name){showNotification('Nome é obrigatório','error');return;}
    CampaignsState.contactLists.push({id:generateId(),name,description:document.getElementById('listDesc').value.trim(),total_contacts:0,valid_contacts:0,created_at:new Date().toISOString(),updated_at:new Date().toISOString()});
    saveCampaignsData(); closeModal(); switchCampaignTab('contacts');
    showNotification('Lista criada!','success');
}

function viewContactList(listId) {
    const list=CampaignsState.contactLists.find(l=>l.id===listId);
    if(!list) return;
    const contacts=CampaignsState.contacts.filter(c=>c.contact_list_id===listId);
    
    openModal(`👥 ${escapeHTML(list.name)}`, `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <div>
                <p style="margin:0; font-size:.875rem; color:var(--gray-500);">${contacts.length} contatos encontrados</p>
            </div>
            <button class="btn btn-primary btn-small" onclick="showContactForm('${listId}')" style="display:flex; align-items:center; gap:5px;">
                <span>➕ Adicionar Contato</span>
            </button>
        </div>
        
        <div style="max-height:400px; overflow-y:auto; border:1px solid var(--gray-100); border-radius:8px;">
            <table style="width:100%; border-collapse:collapse; font-size:.875rem;">
                <thead><tr style="background:var(--gray-50);">
                    <th style="padding:.75rem 1rem; text-align:left;">Nome</th>
                    <th style="padding:.75rem 1rem; text-align:left;">Telefone</th>
                    <th style="padding:.75rem 1rem; text-align:left;">Status</th>
                    <th style="padding:.75rem 1rem; text-align:center;">Ações</th>
                </tr></thead>
                <tbody>${contacts.length === 0 ? `
                    <tr><td colspan="4" style="text-align:center;color:var(--gray-400);padding:3rem;">Nenhum contato nesta lista</td></tr>
                ` : contacts.map(c=>`
                    <tr style="border-top:1px solid var(--gray-100); transition:background .2s;" class="table-row-hover">
                        <td style="padding:.75rem 1rem;">${escapeHTML(c.name)}</td>
                        <td style="padding:.75rem 1rem;">${escapeHTML(c.phone)}</td>
                        <td style="padding:.75rem 1rem;">
                            <span class="badge ${c.is_blacklisted?'badge-error':'badge-success'}">
                                ${c.is_blacklisted?'Bloqueado':'Válido'}
                            </span>
                        </td>
                        <td style="padding:.75rem 1rem; text-align:center; display:flex; justify-content:center; gap:.5rem;">
                            <button class="btn btn-secondary btn-small" onclick="showContactForm('${listId}', '${c.id}')" title="Editar">✏️</button>
                            <button class="btn btn-secondary btn-small" onclick="deleteContactFromList('${c.id}', '${listId}')" title="Excluir" style="color:var(--error-500);">🗑️</button>
                        </td>
                    </tr>`).join('')}</tbody>
            </table>
        </div>
        <div style="display:flex; justify-content:flex-end; margin-top:1.5rem;">
            <button class="btn btn-secondary" onclick="closeModal()">Fechar</button>
        </div>
    `, []);
}

function showContactForm(listId, contactId = null) {
    const contact = contactId ? CampaignsState.contacts.find(c => c.id === contactId) : null;
    const title = contact ? '✏️ Editar Contato' : '➕ Novo Contato';
    
    // Extraindo variáveis para facilitar edição
    const vars = contact?.variables || { unidade: 'Odonto Company São José' };
    
    openModal(title, `
        <div style="display:grid; gap:1.25rem;">
            <div class="form-group">
                <label class="form-label">Nome Completo *</label>
                <input type="text" id="mContactName" class="form-input" placeholder="Ex: Maria Silva" value="${contact ? escapeHTML(contact.name) : ''}">
            </div>
            
            <div class="form-group">
                <label class="form-label">WhatsApp / Telefone *</label>
                <input type="text" id="mContactPhone" class="form-input" placeholder="Ex: 11999999999" value="${contact ? escapeHTML(contact.phone) : ''}">
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
                <div class="form-group">
                    <label class="form-label">Valor de Cobrança (Opcional)</label>
                    <input type="text" id="mContactValue" class="form-input" placeholder="Ex: R$ 150,00" value="${vars.valor || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Data de Vencimento (Opcional)</label>
                    <input type="text" id="mContactDueDate" class="form-input" placeholder="Ex: 15/05/2026" value="${vars.data_vencimento || ''}">
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">E-mail (Opcional)</label>
                <input type="email" id="mContactEmail" class="form-input" placeholder="Ex: maria@gmail.com" value="${contact ? escapeHTML(contact.email) : ''}">
            </div>

            <div style="display:flex; gap:1rem; justify-content:flex-end; margin-top:.5rem;">
                <button class="btn btn-secondary" onclick="viewContactList('${listId}')">Voltar</button>
                <button class="btn btn-primary" onclick="saveManualContact('${listId}', ${contactId ? `'${contactId}'` : 'null'})">Salvar Contato</button>
            </div>
        </div>
    `, []);
}

function saveManualContact(listId, contactId) {
    const name = document.getElementById('mContactName').value.trim();
    const phone = document.getElementById('mContactPhone').value.trim().replace(/\D/g, '');
    const email = document.getElementById('mContactEmail').value.trim();
    const value = document.getElementById('mContactValue').value.trim();
    const dueDate = document.getElementById('mContactDueDate').value.trim();

    if (!name || !phone) {
        showNotification('Nome e Telefone são obrigatórios', 'error');
        return;
    }

    if (phone.length < 10) {
        showNotification('Telefone inválido', 'error');
        return;
    }

    const vars = { 
        unidade: 'Odonto Company São José',
        valor: value,
        data_vencimento: dueDate
    };

    if (contactId) {
        // Atualizar existente
        const idx = CampaignsState.contacts.findIndex(c => c.id === contactId);
        if (idx !== -1) {
            CampaignsState.contacts[idx] = {
                ...CampaignsState.contacts[idx],
                name,
                phone,
                email,
                variables: { ...CampaignsState.contacts[idx].variables, ...vars }
            };
        }
    } else {
        // Criar novo
        const isBlacklisted = CampaignsState.blacklist.some(b => b.phone === phone);
        CampaignsState.contacts.push({
            id: generateId(),
            contact_list_id: listId,
            name,
            phone,
            email,
            status: 'valid',
            is_blacklisted: isBlacklisted,
            variables: vars,
            created_at: new Date().toISOString()
        });
    }

    // Atualizar contadores da lista
    const listIdx = CampaignsState.contactLists.findIndex(l => l.id === listId);
    if (listIdx !== -1) {
        const listContacts = CampaignsState.contacts.filter(c => c.contact_list_id === listId);
        CampaignsState.contactLists[listIdx].total_contacts = listContacts.length;
        CampaignsState.contactLists[listIdx].valid_contacts = listContacts.filter(c => !c.is_blacklisted).length;
        CampaignsState.contactLists[listIdx].updated_at = new Date().toISOString();
    }

    saveCampaignsData();
    viewContactList(listId);
    showNotification('Contato salvo com sucesso!', 'success');
}

function deleteContactFromList(contactId, listId) {
    if (!confirm('Deseja realmente remover este contato da lista?')) return;

    CampaignsState.contacts = CampaignsState.contacts.filter(c => c.id !== contactId);

    // Atualizar contadores
    const listIdx = CampaignsState.contactLists.findIndex(l => l.id === listId);
    if (listIdx !== -1) {
        const listContacts = CampaignsState.contacts.filter(c => c.contact_list_id === listId);
        CampaignsState.contactLists[listIdx].total_contacts = listContacts.length;
        CampaignsState.contactLists[listIdx].valid_contacts = listContacts.filter(c => !c.is_blacklisted).length;
        CampaignsState.contactLists[listIdx].updated_at = new Date().toISOString();
    }

    saveCampaignsData();
    viewContactList(listId);
    showNotification('Contato removido', 'success');
}

function deleteContactList(listId) {
    if(!confirm('Excluir esta lista e todos os seus contatos?')) return;
    CampaignsState.contactLists=CampaignsState.contactLists.filter(l=>l.id!==listId);
    CampaignsState.contacts=CampaignsState.contacts.filter(c=>c.contact_list_id!==listId);
    saveCampaignsData(); switchCampaignTab('contacts');
    showNotification('Lista excluída','success');
}

function showImportContactsModal() {
    openModal('📥 Importar CSV / Excel', `
        <div style="display:grid; gap:1.25rem;">
            <p style="font-size:.875rem; color:var(--gray-600);">Selecione um arquivo CSV para importar e mapear os campos personalizados (Nome, Valor, etc).</p>
            
            <div class="form-group">
                <label class="form-label">Nome da Lista *</label>
                <input type="text" id="csvListName" class="form-input" placeholder="Ex: Devedores Março 2026">
            </div>

            <div class="form-group">
                <label class="form-label">Arquivo CSV *</label>
                <div class="file-upload-wrapper" style="border:2px dashed var(--gray-200); padding:2rem; border-radius:12px; text-align:center; cursor:pointer;" onclick="document.getElementById('csvFileInput').click()">
                    <span style="font-size:2rem; display:block; margin-bottom:.5rem;">📄</span>
                    <span id="fileNameDisplay" style="color:var(--gray-500); font-size:.875rem;">Clique para selecionar ou arraste o arquivo</span>
                    <input type="file" id="csvFileInput" accept=".csv,.txt" style="display:none;" onchange="handleCSVFileSelect(this)">
                </div>
            </div>

            <div id="mappingArea" style="display:none; border-top:1px solid var(--gray-100); padding-top:1.25rem;">
                <h4 style="font-size:.85rem; color:var(--gray-700); margin-bottom:1rem;">Mapeamento de Colunas</h4>
                <div id="mappingGrid" style="display:grid; gap:.75rem;">
                    <!-- Mapeamento será injetado aqui -->
                </div>
            </div>

            <div style="display:flex; gap:1rem; justify-content:flex-end; margin-top:.5rem;">
                <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                <button id="importSubmitBtn" class="btn btn-primary" onclick="processCSVImport()" disabled>📥 Iniciar Importação</button>
            </div>
        </div>
    `, []);
}

let _currentCSVHeaders = [];
let _currentCSVLines = [];

function handleCSVFileSelect(input) {
    const file = input.files[0];
    if (!file) return;

    document.getElementById('fileNameDisplay').textContent = file.name;
    document.getElementById('fileNameDisplay').style.color = 'var(--primary-600)';

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const lines = content.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) {
            showNotification('O arquivo deve conter ao menos o cabeçalho e uma linha de dados', 'error');
            return;
        }

        // Tenta detectar o separador (vírgula ou ponto e vírgula)
        const firstLine = lines[0];
        const separator = firstLine.includes(';') ? ';' : ',';
        
        _currentCSVHeaders = firstLine.split(separator).map(h => h.trim().replace(/['"]/g, ''));
        _currentCSVLines = lines.slice(1).map(l => l.split(separator).map(c => c.trim().replace(/['"]/g, '')));

        renderMappingUI();
    };
    reader.readAsText(file, 'UTF-8');
}

function renderMappingUI() {
    const grid = document.getElementById('mappingGrid');
    const systemFields = [
        { id: 'nome', label: 'Nome do Paciente', required: true, icons: '👤' },
        { id: 'telefone', label: 'WhatsApp / Celular', required: true, icons: '📱' },
        { id: 'valor', label: 'Valor (ex: R$ 150)', icons: '💰' },
        { id: 'data_vencimento', label: 'Data de Vencimento', icons: '📅' },
        { id: 'email', label: 'E-mail', icons: '📧' },
        { id: 'desconto', label: 'Desconto %', icons: '📉' }
    ];

    grid.innerHTML = systemFields.map(field => `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem; align-items:center;">
            <div style="font-size:.875rem; color:var(--gray-600);">
                ${field.icons} ${field.label} ${field.required ? '<span style="color:#ef4444">*</span>' : ''}
            </div>
            <select id="map_${field.id}" class="form-input" style="padding:.4rem;" onchange="validateMapping()">
                <option value="">-- Não mapear --</option>
                ${_currentCSVHeaders.map((h, i) => `
                    <option value="${i}" ${guessHeader(h, field.id) ? 'selected' : ''}>Coluna: ${h}</option>
                `).join('')}
            </select>
        </div>
    `).join('');

    document.getElementById('mappingArea').style.display = 'block';
    validateMapping();
}

function guessHeader(header, fieldId) {
    const h = header.toLowerCase();
    const map = {
        nome: ['nome', 'name', 'paciente', 'cliente'],
        telefone: ['tel', 'fone', 'cel', 'whatsapp', 'phone', 'contato'],
        valor: ['valor', 'vlr', 'preço', 'debito', 'custo'],
        data_vencimento: ['vencimento', 'data', 'venc', 'due'],
        email: ['email', 'e-mail', 'mail'],
        desconto: ['desc', 'off', 'desconto']
    };
    return map[fieldId]?.some(keyword => h.includes(keyword));
}

function validateMapping() {
    const nameIdx = document.getElementById('map_nome').value;
    const phoneIdx = document.getElementById('map_telefone').value;
    const btn = document.getElementById('importSubmitBtn');
    btn.disabled = !(nameIdx !== '' && phoneIdx !== '');
}

function processCSVImport() {
    const listName = document.getElementById('csvListName').value.trim();
    if (!listName) { showNotification('Dê um nome para a sua lista', 'warning'); return; }

    const mappings = {
        nome: document.getElementById('map_nome').value,
        telefone: document.getElementById('map_telefone').value,
        valor: document.getElementById('map_valor').value,
        data_vencimento: document.getElementById('map_data_vencimento').value,
        email: document.getElementById('map_email').value,
        desconto: document.getElementById('map_desconto').value
    };

    const listId = generateId();
    const contacts = [];
    let importedCount = 0;

    _currentCSVLines.forEach(cols => {
        const phone = cols[mappings.telefone]?.replace(/\D/g, '');
        const name = cols[mappings.nome];
        
        if (!phone || !name) return;
        if (CampaignsState.blacklist.find(b => b.phone === phone)) return;

        const vars = { unidade: 'Odonto Company São José' };
        if (mappings.valor !== '') vars.valor = cols[mappings.valor];
        if (mappings.data_vencimento !== '') vars.data_vencimento = cols[mappings.data_vencimento];
        if (mappings.desconto !== '') vars.desconto = cols[mappings.desconto];
        if (mappings.email !== '') vars.email = cols[mappings.email];

        contacts.push({
            id: generateId(),
            contact_list_id: listId,
            name: name,
            phone: phone,
            email: mappings.email !== '' ? cols[mappings.email] : '',
            status: 'valid',
            is_blacklisted: false,
            variables: vars,
            created_at: new Date().toISOString()
        });
        importedCount++;
    });

    if (contacts.length === 0) {
        showNotification('Nenhum contato válido encontrado com os mapeamentos atuais', 'error');
        return;
    }

    CampaignsState.contactLists.push({
        id: listId,
        name: listName,
        description: `Importado via CSV (${importedCount} contatos)`,
        total_contacts: contacts.length,
        valid_contacts: contacts.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    });
    
    CampaignsState.contacts.push(...contacts);
    saveCampaignsData();
    closeModal();
    switchCampaignTab('contacts');
    showNotification(`✅ ${contacts.length} contatos importados com sucesso em "${listName}"!`, 'success');
}

// ===================
// BLACKLIST TAB
// ===================
function renderBlacklistTab() {
    return `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
            <div><h3 style="margin:0; font-size:1rem; color:var(--gray-800);">🚫 Blacklist</h3>
                <p style="margin:.25rem 0 0; font-size:.8rem; color:var(--gray-500);">${CampaignsState.blacklist.length} números bloqueados</p></div>
            <button class="btn btn-error" onclick="showAddToBlacklist()">➕ Adicionar</button>
        </div>
        ${CampaignsState.blacklist.length===0?`
            <div class="empty-state"><div class="empty-state-icon">🚫</div><h3>Nenhum número bloqueado</h3><p>Números aqui não receberão mensagens das campanhas.</p></div>
        `:`
            <div style="display:flex; flex-direction:column; gap:.5rem;">
                ${CampaignsState.blacklist.map(b=>`
                <div class="card" style="padding:1rem; display:flex; justify-content:space-between; align-items:center;">
                    <div><div style="font-weight:600;">${escapeHTML(b.name||b.phone)}</div>
                        <div style="font-size:.8rem; color:var(--gray-500);">${escapeHTML(b.phone)} • ${escapeHTML(b.reason||'Sem motivo')} • ${formatDate(b.added_at)}</div></div>
                    <button class="btn btn-secondary btn-small" onclick="removeFromBlacklist('${b.id}')">Desbloquear</button>
                </div>`).join('')}
            </div>
        `}
    `;
}

function showAddToBlacklist() {
    openModal('🚫 Bloquear Número', `
        <div style="display:grid; gap:1rem;">
            <div class="form-group"><label class="form-label">Telefone *</label><input type="text" id="blPhone" class="form-input" placeholder="(11) 99999-9999"></div>
            <div class="form-group"><label class="form-label">Nome</label><input type="text" id="blName" class="form-input" placeholder="Nome do contato"></div>
            <div class="form-group"><label class="form-label">Motivo</label><input type="text" id="blReason" class="form-input" placeholder="Ex: Solicitou não receber"></div>
            <div style="display:flex; gap:1rem; justify-content:flex-end;">
                <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                <button class="btn btn-error" onclick="addToBlacklist()">🚫 Bloquear</button>
            </div>
        </div>
    `, []);
}

function addToBlacklist() {
    const phone=document.getElementById('blPhone').value.trim();
    if(!phone){showNotification('Telefone é obrigatório','error');return;}
    CampaignsState.blacklist.push({id:generateId(),phone,name:document.getElementById('blName').value.trim(),reason:document.getElementById('blReason').value.trim(),added_at:new Date().toISOString()});
    CampaignsState.contacts.forEach(c=>{if(c.phone===phone) c.is_blacklisted=true;});
    saveCampaignsData(); closeModal(); switchCampaignTab('blacklist');
    showNotification('Número bloqueado','success');
}

function removeFromBlacklist(id) {
    const entry=CampaignsState.blacklist.find(b=>b.id===id);
    CampaignsState.blacklist=CampaignsState.blacklist.filter(b=>b.id!==id);
    if(entry) CampaignsState.contacts.forEach(c=>{if(c.phone===entry.phone) c.is_blacklisted=false;});
    saveCampaignsData(); switchCampaignTab('blacklist');
    showNotification('Número desbloqueado','success');
}

window.renderCampaignListTab = renderCampaignListTab;
window.filterCampaigns = filterCampaigns;
window.renderTemplatesTab = renderTemplatesTab;
window.previewTemplate = previewTemplate;
window.showCreateTemplateForm = showCreateTemplateForm;
window.editTemplate = editTemplate;
window.saveTemplate = saveTemplate;
window.deleteTemplate = deleteTemplate;
window.renderContactsTab = renderContactsTab;
window.importContactsFromSystem = importContactsFromSystem;
window.executeImportFromSystem = executeImportFromSystem;
window.showCreateContactListForm = showCreateContactListForm;
window.saveContactList = saveContactList;
window.viewContactList = viewContactList;
window.deleteContactList = deleteContactList;
window.showImportContactsModal = showImportContactsModal;
window.handleCSVFileSelect = handleCSVFileSelect;
window.validateMapping = validateMapping;
window.processCSVImport = processCSVImport;
window.showContactForm = showContactForm;
window.saveManualContact = saveManualContact;
window.deleteContactFromList = deleteContactFromList;
window.renderBlacklistTab = renderBlacklistTab;
window.showAddToBlacklist = showAddToBlacklist;
window.addToBlacklist = addToBlacklist;
window.removeFromBlacklist = removeFromBlacklist;
