import { CacheConfig } from '../types';
export declare class Cache {
    private cache;
    private config;
    private cleanupTimer?;
    constructor(config: CacheConfig);
    /**
     * 設定快取項目
     * @param key - 快取鍵
     * @param value - 快取值
     * @param ttl - 存活時間（秒）
     */
    set<T>(key: string, value: T, ttl?: number): void;
    /**
     * 取得快取項目
     * @param key - 快取鍵
     * @returns 快取值或 undefined
     */
    get<T>(key: string): T | undefined;
    /**
     * 檢查快取項目是否存在
     * @param key - 快取鍵
     * @returns 是否存在
     */
    has(key: string): boolean;
    /**
     * 刪除快取項目
     * @param key - 快取鍵
     * @returns 是否成功刪除
     */
    delete(key: string): boolean;
    /**
     * 清空所有快取
     */
    clear(): void;
    /**
     * 取得快取大小
     * @returns 快取項目數量
     */
    size(): number;
    /**
     * 取得快取統計
     * @returns 快取統計資訊
     */
    getStats(): {
        size: number;
        maxSize: number;
        hitRate: number;
        missRate: number;
        totalHits: number;
        totalMisses: number;
    };
    /**
     * 取得快取狀態
     * @returns 快取狀態資訊
     */
    getStatus(): {
        size: number;
        maxSize: number;
        ttl: number;
        entries: Array<{
            key: string;
            createdAt: string;
            expiresAt: string;
            accessCount: number;
            lastAccessed: string;
        }>;
    };
    /**
     * 手動清理過期項目
     * @returns 清理的項目數量
     */
    manualCleanup(): number;
    /**
     * 取得最常存取的項目
     * @param limit - 限制數量
     * @returns 最常存取的項目
     */
    getMostAccessed(limit?: number): Array<{
        key: string;
        accessCount: number;
    }>;
    /**
     * 取得最近存取的項目
     * @param limit - 限制數量
     * @returns 最近存取的項目
     */
    getRecentlyAccessed(limit?: number): Array<{
        key: string;
        lastAccessed: string;
    }>;
    /**
     * 取得最舊的項目
     * @param limit - 限制數量
     * @returns 最舊的項目
     */
    getOldest(limit?: number): Array<{
        key: string;
        createdAt: string;
    }>;
    /**
     * 強制執行大小限制
     */
    private enforceSizeLimit;
    /**
     * 啟動清理計時器
     */
    private startCleanupTimer;
    /**
     * 停止清理計時器
     */
    stopCleanupTimer(): void;
    /**
     * 清理資源
     */
    cleanup(): void;
}
//# sourceMappingURL=Cache.d.ts.map