// Error Handling Utilities - CRM Odonto Company
// ================================================

const safeEnv = typeof process !== 'undefined' && process.env ? process.env : {};

/**
 * Centralized error handler
 */
class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 100;
        this.isDevelopment = safeEnv.NODE_ENV !== 'production';
    }

    /**
     * Handle application errors
     */
    handle(error, context = 'Unknown') {
        const errorInfo = {
            message: error.message || String(error),
            stack: error.stack,
            context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // Log to console in development
        if (this.isDevelopment) {
            console.error(`[${context}] ${errorInfo.message}`, error);
        }

        // Add to error log
        this.errorLog.push(errorInfo);
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog.shift();
        }

        // Show user-friendly message
        this.showUserMessage(errorInfo);

        // Send to error tracking service (if configured)
        this.sendToTracking(errorInfo);
    }

    /**
     * Show user-friendly error message
     */
    showUserMessage(errorInfo) {
        const message = this.getUserMessage(errorInfo.message);
        showNotification(message, 'error');
    }

    /**
     * Get user-friendly error message
     */
    getUserMessage(originalMessage) {
        const knownErrors = {
            'Network Error': 'Erro de conexão. Verifique sua internet e tente novamente.',
            'Request failed with status code 401': 'Sessão expirada. Faça login novamente.',
            'Request failed with status code 403': 'Acesso negado. Você não tem permissão para esta ação.',
            'Request failed with status code 404': 'Recurso não encontrado.',
            'Request failed with status code 500': 'Erro no servidor. Tente novamente mais tarde.',
            'Failed to fetch': 'Não foi possível conectar ao servidor.',
            'Supabase not configured': 'Configuração do banco de dados não encontrada.',
            'Invalid login credentials': 'E-mail ou senha incorretos.',
            'Email not confirmed': 'E-mail ainda não confirmado. Verifique sua caixa de entrada.'
        };

        for (const [key, value] of Object.entries(knownErrors)) {
            if (originalMessage.includes(key)) {
                return value;
            }
        }

        return 'Ocorreu um erro inesperado. Por favor, tente novamente.';
    }

    /**
     * Send error to tracking service
     */
    sendToTracking(errorInfo) {
        // In production, you would send to services like Sentry, LogRocket, etc.
        if (this.isDevelopment) {
            console.log('Error would be sent to tracking service:', errorInfo);
        }
    }

    /**
     * Get error log
     */
    getErrorLog() {
        return this.errorLog;
    }

    /**
     * Clear error log
     */
    clearLog() {
        this.errorLog = [];
    }
}

/**
 * Try-catch wrapper for async functions
 */
function safeAsync(fn, context = 'Function') {
    return async (...args) => {
        try {
            return await fn(...args);
        } catch (error) {
            if (window.errorHandler) {
                window.errorHandler.handle(error, context);
            } else {
                console.error(`[${context}]`, error);
            }
            throw error;
        }
    };
}

/**
 * Try-catch wrapper for sync functions
 */
function safeSync(fn, context = 'Function') {
    return (...args) => {
        try {
            return fn(...args);
        } catch (error) {
            if (window.errorHandler) {
                window.errorHandler.handle(error, context);
            } else {
                console.error(`[${context}]`, error);
            }
            throw error;
        }
    };
}

/**
 * Validate function parameters
 */
function validateParams(params, rules) {
    const errors = [];

    for (const [key, rule] of Object.entries(rules)) {
        const value = params[key];

        if (rule.required && (value === undefined || value === null || value === '')) {
            errors.push(`O parâmetro '${key}' é obrigatório.`);
            continue;
        }

        if (value !== undefined && value !== null) {
            if (rule.type) {
                const expectedType = rule.type;
                const actualType = typeof value;

                if (expectedType === 'array' && !Array.isArray(value)) {
                    errors.push(`O parâmetro '${key}' deve ser um array.`);
                } else if (expectedType === 'object' && typeof value !== 'object') {
                    errors.push(`O parâmetro '${key}' deve ser um objeto.`);
                } else if (expectedType !== 'array' && expectedType !== 'object' && actualType !== expectedType) {
                    errors.push(`O parâmetro '${key}' deve ser do tipo ${expectedType}.`);
                }
            }

            if (rule.minLength && value.length < rule.minLength) {
                errors.push(`O parâmetro '${key}' deve ter no mínimo ${rule.minLength} caracteres.`);
            }

            if (rule.maxLength && value.length > rule.maxLength) {
                errors.push(`O parâmetro '${key}' deve ter no máximo ${rule.maxLength} caracteres.`);
            }

            if (rule.pattern && !rule.pattern.test(value)) {
                errors.push(`O parâmetro '${key}' não está em um formato válido.`);
            }
        }
    }

    if (errors.length > 0) {
        const error = new Error(errors.join(' '));
        error.name = 'ValidationError';
        throw error;
    }
}

// Initialize error handler
window.errorHandler = new ErrorHandler();

// Export to global scope
window.ErrorHandler = ErrorHandler;
window.safeAsync = safeAsync;
window.safeSync = safeSync;
window.validateParams = validateParams;