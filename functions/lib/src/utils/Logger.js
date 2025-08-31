"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const types_1 = require("../types");
// 日誌工具類別
class Logger {
    constructor() {
        this.logLevel = types_1.LogLevel.INFO;
        this.isDevelopment = process.env['NODE_ENV'] === 'development';
    }
    /**
     * 取得單例實例
     * @returns Logger 實例
     */
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    /**
     * 設定日誌等級
     * @param level - 日誌等級
     */
    setLogLevel(level) {
        this.logLevel = level;
    }
    /**
     * 檢查是否應該記錄日誌
     * @param level - 日誌等級
     * @returns 是否應該記錄
     */
    shouldLog(level) {
        const levels = {
            [types_1.LogLevel.ERROR]: 0,
            [types_1.LogLevel.WARN]: 1,
            [types_1.LogLevel.INFO]: 2,
            [types_1.LogLevel.DEBUG]: 3,
        };
        return levels[level] <= levels[this.logLevel];
    }
    /**
     * 格式化日誌訊息
     * @param level - 日誌等級
     * @param message - 訊息
     * @param context - 上下文
     * @returns 格式化的日誌條目
     */
    formatLogEntry(level, message, context) {
        return {
            timestamp: new Date(),
            level,
            message,
            context: context || {},
        };
    }
    /**
     * 記錄錯誤日誌
     * @param message - 錯誤訊息
     * @param error - 錯誤物件
     * @param context - 上下文
     */
    error(message, error, context) {
        if (!this.shouldLog(types_1.LogLevel.ERROR))
            return;
        const logEntry = this.formatLogEntry(types_1.LogLevel.ERROR, message, context);
        if (error) {
            logEntry.error = error;
        }
        this.writeLog(logEntry);
    }
    /**
     * 記錄警告日誌
     * @param message - 警告訊息
     * @param context - 上下文
     */
    warn(message, context) {
        if (!this.shouldLog(types_1.LogLevel.WARN))
            return;
        const logEntry = this.formatLogEntry(types_1.LogLevel.WARN, message, context);
        this.writeLog(logEntry);
    }
    /**
     * 記錄資訊日誌
     * @param message - 資訊訊息
     * @param context - 上下文
     */
    info(message, context) {
        if (!this.shouldLog(types_1.LogLevel.INFO))
            return;
        const logEntry = this.formatLogEntry(types_1.LogLevel.INFO, message, context);
        this.writeLog(logEntry);
    }
    /**
     * 記錄除錯日誌
     * @param message - 除錯訊息
     * @param context - 上下文
     */
    debug(message, context) {
        if (!this.shouldLog(types_1.LogLevel.DEBUG))
            return;
        const logEntry = this.formatLogEntry(types_1.LogLevel.DEBUG, message, context);
        this.writeLog(logEntry);
    }
    /**
     * 寫入日誌
     * @param logEntry - 日誌條目
     */
    writeLog(logEntry) {
        const timestamp = logEntry.timestamp.toISOString();
        const level = logEntry.level.toUpperCase();
        const message = logEntry.message;
        const context = logEntry.context ? ` ${JSON.stringify(logEntry.context)}` : '';
        const error = logEntry.error ? `\n${logEntry.error.stack || logEntry.error.message}` : '';
        const logMessage = `[${timestamp}] [${level}] ${message}${context}${error}`;
        // 在開發環境中輸出到控制台
        if (this.isDevelopment) {
            switch (logEntry.level) {
                case types_1.LogLevel.ERROR:
                    console.error(logMessage);
                    break;
                case types_1.LogLevel.WARN:
                    console.warn(logMessage);
                    break;
                case types_1.LogLevel.INFO:
                    console.info(logMessage);
                    break;
                case types_1.LogLevel.DEBUG:
                    console.debug(logMessage);
                    break;
            }
        }
        else {
            // 在生產環境中，可以輸出到檔案或其他日誌服務
            console.log(logMessage);
        }
    }
    /**
     * 記錄 API 請求日誌
     * @param method - HTTP 方法
     * @param path - 請求路徑
     * @param statusCode - 狀態碼
     * @param duration - 執行時間
     * @param userAgent - 使用者代理
     */
    logApiRequest(method, path, statusCode, duration, userAgent) {
        const level = statusCode >= 400 ? types_1.LogLevel.ERROR : statusCode >= 300 ? types_1.LogLevel.WARN : types_1.LogLevel.INFO;
        this.log(level, `API ${method} ${path}`, {
            method,
            path,
            statusCode,
            duration: `${duration}ms`,
            userAgent,
        });
    }
    /**
     * 記錄記憶體使用狀況
     */
    logMemoryUsage() {
        const used = process.memoryUsage();
        this.info('記憶體使用狀況', {
            rss: `${Math.round((used.rss / 1024 / 1024) * 100) / 100} MB`,
            heapTotal: `${Math.round((used.heapTotal / 1024 / 1024) * 100) / 100} MB`,
            heapUsed: `${Math.round((used.heapUsed / 1024 / 1024) * 100) / 100} MB`,
            external: `${Math.round((used.external / 1024 / 1024) * 100) / 100} MB`,
        });
    }
    /**
     * 記錄效能指標
     * @param operation - 操作名稱
     * @param duration - 執行時間
     * @param context - 上下文
     */
    logPerformance(operation, duration, context) {
        const level = duration > 1000 ? types_1.LogLevel.WARN : types_1.LogLevel.INFO;
        this.log(level, `效能指標: ${operation}`, {
            operation,
            duration: `${duration}ms`,
            ...context,
        });
    }
    /**
     * 記錄資料庫操作
     * @param operation - 操作類型
     * @param collection - 集合名稱
     * @param duration - 執行時間
     * @param success - 是否成功
     */
    logDatabaseOperation(operation, collection, duration, success) {
        const level = success ? types_1.LogLevel.INFO : types_1.LogLevel.ERROR;
        this.log(level, `資料庫操作: ${operation}`, {
            operation,
            collection,
            duration: `${duration}ms`,
            success,
        });
    }
    /**
     * 記錄外部 API 呼叫
     * @param service - 服務名稱
     * @param endpoint - 端點
     * @param duration - 執行時間
     * @param success - 是否成功
     * @param statusCode - 狀態碼
     */
    logExternalApiCall(service, endpoint, duration, success, statusCode) {
        const level = success ? types_1.LogLevel.INFO : types_1.LogLevel.ERROR;
        this.log(level, `外部 API 呼叫: ${service}`, {
            service,
            endpoint,
            duration: `${duration}ms`,
            success,
            statusCode,
        });
    }
    /**
     * 記錄快取操作
     * @param operation - 操作類型
     * @param key - 快取鍵
     * @param hit - 是否命中
     * @param duration - 執行時間
     */
    logCacheOperation(operation, key, hit, duration) {
        this.info(`快取操作: ${operation}`, {
            operation,
            key,
            hit,
            duration: `${duration}ms`,
        });
    }
    /**
     * 記錄使用者活動
     * @param userId - 使用者 ID
     * @param action - 動作
     * @param details - 詳細資訊
     */
    logUserActivity(userId, action, details) {
        this.info(`使用者活動: ${action}`, {
            userId,
            action,
            ...details,
        });
    }
    /**
     * 記錄系統事件
     * @param event - 事件名稱
     * @param details - 詳細資訊
     */
    logSystemEvent(event, details) {
        this.info(`系統事件: ${event}`, {
            event,
            ...details,
        });
    }
    /**
     * 記錄安全事件
     * @param event - 安全事件
     * @param details - 詳細資訊
     */
    logSecurityEvent(event, details) {
        this.warn(`安全事件: ${event}`, {
            event,
            ...details,
        });
    }
    /**
     * 通用日誌方法
     * @param level - 日誌等級
     * @param message - 訊息
     * @param context - 上下文
     */
    log(level, message, context) {
        switch (level) {
            case types_1.LogLevel.ERROR:
                this.error(message, undefined, context);
                break;
            case types_1.LogLevel.WARN:
                this.warn(message, context);
                break;
            case types_1.LogLevel.INFO:
                this.info(message, context);
                break;
            case types_1.LogLevel.DEBUG:
                this.debug(message, context);
                break;
        }
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map