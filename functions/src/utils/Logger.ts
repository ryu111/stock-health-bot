import { LogLevel, LogEntry } from '../types';

// 日誌工具類別
export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;
  private isDevelopment: boolean;

  private constructor() {
    this.logLevel = LogLevel.INFO;
    this.isDevelopment = process.env['NODE_ENV'] === 'development';
  }

  /**
   * 取得單例實例
   * @returns Logger 實例
   */
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * 設定日誌等級
   * @param level - 日誌等級
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * 檢查是否應該記錄日誌
   * @param level - 日誌等級
   * @returns 是否應該記錄
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = {
      [LogLevel.ERROR]: 0,
      [LogLevel.WARN]: 1,
      [LogLevel.INFO]: 2,
      [LogLevel.DEBUG]: 3,
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
  private formatLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ): LogEntry {
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
  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const logEntry = this.formatLogEntry(LogLevel.ERROR, message, context);
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
  warn(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const logEntry = this.formatLogEntry(LogLevel.WARN, message, context);
    this.writeLog(logEntry);
  }

  /**
   * 記錄資訊日誌
   * @param message - 資訊訊息
   * @param context - 上下文
   */
  info(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const logEntry = this.formatLogEntry(LogLevel.INFO, message, context);
    this.writeLog(logEntry);
  }

  /**
   * 記錄除錯日誌
   * @param message - 除錯訊息
   * @param context - 上下文
   */
  debug(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const logEntry = this.formatLogEntry(LogLevel.DEBUG, message, context);
    this.writeLog(logEntry);
  }

  /**
   * 寫入日誌
   * @param logEntry - 日誌條目
   */
  private writeLog(logEntry: LogEntry): void {
    const timestamp = logEntry.timestamp.toISOString();
    const level = logEntry.level.toUpperCase();
    const message = logEntry.message;
    const context = logEntry.context ? ` ${JSON.stringify(logEntry.context)}` : '';
    const error = logEntry.error ? `\n${logEntry.error.stack || logEntry.error.message}` : '';

    const logMessage = `[${timestamp}] [${level}] ${message}${context}${error}`;

    // 在開發環境中輸出到控制台
    if (this.isDevelopment) {
      switch (logEntry.level) {
        case LogLevel.ERROR:
          console.error(logMessage);
          break;
        case LogLevel.WARN:
          console.warn(logMessage);
          break;
        case LogLevel.INFO:
          console.info(logMessage);
          break;
        case LogLevel.DEBUG:
          console.debug(logMessage);
          break;
      }
    } else {
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
  logApiRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    userAgent?: string
  ): void {
    const level =
      statusCode >= 400 ? LogLevel.ERROR : statusCode >= 300 ? LogLevel.WARN : LogLevel.INFO;

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
  logMemoryUsage(): void {
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
  logPerformance(operation: string, duration: number, context?: Record<string, unknown>): void {
    const level = duration > 1000 ? LogLevel.WARN : LogLevel.INFO;

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
  logDatabaseOperation(
    operation: string,
    collection: string,
    duration: number,
    success: boolean
  ): void {
    const level = success ? LogLevel.INFO : LogLevel.ERROR;

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
  logExternalApiCall(
    service: string,
    endpoint: string,
    duration: number,
    success: boolean,
    statusCode?: number
  ): void {
    const level = success ? LogLevel.INFO : LogLevel.ERROR;

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
  logCacheOperation(operation: string, key: string, hit: boolean, duration: number): void {
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
  logUserActivity(userId: string, action: string, details?: Record<string, unknown>): void {
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
  logSystemEvent(event: string, details?: Record<string, unknown>): void {
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
  logSecurityEvent(event: string, details?: Record<string, unknown>): void {
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
  log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    switch (level) {
      case LogLevel.ERROR:
        this.error(message, undefined, context);
        break;
      case LogLevel.WARN:
        this.warn(message, context);
        break;
      case LogLevel.INFO:
        this.info(message, context);
        break;
      case LogLevel.DEBUG:
        this.debug(message, context);
        break;
    }
  }
}
