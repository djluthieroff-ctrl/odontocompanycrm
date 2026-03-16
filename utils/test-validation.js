// Test and Validation Utility - Campaigns Module
// ================================================

// Global state for testing and validation
const TestValidationState = {
    tests: [],
    results: [],
    isRunning: false,
    currentTest: null
};

// Test Suite Configuration
const TEST_SUITE = {
    // Core functionality tests
    core: [
        {
            id: 'campaigns-storage',
            name: 'Armazenamento de Dados',
            description: 'Testa a persistência de dados no localStorage',
            category: 'storage',
            async: false
        },
        {
            id: 'campaigns-validation',
            name: 'Validação de Campanhas',
            description: 'Testa a validação de dados de campanhas',
            category: 'validation',
            async: false
        },
        {
            id: 'campaigns-calculation',
            name: 'Cálculo de Métricas',
            description: 'Testa o cálculo de métricas e estatísticas',
            category: 'calculation',
            async: false
        }
    ],

    // Integration tests
    integration: [
        {
            id: 'csv-parser',
            name: 'Parser de CSV',
            description: 'Testa a importação e parsing de arquivos CSV',
            category: 'integration',
            async: true
        },
        {
            id: 'template-system',
            name: 'Sistema de Templates',
            description: 'Testa a criação e substituição de templates',
            category: 'integration',
            async: false
        },
        {
            id: 'rate-limiter',
            name: 'Limitador de Taxa',
            description: 'Testa o controle de taxa de envio de mensagens',
            category: 'integration',
            async: true
        },
        {
            id: 'scheduler',
            name: 'Agendador de Campanhas',
            description: 'Testa o agendamento e execução de campanhas',
            category: 'integration',
            async: true
        }
    ],

    // Performance tests
    performance: [
        {
            id: 'large-dataset',
            name: 'Grande Volume de Dados',
            description: 'Testa o desempenho com grande volume de dados',
            category: 'performance',
            async: false
        },
        {
            id: 'bulk-operations',
            name: 'Operações em Lote',
            description: 'Testa operações em lote de contatos e campanhas',
            category: 'performance',
            async: false
        }
    ],

    // UI tests
    ui: [
        {
            id: 'module-navigation',
            name: 'Navegação do Módulo',
            description: 'Testa a navegação entre as telas do módulo',
            category: 'ui',
            async: false
        },
        {
            id: 'modal-interactions',
            name: 'Interações de Modal',
            description: 'Testa a funcionalidade dos modais',
            category: 'ui',
            async: false
        },
        {
            id: 'responsive-design',
            name: 'Design Responsivo',
            description: 'Testa a responsividade em diferentes dispositivos',
            category: 'ui',
            async: false
        }
    ]
};

// Initialize Test and Validation System
function initTestValidation() {
    console.log('🧪 Test and Validation System initialized');
    loadTestResults();
    setupTestEventListeners();
}

// Load Test Results from Storage
function loadTestResults() {
    try {
        const saved = localStorage.getItem('campaignsTestResults');
        if (saved) {
            TestValidationState.results = JSON.parse(saved);
        }
    } catch (error) {
        console.error('❌ Error loading test results:', error);
    }
}

// Save Test Results to Storage
function saveTestResults() {
    try {
        localStorage.setItem('campaignsTestResults', JSON.stringify(TestValidationState.results));
    } catch (error) {
        console.error('❌ Error saving test results:', error);
    }
}

// Setup Test Event Listeners
function setupTestEventListeners() {
    // Test runner events
    document.addEventListener('testStarted', handleTestStarted);
    document.addEventListener('testCompleted', handleTestCompleted);
    document.addEventListener('testFailed', handleTestFailed);
}

// Run All Tests
function runAllTests() {
    const allTests = [...TEST_SUITE.core, ...TEST_SUITE.integration, ...TEST_SUITE.performance, ...TEST_SUITE.ui];
    return runTests(allTests);
}

// Run Core Tests
function runCoreTests() {
    return runTests(TEST_SUITE.core);
}

// Run Integration Tests
function runIntegrationTests() {
    return runTests(TEST_SUITE.integration);
}

// Run Performance Tests
function runPerformanceTests() {
    return runTests(TEST_SUITE.performance);
}

// Run UI Tests
function runUITests() {
    return runTests(TEST_SUITE.ui);
}

// Run Specific Test
function runTest(testId) {
    const allTests = [...TEST_SUITE.core, ...TEST_SUITE.integration, ...TEST_SUITE.performance, ...TEST_SUITE.ui];
    const test = allTests.find(t => t.id === testId);
    if (!test) return Promise.reject('Test not found');
    return runTests([test]);
}

// Run Tests
async function runTests(tests) {
    if (TestValidationState.isRunning) {
        showNotification('Testes já estão em execução', 'warning');
        return;
    }

    TestValidationState.isRunning = true;
    TestValidationState.results = [];
    TestValidationState.currentTest = null;

    showNotification('Iniciando bateria de testes...', 'info');

    try {
        for (const test of tests) {
            TestValidationState.currentTest = test;
            document.dispatchEvent(new CustomEvent('testStarted', { detail: test }));

            const result = await executeTest(test);
            TestValidationState.results.push(result);

            document.dispatchEvent(new CustomEvent('testCompleted', { detail: result }));
        }

        TestValidationState.isRunning = false;
        saveTestResults();
        showTestResults();
        showNotification('Testes concluídos com sucesso!', 'success');

    } catch (error) {
        TestValidationState.isRunning = false;
        showNotification('Erro durante a execução dos testes', 'error');
        console.error('❌ Test execution error:', error);
    }
}

// Execute Individual Test
async function executeTest(test) {
    const startTime = Date.now();
    let result = {
        id: test.id,
        name: test.name,
        category: test.category,
        startTime: startTime,
        endTime: null,
        duration: 0,
        passed: false,
        error: null,
        details: []
    };

    try {
        // Execute test based on category
        switch (test.category) {
            case 'storage':
                result = await testStorage(result);
                break;
            case 'validation':
                result = await testValidation(result);
                break;
            case 'calculation':
                result = await testCalculation(result);
                break;
            case 'integration':
                result = await testIntegration(result);
                break;
            case 'performance':
                result = await testPerformance(result);
                break;
            case 'ui':
                result = await testUI(result);
                break;
            default:
                throw new Error('Unknown test category');
        }

        result.passed = true;

    } catch (error) {
        result.error = error.message;
        result.details.push({
            type: 'error',
            message: error.message,
            timestamp: Date.now()
        });
    }

    result.endTime = Date.now();
    result.duration = result.endTime - result.startTime;

    return result;
}

// Test Storage Functionality
async function testStorage(result) {
    // Test campaigns storage
    const testCampaigns = [
        { id: 'test-1', name: 'Test Campaign 1', type: 'marketing' },
        { id: 'test-2', name: 'Test Campaign 2', type: 'red_folder' }
    ];

    CampaignsState.campaigns = testCampaigns;
    saveCampaignsData();

    // Reload and verify
    loadCampaignsData();
    if (CampaignsState.campaigns.length !== testCampaigns.length) {
        throw new Error('Campaigns storage test failed');
    }

    result.details.push({
        type: 'success',
        message: 'Campaigns storage test passed',
        timestamp: Date.now()
    });

    return result;
}

// Test Validation Functionality
async function testValidation(result) {
    // Test template validation
    const invalidTemplate = {
        name: '',
        content: '',
        variables: [],
        category: ''
    };

    const validation = validateTemplate(invalidTemplate);
    if (validation.isValid) {
        throw new Error('Template validation should have failed');
    }

    result.details.push({
        type: 'success',
        message: 'Template validation test passed',
        timestamp: Date.now()
    });

    // Test valid template
    const validTemplate = {
        name: 'Test Template',
        content: 'Hello {{name}}!',
        variables: ['name'],
        category: 'marketing'
    };

    const validValidation = validateTemplate(validTemplate);
    if (!validValidation.isValid) {
        throw new Error('Valid template should have passed validation');
    }

    result.details.push({
        type: 'success',
        message: 'Valid template validation test passed',
        timestamp: Date.now()
    });

    return result;
}

// Test Calculation Functionality
async function testCalculation(result) {
    // Test campaign stats calculation
    const testCampaign = {
        id: 'calc-test',
        name: 'Calc Test',
        total_sent: 100,
        total_delivered: 80,
        total_read: 60,
        total_failed: 20
    };

    CampaignsState.campaigns = [testCampaign];
    const stats = calculateCampaignStats();

    if (stats.total !== 1) {
        throw new Error('Campaign count calculation failed');
    }

    result.details.push({
        type: 'success',
        message: 'Campaign stats calculation test passed',
        timestamp: Date.now()
    });

    return result;
}

// Test Integration Functionality
async function testIntegration(result) {
    switch (TestValidationState.currentTest.id) {
        case 'csv-parser':
            return await testCSVParser(result);
        case 'template-system':
            return await testTemplateSystem(result);
        case 'rate-limiter':
            return await testRateLimiter(result);
        case 'scheduler':
            return await testScheduler(result);
        default:
            throw new Error('Unknown integration test');
    }
}

// Test CSV Parser
async function testCSVParser(result) {
    const csvContent = `nome,telefone,email
João Silva,+5511999999999,joao@email.com
Maria Santos,+5511988888888,maria@email.com`;

    parseCSVContent(csvContent);

    if (CSVParserState.parsedData.length !== 2) {
        throw new Error('CSV parsing failed');
    }

    result.details.push({
        type: 'success',
        message: 'CSV parser test passed',
        timestamp: Date.now()
    });

    return result;
}

// Test Template System
async function testTemplateSystem(result) {
    // Test template creation
    const template = createTemplate(
        'Test Template',
        'Hello {{name}}!',
        ['name'],
        'marketing'
    );

    if (!template || template.name !== 'Test Template') {
        throw new Error('Template creation failed');
    }

    // Test variable replacement
    const replaced = replaceTemplateVariables(template.content, { name: 'João' });
    if (replaced !== 'Hello João!') {
        throw new Error('Variable replacement failed');
    }

    result.details.push({
        type: 'success',
        message: 'Template system test passed',
        timestamp: Date.now()
    });

    return result;
}

// Test Rate Limiter
async function testRateLimiter(result) {
    // Test rate limiter initialization
    initRateLimiter();

    const status = getRateLimiterStatus();
    if (!status) {
        throw new Error('Rate limiter status failed');
    }

    // Test can send message
    const canSend = canSendMessage();
    if (typeof canSend.allowed !== 'boolean') {
        throw new Error('Rate limiter check failed');
    }

    result.details.push({
        type: 'success',
        message: 'Rate limiter test passed',
        timestamp: Date.now()
    });

    return result;
}

// Test Scheduler
async function testScheduler(result) {
    // Test scheduler initialization
    initCampaignScheduler();

    const status = getSchedulerStatus();
    if (!status) {
        throw new Error('Scheduler status failed');
    }

    result.details.push({
        type: 'success',
        message: 'Scheduler test passed',
        timestamp: Date.now()
    });

    return result;
}

// Test Performance Functionality
async function testPerformance(result) {
    switch (TestValidationState.currentTest.id) {
        case 'large-dataset':
            return await testLargeDataset(result);
        case 'bulk-operations':
            return await testBulkOperations(result);
        default:
            throw new Error('Unknown performance test');
    }
}

// Test Large Dataset
async function testLargeDataset(result) {
    const startTime = Date.now();

    // Create large dataset
    const largeCampaigns = [];
    for (let i = 0; i < 1000; i++) {
        largeCampaigns.push({
            id: `perf-test-${i}`,
            name: `Performance Test ${i}`,
            type: 'marketing',
            total_sent: Math.floor(Math.random() * 1000),
            total_delivered: Math.floor(Math.random() * 800),
            total_read: Math.floor(Math.random() * 600),
            total_failed: Math.floor(Math.random() * 200)
        });
    }

    CampaignsState.campaigns = largeCampaigns;
    saveCampaignsData();

    // Test calculation performance
    const stats = calculateCampaignStats();
    const endTime = Date.now();
    const duration = endTime - startTime;

    if (duration > 1000) {
        throw new Error(`Performance test failed: ${duration}ms > 1000ms`);
    }

    result.details.push({
        type: 'success',
        message: `Large dataset test passed in ${duration}ms`,
        timestamp: Date.now()
    });

    return result;
}

// Test Bulk Operations
async function testBulkOperations(result) {
    const startTime = Date.now();

    // Test bulk campaign creation
    const campaigns = [];
    for (let i = 0; i < 100; i++) {
        campaigns.push({
            id: `bulk-test-${i}`,
            name: `Bulk Test ${i}`,
            type: 'marketing'
        });
    }

    CampaignsState.campaigns = campaigns;
    saveCampaignsData();

    // Test bulk loading
    loadCampaignsData();
    const endTime = Date.now();
    const duration = endTime - startTime;

    if (duration > 500) {
        throw new Error(`Bulk operations test failed: ${duration}ms > 500ms`);
    }

    result.details.push({
        type: 'success',
        message: `Bulk operations test passed in ${duration}ms`,
        timestamp: Date.now()
    });

    return result;
}

// Test UI Functionality
async function testUI(result) {
    switch (TestValidationState.currentTest.id) {
        case 'module-navigation':
            return await testModuleNavigation(result);
        case 'modal-interactions':
            return await testModalInteractions(result);
        case 'responsive-design':
            return await testResponsiveDesign(result);
        default:
            throw new Error('Unknown UI test');
    }
}

// Test Module Navigation
async function testModuleNavigation(result) {
    // Test if campaigns module is properly integrated
    const campaignsModule = document.getElementById('campaigns-module');
    if (!campaignsModule) {
        throw new Error('Campaigns module not found in DOM');
    }

    // Test navigation button
    const navButton = document.querySelector('[data-module="campaigns"]');
    if (!navButton) {
        throw new Error('Campaigns navigation button not found');
    }

    result.details.push({
        type: 'success',
        message: 'Module navigation test passed',
        timestamp: Date.now()
    });

    return result;
}

// Test Modal Interactions
async function testModalInteractions(result) {
    // Test if modal system is working
    const modalContainer = document.getElementById('modalContainer');
    if (!modalContainer) {
        throw new Error('Modal container not found');
    }

    // Test opening a modal
    openModal('Test Modal', '<p>Test content</p>', []);
    const modal = document.querySelector('.modal');
    if (!modal) {
        throw new Error('Modal not opened properly');
    }

    // Close modal
    closeModal();

    result.details.push({
        type: 'success',
        message: 'Modal interactions test passed',
        timestamp: Date.now()
    });

    return result;
}

// Test Responsive Design
async function testResponsiveDesign(result) {
    // Test viewport sizes
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (viewportWidth <= 0 || viewportHeight <= 0) {
        throw new Error('Invalid viewport dimensions');
    }

    // Test CSS media queries (basic check)
    const testElement = document.createElement('div');
    testElement.style.width = '100vw';
    document.body.appendChild(testElement);

    const computedWidth = window.getComputedStyle(testElement).width;
    document.body.removeChild(testElement);

    if (!computedWidth) {
        throw new Error('CSS computation failed');
    }

    result.details.push({
        type: 'success',
        message: 'Responsive design test passed',
        timestamp: Date.now()
    });

    return result;
}

// Show Test Results
function showTestResults() {
    const results = TestValidationState.results;
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const total = results.length;

    const formHTML = `
        <div class="test-results">
            <h3 style="margin-bottom: 1.5rem; border-bottom: 2px solid var(--primary-100); padding-bottom: 0.5rem;">Resultados dos Testes</h3>
            
            <!-- Summary -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
                <div style="padding: 1.5rem; background: white; border: 1px solid var(--gray-200); border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">📊</div>
                    <div style="font-size: 1.25rem; font-weight: 700; color: var(--gray-900);">${total}</div>
                    <div style="font-size: 0.875rem; color: var(--gray-600);">Total de Testes</div>
                </div>
                <div style="padding: 1.5rem; background: white; border: 1px solid var(--gray-200); border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">✅</div>
                    <div style="font-size: 1.25rem; font-weight: 700; color: var(--success-600);">${passed}</div>
                    <div style="font-size: 0.875rem; color: var(--gray-600);">Testes Aprovados</div>
                </div>
                <div style="padding: 1.5rem; background: white; border: 1px solid var(--gray-200); border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">❌</div>
                    <div style="font-size: 1.25rem; font-weight: 700; color: var(--error-600);">${failed}</div>
                    <div style="font-size: 0.875rem; color: var(--gray-600);">Testes Falhados</div>
                </div>
            </div>

            <!-- Results List -->
            <div style="margin-bottom: 2rem;">
                <h4 style="margin-bottom: 1rem;">Detalhes dos Testes</h4>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    ${results.map(result => `
                        <div style="padding: 1rem; background: white; border: 1px solid var(--gray-200); border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-900);">${escapeHTML(result.name)}</div>
                                <div style="font-size: 0.875rem; color: var(--gray-600);">${escapeHTML(result.description)}</div>
                                <div style="font-size: 0.75rem; color: var(--gray-500); margin-top: 0.25rem;">
                                    Categoria: ${result.category} • Duração: ${result.duration}ms
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <span class="badge ${result.passed ? 'badge-success' : 'badge-error'}">
                                    ${result.passed ? 'Aprovado' : 'Falhou'}
                                </span>
                                ${result.error ? `<span style="font-size: 0.75rem; color: var(--error-600);">${escapeHTML(result.error)}</span>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Actions -->
            <div style="display: flex; gap: 1rem; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 1rem;">
                    <button class="btn btn-primary" onclick="exportTestResults()">📥 Exportar Resultados</button>
                    <button class="btn btn-secondary" onclick="clearTestResults()">🗑️ Limpar Resultados</button>
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button class="btn btn-secondary" onclick="closeModal()">Fechar</button>
                </div>
            </div>
        </div>
    `;

    openModal('Resultados dos Testes', formHTML, []);
}

// Export Test Results
function exportTestResults() {
    const results = TestValidationState.results;
    const exportData = {
        timestamp: new Date().toISOString(),
        summary: {
            total: results.length,
            passed: results.filter(r => r.passed).length,
            failed: results.filter(r => !r.passed).length
        },
        results: results
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test_results_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Resultados exportados com sucesso!', 'success');
}

// Clear Test Results
function clearTestResults() {
    TestValidationState.results = [];
    saveTestResults();
    closeModal();
    showNotification('Resultados limpos', 'info');
}

// Handle Test Events
function handleTestStarted(event) {
    console.log('🧪 Test started:', event.detail.name);
}

function handleTestCompleted(event) {
    console.log('✅ Test completed:', event.detail.name, event.detail.passed ? 'PASSED' : 'FAILED');
}

function handleTestFailed(event) {
    console.log('❌ Test failed:', event.detail.name, event.detail.error);
}

// Export functions
window.initTestValidation = initTestValidation;
window.runAllTests = runAllTests;
window.runCoreTests = runCoreTests;
window.runIntegrationTests = runIntegrationTests;
window.runPerformanceTests = runPerformanceTests;
window.runUITests = runUITests;
window.runTest = runTest;
window.showTestResults = showTestResults;
window.exportTestResults = exportTestResults;
window.clearTestResults = clearTestResults;
window.loadTestResults = loadTestResults;
window.saveTestResults = saveTestResults;
window.setupTestEventListeners = setupTestEventListeners;
window.handleTestStarted = handleTestStarted;
window.handleTestCompleted = handleTestCompleted;
window.handleTestFailed = handleTestFailed;
window.testStorage = testStorage;
window.testValidation = testValidation;
window.testCalculation = testCalculation;
window.testIntegration = testIntegration;
window.testPerformance = testPerformance;
window.testUI = testUI;
window.testCSVParser = testCSVParser;
window.testTemplateSystem = testTemplateSystem;
window.testRateLimiter = testRateLimiter;
window.testScheduler = testScheduler;
window.testLargeDataset = testLargeDataset;
window.testBulkOperations = testBulkOperations;
window.testModuleNavigation = testModuleNavigation;
window.testModalInteractions = testModalInteractions;
window.testResponsiveDesign = testResponsiveDesign;