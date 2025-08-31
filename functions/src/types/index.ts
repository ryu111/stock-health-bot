// 通用 API 回應格式
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// 分頁參數
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

// 應用程式錯誤
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 錯誤代碼
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// 應用程式配置
export interface AppConfig {
  environment: 'development' | 'staging' | 'production';
  logLevel: LogLevel;
  firebase: {
    projectId: string;
    region: string;
    storageBucket?: string;
  };
  line: {
    channelAccessToken: string;
    channelSecret: string;
  };
  yahooFinance: {
    apiKey: string;
    baseUrl: string;
  };
  cache: {
    ttl: number;
    maxSize: number;
    cleanupInterval?: number;
  };
  analysis: {
    defaultEngine: 'fixed-formula' | 'ai';
    aiApiKey: string;
    aiEndpoint: string;
  };
  localization: {
    defaultLanguage: string;
    supportedLanguages: string[];
  };
}

// 日誌等級
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

// 日誌條目
export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
}

// 快取配置
export interface CacheConfig {
  ttl: number;
  maxSize: number;
  cleanupInterval?: number;
}

// 快取條目
export interface CacheEntry<T = unknown> {
  key: string;
  value: T;
  createdAt: Date;
  expiresAt: Date;
  accessCount: number;
  lastAccessed: Date;
}

// 市場資料
export interface MarketData {
  type: string;
  data: unknown;
}

// 驗證結果
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// 格式化選項
export interface FormatOptions {
  currency?: string;
  locale?: string;
  precision?: number;
  showSymbol?: boolean;
}

// 健康檢查結果
export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  checks: {
    [key: string]: {
      status: 'healthy' | 'unhealthy';
      message?: string;
      duration?: number;
    };
  };
  version: string;
  environment: string;
}

// 效能指標
export interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  cpuUsage: number;
  activeConnections: number;
}

// 統計資料
export interface Statistics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  lastUpdated: string;
}

// 重新匯出其他模組的類型
export * from './stock';
export * from './line';
export * from './analysis';
