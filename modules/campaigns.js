// Campaigns Module — CRM Odonto Company (Premium)
// ================================================
// Central de Disparos via Z-API para Clínica Ortodôntica

const CampaignsState = {
    campaigns: [],
    templates: [],
    contactLists: [],
    contacts: [],
    blacklist: [],
    selectedCampaign: null,
    currentTab: 'dashboard', // dashboard | campaigns | templates | contacts | blacklist
    filterStatus: 'all',
    filterType: 'all',
    searchTerm: '',
    activeSend: null // { campaignId, total, sent, failed }
};

const CAMPAIGN_TYPES = {
    cobranca: { label: 'Cobrança', icon: '💰', color: '#f59e0b', gradient: 'linear-gradient(135deg,#f59e0b,#d97706)' },
    marketing: { label: 'Marketing', icon: '📢', color: '#3b82f6', gradient: 'linear-gradient(135deg,#3b82f6,#2563eb)' },
    reativacao_paciente: { label: 'Reativação Paciente', icon: '🔄', color: '#8b5cf6', gradient: 'linear-gradient(135deg,#8b5cf6,#7c3aed)' },
    recuperacao_lead: { label: 'Recuperação de Lead', icon: '🎯', color: '#ef4444', gradient: 'linear-gradient(135deg,#ef4444,#dc2626)' },
    aniversario: { label: 'Aniversário', icon: '🎂', color: '#ec4899', gradient: 'linear-gradient(135deg,#ec4899,#db2777)' },
    lembrete_consulta: { label: 'Lembrete de Consulta', icon: '⏰', color: '#10b981', gradient: 'linear-gradient(135deg,#10b981,#059669)' },
    pos_consulta: { label: 'Pós-Consulta', icon: '⭐', color: '#06b6d4', gradient: 'linear-gradient(135deg,#06b6d4,#0891b2)' },
    orcamento_pendente: { label: 'Orçamento Pendente', icon: '📋', color: '#f97316', gradient: 'linear-gradient(135deg,#f97316,#ea580c)' }
};

const ODC_DEFAULT_TEMPLATES = [
    // COBRANÇAS
    {
        name: 'Cobrança Suave',
        type: 'cobranca',
        category: 'Cobranças',
        content: 'Olá {{nome}}! 😊 Tudo bem?\n\nPassando para avisar que identificamos uma parcela em aberto no seu tratamento aqui na {{unidade}}.\n\nValor: R$ {{valor}}\nVencimento: {{data_vencimento}}\n\nQualquer dúvida ou para regularizar, é só responder esta mensagem! 💙',
        variables: ['nome', 'unidade', 'valor', 'data_vencimento']
    },
    {
        name: 'Cobrança Urgente',
        type: 'cobranca',
        category: 'Cobranças',
        content: 'Olá {{nome}}, bom dia!\n\n⚠️ Sua parcela de R$ {{valor}} vence HOJE!\n\nPara evitar multa, regularize até as 18h.\n\nAceitamos: Pix, cartão ou dinheiro\nChave Pix: {{chave_pix}}\n\nEm caso de dúvidas: {{nome_atendente}}',
        variables: ['nome', 'valor', 'chave_pix', 'nome_atendente']
    },
    {
        name: 'Proposta de Acordo',
        type: 'cobranca',
        category: 'Cobranças',
        content: 'Olá {{nome}}! 💙\n\nSabemos que imprevistos acontecem. Por isso, queremos te ajudar a regularizar sua situação na {{unidade}} sem complicação.\n\nTemos uma proposta especial para você:\n✅ Parcelamento sem juros\n✅ Desconto de {{desconto}}% à vista\n\nEntre em contato: responda esta mensagem ou ligue para {{telefone_clinica}}',
        variables: ['nome', 'unidade', 'desconto', 'telefone_clinica']
    },
    // MARKETING
    {
        name: 'Avaliação Gratuita',
        type: 'marketing',
        category: 'Marketing',
        content: '🦷 Olá {{nome}}!\n\nA {{unidade}} tem uma surpresa para você!\n\n🎁 AVALIAÇÃO ORTODÔNTICA GRATUITA!\n\nCorriga seu sorriso com aparelho a partir de R$ {{valor_aparelho}}/mês!\n\n✅ Sem dor\n✅ Resultados em poucos meses\n✅ Parcelamos no cartão\n\nGaranta sua vaga: {{link_agendamento}}\nOu responda esta mensagem! 😊',
        variables: ['nome', 'unidade', 'valor_aparelho', 'link_agendamento']
    },
    {
        name: 'Promoção Clareamento',
        type: 'marketing',
        category: 'Marketing',
        content: '✨ {{nome}}, oferta especial para você!\n\nClareamento a laser na {{unidade}} com {{desconto}}% de desconto!\n\nDe R$ {{valor_original}} por apenas R$ {{valor_promocional}}!\n\n⏰ Promoção válida até {{data_validade}}\n\n👉 Agende agora e garanta seu horário!\nResponda ou ligue: {{telefone_clinica}}',
        variables: ['nome', 'unidade', 'desconto', 'valor_original', 'valor_promocional', 'data_validade', 'telefone_clinica']
    },
    {
        name: 'Programa de Indicação',
        type: 'marketing',
        category: 'Marketing',
        content: '🌟 Olá {{nome}}!\n\nVocê sabia que pode ganhar desconto indicando amigos para a {{unidade}}?\n\n🎁 PROGRAMA INDICA & GANHA:\n👥 Indique um amigo → Você ganha R$ {{valor_bonus}} de desconto\n\nÉ simples: o amigo menciona seu nome ao agendar!\n\nObrigado por confiar em nós! 💙',
        variables: ['nome', 'unidade', 'valor_bonus']
    },
    // REATIVAÇÃO DE PACIENTES
    {
        name: 'Sentimos Sua Falta',
        type: 'reativacao_paciente',
        category: 'Reativação de Pacientes',
        content: 'Oi {{nome}}! 😊\n\nFaz um tempo que não te vemos aqui na {{unidade}} e sentimos sua falta!\n\nComo está seu sorriso? Está na hora da sua manutenção? 🦷\n\nAgende sua consulta de retorno e garanta que seu tratamento está indo bem!\n\n👉 Responda esta mensagem ou clique: {{link_agendamento}}',
        variables: ['nome', 'unidade', 'link_agendamento']
    },
    {
        name: 'Tratamento Incompleto',
        type: 'reativacao_paciente',
        category: 'Reativação de Pacientes',
        content: 'Olá {{nome}}, tudo bem?\n\nIdentificamos que seu tratamento ortodôntico na {{unidade}} está em aberto.\n\n⚠️ Interromper o tratamento pode causar:\n• Recidiva (dentes voltam à posição)\n• Perda do investimento já realizado\n• Necessidade de recomeçar\n\nVamos retomar? Temos horários disponíveis esta semana!\n\nResponda esta mensagem 💙',
        variables: ['nome', 'unidade']
    },
    {
        name: 'Manutenção do Aparelho',
        type: 'reativacao_paciente',
        category: 'Reativação de Pacientes',
        content: '🦷 Oi {{nome}}!\n\nChegou a hora da sua manutenção do aparelho!\n\nA manutenção regular é essencial para:\n✅ Acelerar o tratamento\n✅ Evitar dores\n✅ Manter os resultados\n\nSua última visita foi há {{meses_ausente}} meses. Vamos agendar?\n\nResponda esta mensagem ou ligue: {{telefone_clinica}} 📱',
        variables: ['nome', 'meses_ausente', 'telefone_clinica']
    },
    // RECUPERAÇÃO DE LEADS
    {
        name: 'Lead Frio — Retomada',
        type: 'recuperacao_lead',
        category: 'Recuperação de Leads',
        content: 'Oi {{nome}}! 😊\n\nVocê entrou em contato com a {{unidade}} há um tempo atrás e gostaríamos de saber se ainda tem interesse no tratamento!\n\n🦷 Ainda temos:\n✅ Avaliação gratuita\n✅ Parcelamento facilitado\n✅ Equipe especializada\n\nQuer agendar? Responda este número! 💙',
        variables: ['nome', 'unidade']
    },
    {
        name: 'Pasta Vermelha — Segundo Contato',
        type: 'recuperacao_lead',
        category: 'Recuperação de Leads',
        content: 'Olá {{nome}}!\n\nVocê veio até a {{unidade}}, recebeu a avaliação, mas ainda não deu o próximo passo.\n\nSabemos que a decisão é importante, e queremos te ajudar! 💙\n\n🎁 Temos condições especiais para você fechar hoje:\n• Parcelamento em até 36x\n• Entrada facilitada\n• Desconto especial de {{desconto}}%\n\nEsta oferta é válida só por 48h!\nResponda agora: {{nome_atendente}} 🦷',
        variables: ['nome', 'unidade', 'desconto', 'nome_atendente']
    },
    {
        name: 'Orçamento Expirado',
        type: 'orcamento_pendente',
        category: 'Orçamento Pendente',
        content: '{{nome}}, olá!\n\nO orçamento que passamos para você na {{unidade}} está prestes a expirar.\n\n📋 Seu orçamento:\nTratamento: {{tratamento}}\nValor: R$ {{valor}}\nValidade: {{data_validade}}\n\nQuer renovar ou tem alguma dúvida? Responda esta mensagem!\n\nNão deixe seu sorriso esperar! 🦷✨',
        variables: ['nome', 'unidade', 'tratamento', 'valor', 'data_validade']
    },
    // ESPECIAIS
    {
        name: 'Feliz Aniversário',
        type: 'aniversario',
        category: 'Especiais',
        content: '🎉 Feliz Aniversário, {{nome}}!\n\nToda a equipe da {{unidade}} deseja um dia incrível para você! 🎂\n\n🎁 De presente, temos um mimo especial:\n✨ Desconto de {{desconto}}% em qualquer procedimento\n\nVálido por 30 dias após seu aniversário!\n\nParabéns! Que venham muitos mais! 🥳',
        variables: ['nome', 'unidade', 'desconto']
    },
    {
        name: 'Lembrete de Consulta D-1',
        type: 'lembrete_consulta',
        category: 'Especiais',
        content: '📅 Olá {{nome}}!\n\nSeu agendamento na {{unidade}} é AMANHÃ!\n\n🕐 Horário: {{horario}}\n👨‍⚕️ Profissional: {{dentista}}\n📍 Endereço: {{endereco}}\n\nConfirme sua presença respondendo SIM! ✅\n\nEm caso de imprevisto, avise com antecedência! 🙏',
        variables: ['nome', 'unidade', 'horario', 'dentista', 'endereco']
    },
    {
        name: 'Pesquisa Pós-Consulta',
        type: 'pos_consulta',
        category: 'Especiais',
        content: '⭐ Olá {{nome}}!\n\nObrigado pela sua visita à {{unidade}} hoje!\n\nSua opinião é muito importante para nós.\n\nComo foi sua experiência?\n1️⃣ Ótima\n2️⃣ Boa\n3️⃣ Regular\n4️⃣ Ruim\n\nResponda com o número! Sua avaliação nos ajuda a melhorar sempre! 💙',
        variables: ['nome', 'unidade']
    }
];

// ===================
// INIT
// ===================
function initCampaignsModule() {
    console.log('📢 Campaigns Module iniciado');
    loadCampaignsData();
    renderCampaignsModule();
}

function loadCampaignsData() {
    try {
        // Data is now primarily loaded via loadDataFromSupabase() in supabase.js
        // and populated into CampaignsState directly.

        // If no templates were loaded from Supabase, initialize with defaults
        if (CampaignsState.templates.length === 0) {
            console.log('📝 Initializing default templates...');
            const defaultTemplates = ODC_DEFAULT_TEMPLATES.map(tpl => ({
                ...tpl,
                id: generateId(),
                is_active: true,
                created_at: new Date().toISOString()
            }));

            CampaignsState.templates = defaultTemplates;

            // Save defaults to Supabase if connected
            if (window.isCloudConnected && window.isCloudConnected()) {
                saveToSupabase('campaign_templates', defaultTemplates);
            } else {
                localStorage.setItem('campaignTemplates', JSON.stringify(defaultTemplates));
            }
        }

        // Load other data from localStorage as fallback if needed (though already done in supabase.js)
        if (CampaignsState.campaigns.length === 0) {
            const c = localStorage.getItem('campaigns');
            if (c) CampaignsState.campaigns = JSON.parse(c);
        }

        if (CampaignsState.contactLists.length === 0) {
            const cl = localStorage.getItem('campaignContactLists');
            if (cl) CampaignsState.contactLists = JSON.parse(cl);
        }

        if (CampaignsState.contacts.length === 0) {
            const ct = localStorage.getItem('campaignContacts');
            if (ct) CampaignsState.contacts = JSON.parse(ct);
        }

        if (CampaignsState.blacklist.length === 0) {
            const bl = localStorage.getItem('campaignBlacklist');
            if (bl) CampaignsState.blacklist = JSON.parse(bl);
        }
    } catch (e) {
        console.error('Erro ao carregar campanhas:', e);
    }
}

function saveCampaignsData() {
    // Save to localStorage as cache
    localStorage.setItem('campaigns', JSON.stringify(CampaignsState.campaigns));
    localStorage.setItem('campaignTemplates', JSON.stringify(CampaignsState.templates));
    localStorage.setItem('campaignContactLists', JSON.stringify(CampaignsState.contactLists));
    localStorage.setItem('campaignContacts', JSON.stringify(CampaignsState.contacts));
    localStorage.setItem('campaignBlacklist', JSON.stringify(CampaignsState.blacklist));

    // Save to Supabase if connected
    if (window.isCloudConnected && window.isCloudConnected()) {
        saveToSupabase('campaigns', CampaignsState.campaigns);
        saveToSupabase('campaign_templates', CampaignsState.templates);
        saveToSupabase('contact_lists', CampaignsState.contactLists);
        saveToSupabase('contacts', CampaignsState.contacts);
        saveToSupabase('blacklist', CampaignsState.blacklist);
    }
}

// ===================
// RENDER PRINCIPAL
// ===================
function renderCampaignsModule() {
    const container = document.getElementById('campaignsContent');
    if (!container) return;

    const zapiOk = !!(AppState?.settings?.zapiInstance && AppState?.settings?.zapiToken);

    container.innerHTML = `
        <div class="campaigns-module">
            ${!zapiOk ? `
            <div class="campaigns-zapi-warning">
                ⚠️ <strong>Z-API não configurada.</strong> Vá em <a onclick="switchModule('settings')" style="cursor:pointer;color:var(--primary-600);text-decoration:underline;">Configurações → Integrações</a> e preencha os dados da Z-API para habilitar os disparos.
            </div>` : ''}

            <!-- Tabs -->
            <div class="campaigns-tabs">
                <button class="campaigns-tab ${CampaignsState.currentTab === 'dashboard' ? 'active' : ''}" onclick="switchCampaignTab('dashboard')">
                    <span>📊</span> Dashboard
                </button>
                <button class="campaigns-tab ${CampaignsState.currentTab === 'campaigns' ? 'active' : ''}" onclick="switchCampaignTab('campaigns')">
                    <span>📢</span> Campanhas
                    ${CampaignsState.campaigns.filter(c => c.status === 'running').length > 0 ? `<span class="tab-badge">${CampaignsState.campaigns.filter(c => c.status === 'running').length}</span>` : ''}
                </button>
                <button class="campaigns-tab ${CampaignsState.currentTab === 'templates' ? 'active' : ''}" onclick="switchCampaignTab('templates')">
                    <span>📝</span> Templates
                </button>
                <button class="campaigns-tab ${CampaignsState.currentTab === 'contacts' ? 'active' : ''}" onclick="switchCampaignTab('contacts')">
                    <span>👥</span> Contatos
                    ${CampaignsState.contactLists.length > 0 ? `<span class="tab-badge">${CampaignsState.contactLists.length}</span>` : ''}
                </button>
                <button class="campaigns-tab ${CampaignsState.currentTab === 'blacklist' ? 'active' : ''}" onclick="switchCampaignTab('blacklist')">
                    <span>🚫</span> Blacklist
                    ${CampaignsState.blacklist.length > 0 ? `<span class="tab-badge tab-badge-red">${CampaignsState.blacklist.length}</span>` : ''}
                </button>
            </div>

            <!-- Tab Content -->
            <div class="campaigns-tab-content" id="campaignTabContent">
                ${renderCampaignTabContent()}
            </div>
        </div>
    `;
}

// ===================
// AVISOS DE BOAS PRÁTICAS WHATSAPP
// ===================
function renderCampaignsWarnings() {
    return `
        <div class="campaigns-warnings-container">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                <h4 style="margin:0; font-size:.9rem; color:var(--gray-700); display:flex; align-items:center; gap:.5rem;">
                    📚 Boas Práticas WhatsApp
                </h4>
                <button class="btn btn-secondary btn-small" onclick="showCampaignsBestPracticesModal()">
                    📖 Ver Completo
                </button>
            </div>
            
            <div class="campaigns-warnings-grid">
                <!-- Aviso 1: Ativação do chip -->
                <div class="warning-card warning-success">
                    <div class="warning-icon">✅</div>
                    <div class="warning-content">
                        <div class="warning-title">Ativação correta do chip</div>
                        <div class="warning-text">Sempre faça o "aquecimento" do chip por 2 semanas antes de disparar campanhas.</div>
                    </div>
                </div>

                <!-- Aviso 2: Frequência equilibrada -->
                <div class="warning-card warning-warning">
                    <div class="warning-icon">📆</div>
                    <div class="warning-content">
                        <div class="warning-title">Frequência equilibrada</div>
                        <div class="warning-text">Evite disparos em massa seguidos de inatividade. Mantenha volume consistente.</div>
                    </div>
                </div>

                <!-- Aviso 3: Humanização -->
                <div class="warning-card warning-info">
                    <div class="warning-icon">🧠</div>
                    <div class="warning-content">
                        <div class="warning-title">Humanize suas mensagens</div>
                        <div class="warning-text">Personalize textos e faça perguntas abertas para estimular respostas.</div>
                    </div>
                </div>

                <!-- Aviso 4: Evitar bloqueios -->
                <div class="warning-card warning-danger">
                    <div class="warning-icon">📛</div>
                    <div class="warning-content">
                        <div class="warning-title">Evite práticas de bloqueio</div>
                        <div class="warning-text">Não faça disparos excessivos, mensagens genéricas ou encaminhamento em massa.</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showCampaignsBestPracticesModal() {
    const content = `
        <div class="best-practices-modal">
            <div style="display:flex; flex-direction:column; gap:1.5rem; max-height:60vh; overflow-y:auto;">
                
                <!-- Aviso 1 -->
                <div class="best-practice-item">
                    <div style="display:flex; align-items:center; gap:.75rem; margin-bottom:.5rem;">
                        <span style="font-size:1.5rem;">✅</span>
                        <h4 style="margin:0; font-size:1rem; color:var(--gray-800);">1. Ativação correta do chip novo</h4>
                    </div>
                    <p style="margin:0; color:var(--gray-600); font-size:.9rem; line-height:1.5;">
                        Sempre que for usar um chip novo, é essencial fazer o "aquecimento" por pelo menos 2 semanas, utilizando manualmente com conversas reais e atendimentos sem disparar campanhas ou listas de transmissão nesse período.
                    </p>
                </div>

                <!-- Aviso 2 -->
                <div class="best-practice-item">
                    <div style="display:flex; align-items:center; gap:.75rem; margin-bottom:.5rem;">
                        <span style="font-size:1.5rem;">📆</span>
                        <h4 style="margin:0; font-size:1rem; color:var(--gray-800);">2. Frequência e volume equilibrado</h4>
                    </div>
                    <p style="margin:0; color:var(--gray-600); font-size:.9rem; line-height:1.5;">
                        Evite enviar um alto volume de mensagens em poucos dias e depois ficar vários dias inativo.<br>
                        <strong>Exemplo de prática ruim:</strong> 3.000 mensagens em 3 dias e depois 5 a 7 dias sem nenhuma atividade.<br>
                        <strong>O ideal:</strong> mantenha uma frequência equilibrada de uso, com volumes progressivos e consistentes, como se fosse um atendimento natural e contínuo.
                    </p>
                </div>

                <!-- Aviso 3 -->
                <div class="best-practice-item">
                    <div style="display:flex; align-items:center; gap:.75rem; margin-bottom:.5rem;">
                        <span style="font-size:1.5rem;">🧠</span>
                        <h4 style="margin:0; font-size:1rem; color:var(--gray-800);">3. Humanize suas mensagens</h4>
                    </div>
                    <p style="margin:0; color:var(--gray-600); font-size:.9rem; line-height:1.5;">
                        Personalize os textos como se estivesse falando diretamente com a pessoa.<br>
                        • Faça perguntas abertas para estimular respostas.<br>
                        • Evite copiar e colar o mesmo conteúdo para todos.<br>
                        • Use listas segmentadas (quentes e frias) com abordagens diferentes para cada grupo.
                    </p>
                </div>

                <!-- Aviso 4 -->
                <div class="best-practice-item">
                    <div style="display:flex; align-items:center; gap:.75rem; margin-bottom:.5rem;">
                        <span style="font-size:1.5rem;">📛</span>
                        <h4 style="margin:0; font-size:1rem; color:var(--gray-800);">4. Evite práticas que geram bloqueio</h4>
                    </div>
                    <p style="margin:0; color:var(--gray-600); font-size:.9rem; line-height:1.5;">
                        • Disparos excessivos em pouco tempo.<br>
                        • Mensagens repetidas ou genéricas.<br>
                        • Uso de listas de transmissão com frequência sem alteração de texto e personalização.<br>
                        • Encaminhamento em massa.<br>
                        • Falta de consentimento dos contatos (envio sem autorização ou opt-in).<br>
                        • Ignorar pedidos de descadastramento.
                    </p>
                </div>

                <!-- Aviso 5 -->
                <div class="best-practice-item">
                    <div style="display:flex; align-items:center; gap:.75rem; margin-bottom:.5rem;">
                        <span style="font-size:1.5rem;">📝</span>
                        <h4 style="margin:0; font-size:1rem; color:var(--gray-800);">5. Boas práticas recomendadas</h4>
                    </div>
                    <p style="margin:0; color:var(--gray-600); font-size:.9rem; line-height:1.5;">
                        • Pergunte sempre se o cliente quer continuar recebendo mensagens.<br>
                        • Atualize regularmente sua lista de contatos.<br>
                        • Utilize os recursos do CRM para segmentar e personalizar suas campanhas.<br>
                        • Respeite os horários e mantenha o profissionalismo.<br>
                        • Responda rapidamente quem iniciar uma conversa.
                    </p>
                </div>

                <!-- Aviso 6 -->
                <div class="best-practice-item">
                    <div style="display:flex; align-items:center; gap:.75rem; margin-bottom:.5rem;">
                        <span style="font-size:1.5rem;">🌐</span>
                        <h4 style="margin:0; font-size:1rem; color:var(--gray-800);">6. Cuidados técnicos</h4>
                    </div>
                    <p style="margin:0; color:var(--gray-600); font-size:.9rem; line-height:1.5;">
                        • Evite uso exclusivo do mesmo IP por longos períodos. Reiniciar o modem periodicamente pode ajudar.<br>
                        • Acompanhe as atualizações das políticas do WhatsApp e adapte suas práticas quando necessário.
                    </p>
                </div>

                <!-- Aviso 7 -->
                <div class="best-practice-item">
                    <div style="display:flex; align-items:center; gap:.75rem; margin-bottom:.5rem;">
                        <span style="font-size:1.5rem;">⚠️</span>
                        <h4 style="margin:0; font-size:1rem; color:var(--gray-800);">7. Lembre-se</h4>
                    </div>
                    <p style="margin:0; color:var(--gray-600); font-size:.9rem; line-height:1.5;">
                        A ferramenta não é a causa do bloqueio. O que causa suspensão ou banimento é o uso indevido, que pode ocorrer com ou sem qualquer sistema automatizado.<br><br>
                        <strong>Seguindo todas essas orientações, você reduz drasticamente as chances de bloqueio e garante uma comunicação eficiente, ética e duradoura com seus clientes via WhatsApp. 😊</strong>
                    </p>
                </div>

            </div>
            
            <div style="display:flex; gap:1rem; justify-content:flex-end; margin-top:1.5rem; border-top:1px solid var(--gray-200); padding-top:1rem;">
                <button class="btn btn-secondary" onclick="closeModal()">Fechar</button>
            </div>
        </div>
    `;

    openModal('📚 Boas Práticas WhatsApp - Guia Completo', content, []);
}

// Export global functions
window.renderCampaignsWarnings = renderCampaignsWarnings;
window.showCampaignsBestPracticesModal = showCampaignsBestPracticesModal;

function switchCampaignTab(tab) {
    CampaignsState.currentTab = tab;
    const tabContent = document.getElementById('campaignTabContent');
    if (tabContent) {
        tabContent.innerHTML = renderCampaignTabContent();
    }
    // Update tab active states
    document.querySelectorAll('.campaigns-tab').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(`'${tab}'`)) {
            btn.classList.add('active');
        }
    });
}

function renderCampaignTabContent() {
    switch (CampaignsState.currentTab) {
        case 'dashboard': return renderDashboardTab();
        case 'campaigns': return renderCampaignListTab();
        case 'templates': return renderTemplatesTab();
        case 'contacts': return renderContactsTab();
        case 'blacklist': return renderBlacklistTab();
        default: return renderDashboardTab();
    }
}

// ===================
// DASHBOARD TAB
// ===================
function renderDashboardTab() {
    const total = CampaignsState.campaigns.length;
    const running = CampaignsState.campaigns.filter(c => c.status === 'running').length;
    const completed = CampaignsState.campaigns.filter(c => c.status === 'completed').length;
    const scheduled = CampaignsState.campaigns.filter(c => c.status === 'scheduled').length;

    let totalSent = 0, totalDelivered = 0, totalFailed = 0;
    CampaignsState.campaigns.forEach(c => {
        totalSent += c.total_sent || 0;
        totalDelivered += c.total_delivered || 0;
        totalFailed += c.total_failed || 0;
    });
    const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;

    const typeCounts = {};
    CampaignsState.campaigns.forEach(c => {
        typeCounts[c.type] = (typeCounts[c.type] || 0) + 1;
    });

    const recentCampaigns = [...CampaignsState.campaigns]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

    return `
        <div style="display:grid; gap:1.5rem;">
            <!-- Avisos de Boas Práticas WhatsApp -->
            ${renderCampaignsWarnings()}

            <!-- Stats cards -->
            <div class="campaigns-stats-grid">
                <div class="cstat-card cstat-blue">
                    <div class="cstat-icon">📢</div>
                    <div class="cstat-value">${total}</div>
                    <div class="cstat-label">Total de Campanhas</div>
                </div>
                <div class="cstat-card cstat-green">
                    <div class="cstat-icon">▶️</div>
                    <div class="cstat-value">${running}</div>
                    <div class="cstat-label">Em Andamento</div>
                </div>
                <div class="cstat-card cstat-purple">
                    <div class="cstat-icon">✅</div>
                    <div class="cstat-value">${completed}</div>
                    <div class="cstat-label">Concluídas</div>
                </div>
                <div class="cstat-card cstat-orange">
                    <div class="cstat-icon">📅</div>
                    <div class="cstat-value">${scheduled}</div>
                    <div class="cstat-label">Agendadas</div>
                </div>
                <div class="cstat-card cstat-teal">
                    <div class="cstat-icon">📤</div>
                    <div class="cstat-value">${totalSent.toLocaleString()}</div>
                    <div class="cstat-label">Total Enviados</div>
                </div>
                <div class="cstat-card cstat-indigo">
                    <div class="cstat-icon">📈</div>
                    <div class="cstat-value">${deliveryRate}%</div>
                    <div class="cstat-label">Taxa de Entrega</div>
                </div>
            </div>

            <!-- Active sending progress -->
            ${CampaignsState.activeSend ? `
            <div class="campaigns-active-send">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                    <h4 style="margin:0; color:var(--primary-700);">🚀 Campanha em Execução</h4>
                    <button class="btn btn-error btn-small" onclick="stopActiveSending()">⏹️ Parar</button>
                </div>
                <div style="font-size:.875rem; color:var(--gray-600); margin-bottom:.5rem;">
                    ${CampaignsState.activeSend.sent} / ${CampaignsState.activeSend.total} mensagens enviadas
                    ${CampaignsState.activeSend.failed > 0 ? ` • <span style="color:#ef4444">${CampaignsState.activeSend.failed} falhas</span>` : ''}
                </div>
                <div style="height:10px; background:var(--gray-100); border-radius:10px; overflow:hidden;">
                    <div style="height:100%; background:linear-gradient(90deg,#3b82f6,#8b5cf6); width:${Math.round((CampaignsState.activeSend.sent / CampaignsState.activeSend.total) * 100)}%; transition:width .5s ease;"></div>
                </div>
            </div>
            ` : ''}

            <!-- Type breakdown + recent -->
            <div style="display:grid; grid-template-columns:1fr 2fr; gap:1.5rem;">
                <div class="card" style="padding:1.25rem;">
                    <h4 style="margin-bottom:1rem; font-size:.9rem; color:var(--gray-700);">Por Tipo</h4>
                    <div style="display:flex; flex-direction:column; gap:.5rem;">
                        ${Object.entries(CAMPAIGN_TYPES).map(([key, t]) => {
        const count = typeCounts[key] || 0;
        if (count === 0) return '';
        return `<div style="display:flex; justify-content:space-between; align-items:center; padding:.5rem .75rem; background:var(--gray-50); border-radius:8px;">
                                <span style="font-size:.875rem;">${t.icon} ${t.label}</span>
                                <span class="badge badge-primary">${count}</span>
                            </div>`;
    }).join('')}
                        ${Object.values(typeCounts).every(v => v === 0) ? '<p style="color:var(--gray-400); font-size:.875rem; text-align:center; padding:1rem;">Sem campanhas ainda</p>' : ''}
                    </div>
                </div>
                <div class="card" style="padding:1.25rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                        <h4 style="margin:0; font-size:.9rem; color:var(--gray-700);">Campanhas Recentes</h4>
                        <button class="btn btn-primary btn-small" onclick="switchCampaignTab('campaigns')">Ver todas →</button>
                    </div>
                    ${recentCampaigns.length > 0 ? recentCampaigns.map(c => {
        const t = CAMPAIGN_TYPES[c.type] || CAMPAIGN_TYPES.marketing;
        return `<div style="display:flex; justify-content:space-between; align-items:center; padding:.75rem; border-bottom:1px solid var(--gray-100);">
                            <div style="display:flex; align-items:center; gap:.75rem;">
                                <span style="font-size:1.5rem;">${t.icon}</span>
                                <div>
                                    <div style="font-weight:600; font-size:.875rem; color:var(--gray-900);">${escapeHTML(c.name)}</div>
                                    <div style="font-size:.75rem; color:var(--gray-500);">${t.label} • ${formatDate(c.created_at)}</div>
                                </div>
                            </div>
                            <span class="badge ${getStatusBadgeClass(c.status)}">${getStatusLabel(c.status)}</span>
                        </div>`;
    }).join('') : '<p style="color:var(--gray-400); text-align:center; padding:2rem;">Crie sua primeira campanha!</p>'}
                </div>
            </div>

            <!-- Quick actions -->
            <div class="card" style="padding:1.25rem;">
                <h4 style="margin-bottom:1rem; font-size:.9rem; color:var(--gray-700);">⚡ Acesso Rápido</h4>
                <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem;">
                    ${Object.entries(CAMPAIGN_TYPES).slice(0, 4).map(([key, t]) => `
                    <button class="campaigns-quick-btn" onclick="showCreateCampaignForm('${key}')" style="border-left:4px solid ${t.color};">
                        <span style="font-size:1.75rem;">${t.icon}</span>
                        <div>
                            <div style="font-weight:700; font-size:.875rem;">${t.label}</div>
                            <div style="font-size:.75rem; color:var(--gray-500);">${CampaignsState.templates.filter(tp => tp.type === key).length} templates</div>
                        </div>
                    </button>`).join('')}
                </div>
            </div>
        </div>
    `;
}
