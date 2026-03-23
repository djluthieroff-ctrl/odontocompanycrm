// Integração WhatsApp - CRM Odonto Company
// =============================================

const WhatsAppState = {
    connected: false,
    apiKey: null,
    templates: [],
    messageHistory: [],
    autoResponses: []
};

// Inicializar Módulo de WhatsApp
function initWhatsAppIntegrationModule() {
    WhatsAppState.templates = loadWhatsAppTemplates();
    WhatsAppState.autoResponses = loadAutoResponses();
    renderWhatsAppDashboard();
    setupWhatsAppEvents();
}

// Renderizar Dashboard do WhatsApp
function renderWhatsAppDashboard() {
    const container = document.getElementById('whatsappContent');
    if (!container) return;

    container.innerHTML = `
        <style>
            .whatsapp-header {
                background: white;
                padding: 1.5rem;
                border-radius: 16px;
                box-shadow: var(--shadow-lg);
                border: 1px solid var(--gray-200);
                margin-bottom: 2rem;
            }

            .connection-status {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 1rem;
            }

            .status-indicator {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #ef4444;
                box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
                animation: pulse 2s infinite;
            }

            .status-indicator.connected {
                background: #10b981;
                box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
            }

            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
                100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
            }

            .whatsapp-controls {
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                align-items: center;
                margin-bottom: 1.5rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--gray-200);
            }

            .whatsapp-tabs {
                display: flex;
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .tab-btn {
                padding: 0.75rem 1.5rem;
                border: 1px solid var(--gray-300);
                border-radius: 12px;
                background: white;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .tab-btn.active {
                background: #dcfce7;
                border-color: #10b981;
                color: #065f46;
            }

            .whatsapp-content {
                display: none;
            }

            .whatsapp-content.active {
                display: block;
            }

            .message-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 16px;
                padding: 1.5rem;
                margin-bottom: 1rem;
                box-shadow: var(--shadow-md);
            }

            .message-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
                border-bottom: 1px solid var(--gray-200);
                padding-bottom: 1rem;
            }

            .message-body {
                font-size: 0.95rem;
                line-height: 1.6;
                color: var(--gray-700);
            }

            .message-meta {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 1rem;
                padding-top: 1rem;
                border-top: 1px solid var(--gray-200);
                font-size: 0.8rem;
                color: var(--gray-500);
            }

            .template-card {
                background: white;
                border: 1px solid var(--gray-200);
                border-radius: 12px;
                padding: 1rem;
                margin-bottom: 1rem;
                transition: all 0.2s;
            }

            .template-card:hover {
                border-color: var(--primary-300);
                transform: translateY(-2px);
            }

            .template-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
            }

            .template-name {
                font-weight: 700;
                color: var(--gray-900);
            }

            .template-preview {
                background: var(--gray-50);
                padding: 0.75rem;
                border-radius: 8px;
                font-size: 0.9rem;
                color: var(--gray-600);
                margin-bottom: 1rem;
            }

            .btn-whatsapp {
                background: #25d366;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s;
            }

            .btn-whatsapp:hover {
                background: #128c7e;
                transform: translateY(-1px);
            }

            .btn-whatsapp-secondary {
                background: #f3f4f6;
                color: var(--gray-700);
                border: 1px solid var(--gray-300);
                padding: 0.5rem 1rem;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s;
            }

            .btn-whatsapp-secondary:hover {
                background: #e5e7eb;
            }

            .form-group-whatsapp {
                margin-bottom: 1rem;
            }

            .form-label-whatsapp {
                display: block;
                font-size: 0.875rem;
                font-weight: 600;
                color: var(--gray-700);
                margin-bottom: 0.5rem;
            }

            .form-input-whatsapp {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid var(--gray-300);
                border-radius: 8px;
                font-size: 0.9rem;
                transition: border-color 0.2s;
            }

            .form-input-whatsapp:focus {
                outline: none;
                border-color: var(--primary-500);
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .form-textarea-whatsapp {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid var(--gray-300);
                border-radius: 8px;
                font-size: 0.9rem;
                min-height: 120px;
                resize: vertical;
                transition: border-color 0.2s;
            }

            .stats-grid-whatsapp {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .stat-card-whatsapp {
                background: linear-gradient(135deg, #f8fafc, #e2e8f0);
                padding: 1.5rem;
                border-radius: 16px;
                border: 1px solid var(--gray-200);
                text-align: center;
            }

            .stat-value-whatsapp {
                font-size: 2rem;
                font-weight: 800;
                color: var(--gray-900);
                margin-bottom: 0.5rem;
            }

            .stat-label-whatsapp {
                font-size: 0.875rem;
                color: var(--gray-600);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
        </style>

        <!-- Header com Status -->
        <div class="whatsapp-header">
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div>
                    <h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; color: var(--gray-900);">💬 WhatsApp Business</h2>
                    <p style="margin: 0; color: var(--gray-600);">Comunicação automatizada com pacientes</p>
                </div>
                <div class="connection-status">
                    <div class="status-indicator ${WhatsAppState.connected ? 'connected' : ''}"></div>
                    <span style="font-weight: 600; color: ${WhatsAppState.connected ? '#065f46' : '#991b1b'};">
                        ${WhatsAppState.connected ? 'Conectado' : 'Desconectado'}
                    </span>
                    <button class="btn-whatsapp-secondary" onclick="toggleWhatsAppConnection()">
                        ${WhatsAppState.connected ? 'Desconectar' : 'Conectar'}
                    </button>
                </div>
            </div>
        </div>

        <!-- Abas de Navegação -->
        <div class="whatsapp-tabs">
            <button class="tab-btn active" onclick="switchWhatsAppTab('messages')" id="tab-messages">
                📨 Mensagens
            </button>
            <button class="tab-btn" onclick="switchWhatsAppTab('templates')" id="tab-templates">
                📋 Templates
            </button>
            <button class="tab-btn" onclick="switchWhatsAppTab('automation')" id="tab-automation">
                🤖 Automação
            </button>
            <button class="tab-btn" onclick="switchWhatsAppTab('stats')" id="tab-stats">
                📊 Estatísticas
            </button>
        </div>

        <!-- Conteúdo das Abas -->
        <div id="whatsapp-messages" class="whatsapp-content active">
            ${renderMessagesTab()}
        </div>

        <div id="whatsapp-templates" class="whatsapp-content">
            ${renderTemplatesTab()}
        </div>

        <div id="whatsapp-automation" class="whatsapp-content">
            ${renderAutomationTab()}
        </div>

        <div id="whatsapp-stats" class="whatsapp-content">
            ${renderStatsTab()}
        </div>
    `;
}

// Renderizar Aba de Mensagens
function renderMessagesTab() {
    const recentMessages = WhatsAppState.messageHistory.slice(-20).reverse();

    return `
        <div class="message-card">
            <div class="message-header">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📤 Enviar Mensagem em Massa</h3>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-whatsapp-secondary" onclick="showBulkMessageForm()">📧 Por Lista</button>
                    <button class="btn-whatsapp-secondary" onclick="showScheduledMessageForm()">⏰ Agendada</button>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <div class="form-group-whatsapp">
                        <label class="form-label-whatsapp">Mensagem</label>
                        <textarea class="form-textarea-whatsapp" id="bulkMessageText" placeholder="Digite sua mensagem..."></textarea>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn-whatsapp" onclick="sendBulkMessage()">📤 Enviar para Todos</button>
                        <button class="btn-whatsapp-secondary" onclick="previewMessage()">👁️ Visualizar</button>
                    </div>
                </div>
                
                <div>
                    <div style="font-size: 0.9rem; color: var(--gray-600); margin-bottom: 1rem;">
                        <strong>Dicas:</strong><br>
                        • Use {nome} para personalizar<br>
                        • Use {data} para data do agendamento<br>
                        • Use {horario} para horário do agendamento
                    </div>
                    <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px; font-family: monospace; font-size: 0.9rem;">
                        Exemplo: "Olá {nome}! Seu agendamento para {data} às {horario} está confirmado. Até logo!"
                    </div>
                </div>
            </div>
        </div>

        <div class="message-card">
            <div class="message-header">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📨 Histórico de Mensagens</h3>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-whatsapp-secondary" onclick="clearMessageHistory()">🗑️ Limpar Histórico</button>
                    <button class="btn-whatsapp-secondary" onclick="exportMessageHistory()">📤 Exportar</button>
                </div>
            </div>
            
            <div style="max-height: 400px; overflow-y: auto;">
                ${recentMessages.length > 0 ? recentMessages.map(renderMessageCard).join('') : `
                    <div style="text-align: center; color: var(--gray-500); padding: 2rem;">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">📨</div>
                        <p>Nenhuma mensagem enviada ainda</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

// Renderizar Aba de Templates
function renderTemplatesTab() {
    return `
        <div class="message-card">
            <div class="message-header">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📋 Templates de Mensagem</h3>
                <button class="btn-whatsapp-secondary" onclick="showNewTemplateForm()">➕ Novo Template</button>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;">
                ${WhatsAppState.templates.map(renderTemplateCard).join('')}
            </div>
        </div>
    `;
}

// Renderizar Aba de Automação
function renderAutomationTab() {
    return `
        <div class="message-card">
            <div class="message-header">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">🤖 Automação de Mensagens</h3>
                <button class="btn-whatsapp-secondary" onclick="toggleAutoResponses()">⚡ ${WhatsAppState.autoResponses.length > 0 ? 'Desativar' : 'Ativar'} Respostas</button>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <h4 style="margin: 0 0 1rem 0; color: var(--gray-800);">Respostas Automáticas</h4>
                    ${WhatsAppState.autoResponses.map(renderAutoResponseCard).join('')}
                    <button class="btn-whatsapp-secondary" onclick="showNewAutoResponseForm()">➕ Nova Resposta</button>
                </div>
                
                <div>
                    <h4 style="margin: 0 0 1rem 0; color: var(--gray-800);">Configurações</h4>
                    <div class="form-group-whatsapp">
                        <label class="form-label-whatsapp">Horário de Funcionamento</label>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <input type="time" class="form-input-whatsapp" id="autoStartHour" value="08:00">
                            <input type="time" class="form-input-whatsapp" id="autoEndHour" value="18:00">
                        </div>
                    </div>
                    <div class="form-group-whatsapp">
                        <label class="form-label-whatsapp">Dias da Semana</label>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;">
                            ${['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, index) => `
                                <label style="display: flex; align-items: center; gap: 0.5rem;">
                                    <input type="checkbox" ${index < 5 ? 'checked' : ''}> ${day}
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    <button class="btn-whatsapp" onclick="saveAutoSettings()">💾 Salvar Configurações</button>
                </div>
            </div>
        </div>
    `;
}

// Renderizar Aba de Estatísticas
function renderStatsTab() {
    const stats = calculateWhatsAppStats();

    return `
        <div class="stats-grid-whatsapp">
            <div class="stat-card-whatsapp">
                <div class="stat-value-whatsapp">${stats.totalMessages}</div>
                <div class="stat-label-whatsapp">Mensagens Enviadas</div>
            </div>
            <div class="stat-card-whatsapp">
                <div class="stat-value-whatsapp" style="color: #10b981;">${stats.successRate}%</div>
                <div class="stat-label-whatsapp">Taxa de Sucesso</div>
            </div>
            <div class="stat-card-whatsapp">
                <div class="stat-value-whatsapp" style="color: #3b82f6;">${stats.autoResponses}</div>
                <div class="stat-label-whatsapp">Respostas Automáticas</div>
            </div>
            <div class="stat-card-whatsapp">
                <div class="stat-value-whatsapp" style="color: #f59e0b;">${stats.avgResponseTime}</div>
                <div class="stat-label-whatsapp">Tempo Médio de Resposta</div>
            </div>
        </div>

        <div class="message-card">
            <div class="message-header">
                <h3 style="margin: 0; font-size: 1.25rem; color: var(--gray-900);">📈 Gráfico de Atividade</h3>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-whatsapp-secondary" onclick="generateActivityReport()">📊 Gerar Relatório</button>
                    <button class="btn-whatsapp-secondary" onclick="exportStats()">📤 Exportar Dados</button>
                </div>
            </div>
            
            <div style="height: 300px; background: var(--gray-50); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--gray-600);">
                Gráfico de atividade será implementado com biblioteca de charts
            </div>
        </div>
    `;
}

// Renderizar Card de Mensagem
function renderMessageCard(message) {
    return `
        <div class="message-card">
            <div class="message-header">
                <div>
                    <span style="font-weight: 700; color: var(--gray-900);">${message.recipient}</span>
                    <span style="margin-left: 1rem; font-size: 0.8rem; color: var(--gray-500);">${message.type}</span>
                </div>
                <span style="font-size: 0.8rem; color: var(--gray-500);">${new Date(message.timestamp).toLocaleString('pt-BR')}</span>
            </div>
            <div class="message-body">
                ${escapeHTML(message.content)}
            </div>
            <div class="message-meta">
                <span style="color: ${message.status === 'success' ? '#10b981' : '#ef4444'};">
                    ${message.status === 'success' ? '✅ Enviada' : '❌ Falhou'}
                </span>
                <span>Destinatários: ${message.recipientsCount}</span>
            </div>
        </div>
    `;
}

// Renderizar Card de Template
function renderTemplateCard(template) {
    return `
        <div class="template-card">
            <div class="template-header">
                <div class="template-name">${template.name}</div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-whatsapp-secondary" onclick="useTemplate('${template.id}')">✉️ Usar</button>
                    <button class="btn-whatsapp-secondary" onclick="editTemplate('${template.id}')">✏️ Editar</button>
                    <button class="btn-whatsapp-secondary" style="background: #fee2e2; color: #991b1b;" onclick="deleteTemplate('${template.id}')">🗑️</button>
                </div>
            </div>
            <div class="template-preview">
                ${template.content}
            </div>
            <div style="font-size: 0.8rem; color: var(--gray-500);">
                Categoria: ${template.category} • Variáveis: ${template.variables.join(', ')}
            </div>
        </div>
    `;
}

// Renderizar Card de Resposta Automática
function renderAutoResponseCard(response) {
    return `
        <div class="template-card">
            <div class="template-header">
                <div class="template-name">${response.trigger}</div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-whatsapp-secondary" onclick="toggleAutoResponse('${response.id}')">${response.active ? '⏸️ Pausar' : '▶️ Ativar'}</button>
                    <button class="btn-whatsapp-secondary" style="background: #fee2e2; color: #991b1b;" onclick="deleteAutoResponse('${response.id}')">🗑️</button>
                </div>
            </div>
            <div class="template-preview">
                ${response.response}
            </div>
            <div style="font-size: 0.8rem; color: var(--gray-500);">
                Ativa: ${response.active ? 'Sim' : 'Não'} • Prioridade: ${response.priority}
            </div>
        </div>
    `;
}

// Funções de Controle
function switchWhatsAppTab(tabName) {
    // Atualizar classes das abas
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');

    // Mostrar/esconder conteúdo
    document.querySelectorAll('.whatsapp-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`whatsapp-${tabName}`).classList.add('active');
}

function toggleWhatsAppConnection() {
    WhatsAppState.connected = !WhatsAppState.connected;
    renderWhatsAppDashboard();
    showNotification(`WhatsApp ${WhatsAppState.connected ? 'conectado' : 'desconectado'}`, 'success');
}

// Funções de Mensagens
function showBulkMessageForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">📤 Mensagem em Massa</h4>
            <div class="form-group-whatsapp">
                <label class="form-label-whatsapp">Destinatários</label>
                <select class="form-select" id="bulkRecipients" multiple size="5" style="height: auto;">
                    ${AppState.patients.map(p => `<option value="${p.id}">${p.name} (${p.phone})</option>`).join('')}
                </select>
            </div>
            <div class="form-group-whatsapp">
                <label class="form-label-whatsapp">Mensagem</label>
                <textarea class="form-textarea-whatsapp" id="bulkMessageContent" placeholder="Digite sua mensagem..."></textarea>
            </div>
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button class="btn-whatsapp-secondary" onclick="closeModal()">Cancelar</button>
                <button class="btn-whatsapp" onclick="sendSelectedBulkMessage()">📤 Enviar</button>
            </div>
        </div>
    `;

    openModal('Mensagem em Massa', modalContent, []);
}

function sendBulkMessage() {
    const message = document.getElementById('bulkMessageText').value;
    if (!message.trim()) {
        showNotification('Digite uma mensagem para enviar', 'error');
        return;
    }

    const recipients = AppState.patients.map(p => ({ name: p.name, phone: p.phone }));
    sendMessageToRecipients(recipients, message);
}

function sendSelectedBulkMessage() {
    const recipientsSelect = document.getElementById('bulkRecipients');
    const selected = Array.from(recipientsSelect.selectedOptions).map(option => {
        const patient = AppState.patients.find(p => p.id === option.value);
        return { name: patient.name, phone: patient.phone };
    });

    const message = document.getElementById('bulkMessageContent').value;
    sendMessageToRecipients(selected, message);
    closeModal();
}

function sendMessageToRecipients(recipients, message) {
    if (!WhatsAppState.connected) {
        showNotification('Conecte-se ao WhatsApp primeiro', 'error');
        return;
    }

    const messageRecord = {
        id: generateId(),
        content: message,
        recipientsCount: recipients.length,
        timestamp: new Date().toISOString(),
        type: 'Mensagem em Massa',
        status: 'success',
        recipient: recipients.map(r => r.name).join(', ')
    };

    WhatsAppState.messageHistory.push(messageRecord);
    saveWhatsAppHistory();

    // Simulação de envio (em produção usaria API real)
    recipients.forEach(recipient => {
        console.log(`Enviando para ${recipient.name}: ${message}`);
    });

    renderWhatsAppDashboard();
    showNotification(`Mensagem enviada para ${recipients.length} destinatários`, 'success');
}

// Funções de Templates
function showNewTemplateForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">➕ Novo Template</h4>
            <div class="form-group-whatsapp">
                <label class="form-label-whatsapp">Nome</label>
                <input type="text" class="form-input-whatsapp" id="templateName" placeholder="Ex: Confirmação de Agendamento">
            </div>
            <div class="form-group-whatsapp">
                <label class="form-label-whatsapp">Categoria</label>
                <select class="form-select" id="templateCategory">
                    <option value="appointment">Agendamento</option>
                    <option value="reminder">Lembrete</option>
                    <option value="promotion">Promoção</option>
                    <option value="information">Informação</option>
                    <option value="other">Outro</option>
                </select>
            </div>
            <div class="form-group-whatsapp">
                <label class="form-label-whatsapp">Conteúdo</label>
                <textarea class="form-textarea-whatsapp" id="templateContent" placeholder="Digite o conteúdo do template..."></textarea>
            </div>
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button class="btn-whatsapp-secondary" onclick="closeModal()">Cancelar</button>
                <button class="btn-whatsapp" onclick="saveNewTemplate()">💾 Salvar Template</button>
            </div>
        </div>
    `;

    openModal('Novo Template', modalContent, []);
}

function saveNewTemplate() {
    const name = document.getElementById('templateName').value;
    const category = document.getElementById('templateCategory').value;
    const content = document.getElementById('templateContent').value;

    if (!name || !content) {
        showNotification('Preencha todos os campos', 'error');
        return;
    }

    const template = {
        id: generateId(),
        name,
        category,
        content,
        variables: extractVariables(content),
        createdAt: new Date().toISOString()
    };

    WhatsAppState.templates.push(template);
    saveWhatsAppTemplates();
    closeModal();
    renderWhatsAppDashboard();
    showNotification('Template criado com sucesso!', 'success');
}

function useTemplate(templateId) {
    const template = WhatsAppState.templates.find(t => t.id === templateId);
    if (template) {
        document.getElementById('bulkMessageText').value = template.content;
        showNotification('Template aplicado ao campo de mensagem', 'success');
    }
}

function editTemplate(templateId) {
    const template = WhatsAppState.templates.find(t => t.id === templateId);
    if (!template) return;

    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">✏️ Editar Template</h4>
            <div class="form-group-whatsapp">
                <label class="form-label-whatsapp">Nome</label>
                <input type="text" class="form-input-whatsapp" id="editTemplateName" value="${escapeHTML(template.name)}">
            </div>
            <div class="form-group-whatsapp">
                <label class="form-label-whatsapp">Conteúdo</label>
                <textarea class="form-textarea-whatsapp" id="editTemplateContent">${escapeHTML(template.content)}</textarea>
            </div>
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button class="btn-whatsapp-secondary" onclick="closeModal()">Cancelar</button>
                <button class="btn-whatsapp" onclick="updateTemplate('${templateId}')">💾 Atualizar</button>
            </div>
        </div>
    `;

    openModal('Editar Template', modalContent, []);
}

function updateTemplate(templateId) {
    const template = WhatsAppState.templates.find(t => t.id === templateId);
    if (!template) return;

    template.name = document.getElementById('editTemplateName').value;
    template.content = document.getElementById('editTemplateContent').value;
    template.variables = extractVariables(template.content);
    template.updatedAt = new Date().toISOString();

    saveWhatsAppTemplates();
    closeModal();
    renderWhatsAppDashboard();
    showNotification('Template atualizado com sucesso!', 'success');
}

function deleteTemplate(templateId) {
    if (!confirm('Tem certeza que deseja excluir este template?')) return;

    WhatsAppState.templates = WhatsAppState.templates.filter(t => t.id !== templateId);
    saveWhatsAppTemplates();
    renderWhatsAppDashboard();
    showNotification('Template excluído com sucesso!', 'success');
}

// Funções de Automação
function toggleAutoResponses() {
    // Implementação de toggle de respostas automáticas
    showNotification('Respostas automáticas alternadas', 'success');
}

function showNewAutoResponseForm() {
    const modalContent = `
        <div style="padding: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0;">➕ Nova Resposta Automática</h4>
            <div class="form-group-whatsapp">
                <label class="form-label-whatsapp">Palavra-chave</label>
                <input type="text" class="form-input-whatsapp" id="autoTrigger" placeholder="Ex: horário, preço, agendamento">
            </div>
            <div class="form-group-whatsapp">
                <label class="form-label-whatsapp">Resposta</label>
                <textarea class="form-textarea-whatsapp" id="autoResponse" placeholder="Digite a resposta automática..."></textarea>
            </div>
            <div class="form-group-whatsapp">
                <label class="form-label-whatsapp">Prioridade</label>
                <input type="number" class="form-input-whatsapp" id="autoPriority" value="1" min="1" max="10">
            </div>
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button class="btn-whatsapp-secondary" onclick="closeModal()">Cancelar</button>
                <button class="btn-whatsapp" onclick="saveAutoResponse()">💾 Salvar Resposta</button>
            </div>
        </div>
    `;

    openModal('Nova Resposta Automática', modalContent, []);
}

function saveAutoResponse() {
    const trigger = document.getElementById('autoTrigger').value;
    const response = document.getElementById('autoResponse').value;
    const priority = parseInt(document.getElementById('autoPriority').value);

    if (!trigger || !response) {
        showNotification('Preencha todos os campos', 'error');
        return;
    }

    const autoResponse = {
        id: generateId(),
        trigger: trigger.toLowerCase(),
        response,
        priority,
        active: true,
        createdAt: new Date().toISOString()
    };

    WhatsAppState.autoResponses.push(autoResponse);
    saveAutoResponses();
    closeModal();
    renderWhatsAppDashboard();
    showNotification('Resposta automática criada com sucesso!', 'success');
}

// Funções Auxiliares
function loadWhatsAppTemplates() {
    const saved = localStorage.getItem('whatsapp_templates');
    return saved ? JSON.parse(saved) : getDefaultTemplates();
}

function saveWhatsAppTemplates() {
    localStorage.setItem('whatsapp_templates', JSON.stringify(WhatsAppState.templates));
}

function loadAutoResponses() {
    const saved = localStorage.getItem('whatsapp_auto_responses');
    return saved ? JSON.parse(saved) : getDefaultAutoResponses();
}

function saveAutoResponses() {
    localStorage.setItem('whatsapp_auto_responses', JSON.stringify(WhatsAppState.autoResponses));
}

function saveWhatsAppHistory() {
    localStorage.setItem('whatsapp_history', JSON.stringify(WhatsAppState.messageHistory));
}

function getDefaultTemplates() {
    return [
        {
            id: 'template-1',
            name: 'Confirmação de Agendamento',
            category: 'appointment',
            content: 'Olá {nome}! Seu agendamento para {data} às {horario} está confirmado. Estamos te esperando!',
            variables: ['{nome}', '{data}', '{horario}'],
            createdAt: new Date().toISOString()
        },
        {
            id: 'template-2',
            name: 'Lembrete de Consulta',
            category: 'reminder',
            content: 'Olá {nome}! Lembrando que sua consulta está marcada para amanhã ({data}) às {horario}. Caso precise remarcar, entre em contato.',
            variables: ['{nome}', '{data}', '{horario}'],
            createdAt: new Date().toISOString()
        },
        {
            id: 'template-3',
            name: 'Promoção Especial',
            category: 'promotion',
            content: 'Olá {nome}! Temos uma promoção especial para você: {promocao}. Agende já sua consulta e aproveite!',
            variables: ['{nome}', '{promocao}'],
            createdAt: new Date().toISOString()
        }
    ];
}

function getDefaultAutoResponses() {
    return [
        {
            id: 'auto-1',
            trigger: 'horário',
            response: 'Nossos horários de atendimento são de segunda a sexta das 8h às 18h. Agende sua consulta pelo nosso site!',
            priority: 1,
            active: true,
            createdAt: new Date().toISOString()
        },
        {
            id: 'auto-2',
            trigger: 'preço',
            response: 'Para saber sobre nossos preços, entre em contato pelo telefone (11) 99999-9999 ou venha nos visitar. Temos opções para todos os bolsos!',
            priority: 1,
            active: true,
            createdAt: new Date().toISOString()
        }
    ];
}

function extractVariables(content) {
    const regex = /\{(\w+)\}/g;
    const matches = content.match(regex);
    return matches ? [...new Set(matches)] : [];
}

function calculateWhatsAppStats() {
    const totalMessages = WhatsAppState.messageHistory.length;
    const successRate = totalMessages > 0 ?
        Math.round((WhatsAppState.messageHistory.filter(m => m.status === 'success').length / totalMessages) * 100) : 0;
    const autoResponses = WhatsAppState.autoResponses.filter(r => r.active).length;
    const avgResponseTime = '2h'; // Simulação

    return {
        totalMessages,
        successRate,
        autoResponses,
        avgResponseTime
    };
}

// Configurar Eventos
function setupWhatsAppEvents() {
    // Atualizar quando os dados mudarem
    document.addEventListener('whatsappUpdated', () => {
        renderWhatsAppDashboard();
    });
}

// Exportar funções globais
window.initWhatsAppIntegrationModule = initWhatsAppIntegrationModule;
window.renderWhatsAppDashboard = renderWhatsAppDashboard;
window.setupWhatsAppEvents = setupWhatsAppEvents;
window.switchWhatsAppTab = switchWhatsAppTab;
window.toggleWhatsAppConnection = toggleWhatsAppConnection;
window.showBulkMessageForm = showBulkMessageForm;
window.sendBulkMessage = sendBulkMessage;
window.sendSelectedBulkMessage = sendSelectedBulkMessage;
window.sendMessageToRecipients = sendMessageToRecipients;
window.showNewTemplateForm = showNewTemplateForm;
window.saveNewTemplate = saveNewTemplate;
window.useTemplate = useTemplate;
window.editTemplate = editTemplate;
window.updateTemplate = updateTemplate;
window.deleteTemplate = deleteTemplate;
window.toggleAutoResponses = toggleAutoResponses;
window.showNewAutoResponseForm = showNewAutoResponseForm;
window.saveAutoResponse = saveAutoResponse;
window.loadWhatsAppTemplates = loadWhatsAppTemplates;
window.saveWhatsAppTemplates = saveWhatsAppTemplates;
window.loadAutoResponses = loadAutoResponses;
window.saveAutoResponses = saveAutoResponses;
window.saveWhatsAppHistory = saveWhatsAppHistory;
window.getDefaultTemplates = getDefaultTemplates;
window.getDefaultAutoResponses = getDefaultAutoResponses;
window.extractVariables = extractVariables;
window.calculateWhatsAppStats = calculateWhatsAppStats;