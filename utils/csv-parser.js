// CSV Parser Utility - Campaigns Module
// ========================================

// Global state for CSV parsing
const CSVParserState = {
    currentFile: null,
    parsedData: [],
    headers: [],
    originalHeaders: [],
    columnMapping: {
        name: '',
        phone: '',
        amount: ''
    },
    previewData: [],
    errors: [],
    warnings: []
};

// Initialize CSV Parser
function initCSVParser() {
    console.log('📄 CSV Parser initialized');
    setupCSVEventListeners();
}

// Setup Event Listeners for CSV Import
function setupCSVEventListeners() {
    // Drag and drop events
    const dropzone = document.getElementById('csvDropzone');
    if (dropzone) {
        dropzone.addEventListener('dragover', handleDragOver);
        dropzone.addEventListener('dragleave', handleDragLeave);
        dropzone.addEventListener('drop', handleDrop);
        dropzone.addEventListener('click', () => document.getElementById('csvFileInput').click());
    }

    // File input change
    const fileInput = document.getElementById('csvFileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
}

// Handle Drag Over
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = e.target.closest('.import-dropzone') || e.target;
    dropzone.classList.add('dragover');
}

// Handle Drag Leave
function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = e.target.closest('.import-dropzone') || e.target;
    dropzone.classList.remove('dragover');
}

// Handle Drop
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = e.target.closest('.import-dropzone') || e.target;
    dropzone.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
        handleFile(files[0]);
    }
}

// Handle File Select
function handleFileSelect(e) {
    const files = e.target.files;
    if (files && files.length > 0) {
        handleFile(files[0]);
    }
}

// Handle File Processing
function handleFile(file) {
    if (!file) return;

    // Validate file type
    if (!file.type.includes('csv') && !file.name.endsWith('.csv')) {
        showNotification('Por favor, selecione um arquivo CSV válido', 'error');
        return;
    }

    CSVParserState.currentFile = file;
    CSVParserState.errors = [];
    CSVParserState.warnings = [];
    CSVParserState.originalHeaders = [];
    resetColumnMapping();

    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        parseCSVContent(content);
    };
    reader.readAsText(file);
}

// Parse CSV Content
function parseCSVContent(content) {
    try {
        // Clean content
        const cleanedContent = cleanCSVContent(content);
        const lines = cleanedContent.split(/\r?\n/).filter(line => line.trim());

        if (lines.length < 2) {
            throw new Error('Arquivo CSV muito pequeno ou vazio');
        }

        // Parse headers
        const headers = parseHeaders(lines[0]);
        CSVParserState.headers = headers;
        setDefaultColumnMapping(headers);

        // Parse data
        const data = parseData(lines.slice(1), headers);
        CSVParserState.parsedData = data;

        // Validate data
        validateData(data, headers);

        // Generate preview
        generatePreview(data);

        // Render preview
        renderCSVPreview();

        showNotification(`CSV carregado com sucesso: ${data.length} registros`, 'success');

    } catch (error) {
        console.error('❌ Error parsing CSV:', error);
        showNotification('Erro ao processar arquivo CSV', 'error');
        CSVParserState.errors.push(error.message);
    }
}

// Clean CSV Content
function cleanCSVContent(content) {
    // Remove BOM if present
    let cleaned = content.replace(/^\uFEFF/, '');

    // Normalize line endings
    cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Remove extra spaces around commas
    cleaned = cleaned.replace(/\s*,\s*/g, ',');

    return cleaned;
}

// Parse Headers
function parseHeaders(headerLine) {
    // Handle different quote styles and delimiters
    const possibleDelimiters = [',', ';', '\t', '|'];
    let delimiter = ',';

    // Auto-detect delimiter
    for (const del of possibleDelimiters) {
        const count = (headerLine.match(new RegExp(escapeRegex(del), 'g')) || []).length;
        if (count > (headerLine.match(/,/g) || []).length) {
            delimiter = del;
            break;
        }
    }

    const rawHeaders = parseCSVLine(headerLine, delimiter).map(h => h.trim());
    CSVParserState.originalHeaders = rawHeaders;
    return rawHeaders.map(h => h.toLowerCase());
}

// Parse CSV Line
function parseCSVLine(line, delimiter = ',') {
    const result = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === delimiter && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
        i++;
    }

    result.push(current.trim());
    return result;
}

// Escape Regex
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const NAME_FALLBACKS = ['nome', 'name', 'cliente', 'paciente', 'contato'];
const PHONE_FALLBACKS = ['telefone', 'phone', 'celular', 'whatsapp', 'contato', 'fone'];
const AMOUNT_FALLBACKS = ['valor', 'amount', 'valor_total', 'total', 'price', 'cobranca', 'cobrança', 'billing', 'receita'];

function setDefaultColumnMapping(headers) {
    CSVParserState.columnMapping = {
        name: matchHeader(headers, NAME_FALLBACKS),
        phone: matchHeader(headers, PHONE_FALLBACKS),
        amount: matchHeader(headers, AMOUNT_FALLBACKS)
    };
}

function matchHeader(headers, keywords) {
    if (!headers || headers.length === 0) return '';
    for (const keyword of keywords) {
        const normalized = keyword.toLowerCase();
        const match = headers.find(header => header.includes(normalized));
        if (match) return match;
    }
    return '';
}

function resetColumnMapping() {
    CSVParserState.columnMapping = {
        name: '',
        phone: '',
        amount: ''
    };
}

function setCSVColumnMapping(field, column) {
    if (!CSVParserState.columnMapping) {
        resetColumnMapping();
    }
    CSVParserState.columnMapping[field] = column || '';
}

function escapeAttributeValue(value) {
    if (value == null) return '';
    return value
        .toString()
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function sanitizeDisplayLabel(value) {
    if (!value) return '';
    if (window.SecurityUtils && typeof SecurityUtils.sanitizeHTML === 'function') {
        return SecurityUtils.sanitizeHTML(value);
    }
    return value
        .toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Parse Data
function parseData(lines, headers) {
    const data = [];

    lines.forEach((line, index) => {
        try {
            const values = parseCSVLine(line);
            const record = {};

            // Map values to headers
            headers.forEach((header, i) => {
                const value = values[i] || '';
                record[header] = sanitizeValue(value);
            });

            // Add row number for error tracking
            record._row = index + 2; // +2 because headers are row 1

            data.push(record);
        } catch (error) {
            CSVParserState.errors.push(`Linha ${index + 2}: ${error.message}`);
        }
    });

    return data;
}

// Sanitize Value
function sanitizeValue(value) {
    if (!value) return '';

    // Remove quotes and trim
    let sanitized = value.replace(/^"(.*)"$/, '$1').trim();

    // Remove common problematic characters
    sanitized = sanitized.replace(/[^\w\s\-\.@]/g, '');

    return sanitized;
}

// Validate Data
function validateData(data, headers) {
    const mapping = CSVParserState.columnMapping || {};
    const requiredFields = ['nome', 'phone', 'telefone'];
    const hasRequired = mapping.name || mapping.phone || requiredFields.some(field => headers.includes(field));

    if (!hasRequired) {
        CSVParserState.warnings.push('O arquivo não contém os campos obrigatórios: nome e telefone');
    }

    data.forEach((record, index) => {
        const rowNumber = record._row || (index + 2);
        const nameValue = getMappedValue(record, mapping.name, NAME_FALLBACKS);
        if (!nameValue) {
            CSVParserState.warnings.push(`Linha ${rowNumber}: Nome não encontrado`);
        }

        const phoneValue = getMappedValue(record, mapping.phone, PHONE_FALLBACKS);
        const normalizedPhone = phoneValue ? formatPhone(phoneValue) : '';
        if (!phoneValue) {
            CSVParserState.warnings.push(`Linha ${rowNumber}: Telefone não encontrado`);
        } else if (!isValidPhone(normalizedPhone)) {
            CSVParserState.warnings.push(`Linha ${rowNumber}: Telefone inválido: ${phoneValue}`);
        }

        if (normalizedPhone) {
            const duplicates = data.filter(r => {
                const otherPhone = formatPhone(getMappedValue(r, mapping.phone, PHONE_FALLBACKS) || '');
                return otherPhone === normalizedPhone && r !== record;
            });

            if (duplicates.length > 0) {
                CSVParserState.warnings.push(`Linha ${rowNumber}: Telefone duplicado: ${phoneValue}`);
            }
        }
    });
}

// Validate Phone Number
function isValidPhone(phone) {
    // Remove all non-numeric characters except +
    const cleanPhone = phone.replace(/[^\d+]/g, '');

    // Check if it's a valid Brazilian phone number
    // Format: +55 (11) 99999-9999 or 11 99999-9999 or 999999999
    const phoneRegex = /^(\+55)?\s?(?:[1-9][0-9])\s?(?:9[0-9]{4}|[0-9]{4})[-\s]?[0-9]{4}$/;

    return phoneRegex.test(cleanPhone) || cleanPhone.length >= 10;
}

// Generate Preview
function generatePreview(data) {
    const limit = Math.min(10, data.length);
    CSVParserState.previewData = data.slice(0, limit);
}

// Render CSV Preview
function renderCSVPreview() {
    const container = document.getElementById('csvPreviewContainer');
    if (!container) return;

    const columns = CSVParserState.headers || [];
    const displayColumns = CSVParserState.originalHeaders.length ? CSVParserState.originalHeaders : columns;
    const hasColumns = columns.length > 0;
    const columnLabel = (index) => displayColumns[index] || columns[index] || '';
    const optionalPlaceholder = `<option value="">${hasColumns ? 'Nenhuma' : 'Nenhum campo detectado'}</option>`;
    const columnsOptions = columns.map((column, index) => `
        <option value="${escapeAttributeValue(column)}">${sanitizeDisplayLabel(columnLabel(index))}</option>
    `).join('');
    const optionalOptions = optionalPlaceholder + columnsOptions;
    const disabledAttr = hasColumns ? '' : 'disabled';
    const buildMappingOptions = (field) => {
        const placeholderText = hasColumns ? 'Selecione...' : 'Nenhum campo detectado';
        const placeholderSelected = !CSVParserState.columnMapping[field];
        let html = `<option value="" ${placeholderSelected ? 'selected' : ''}>${placeholderText}</option>`;
        html += columns.map((column, index) => {
            const selected = CSVParserState.columnMapping[field] === column ? 'selected' : '';
            return `<option value="${escapeAttributeValue(column)}" ${selected}>${sanitizeDisplayLabel(columnLabel(index))}</option>`;
        }).join('');
        return html;
    };

    const stats = calculateCSVStats();

    container.innerHTML = `
        <div class="csv-preview">
            <div class="csv-mapping" style="background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: 12px; padding: 1.25rem; margin-bottom: 2rem;">
                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 200px;">
                        <label class="form-label">Coluna do Nome *</label>
                        <select id="nameColumn" class="form-select" ${disabledAttr} onchange="setCSVColumnMapping('name', this.value)">
                            ${buildMappingOptions('name')}
                        </select>
                    </div>
                    <div style="flex: 1; min-width: 200px;">
                        <label class="form-label">Coluna do Telefone *</label>
                        <select id="phoneColumn" class="form-select" ${disabledAttr} onchange="setCSVColumnMapping('phone', this.value)">
                            ${buildMappingOptions('phone')}
                        </select>
                    </div>
                    <div style="flex: 1; min-width: 200px;">
                        <label class="form-label">Coluna de Valor (Cobrança)</label>
                        <select id="billingColumn" class="form-select" ${disabledAttr} onchange="setCSVColumnMapping('amount', this.value)">
                            ${buildMappingOptions('amount')}
                        </select>
                    </div>
                </div>
                <p style="margin-top: 0.75rem; color: var(--gray-500); font-size: 0.75rem;">
                    Cada importação pode mapear manualmente Nome, Telefone e Valores de Cobrança, permitindo ajustes por arquivo.
                </p>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                <div class="form-group">
                    <label class="form-label">Coluna de Canal (opcional)</label>
                    <select id="channelColumn" class="form-select" ${disabledAttr}>
                        ${optionalOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Coluna de Agendamento (opcional)</label>
                    <select id="appointmentColumn" class="form-select" ${disabledAttr}>
                        ${optionalOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Coluna de Ação/Resultado (opcional)</label>
                    <select id="actionColumn" class="form-select" ${disabledAttr}>
                        ${optionalOptions}
                    </select>
                </div>
            </div>

            <!-- Stats -->
            <div class="csv-stats" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem;">
                <div class="stat-card">
                    <div class="stat-icon">📄</div>
                    <div class="stat-content">
                        <h3>Total de Linhas</h3>
                        <div class="stat-number">${stats.totalLines}</div>
                        <div class="stat-label">Registros no arquivo</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">✅</div>
                    <div class="stat-content">
                        <h3>Válidos</h3>
                        <div class="stat-number">${stats.validRecords}</div>
                        <div class="stat-label">Registros processados</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⚠️</div>
                    <div class="stat-content">
                        <h3>Avisos</h3>
                        <div class="stat-number">${stats.warnings}</div>
                        <div class="stat-label">Problemas identificados</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">❌</div>
                    <div class="stat-content">
                        <h3>Erros</h3>
                        <div class="stat-number">${stats.errors}</div>
                        <div class="stat-label">Erros críticos</div>
                    </div>
                </div>
            </div>

            <!-- Headers -->
            <div style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem; border-bottom: 2px solid var(--primary-100); padding-bottom: 0.5rem;">Campos Identificados</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    ${columns.length > 0 ? columns.map((header, index) => `
                        <span class="badge badge-primary" style="font-size: 0.8rem; padding: 0.25rem 0.5rem;">${sanitizeDisplayLabel(columnLabel(index))}</span>
                    `).join('') : `
                        <span class="badge badge-gray" style="font-size: 0.75rem;">Nenhum cabeçalho detectado</span>
                    `}
                </div>
            </div>

            <!-- Preview Table -->
            <div style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem; border-bottom: 2px solid var(--primary-100); padding-bottom: 0.5rem;">Pré-visualização (10 primeiros)</h4>
                <div style="overflow-x: auto;">
                    <table class="csv-preview-table" style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: var(--shadow-sm);">
                        <thead style="background: var(--gray-50);">
                            <tr>
                                ${columns.map((header, index) => `
                                    <th style="padding: 0.75rem; text-align: left; font-size: 0.875rem; color: var(--gray-600); border-bottom: 1px solid var(--gray-200);">${sanitizeDisplayLabel(columnLabel(index))}</th>
                                `).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${CSVParserState.previewData.map((record, index) => `
                                <tr style="border-bottom: 1px solid var(--gray-100);">
                                    ${columns.map(header => {
        const value = record[header] || '';
        const isPhone = header.includes('phone') || header.includes('tel') || header.includes('cel');
        return `<td style="padding: 0.75rem; font-size: 0.875rem; color: var(--gray-700); ${isPhone ? 'font-family: monospace; background: var(--gray-50);' : ''}">${escapeHTML(value)}</td>`;
    }).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Actions -->
            <div style="display: flex; gap: 1rem; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    ${CSVParserState.errors.length > 0 ? `
                        <button class="btn btn-error btn-small" onclick="showCSVErrors()">❌ Ver Erros</button>
                    ` : ''}
                    ${CSVParserState.warnings.length > 0 ? `
                        <button class="btn btn-warning btn-small" onclick="showCSVWarnings()">⚠️ Ver Avisos</button>
                    ` : ''}
                    <button class="btn btn-secondary btn-small" onclick="downloadCSVTemplate()">📥 Baixar Modelo</button>
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button class="btn btn-secondary" onclick="cancelCSVImport()">Cancelar</button>
                    <button class="btn btn-primary" onclick="confirmCSVImport()">✅ Importar Contatos</button>
                </div>
            </div>
        </div>
    `;
}

// Calculate CSV Stats
function calculateCSVStats() {
    return {
        totalLines: CSVParserState.parsedData.length,
        validRecords: CSVParserState.parsedData.length - CSVParserState.errors.length,
        warnings: CSVParserState.warnings.length,
        errors: CSVParserState.errors.length
    };
}

function getMappedValue(record, column, fallbacks = []) {
    if (column && record[column]) {
        return record[column];
    }
    for (const fallback of fallbacks) {
        if (record[fallback]) {
            return record[fallback];
        }
    }
    return '';
}

// Show CSV Errors
function showCSVErrors() {
    if (CSVParserState.errors.length === 0) return;

    const errorsHTML = CSVParserState.errors.map(error => `
        <div style="padding: 0.5rem; background: #fee2e2; border: 1px solid #fecaca; border-radius: 4px; margin-bottom: 0.5rem; color: #991b1b;">
            ${escapeHTML(error)}
        </div>
    `).join('');

    openModal('Erros de Importação', `
        <div style="max-height: 400px; overflow-y: auto;">
            ${errorsHTML}
        </div>
    `, [
        { label: 'Fechar', class: 'btn-secondary', onclick: 'closeModal()' }
    ]);
}

// Show CSV Warnings
function showCSVWarnings() {
    if (CSVParserState.warnings.length === 0) return;

    const warningsHTML = CSVParserState.warnings.map(warning => `
        <div style="padding: 0.5rem; background: #fef3c7; border: 1px solid #fde68a; border-radius: 4px; margin-bottom: 0.5rem; color: #92400e;">
            ${escapeHTML(warning)}
        </div>
    `).join('');

    openModal('Avisos de Importação', `
        <div style="max-height: 400px; overflow-y: auto;">
            ${warningsHTML}
        </div>
    `, [
        { label: 'Fechar', class: 'btn-secondary', onclick: 'closeModal()' }
    ]);
}

// Download CSV Template
function downloadCSVTemplate() {
    const template = `nome,telefone,email,unidade,data_consulta,horario,valor,data_vencimento,valor_implante
João Silva,+5511999999999,joao@email.com,Centro,15/03/2024,14:30,500,01/04/2024,3000
Maria Santos,+5511988888888,maria@email.com,Alphaville,16/03/2024,10:00,800,15/03/2024,4500`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo_contatos.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification('Modelo de CSV baixado', 'success');
}

// Confirm CSV Import
function confirmCSVImport() {
    if (CSVParserState.errors.length > 0) {
        if (!confirm('Existem erros críticos no arquivo. Deseja continuar mesmo assim?')) {
            return;
        }
    }

    const stats = calculateCSVStats();
    const message = `
        <div style="text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">📊</div>
            <h3 style="margin-bottom: 1rem;">Resumo da Importação</h3>
            <div style="text-align: left; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                <div style="padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                    <div style="font-weight: 600; color: var(--gray-600);">Total de Registros</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900);">${stats.totalLines}</div>
                </div>
                <div style="padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                    <div style="font-weight: 600; color: var(--gray-600);">Registros Válidos</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--success-600);">${stats.validRecords}</div>
                </div>
                <div style="padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                    <div style="font-weight: 600; color: var(--gray-600);">Avisos</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--warning-600);">${stats.warnings}</div>
                </div>
                <div style="padding: 1rem; background: var(--gray-50); border-radius: 8px;">
                    <div style="font-weight: 600; color: var(--gray-600);">Erros</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--error-600);">${stats.errors}</div>
                </div>
            </div>
            <p style="color: var(--gray-600); margin-bottom: 2rem;">
                ${stats.warnings > 0 ? 'Alguns avisos foram identificados. Revise os dados antes de confirmar.' : ''}
                ${stats.errors > 0 ? 'Erros críticos foram encontrados. Alguns registros podem não ser importados.' : ''}
            </p>
        </div>
    `;

    openModal('Confirmar Importação', message, [
        { label: 'Cancelar', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Importar', class: 'btn-primary', onclick: 'processCSVImport()' }
    ]);
}

// Process CSV Import
function processCSVImport() {
    closeModal();

    const mapping = CSVParserState.columnMapping || {};
    const validRecords = CSVParserState.parsedData.filter(record => {
        const nameValue = getMappedValue(record, mapping.name, NAME_FALLBACKS);
        const phoneValue = getMappedValue(record, mapping.phone, PHONE_FALLBACKS);
        const normalizedPhone = formatPhone(phoneValue || '');
        return nameValue && phoneValue && isValidPhone(normalizedPhone);
    });

    if (validRecords.length === 0) {
        showNotification('Nenhum registro válido para importar', 'warning');
        return;
    }

    const contactList = {
        id: generateId(),
        name: `Importação ${new Date().toLocaleDateString('pt-BR')}`,
        description: `Importado do arquivo: ${CSVParserState.currentFile.name}`,
        total_contacts: validRecords.length,
        valid_contacts: validRecords.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    const skipFields = new Set(['nome', 'name', 'phone', 'telefone', 'celular', 'whatsapp', '_row', ...AMOUNT_FALLBACKS]);

    const contacts = validRecords.map(record => {
        const nameValue = getMappedValue(record, mapping.name, NAME_FALLBACKS) || 'Sem Nome';
        const rawPhone = getMappedValue(record, mapping.phone, PHONE_FALLBACKS) || '';
        const normalizedPhone = formatPhone(rawPhone);
        const amountValue = getMappedValue(record, mapping.amount, AMOUNT_FALLBACKS);

        const variables = {};
        Object.keys(record).forEach(key => {
            if (!skipFields.has(key)) {
                variables[key] = record[key];
            }
        });

        if (amountValue) {
            variables.valor = amountValue;
        }

        return {
            id: generateId(),
            contact_list_id: contactList.id,
            name: nameValue,
            phone: normalizedPhone || rawPhone,
            email: record.email || '',
            status: 'valid',
            variables: variables,
            is_blacklisted: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    });

    CampaignsState.contactLists.push(contactList);
    CampaignsState.contacts = CampaignsState.contacts.concat(contacts);
    saveCampaignsData();

    closeModal();
    renderCampaignsDashboard();
    showNotification(`${validRecords.length} contatos importados com sucesso!`, 'success');
}

// Format Phone Number
function formatPhone(phone) {
    // Remove all non-numeric characters except +
    const cleanPhone = phone.replace(/[^\d+]/g, '');

    // If it doesn't start with +55, add it
    if (!cleanPhone.startsWith('+55') && cleanPhone.length >= 10) {
        return `+55${cleanPhone}`;
    }

    return cleanPhone;
}

// Cancel CSV Import
function cancelCSVImport() {
    CSVParserState.currentFile = null;
    CSVParserState.parsedData = [];
    CSVParserState.headers = [];
    CSVParserState.originalHeaders = [];
    CSVParserState.previewData = [];
    CSVParserState.errors = [];
    CSVParserState.warnings = [];
    resetColumnMapping();

    closeModal();
    showNotification('Importação cancelada', 'info');
}

// Show Import Contacts Modal
function showImportContactsModal() {
    const formHTML = `
        <div class="import-modal">
            <h3 style="margin-bottom: 1.5rem; border-bottom: 2px solid var(--primary-100); padding-bottom: 0.5rem;">Importar Contatos de CSV</h3>
            
            <div class="import-dropzone" id="csvDropzone">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📁</div>
                <div style="font-weight: 600; margin-bottom: 0.5rem;">Arraste e solte seu arquivo CSV aqui</div>
                <div style="color: var(--gray-600); font-size: 0.875rem;">ou clique para selecionar</div>
                <input type="file" id="csvFileInput" accept=".csv" style="display: none;">
            </div>

            <div id="csvPreviewContainer" style="margin-top: 2rem;"></div>
        </div>
    `;

    openModal('Importar Contatos', formHTML, [
        { label: 'Fechar', class: 'btn-secondary', onclick: 'closeModal()' }
    ]);

    // Setup listeners for the new modal
    setupCSVEventListeners();
}

// Export functions
window.initCSVParser = initCSVParser;
window.setupCSVEventListeners = setupCSVEventListeners;
window.handleFile = handleFile;
window.parseCSVContent = parseCSVContent;
window.showImportContactsModal = showImportContactsModal;
window.confirmCSVImport = confirmCSVImport;
window.processCSVImport = processCSVImport;
window.cancelCSVImport = cancelCSVImport;
window.downloadCSVTemplate = downloadCSVTemplate;
window.showCSVErrors = showCSVErrors;
window.showCSVWarnings = showCSVWarnings;
window.isValidPhone = isValidPhone;
window.formatPhone = formatPhone;
window.parseCSVLine = parseCSVLine;
window.parseHeaders = parseHeaders;
window.sanitizeValue = sanitizeValue;
window.validateData = validateData;
window.generatePreview = generatePreview;
window.renderCSVPreview = renderCSVPreview;
window.calculateCSVStats = calculateCSVStats;
window.setCSVColumnMapping = setCSVColumnMapping;
