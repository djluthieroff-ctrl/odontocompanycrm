// Template System Utility - Campaigns Module
// =============================================

// Global state for template system
const TemplateSystemState = {
    templates: [],
    variables: [],
    categories: [],
    activeTemplate: null
};

// Initialize Template System
function initTemplateSystem() {
    console.log('📝 Template System initialized');
    loadTemplates();
    loadVariables();
    loadCategories();
    setupTemplateEventListeners();
}

// Load Templates from Storage
function loadTemplates() {
    try {
        const saved = localStorage.getItem('campaignTemplates');
        if (saved) {
            TemplateSystemState.templates = JSON.parse(saved);
        }
    } catch (error) {
        console.error('❌ Error loading templates:', error);
    }
}

// Save Templates to Storage
function saveTemplates() {
    try {
        localStorage.setItem('campaignTemplates', JSON.stringify(TemplateSystemState.templates));
    } catch (error) {
        console.error('❌ Error saving templates:', error);
    }
}

// Load Variables from Storage
function loadVariables() {
    try {
        const saved = localStorage.getItem('templateVariables');
        if (saved) {
            TemplateSystemState.variables = JSON.parse(saved);
        } else {
            // Load default variables
            loadDefaultVariables();
        }
    } catch (error) {
        console.error('❌ Error loading variables:', error);
    }
}

// Save Variables to Storage
function saveVariables() {
    try {
        localStorage.setItem('templateVariables', JSON.stringify(TemplateSystemState.variables));
    } catch (error) {
        console.error('❌ Error saving variables:', error);
    }
}

// Load Categories from Storage
function loadCategories() {
    try {
        const saved = localStorage.getItem('templateCategories');
        if (saved) {
            TemplateSystemState.categories = JSON.parse(saved);
        } else {
            // Load default categories
            loadDefaultCategories();
        }
    } catch (error) {
        console.error('❌ Error loading categories:', error);
    }
}

// Save Categories to Storage
function saveCategories() {
    try {
        localStorage.setItem('templateCategories', JSON.stringify(TemplateSystemState.categories));
    } catch (error) {
        console.error('❌ Error saving categories:', error);
    }
}

// Load Default Variables
function loadDefaultVariables() {
    TemplateSystemState.variables = [
        { name: 'nome', description: 'Nome do cliente', example: 'João Silva' },
        { name: 'phone', description: 'Número de telefone', example: '+5511999999999' },
        { name: 'email', description: 'E-mail do cliente', example: 'joao@email.com' },
        { name: 'unidade', description: 'Unidade odontológica', example: 'Centro' },
        { name: 'data_consulta', description: 'Data da consulta', example: '15/03/2024' },
        { name: 'horario', description: 'Horário da consulta', example: '14:30' },
        { name: 'valor', description: 'Valor do tratamento', example: 'R$ 500,00' },
        { name: 'data_vencimento', description: 'Data de vencimento', example: '01/04/2024' },
        { name: 'valor_implante', description: 'Valor do implante', example: 'R$ 3000,00' },
        { name: 'data_nascimento', description: 'Data de nascimento', example: '01/01/1980' },
        { name: 'cpf', description: 'CPF do cliente', example: '123.456.789-00' },
        { name: 'endereco', description: 'Endereço do cliente', example: 'Rua Exemplo, 123' },
        { name: 'cidade', description: 'Cidade do cliente', example: 'São Paulo' },
        { name: 'estado', description: 'Estado do cliente', example: 'SP' },
        { name: 'profissao', description: 'Profissão do cliente', example: 'Engenheiro' },
        { name: 'empresa', description: 'Empresa do cliente', example: 'Empresa XYZ' },
        { name: 'convenio', description: 'Convênio do cliente', example: 'Unimed' },
        { name: 'plano', description: 'Plano do convênio', example: 'Plano Ouro' },
        { name: 'validade_convenio', description: 'Validade do convênio', example: '31/12/2024' },
        { name: 'observacoes', description: 'Observações gerais', example: 'Alergia a penicilina' },
        { name: 'tratamento_recomendado', description: 'Tratamento recomendado', example: 'Clareamento dental' },
        { name: 'valor_total', description: 'Valor total do tratamento', example: 'R$ 2500,00' },
        { name: 'parcelas', description: 'Número de parcelas', example: '12x' },
        { name: 'valor_parcela', description: 'Valor de cada parcela', example: 'R$ 208,33' },
        { name: 'desconto', description: 'Valor do desconto', example: 'R$ 250,00' },
        { name: 'primeiro_pagamento', description: 'Data do primeiro pagamento', example: '05/03/2024' },
        { name: 'ultima_consulta', description: 'Data da última consulta', example: '10/02/2024' },
        { name: 'proxima_consulta', description: 'Data da próxima consulta', example: '15/03/2024' },
        { name: 'tempo_tratamento', description: 'Tempo estimado do tratamento', example: '6 meses' },
        { name: 'dentista_responsavel', description: 'Dentista responsável', example: 'Dr. Carlos Silva' },
        { name: 'assistente', description: 'Assistente do dentista', example: 'Ana Maria' },
        { name: 'urgencia', description: 'Nível de urgência', example: 'Alta' },
        { name: 'motivo_consulta', description: 'Motivo da consulta', example: 'Dor de dente' },
        { name: 'historico_medico', description: 'Histórico médico', example: 'Diabetes tipo 2' },
        { name: 'medicamentos', description: 'Medicamentos em uso', example: 'Insulina' },
        { name: 'alergias', description: 'Alergias conhecidas', example: 'Penicilina' },
        { name: 'cirurgias', description: 'Cirurgias anteriores', example: 'Apêndice' },
        { name: 'exames', description: 'Exames realizados', example: 'Radiografia panorâmica' },
        { name: 'diagnostico', description: 'Diagnóstico', example: 'Cárie dentária' },
        { name: 'procedimentos', description: 'Procedimentos realizados', example: 'Obturação' },
        { name: 'prescricao', description: 'Prescrição médica', example: 'Paracetamol 500mg' },
        { name: 'instrucoes_pos', description: 'Instruções pós-procedimento', example: 'Evitar alimentos duros' },
        { name: 'retorno', description: 'Data de retorno', example: '20/03/2024' },
        { name: 'avaliacao_satisfacao', description: 'Avaliação de satisfação', example: '9/10' },
        { name: 'recomendacao', description: 'Recomendação do cliente', example: 'Sim' },
        { name: 'feedback', description: 'Feedback do cliente', example: 'Excelente atendimento' },
        { name: 'campanha_origem', description: 'Campanha de origem', example: 'Black Friday 2024' },
        { name: 'canal_origem', description: 'Canal de origem', example: 'Instagram' },
        { name: 'data_cadastro', description: 'Data de cadastro', example: '01/03/2024' },
        { name: 'status_cadastro', description: 'Status do cadastro', example: 'Aguardando contato' },
        { name: 'fonte_lead', description: 'Fonte do lead', example: 'WhatsApp' },
        { name: 'score_lead', description: 'Score do lead', example: '85' },
        { name: 'etapa_vendas', description: 'Etapa nas vendas', example: 'Negociação' },
        { name: 'probabilidade_fechamento', description: 'Probabilidade de fechamento', example: '70%' },
        { name: 'valor_potencial', description: 'Valor potencial', example: 'R$ 5000,00' },
        { name: 'data_ultimo_contato', description: 'Data do último contato', example: '12/03/2024' },
        { name: 'proxima_acao', description: 'Próxima ação', example: 'Enviar proposta' },
        { name: 'responsavel', description: 'Responsável pelo atendimento', example: 'Maria Santos' },
        { name: 'observacoes_vendas', description: 'Observações de vendas', example: 'Interessado em implante' }
    ];
    saveVariables();
}

// Load Default Categories
function loadDefaultCategories() {
    TemplateSystemState.categories = [
        { id: 'marketing', name: 'Marketing', color: '#3b82f6', icon: '📢' },
        { id: 'red_folder', name: 'Pasta Vermelha', color: '#ef4444', icon: '🚩' },
        { id: 'collection', name: 'Cobrança', color: '#f59e0b', icon: '💰' },
        { id: 'birthday', name: 'Aniversário', color: '#ec4899', icon: '🎂' },
        { id: 'reminder', name: 'Lembrete', color: '#10b981', icon: '⏰' },
        { id: 'promotion', name: 'Promoção', color: '#ef4444', icon: '🔥' },
        { id: 'welcome', name: 'Boas-vindas', color: '#22c55e', icon: '👋' },
        { id: 'follow_up', name: 'Follow-up', color: '#8b5cf6', icon: '📈' },
        { id: 'survey', name: 'Pesquisa', color: '#f97316', icon: '📊' },
        { id: 'emergency', name: 'Emergência', color: '#ef4444', icon: '🚨' }
    ];
    saveCategories();
}

// Setup Event Listeners for Template System
function setupTemplateEventListeners() {
    // Template editor events
    const templateForm = document.getElementById('templateForm');
    if (templateForm) {
        templateForm.addEventListener('submit', saveTemplate);
    }

    // Variable picker events
    const variablePicker = document.getElementById('variablePicker');
    if (variablePicker) {
        variablePicker.addEventListener('change', insertVariable);
    }

    // Category filter events
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterTemplatesByCategory);
    }
}

// Create Template
function createTemplate(name, content, variables, category, type = 'custom') {
    const template = {
        id: generateId(),
        name: name,
        content: content,
        variables: variables,
        category: category,
        type: type,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        usage_count: 0,
        last_used: null
    };

    TemplateSystemState.templates.push(template);
    saveTemplates();
    return template;
}

// Update Template
function updateTemplate(templateId, updates) {
    const template = TemplateSystemState.templates.find(t => t.id === templateId);
    if (!template) return null;

    Object.assign(template, updates);
    template.updated_at = new Date().toISOString();
    saveTemplates();
    return template;
}

// Delete Template
function deleteTemplate(templateId) {
    const index = TemplateSystemState.templates.findIndex(t => t.id === templateId);
    if (index > -1) {
        TemplateSystemState.templates.splice(index, 1);
        saveTemplates();
        return true;
    }
    return false;
}

// Get Template by ID
function getTemplate(templateId) {
    return TemplateSystemState.templates.find(t => t.id === templateId);
}

// Get Templates by Category
function getTemplatesByCategory(category) {
    return TemplateSystemState.templates.filter(t => t.category === category);
}

// Get Active Templates
function getActiveTemplates() {
    return TemplateSystemState.templates.filter(t => t.is_active);
}

// Get Template Variables
function getTemplateVariables(content) {
    const variableRegex = /{{(\w+)}}/g;
    const variables = new Set();
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
        variables.add(match[1]);
    }

    return Array.from(variables);
}

// Replace Template Variables
function replaceTemplateVariables(templateContent, variablesData) {
    let content = templateContent;

    Object.keys(variablesData).forEach(variable => {
        const regex = new RegExp(`{{${variable}}}`, 'g');
        content = content.replace(regex, variablesData[variable] || '');
    });

    return content;
}

// Validate Template
function validateTemplate(template) {
    const errors = [];

    if (!template.name || template.name.trim().length < 3) {
        errors.push('Nome do template deve ter pelo menos 3 caracteres');
    }

    if (!template.content || template.content.trim().length < 10) {
        errors.push('Conteúdo do template deve ter pelo menos 10 caracteres');
    }

    if (!template.category) {
        errors.push('Selecione uma categoria para o template');
    }

    // Check for variables
    const variables = getTemplateVariables(template.content);
    if (variables.length === 0) {
        errors.push('O template deve conter pelo menos uma variável');
    }

    // Validate variables
    variables.forEach(variable => {
        const varDef = TemplateSystemState.variables.find(v => v.name === variable);
        if (!varDef) {
            errors.push(`Variável desconhecida: ${variable}`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// Insert Variable into Template
function insertVariable() {
    const variablePicker = document.getElementById('variablePicker');
    const templateContent = document.getElementById('templateContent');
    const selectedVariable = variablePicker.value;

    if (selectedVariable && templateContent) {
        const cursorPos = templateContent.selectionStart;
        const textBefore = templateContent.value.substring(0, cursorPos);
        const textAfter = templateContent.value.substring(cursorPos);

        templateContent.value = textBefore + `{{${selectedVariable}}}` + textAfter;
        templateContent.selectionStart = templateContent.selectionEnd = cursorPos + selectedVariable.length + 4;

        // Update variables list
        updateVariablesList();
        templateContent.focus();
    }
}

// Update Variables List
function updateVariablesList() {
    const templateContent = document.getElementById('templateContent');
    const variablesList = document.getElementById('variablesList');

    if (!templateContent || !variablesList) return;

    const variables = getTemplateVariables(templateContent.value);
    const variablesData = variables.map(varName => {
        const varDef = TemplateSystemState.variables.find(v => v.name === varName);
        return {
            name: varName,
            description: varDef ? varDef.description : 'Variável desconhecida',
            example: varDef ? varDef.example : ''
        };
    });

    variablesList.innerHTML = variablesData.map(variable => `
        <div style="padding: 0.5rem; background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: 4px; margin-bottom: 0.5rem;">
            <div style="font-weight: 600; color: var(--gray-700);">${variable.name}</div>
            <div style="font-size: 0.875rem; color: var(--gray-600);">${variable.description}</div>
            <div style="font-size: 0.75rem; color: var(--gray-500); margin-top: 0.25rem;">Exemplo: ${variable.example}</div>
        </div>
    `).join('');
}

// Filter Templates by Category
function filterTemplatesByCategory() {
    const categoryFilter = document.getElementById('categoryFilter');
    const category = categoryFilter.value;

    renderTemplatesList(category === 'all' ? null : category);
}

// Render Templates List
function renderTemplatesList(category = null) {
    const container = document.getElementById('templatesList');
    if (!container) return;

    let templates = TemplateSystemState.templates;
    if (category) {
        templates = templates.filter(t => t.category === category);
    }

    templates.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    container.innerHTML = templates.map(template => {
        const categoryInfo = TemplateSystemState.categories.find(c => c.id === template.category);
        const variables = getTemplateVariables(template.content);

        return `
            <div class="template-card" style="border: 1px solid var(--gray-200); border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; background: white;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <span style="font-size: 1.5rem;">${categoryInfo ? categoryInfo.icon : '📝'}</span>
                            <h4 style="margin: 0; font-size: 1.125rem; color: var(--gray-900);">${escapeHTML(template.name)}</h4>
                            <span class="badge ${template.is_active ? 'badge-success' : 'badge-gray'}" style="font-size: 0.75rem;">${template.is_active ? 'Ativo' : 'Inativo'}</span>
                        </div>
                        <div style="font-size: 0.875rem; color: var(--gray-600);">
                            ${categoryInfo ? categoryInfo.name : 'Sem categoria'} • ${formatDate(template.created_at)}
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-secondary btn-small" onclick="editTemplate('${template.id}')">✏️ Editar</button>
                        <button class="btn btn-error btn-small" onclick="deleteTemplate('${template.id}')">🗑️ Excluir</button>
                    </div>
                </div>
                
                <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px; border: 1px solid var(--gray-200); margin-bottom: 1rem;">
                    <div style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 0.5rem;">Conteúdo:</div>
                    <div style="font-size: 0.9rem; line-height: 1.6; white-space: pre-wrap;">${escapeHTML(template.content)}</div>
                </div>

                <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                    <div style="font-size: 0.875rem; color: var(--gray-600);">
                        Variáveis: ${variables.length}
                    </div>
                    <div style="font-size: 0.875rem; color: var(--gray-600);">
                        Uso: ${template.usage_count}
                    </div>
                    <div style="font-size: 0.875rem; color: var(--gray-600);">
                        Último uso: ${template.last_used ? formatDate(template.last_used) : 'Nunca'}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Show Template Manager
function showTemplateManager() {
    const categoriesHTML = TemplateSystemState.categories.map(category => `
        <option value="${category.id}">${category.icon} ${category.name}</option>
    `).join('');

    const variablesHTML = TemplateSystemState.variables.map(variable => `
        <option value="${variable.name}">${variable.name} - ${variable.description}</option>
    `).join('');

    const formHTML = `
        <div class="template-manager">
            <h3 style="margin-bottom: 1.5rem; border-bottom: 2px solid var(--primary-100); padding-bottom: 0.5rem;">Gerenciador de Templates</h3>
            
            <!-- Template Form -->
            <div style="background: var(--gray-50); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--gray-200); margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem;">Criar/Editar Template</h4>
                <form id="templateForm">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div class="form-group">
                            <label class="form-label">Nome do Template *</label>
                            <input type="text" id="templateName" class="form-input" placeholder="Ex: Template de Marketing">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Categoria *</label>
                            <select id="templateCategory" class="form-input">
                                <option value="">Selecione uma categoria</option>
                                ${categoriesHTML}
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Conteúdo do Template *</label>
                        <textarea id="templateContent" class="form-input" rows="6" placeholder="Digite o conteúdo do template aqui..."></textarea>
                    </div>
                    <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem;">
                        <select id="variablePicker" class="form-input" style="flex: 1;">
                            <option value="">Inserir variável...</option>
                            ${variablesHTML}
                        </select>
                        <button type="button" class="btn btn-secondary" onclick="insertVariable()">➕ Inserir</button>
                    </div>
                    <div id="variablesList" style="margin-bottom: 1rem;"></div>
                    <div style="display: flex; gap: 1rem;">
                        <button type="submit" class="btn btn-primary">💾 Salvar Template</button>
                        <button type="button" class="btn btn-secondary" onclick="clearTemplateForm()">Limpar</button>
                    </div>
                </form>
            </div>

            <!-- Templates List -->
            <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem;">
                <div class="form-group" style="margin: 0;">
                    <label class="form-label">Filtrar por Categoria</label>
                    <select id="categoryFilter" class="form-input">
                        <option value="all">Todas as Categorias</option>
                        ${categoriesHTML}
                    </select>
                </div>
                <button class="btn btn-secondary" onclick="renderTemplatesList()">🔄 Atualizar</button>
            </div>

            <div id="templatesList">
                ${renderTemplatesListHTML()}
            </div>
        </div>
    `;

    openModal('Gerenciador de Templates', formHTML, [
        { label: 'Fechar', class: 'btn-secondary', onclick: 'closeModal()' }
    ]);

    setupTemplateEventListeners();
}

function showCreateTemplateForm() {
    showTemplateManager();
    setTimeout(() => {
        if (typeof clearTemplateForm === 'function') {
            clearTemplateForm();
        }
        const input = document.getElementById('templateName');
        if (input) input.focus();
    }, 100);
}

// Render Templates List HTML (for modal)
function renderTemplatesListHTML() {
    const templates = TemplateSystemState.templates;
    const categories = TemplateSystemState.categories;

    return templates.map(template => {
        const categoryInfo = categories.find(c => c.id === template.category);
        const variables = getTemplateVariables(template.content);

        return `
            <div class="template-card" style="border: 1px solid var(--gray-200); border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; background: white;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <span style="font-size: 1.5rem;">${categoryInfo ? categoryInfo.icon : '📝'}</span>
                            <h4 style="margin: 0; font-size: 1.125rem; color: var(--gray-900);">${escapeHTML(template.name)}</h4>
                            <span class="badge ${template.is_active ? 'badge-success' : 'badge-gray'}" style="font-size: 0.75rem;">${template.is_active ? 'Ativo' : 'Inativo'}</span>
                        </div>
                        <div style="font-size: 0.875rem; color: var(--gray-600);">
                            ${categoryInfo ? categoryInfo.name : 'Sem categoria'} • ${formatDate(template.created_at)}
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-secondary btn-small" onclick="editTemplate('${template.id}')">✏️ Editar</button>
                        <button class="btn btn-error btn-small" onclick="deleteTemplate('${template.id}')">🗑️ Excluir</button>
                    </div>
                </div>
                
                <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px; border: 1px solid var(--gray-200); margin-bottom: 1rem;">
                    <div style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 0.5rem;">Conteúdo:</div>
                    <div style="font-size: 0.9rem; line-height: 1.6; white-space: pre-wrap;">${escapeHTML(template.content)}</div>
                </div>

                <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                    <div style="font-size: 0.875rem; color: var(--gray-600);">
                        Variáveis: ${variables.length}
                    </div>
                    <div style="font-size: 0.875rem; color: var(--gray-600);">
                        Uso: ${template.usage_count}
                    </div>
                    <div style="font-size: 0.875rem; color: var(--gray-600);">
                        Último uso: ${template.last_used ? formatDate(template.last_used) : 'Nunca'}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Save Template (form submission)
function saveTemplate(e) {
    e.preventDefault();

    const name = document.getElementById('templateName').value.trim();
    const category = document.getElementById('templateCategory').value;
    const content = document.getElementById('templateContent').value.trim();

    if (!name || !category || !content) {
        showNotification('Preencha todos os campos obrigatórios', 'error');
        return;
    }

    const variables = getTemplateVariables(content);
    const templateData = { name, content, variables, category };

    const validation = validateTemplate(templateData);
    if (!validation.isValid) {
        showNotification(validation.errors.join('\n'), 'error');
        return;
    }

    // Check if editing existing template
    const activeTemplate = TemplateSystemState.activeTemplate;
    if (activeTemplate) {
        updateTemplate(activeTemplate, templateData);
        showNotification('Template atualizado com sucesso!', 'success');
    } else {
        createTemplate(name, content, variables, category);
        showNotification('Template criado com sucesso!', 'success');
    }

    clearTemplateForm();
    renderTemplatesList();
}

// Edit Template
function editTemplate(templateId) {
    const template = getTemplate(templateId);
    if (!template) return;

    TemplateSystemState.activeTemplate = templateId;

    document.getElementById('templateName').value = template.name;
    document.getElementById('templateCategory').value = template.category;
    document.getElementById('templateContent').value = template.content;

    updateVariablesList();
    showNotification('Template carregado para edição', 'info');
}

// Clear Template Form
function clearTemplateForm() {
    TemplateSystemState.activeTemplate = null;
    document.getElementById('templateForm').reset();
    document.getElementById('variablesList').innerHTML = '';
}

// Export Template
function exportTemplate(templateId) {
    const template = getTemplate(templateId);
    if (!template) return;

    const templateData = {
        name: template.name,
        content: template.content,
        variables: template.variables,
        category: template.category,
        type: template.type,
        exported_at: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(templateData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_${template.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Template exportado com sucesso!', 'success');
}

// Import Template
function importTemplate() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const templateData = JSON.parse(e.target.result);
                createTemplate(
                    templateData.name,
                    templateData.content,
                    templateData.variables,
                    templateData.category,
                    templateData.type || 'imported'
                );
                showNotification('Template importado com sucesso!', 'success');
                renderTemplatesList();
            } catch (error) {
                showNotification('Erro ao importar template', 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Get Template Preview
function getTemplatePreview(templateId, sampleData = {}) {
    const template = getTemplate(templateId);
    if (!template) return '';

    const variables = getTemplateVariables(template.content);
    const data = { ...sampleData };

    // Fill missing variables with examples
    variables.forEach(variable => {
        if (!data[variable]) {
            const varDef = TemplateSystemState.variables.find(v => v.name === variable);
            data[variable] = varDef ? varDef.example : `{{${variable}}}`;
        }
    });

    return replaceTemplateVariables(template.content, data);
}

// Export functions
window.initTemplateSystem = initTemplateSystem;
window.createTemplate = createTemplate;
window.updateTemplate = updateTemplate;
window.deleteTemplate = deleteTemplate;
window.getTemplate = getTemplate;
window.getTemplatesByCategory = getTemplatesByCategory;
window.getActiveTemplates = getActiveTemplates;
window.getTemplateVariables = getTemplateVariables;
window.replaceTemplateVariables = replaceTemplateVariables;
window.validateTemplate = validateTemplate;
window.insertVariable = insertVariable;
window.updateVariablesList = updateVariablesList;
window.filterTemplatesByCategory = filterTemplatesByCategory;
window.renderTemplatesList = renderTemplatesList;
window.showTemplateManager = showTemplateManager;
window.showCreateTemplateForm = showCreateTemplateForm;
window.showTemplatesManager = showTemplateManager;
window.saveTemplate = saveTemplate;
window.editTemplate = editTemplate;
window.clearTemplateForm = clearTemplateForm;
window.exportTemplate = exportTemplate;
window.importTemplate = importTemplate;
window.getTemplatePreview = getTemplatePreview;
window.loadDefaultVariables = loadDefaultVariables;
window.loadDefaultCategories = loadDefaultCategories;
window.setupTemplateEventListeners = setupTemplateEventListeners;
window.saveTemplates = saveTemplates;
window.saveVariables = saveVariables;
window.saveCategories = saveCategories;
window.loadTemplates = loadTemplates;
window.loadVariables = loadVariables;
window.loadCategories = loadCategories;
