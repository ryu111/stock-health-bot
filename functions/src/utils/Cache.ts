import { CacheConfig, CacheEntry } from '../types';
import { ValuationResult } from '../types/valuation';
import { HealthReport } from '../types/health-score';

// 快取類別
export class Cache {
  private cache: Map<string, CacheEntry<unknown>>;
  private config: CacheConfig;
  private cleanupTimer?: NodeJS.Timeout | undefined;

  constructor(config: CacheConfig) {
    this.config = config;
    this.cache = new Map();
    this.startCleanupTimer();
  }

  /**
   * 設定快取項目
   * @param key - 快取鍵
   * @param value - 快取值
   * @param ttl - 存活時間（秒）
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (ttl || this.config.ttl) * 1000);

    const entry: CacheEntry<T> = {
      key,
      value,
      createdAt: now,
      expiresAt,
      accessCount: 0,
      lastAccessed: now,
    };

    this.cache.set(key, entry);
    this.enforceSizeLimit();
  }

  /**
   * 取得快取項目
   * @param key - 快取鍵
   * @returns 快取值或 undefined
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    // 檢查是否過期
    if (new Date() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    // 更新存取統計
    entry.accessCount++;
    entry.lastAccessed = new Date();

    return entry.value as T;
  }

  /**
   * 檢查快取項目是否存在
   * @param key - 快取鍵
   * @returns 是否存在
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // 檢查是否過期
    if (new Date() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 刪除快取項目
   * @param key - 快取鍵
   * @returns 是否成功刪除
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空所有快取
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 取得快取大小
   * @returns 快取項目數量
   */
  size(): number {
    return this.cache.size;
  }

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
  } {
    const totalHits = Array.from(this.cache.values()).reduce(
      (sum, entry) => sum + entry.accessCount,
      0
    );
    const totalMisses = 0; // 這裡需要額外的追蹤機制

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: totalHits / (totalHits + totalMisses) || 0,
      missRate: totalMisses / (totalHits + totalMisses) || 0,
      totalHits,
      totalMisses,
    };
  }

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
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      createdAt: entry.createdAt.toISOString(),
      expiresAt: entry.expiresAt.toISOString(),
      accessCount: entry.accessCount,
      lastAccessed: entry.lastAccessed.toISOString(),
    }));

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      ttl: this.config.ttl,
      entries,
    };
  }

  /**
   * 手動清理過期項目
   * @returns 清理的項目數量
   */
  manualCleanup(): number {
    const now = new Date();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * 取得最常存取的項目
   * @param limit - 限制數量
   * @returns 最常存取的項目
   */
  getMostAccessed(limit: number = 10): Array<{ key: string; accessCount: number }> {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, accessCount: entry.accessCount }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit);

    return entries;
  }

  /**
   * 取得最近存取的項目
   * @param limit - 限制數量
   * @returns 最近存取的項目
   */
  getRecentlyAccessed(limit: number = 10): Array<{ key: string; lastAccessed: string }> {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        key,
        lastAccessed: entry.lastAccessed.toISOString(),
      }))
      .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
      .slice(0, limit);

    return entries;
  }

  /**
   * 取得最舊的項目
   * @param limit - 限制數量
   * @returns 最舊的項目
   */
  getOldest(limit: number = 10): Array<{ key: string; createdAt: string }> {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        key,
        createdAt: entry.createdAt.toISOString(),
      }))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(0, limit);

    return entries;
  }

  /**
   * 強制執行大小限制
   */
  private enforceSizeLimit(): void {
    if (this.cache.size <= this.config.maxSize) {
      return;
    }

    // 移除最舊的項目
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, entry }))
      .sort((a, b) => a.entry.lastAccessed.getTime() - b.entry.lastAccessed.getTime());

    const toRemove = this.cache.size - this.config.maxSize;

    for (let i = 0; i < toRemove; i++) {
      const entry = entries[i];
      if (entry && entry.key) {
        this.cache.delete(entry.key);
      }
    }
  }

  /**
   * 啟動清理計時器
   */
  private startCleanupTimer(): void {
    if (this.config.cleanupInterval) {
      this.cleanupTimer = setInterval(() => {
        this.manualCleanup();
      }, this.config.cleanupInterval);
    }
  }

  /**
   * 停止清理計時器
   */
  stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.cleanupTimer = undefined;
  }

  /**
   * 清理資源
   */
  cleanup(): void {
    this.stopCleanupTimer();
    this.clear();
  }

  /**
   * 快取估值結果
   * @param symbol - 股票代碼
   * @param method - 估值方法
   * @param result - 估值結果
   * @param ttl - 存活時間（秒）
   */
  cacheValuationResult(
    symbol: string,
    method: string,
    result: ValuationResult,
    ttl?: number
  ): void {
    const key = `valuation:${symbol}:${method}`;
    this.set(key, result, ttl || this.config.ttl);
  }

  /**
   * 取得快取的估值結果
   * @param symbol - 股票代碼
   * @param method - 估值方法
   * @returns 估值結果或 undefined
   */
  getCachedValuationResult(symbol: string, method: string): ValuationResult | undefined {
    const key = `valuation:${symbol}:${method}`;
    return this.get<ValuationResult>(key);
  }

  /**
   * 快取體質分析報告
   * @param symbol - 股票代碼
   * @param report - 體質分析報告
   * @param ttl - 存活時間（秒）
   */
  cacheHealthReport(symbol: string, report: HealthReport, ttl?: number): void {
    const key = `health:${symbol}`;
    this.set(key, report, ttl || this.config.ttl);
  }

  /**
   * 取得快取的體質分析報告
   * @param symbol - 股票代碼
   * @returns 體質分析報告或 undefined
   */
  getCachedHealthReport(symbol: string): HealthReport | undefined {
    const key = `health:${symbol}`;
    return this.get<HealthReport>(key);
  }

  /**
   * 快取綜合分析結果
   * @param symbol - 股票代碼
   * @param result - 綜合分析結果
   * @param ttl - 存活時間（秒）
   */
  cacheComprehensiveAnalysis(symbol: string, result: unknown, ttl?: number): void {
    const key = `comprehensive:${symbol}`;
    this.set(key, result, ttl || this.config.ttl);
  }

  /**
   * 取得快取的綜合分析結果
   * @param symbol - 股票代碼
   * @returns 綜合分析結果或 undefined
   */
  getCachedComprehensiveAnalysis(symbol: string): unknown | undefined {
    const key = `comprehensive:${symbol}`;
    return this.get<unknown>(key);
  }

  /**
   * 清除特定股票的所有快取
   * @param symbol - 股票代碼
   */
  clearStockCache(symbol: string): void {
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (key.includes(symbol)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * 取得快取統計資訊
   * @returns 快取統計資訊
   */
  getCacheStats(): {
    totalEntries: number;
    totalSize: number;
    hitRate: number;
    averageAccessCount: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  } {
    if (this.cache.size === 0) {
      return {
        totalEntries: 0,
        totalSize: 0,
        hitRate: 0,
        averageAccessCount: 0,
        oldestEntry: null,
        newestEntry: null,
      };
    }

    let totalSize = 0;
    let totalAccessCount = 0;
    let oldestDate = new Date();
    let newestDate = new Date(0);

    for (const entry of this.cache.values()) {
      totalSize += JSON.stringify(entry.value).length;
      totalAccessCount += entry.accessCount;

      if (entry.createdAt < oldestDate) {
        oldestDate = entry.createdAt;
      }

      if (entry.createdAt > newestDate) {
        newestDate = entry.createdAt;
      }
    }

    return {
      totalEntries: this.cache.size,
      totalSize,
      hitRate: totalAccessCount / this.cache.size,
      averageAccessCount: totalAccessCount / this.cache.size,
      oldestEntry: oldestDate,
      newestEntry: newestDate,
    };
  }
}
