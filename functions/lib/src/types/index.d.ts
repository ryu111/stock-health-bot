export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: string;
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    offset?: number;
}
export declare class AppError extends Error {
    readonly code: ErrorCode;
    readonly statusCode: number;
    readonly isOperational: boolean;
    constructor(message: string, code?: ErrorCode, statusCode?: number, isOperational?: boolean);
}
export declare enum ErrorCode {
    VALIDATION_ERROR = "VALIDATION_ERROR",
    NOT_FOUND = "NOT_FOUND",
    UNAUTHORIZED = "UNAUTHORIZED",
    FORBIDDEN = "FORBIDDEN",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
    EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR",
    DATABASE_ERROR = "DATABASE_ERROR",
    CACHE_ERROR = "CACHE_ERROR",
    UNKNOWN_ERROR = "UNKNOWN_ERROR"
}
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
export declare enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    DEBUG = "debug"
}
export interface LogEntry {
    timestamp: Date;
    level: LogLevel;
    message: string;
    context?: Record<string, unknown>;
    error?: Error;
}
export interface CacheConfig {
    ttl: number;
    maxSize: number;
    cleanupInterval?: number;
}
export interface CacheEntry<T = unknown> {
    key: string;
    value: T;
    createdAt: Date;
    expiresAt: Date;
    accessCount: number;
    lastAccessed: Date;
}
export interface MarketData {
    type: string;
    data: unknown;
}
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
export interface FormatOptions {
    currency?: string;
    locale?: string;
    precision?: number;
    showSymbol?: boolean;
}
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
export interface Statistics {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    cacheHitRate: number;
    errorRate: number;
    lastUpdated: string;
}
export * from './stock';
export * from './line';
export * from './analysis';
//# sourceMappingURL=index.d.ts.map