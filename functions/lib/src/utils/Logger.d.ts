import { LogLevel } from '../types';
export declare class Logger {
    private static instance;
    private logLevel;
    private isDevelopment;
    private constructor();
    /**
     * 取得單例實例
     * @returns Logger 實例
     */
    static getInstance(): Logger;
    /**
     * 設定日誌等級
     * @param level - 日誌等級
     */
    setLogLevel(level: LogLevel): void;
    /**
     * 檢查是否應該記錄日誌
     * @param level - 日誌等級
     * @returns 是否應該記錄
     */
    private shouldLog;
    /**
     * 格式化日誌訊息
     * @param level - 日誌等級
     * @param message - 訊息
     * @param context - 上下文
     * @returns 格式化的日誌條目
     */
    private formatLogEntry;
    /**
     * 記錄錯誤日誌
     * @param message - 錯誤訊息
     * @param error - 錯誤物件
     * @param context - 上下文
     */
    error(message: string, error?: Error, context?: Record<string, unknown>): void;
    /**
     * 記錄警告日誌
     * @param message - 警告訊息
     * @param context - 上下文
     */
    warn(message: string, context?: Record<string, unknown>): void;
    /**
     * 記錄資訊日誌
     * @param message - 資訊訊息
     * @param context - 上下文
     */
    info(message: string, context?: Record<string, unknown>): void;
    /**
     * 記錄除錯日誌
     * @param message - 除錯訊息
     * @param context - 上下文
     */
    debug(message: string, context?: Record<string, unknown>): void;
    /**
     * 寫入日誌
     * @param logEntry - 日誌條目
     */
    private writeLog;
    /**
     * 記錄 API 請求日誌
     * @param method - HTTP 方法
     * @param path - 請求路徑
     * @param statusCode - 狀態碼
     * @param duration - 執行時間
     * @param userAgent - 使用者代理
     */
    logApiRequest(method: string, path: string, statusCode: number, duration: number, userAgent?: string): void;
    /**
     * 記錄記憶體使用狀況
     */
    logMemoryUsage(): void;
    /**
     * 記錄效能指標
     * @param operation - 操作名稱
     * @param duration - 執行時間
     * @param context - 上下文
     */
    logPerformance(operation: string, duration: number, context?: Record<string, unknown>): void;
    /**
     * 記錄資料庫操作
     * @param operation - 操作類型
     * @param collection - 集合名稱
     * @param duration - 執行時間
     * @param success - 是否成功
     */
    logDatabaseOperation(operation: string, collection: string, duration: number, success: boolean): void;
    /**
     * 記錄外部 API 呼叫
     * @param service - 服務名稱
     * @param endpoint - 端點
     * @param duration - 執行時間
     * @param success - 是否成功
     * @param statusCode - 狀態碼
     */
    logExternalApiCall(service: string, endpoint: string, duration: number, success: boolean, statusCode?: number): void;
    /**
     * 記錄快取操作
     * @param operation - 操作類型
     * @param key - 快取鍵
     * @param hit - 是否命中
     * @param duration - 執行時間
     */
    logCacheOperation(operation: string, key: string, hit: boolean, duration: number): void;
    /**
     * 記錄使用者活動
     * @param userId - 使用者 ID
     * @param action - 動作
     * @param details - 詳細資訊
     */
    logUserActivity(userId: string, action: string, details?: Record<string, unknown>): void;
    /**
     * 記錄系統事件
     * @param event - 事件名稱
     * @param details - 詳細資訊
     */
    logSystemEvent(event: string, details?: Record<string, unknown>): void;
    /**
     * 記錄安全事件
     * @param event - 安全事件
     * @param details - 詳細資訊
     */
    logSecurityEvent(event: string, details?: Record<string, unknown>): void;
    /**
     * 通用日誌方法
     * @param level - 日誌等級
     * @param message - 訊息
     * @param context - 上下文
     */
    log(level: LogLevel, message: string, context?: Record<string, unknown>): void;
}
//# sourceMappingURL=Logger.d.ts.map