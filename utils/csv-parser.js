// CSV Parser Utility - Campaigns Module
// ========================================

// Global state for CSV parsing
const CSVParserState = {
    currentFile: null,
    parsedData: [],
    headers: [],
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

    const headers = parseCSVLine(headerLine, delimiter);
    return headers.map(h => h.trim().toLowerCase());
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
    // Check required fields
    const requiredFields = ['nome', 'phone', 'telefone'];
    const hasRequired = requiredFields.some(field => headers.includes(field));

    if (!hasRequired) {
        CSVParserState.warnings.push('O arquivo não contém os campos obrigatórios: nome e telefone');
    }

    // Validate each record
    data.forEach((record, index) => {
        const rowNumber = record._row || (index + 2);

        // Check name
        if (!record.nome && !record.name) {
            CSVParserState.warnings.push(`Linha ${rowNumber}: Nome não encontrado`);
        }

        // Check phone
        const phone = record.phone || record.telefone || record.celular || record.whatsapp;
        if (!phone) {
            CSVParserState.warnings.push(`Linha ${rowNumber}: Telefone não encontrado`);
        } else if (!isValidPhone(phone)) {
            CSVParserState.warnings.push(`Linha ${rowNumber}: Telefone inválido: ${phone}`);
        }

        // Check for duplicates
        const currentPhone = phone;
        if (currentPhone) {
            const duplicates = data.filter(r => {
                const rPhone = r.phone || r.telefone || r.celular || r.whatsapp;
                return rPhone === currentPhone && r !== record;
            });

            if (duplicates.length > 0) {
                CSVParserState.warnings.push(`Linha ${rowNumber}: Telefone duplicado: ${currentPhone}`);
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

    const stats = calculateCSVStats();

    container.innerHTML = `
        <div class="csv-preview">
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
                    ${CSVParserState.headers.map(header => `
                        <span class="badge badge-primary" style="font-size: 0.8rem; padding: 0.25rem 0.5rem;">${header}</span>
                    `).join('')}
                </div>
            </div>

            <!-- Preview Table -->
            <div style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem; border-bottom: 2px solid var(--primary-100); padding-bottom: 0.5rem;">Pré-visualização (10 primeiros)</h4>
                <div style="overflow-x: auto;">
                    <table class="csv-preview-table" style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: var(--shadow-sm);">
                        <thead style="background: var(--gray-50);">
                            <tr>
                                ${CSVParserState.headers.map(header => `
                                    <th style="padding: 0.75rem; text-align: left; font-size: 0.875rem; color: var(--gray-600); border-bottom: 1px solid var(--gray-200);">${header}</th>
                                `).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${CSVParserState.previewData.map((record, index) => `
                                <tr style="border-bottom: 1px solid var(--gray-100);">
                                    ${CSVParserState.headers.map(header => {
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

    // Filter out invalid records
    const validRecords = CSVParserState.parsedData.filter(record => {
        const phone = record.phone || record.telefone || record.celular || record.whatsapp;
        return phone && isValidPhone(phone) && (record.nome || record.name);
    });

    if (validRecords.length === 0) {
        showNotification('Nenhum registro válido para importar', 'warning');
        return;
    }

    // Create contact list
    const contactList = {
        id: generateId(),
        name: `Importação ${new Date().toLocaleDateString('pt-BR')}`,
        description: `Importado do arquivo: ${CSVParserState.currentFile.name}`,
        total_contacts: validRecords.length,
        valid_contacts: validRecords.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    // Process contacts
    const contacts = validRecords.map(record => {
        const phone = record.phone || record.telefone || record.celular || record.whatsapp;
        const name = record.nome || record.name || 'Sem Nome';

        // Extract variables from record
        const variables = {};
        Object.keys(record).forEach(key => {
            if (key !== 'nome' && key !== 'name' && key !== 'phone' && key !== 'telefone' && key !== 'celular' && key !== 'whatsapp' && key !== '_row') {
                variables[key] = record[key];
            }
        });

        return {
            id: generateId(),
            contact_list_id: contactList.id,
            name: name,
            phone: formatPhone(phone),
            email: record.email || '',
            status: 'valid',
            variables: variables,
            is_blacklisted: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    });

    // Save to storage
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
    CSVParserState.previewData = [];
    CSVParserState.errors = [];
    CSVParserState.warnings = [];

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