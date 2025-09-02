// 公開資訊觀測站資料來源服務
import { DataSource, DataSourceType, DataSourceStatus } from '../../types/data-source';
import { MarketType } from '../../types/stock';
import { DataFetchResult, DataFetchError } from '../DataFetcher';

// 公開資訊觀測站資料來源配置
const PUBLIC_INFO_SOURCE: DataSource = {
  id: 'public_info',
  name: '公開資訊觀測站',
  type: DataSourceType.PUBLIC_INFO,
  status: DataSourceStatus.ACTIVE,
  priority: 2, // 僅次於Yahoo Finance
  reliability: 0.98, // 官方資料，可靠性最高
  updateFrequency: 'daily',
  lastUpdate: new Date(),
  nextUpdate: new Date(),
  apiEndpoint: 'https://mopsfin.twse.com.tw',
  rateLimit: {
    requestsPerMinute: 30,
    requestsPerHour: 200,
    requestsPerDay: 1000,
  },
  authentication: {
    type: 'none',
  },
  supportedMarkets: [MarketType.TW_STOCK],
  supportedDataTypes: ['financials', 'dividends', 'earnings', 'balance_sheet', 'cash_flow'],
  cost: {
    free: true,
  },
};

// 財務資料介面
interface FinancialData {
  symbol: string;
  period: string; // 年度或季度
  eps: number | null;
  revenue: number | null;
  netIncome: number | null;
  totalAssets: number | null;
  totalLiabilities: number | null;
  operatingCashFlow: number | null;
  investingCashFlow: number | null;
  financingCashFlow: number | null;
  capitalExpenditure: number | null;
  dividendPerShare: number | null;
  dividendYield: number | null;
  roe: number | null;
  roa: number | null;
  debtToEquity: number | null;
  currentRatio: number | null;
  quickRatio: number | null;
  inventoryTurnover: number | null;
  assetTurnover: number | null;
  netProfitMargin: number | null;
  grossProfitMargin: number | null;
  operatingMargin: number | null;
  revenueGrowth: number | null;
  earningsGrowth: number | null;
  lastUpdated: Date;
}

// 股利資料介面
interface DividendData {
  symbol: string;
  year: number;
  cashDividend: number | null;
  stockDividend: number | null;
  totalDividend: number | null;
  exDividendDate: string | null;
  paymentDate: string | null;
  dividendYield: number | null;
  payoutRatio: number | null;
  lastUpdated: Date;
}

// 公開資訊觀測站資料來源服務類別
export class PublicInfoSource {
  private source: DataSource;
  private cache: Map<string, { data: unknown; timestamp: Date; ttl: number }>;
  private requestCount: { minute: number; hour: number; day: number };
  private lastReset: { minute: Date; hour: Date; day: Date };

  constructor() {
    this.source = PUBLIC_INFO_SOURCE;
    this.cache = new Map();
    this.requestCount = { minute: 0, hour: 0, day: 0 };
    this.lastReset = {
      minute: new Date(),
      hour: new Date(),
      day: new Date(),
    };
  }

  /**
   * 取得財務資料
   * @param symbol - 股票代碼
   * @param year - 年度
   * @param quarter - 季度 (1-4, 0表示全年)
   * @param forceRefresh - 強制重新取得
   * @returns 財務資料
   */
  async fetchFinancialData(
    symbol: string,
    year: number,
    quarter: number = 0,
    forceRefresh: boolean = false
  ): Promise<DataFetchResult<FinancialData>> {
    try {
      console.log(`🔍 公開資訊觀測站: 開始取得 ${symbol} ${year}年${quarter > 0 ? `Q${quarter}` : '全年'}財務資料...`);

      // 檢查快取
      if (!forceRefresh) {
        const cacheKey = `${symbol}_${year}_${quarter}`;
        const cachedData = this.getCachedData<FinancialData>(cacheKey, 'financial');
        if (cachedData) {
          console.log(`📋 公開資訊觀測站: 使用快取財務資料: ${symbol}`);
          return cachedData;
        }
      }

      // 檢查速率限制
      if (!this.checkRateLimit()) {
        throw new Error('已達到速率限制，請稍後再試');
      }

      // 從公開資訊觀測站取得資料
      const financialData = await this.fetchFromPublicInfo(symbol, year, quarter);

      // 更新請求計數
      this.incrementRequestCount();

      // 快取資料
      const result: DataFetchResult<FinancialData> = {
        data: financialData,
        source: this.source,
        timestamp: new Date(),
        quality: 0.98,
        confidence: 0.95,
      };

      const cacheKey = `${symbol}_${year}_${quarter}`;
      this.cacheData(cacheKey, 'financial', result.data, 86400000); // 24小時快取

      console.log(`✅ 公開資訊觀測站: 成功取得 ${symbol} 財務資料`);
      return result;
    } catch (error) {
      console.error(`❌ 公開資訊觀測站: 取得 ${symbol} 財務資料失敗:`, error instanceof Error ? error.message : 'Unknown error');
      
      // 記錄錯誤
      const fetchError: DataFetchError = {
        symbol,
        source: this.source,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        retryable: this.isRetryableError(error),
      };

      throw new Error(`公開資訊觀測站財務資料取得失敗: ${fetchError.error}`);
    }
  }

  /**
   * 取得股利資料
   * @param symbol - 股票代碼
   * @param year - 年度
   * @param forceRefresh - 強制重新取得
   * @returns 股利資料
   */
  async fetchDividendData(
    symbol: string,
    year: number,
    forceRefresh: boolean = false
  ): Promise<DataFetchResult<DividendData>> {
    try {
      console.log(`🔍 公開資訊觀測站: 開始取得 ${symbol} ${year}年股利資料...`);

      // 檢查快取
      if (!forceRefresh) {
        const cacheKey = `${symbol}_dividend_${year}`;
        const cachedData = this.getCachedData<DividendData>(cacheKey, 'dividend');
        if (cachedData) {
          console.log(`📋 公開資訊觀測站: 使用快取股利資料: ${symbol}`);
          return cachedData;
        }
      }

      // 檢查速率限制
      if (!this.checkRateLimit()) {
        throw new Error('已達到速率限制，請稍後再試');
      }

      // 從公開資訊觀測站取得股利資料
      const dividendData = await this.fetchDividendFromPublicInfo(symbol, year);

      // 更新請求計數
      this.incrementRequestCount();

      // 快取資料
      const result: DataFetchResult<DividendData> = {
        data: dividendData,
        source: this.source,
        timestamp: new Date(),
        quality: 0.98,
        confidence: 0.95,
      };

      const cacheKey = `${symbol}_dividend_${year}`;
      this.cacheData(cacheKey, 'dividend', result.data, 86400000); // 24小時快取

      console.log(`✅ 公開資訊觀測站: 成功取得 ${symbol} 股利資料`);
      return result;
    } catch (error) {
      console.error(`❌ 公開資訊觀測站: 取得 ${symbol} 股利資料失敗:`, error instanceof Error ? error.message : 'Unknown error');
      
      // 記錄錯誤
      const fetchError: DataFetchError = {
        symbol,
        source: this.source,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        retryable: this.isRetryableError(error),
      };

      throw new Error(`公開資訊觀測站股利資料取得失敗: ${fetchError.error}`);
    }
  }

  /**
   * 取得最新年度財務資料
   * @param symbol - 股票代碼
   * @param forceRefresh - 強制重新取得
   * @returns 最新財務資料
   */
  async fetchLatestFinancialData(
    symbol: string,
    forceRefresh: boolean = false
  ): Promise<DataFetchResult<FinancialData>> {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    // 根據當前月份判斷最新季度
    let latestQuarter = 0;
    if (currentMonth >= 10) {
      latestQuarter = 3; // Q3
    } else if (currentMonth >= 7) {
      latestQuarter = 2; // Q2
    } else if (currentMonth >= 4) {
      latestQuarter = 1; // Q1
    } else {
      latestQuarter = 4; // 前一年Q4
    }

    const targetYear = latestQuarter === 4 ? currentYear - 1 : currentYear;
    
    return this.fetchFinancialData(symbol, targetYear, latestQuarter, forceRefresh);
  }

  /**
   * 取得資料來源資訊
   */
  getDataSource(): DataSource {
    return { ...this.source };
  }

  /**
   * 檢查資料來源狀態
   */
  getStatus(): DataSourceStatus {
    return this.source.status;
  }

  // 私有方法

  /**
   * 從公開資訊觀測站取得財務資料
   */
  private async fetchFromPublicInfo(symbol: string, year: number, quarter: number): Promise<FinancialData> {
    // 模擬API呼叫 - 實際實作時需要整合真實的公開資訊觀測站API
    console.log(`📡 模擬呼叫公開資訊觀測站API: ${symbol} ${year}年${quarter > 0 ? `Q${quarter}` : '全年'}`);
    
    // 模擬網路延遲
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // 模擬資料
    const baseEps = 2.5 + Math.random() * 8;
    const baseRevenue = 1000000 + Math.random() * 5000000;
    const baseNetIncome = baseRevenue * (0.1 + Math.random() * 0.2);
    
    return {
      symbol,
      period: quarter > 0 ? `${year}Q${quarter}` : `${year}全年`,
      eps: baseEps * (quarter > 0 ? 0.25 : 1),
      revenue: baseRevenue * (quarter > 0 ? 0.25 : 1),
      netIncome: baseNetIncome * (quarter > 0 ? 0.25 : 1),
      totalAssets: baseRevenue * (2 + Math.random() * 2),
      totalLiabilities: baseRevenue * (0.5 + Math.random() * 1),
      operatingCashFlow: baseNetIncome * (1.2 + Math.random() * 0.6),
      investingCashFlow: -(baseRevenue * (0.1 + Math.random() * 0.2)),
      financingCashFlow: -(baseRevenue * (0.05 + Math.random() * 0.1)),
      capitalExpenditure: -(baseRevenue * (0.08 + Math.random() * 0.15)),
      dividendPerShare: baseEps * (0.3 + Math.random() * 0.4),
      dividendYield: (baseEps * (0.3 + Math.random() * 0.4)) / (50 + Math.random() * 100) * 100,
      roe: (0.08 + Math.random() * 0.15) * 100,
      roa: (0.04 + Math.random() * 0.08) * 100,
      debtToEquity: 0.3 + Math.random() * 0.7,
      currentRatio: 1.5 + Math.random() * 1.5,
      quickRatio: 1.0 + Math.random() * 1.0,
      inventoryTurnover: 4 + Math.random() * 8,
      assetTurnover: 0.5 + Math.random() * 0.5,
      netProfitMargin: (0.08 + Math.random() * 0.12) * 100,
      grossProfitMargin: (0.2 + Math.random() * 0.3) * 100,
      operatingMargin: (0.12 + Math.random() * 0.18) * 100,
      revenueGrowth: (-0.1 + Math.random() * 0.3) * 100,
      earningsGrowth: (-0.15 + Math.random() * 0.4) * 100,
      lastUpdated: new Date(),
    };
  }

  /**
   * 從公開資訊觀測站取得股利資料
   */
  private async fetchDividendFromPublicInfo(symbol: string, year: number): Promise<DividendData> {
    // 模擬API呼叫
    console.log(`📡 模擬呼叫公開資訊觀測站股利API: ${symbol} ${year}年`);
    
    // 模擬網路延遲
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1500));
    
    // 模擬股利資料
    const baseEps = 2.5 + Math.random() * 8;
    const cashDividend = baseEps * (0.3 + Math.random() * 0.4);
    const stockDividend = Math.random() > 0.7 ? baseEps * (0.1 + Math.random() * 0.2) : 0;
    const totalDividend = cashDividend + stockDividend;
    
    return {
      symbol,
      year,
      cashDividend,
      stockDividend,
      totalDividend,
      exDividendDate: `${year}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      paymentDate: `${year}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      dividendYield: totalDividend / (50 + Math.random() * 100) * 100,
      payoutRatio: (totalDividend / baseEps) * 100,
      lastUpdated: new Date(),
    };
  }

  /**
   * 檢查速率限制
   */
  private checkRateLimit(): boolean {
    const now = new Date();
    
    // 重置計數器
    if (now.getTime() - this.lastReset.minute.getTime() >= 60000) {
      this.requestCount.minute = 0;
      this.lastReset.minute = now;
    }
    if (now.getTime() - this.lastReset.hour.getTime() >= 3600000) {
      this.requestCount.hour = 0;
      this.lastReset.hour = now;
    }
    if (now.getTime() - this.lastReset.day.getTime() >= 86400000) {
      this.requestCount.day = 0;
      this.lastReset.day = now;
    }

    // 檢查限制
    if (this.requestCount.minute >= (this.source.rateLimit?.requestsPerMinute || 30)) {
      return false;
    }
    if (this.requestCount.hour >= (this.source.rateLimit?.requestsPerHour || 200)) {
      return false;
    }
    if (this.requestCount.day >= (this.source.rateLimit?.requestsPerDay || 1000)) {
      return false;
    }

    return true;
  }

  /**
   * 增加請求計數
   */
  private incrementRequestCount(): void {
    this.requestCount.minute++;
    this.requestCount.hour++;
    this.requestCount.day++;
  }

  /**
   * 快取資料
   */
  private cacheData<T>(key: string, type: string, data: T, ttl: number): void {
    const cacheKey = `public_info_${type}:${key}`;
    this.cache.set(cacheKey, {
      data,
      timestamp: new Date(),
      ttl,
    });
  }

  /**
   * 取得快取資料
   */
  private getCachedData<T>(key: string, type: string): DataFetchResult<T> | null {
    const cacheKey = `public_info_${type}:${key}`;
    const cached = this.cache.get(cacheKey);
    
    if (!cached) return null;
    
    const now = new Date();
    if (now.getTime() - cached.timestamp.getTime() > cached.ttl) {
      this.cache.delete(cacheKey);
      return null;
    }

    return {
      data: cached.data as T,
      source: this.source,
      timestamp: cached.timestamp,
      quality: 0.95,
      confidence: 0.90,
    };
  }

  /**
   * 判斷錯誤是否可重試
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      // 網路錯誤、超時等可以重試
      return message.includes('timeout') || 
             message.includes('network') || 
             message.includes('rate limit') ||
             message.includes('temporary') ||
             message.includes('service unavailable');
    }
    return false;
  }
}
