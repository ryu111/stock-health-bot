// Yahoo Finance 資料來源服務
import { DataSource, DataSourceType, DataSourceStatus } from '../../types/data-source';
import { StockData, ETFData, MarketType } from '../../types/stock';
import { DataFetchResult, DataFetchError } from '../DataFetcher';

// Yahoo Finance 型別定義
interface YahooFinanceQuote {
  symbol: string;
  longName?: string;
  shortName?: string;
  regularMarketPrice?: number;
  volume?: number;
  dividendYield?: number;
  marketCap?: number;
  currency?: string;
  trailingPE?: number;
  priceToBook?: number;
  trailingEps?: number;
  returnOnEquity?: number;
  debtToEquity?: number;
  currentRatio?: number;
  quickRatio?: number;
  profitMargins?: number;
  grossMargins?: number;
  operatingMargins?: number;
  revenueGrowth?: number;
  earningsGrowth?: number;
  beta?: number;
  regularMarketDayRange?: string;
  sector?: string;
  industry?: string;
  longBusinessSummary?: string;
  website?: string;
  fullTimeEmployees?: number;
  founded?: number;
  expenseRatio?: number;
  holdings?: number;
  assetClass?: string;
  category?: string;
  issuer?: string;
  inceptionDate?: string;
  trackingError?: number;
  previousClose?: number;
  averageVolume?: number;
  inventoryTurnover?: number;
  assetTurnover?: number;
  netIncomeToCommon?: number;
}

interface YahooFinanceHistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Yahoo Finance 資料來源配置
const YAHOO_FINANCE_SOURCE: DataSource = {
  id: 'yahoo_finance',
  name: 'Yahoo Finance',
  type: DataSourceType.YAHOO_FINANCE,
  status: DataSourceStatus.ACTIVE,
  priority: 1,
  reliability: 0.95,
  updateFrequency: 'realtime',
  lastUpdate: new Date(),
  nextUpdate: new Date(),
  apiEndpoint: 'https://query1.finance.yahoo.com',
  rateLimit: {
    requestsPerMinute: 100,
    requestsPerHour: 1000,
    requestsPerDay: 10000,
  },
  authentication: {
    type: 'none',
  },
  supportedMarkets: [MarketType.TW_STOCK, MarketType.ETF, MarketType.US_STOCK],
  supportedDataTypes: ['price', 'fundamentals', 'dividends', 'financials', 'historical'],
  cost: {
    free: true,
  },
};

// Yahoo Finance 資料來源服務類別
export class YahooFinanceSource {
  private yahooFinance: any;
  private source: DataSource;
  private cache: Map<string, { data: unknown; timestamp: Date; ttl: number }>;
  private requestCount: { minute: number; hour: number; day: number };
  private lastReset: { minute: Date; hour: Date; day: Date };

  constructor() {
    this.source = YAHOO_FINANCE_SOURCE;
    this.cache = new Map();
    this.requestCount = { minute: 0, hour: 0, day: 0 };
    this.lastReset = {
      minute: new Date(),
      hour: new Date(),
      day: new Date(),
    };
    
    // 動態載入 yahoo-finance2 模組
    try {
      this.yahooFinance = require('yahoo-finance2').default;
    } catch (error) {
      console.error('❌ 無法載入 yahoo-finance2 模組:', error);
      this.yahooFinance = null;
    }
  }

  /**
   * 取得股票資料
   * @param symbol - 股票代碼
   * @param forceRefresh - 強制重新取得
   * @returns 股票資料
   */
  async fetchStockData(symbol: string, forceRefresh: boolean = false): Promise<DataFetchResult<StockData>> {
    try {
      console.log(`🔍 Yahoo Finance: 開始取得 ${symbol} 股票資料...`);

      // 檢查快取
      if (!forceRefresh) {
        const cachedData = this.getCachedData<StockData>(symbol, 'stock');
        if (cachedData) {
          console.log(`📋 Yahoo Finance: 使用快取資料: ${symbol}`);
          return cachedData;
        }
      }

      // 檢查速率限制
      if (!this.checkRateLimit()) {
        throw new Error('已達到速率限制，請稍後再試');
      }

      // 格式化股票代碼
      const formattedSymbol = this.formatSymbol(symbol);

      // 從 Yahoo Finance 取得資料
      const yahooData = await this.fetchFromYahooFinance(formattedSymbol);

      // 轉換為股票資料格式
      const stockData: StockData = this.convertToStockData(yahooData, symbol);

      // 更新請求計數
      this.incrementRequestCount();

      // 快取資料
      const result: DataFetchResult<StockData> = {
        data: stockData,
        source: this.source,
        timestamp: new Date(),
        quality: 0.95,
        confidence: 0.90,
      };

      this.cacheData(symbol, 'stock', result.data, 300000); // 5分鐘快取

      console.log(`✅ Yahoo Finance: 成功取得 ${symbol} 股票資料`);
      return result;
    } catch (error) {
      console.error(`❌ Yahoo Finance: 取得 ${symbol} 股票資料失敗:`, error instanceof Error ? error.message : 'Unknown error');
      
      // 記錄錯誤
      const fetchError: DataFetchError = {
        symbol,
        source: this.source,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        retryable: this.isRetryableError(error),
      };

      throw new Error(`Yahoo Finance 資料取得失敗: ${fetchError.error}`);
    }
  }

  /**
   * 取得ETF資料
   * @param symbol - ETF代碼
   * @param forceRefresh - 強制重新取得
   * @returns ETF資料
   */
  async fetchETFData(symbol: string, forceRefresh: boolean = false): Promise<DataFetchResult<ETFData>> {
    try {
      console.log(`🔍 Yahoo Finance: 開始取得 ${symbol} ETF資料...`);

      // 檢查快取
      if (!forceRefresh) {
        const cachedData = this.getCachedData<ETFData>(symbol, 'etf');
        if (cachedData) {
          console.log(`📋 Yahoo Finance: 使用快取資料: ${symbol}`);
          return cachedData;
        }
      }

      // 檢查速率限制
      if (!this.checkRateLimit()) {
        throw new Error('已達到速率限制，請稍後再試');
      }

      // 格式化ETF代碼
      const formattedSymbol = this.formatSymbol(symbol);

      // 從 Yahoo Finance 取得資料
      const yahooData = await this.fetchFromYahooFinance(formattedSymbol);

      // 轉換為ETF資料格式
      const etfData: ETFData = this.convertToETFData(yahooData, symbol);

      // 更新請求計數
      this.incrementRequestCount();

      // 快取資料
      const result: DataFetchResult<ETFData> = {
        data: etfData,
        source: this.source,
        timestamp: new Date(),
        quality: 0.95,
        confidence: 0.90,
      };

      this.cacheData(symbol, 'etf', result.data, 300000); // 5分鐘快取

      console.log(`✅ Yahoo Finance: 成功取得 ${symbol} ETF資料`);
      return result;
    } catch (error) {
      console.error(`❌ Yahoo Finance: 取得 ${symbol} ETF資料失敗:`, error instanceof Error ? error.message : 'Unknown error');
      
      // 記錄錯誤
      const fetchError: DataFetchError = {
        symbol,
        source: this.source,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        retryable: this.isRetryableError(error),
      };

      throw new Error(`Yahoo Finance ETF資料取得失敗: ${fetchError.error}`);
    }
  }

  /**
   * 取得歷史資料
   * @param symbol - 股票代碼
   * @param period - 期間 (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
   * @returns 歷史資料
   */
  async fetchHistoricalData(
    symbol: string,
    period: string = '1y'
  ): Promise<DataFetchResult<YahooFinanceHistoricalData[]>> {
    try {
      console.log(`🔍 Yahoo Finance: 開始取得 ${symbol} 歷史資料 (${period})...`);

      // 檢查快取
      const cacheKey = `${symbol}_${period}`;
      const cachedData = this.getCachedData<YahooFinanceHistoricalData[]>(cacheKey, 'historical');
      if (cachedData) {
        console.log(`📋 Yahoo Finance: 使用快取歷史資料: ${symbol}`);
        return cachedData;
      }

      // 檢查速率限制
      if (!this.checkRateLimit()) {
        throw new Error('已達到速率限制，請稍後再試');
      }

      // 格式化股票代碼
      const formattedSymbol = this.formatSymbol(symbol);

      // 從 Yahoo Finance 取得歷史資料
      const historicalData = await this.yahooFinance.historical(formattedSymbol, { period });

      // 更新請求計數
      this.incrementRequestCount();

      // 快取資料
      const result: DataFetchResult<YahooFinanceHistoricalData[]> = {
        data: historicalData,
        source: this.source,
        timestamp: new Date(),
        quality: 0.95,
        confidence: 0.90,
      };

      this.cacheData(cacheKey, 'historical', result.data, 3600000); // 1小時快取

      console.log(`✅ Yahoo Finance: 成功取得 ${symbol} 歷史資料 (${historicalData.length} 筆)`);
      return result;
    } catch (error) {
      console.error(`❌ Yahoo Finance: 取得 ${symbol} 歷史資料失敗:`, error instanceof Error ? error.message : 'Unknown error');
      throw new Error(`Yahoo Finance 歷史資料取得失敗: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
    if (!this.yahooFinance) {
      return DataSourceStatus.ERROR;
    }
    return this.source.status;
  }

  // 私有方法

  /**
   * 從 Yahoo Finance 取得資料
   */
  private async fetchFromYahooFinance(symbol: string): Promise<YahooFinanceQuote> {
    if (!this.yahooFinance) {
      throw new Error('Yahoo Finance 模組未載入');
    }

    try {
      const quote = await this.yahooFinance.quote(symbol);
      if (!quote || !quote.symbol) {
        throw new Error('無效的股票資料');
      }
      return quote;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        throw new Error(`找不到股票: ${symbol}`);
      }
      throw error;
    }
  }

  /**
   * 轉換為股票資料格式
   */
  private convertToStockData(yahooData: YahooFinanceQuote, symbol: string): StockData {
    return {
      symbol: yahooData.symbol || symbol,
      name: yahooData.longName || yahooData.shortName || symbol,
      price: yahooData.regularMarketPrice || null,
      volume: yahooData.volume || null,
      dividendYield: yahooData.dividendYield || null,
      marketCap: yahooData.marketCap || null,
      currency: yahooData.currency || 'TWD',
      peRatio: yahooData.trailingPE || null,
      pbRatio: yahooData.priceToBook || null,
      eps: yahooData.trailingEps || null,
      roe: yahooData.returnOnEquity || null,
      debtToEquity: yahooData.debtToEquity || null,
      currentRatio: yahooData.currentRatio || null,
      quickRatio: yahooData.quickRatio || null,
      inventoryTurnover: yahooData.inventoryTurnover || null,
      assetTurnover: yahooData.assetTurnover || null,
      netProfitMargin: yahooData.netIncomeToCommon || null,
      grossProfitMargin: yahooData.grossMargins || null,
      operatingMargin: yahooData.operatingMargins || null,
      revenueGrowth: yahooData.revenueGrowth || null,
      earningsGrowth: yahooData.earningsGrowth || null,
      beta: yahooData.beta || null,
      volatility: yahooData.regularMarketDayRange
        ? this.calculateVolatility(yahooData.regularMarketDayRange)
        : null,
      sharpeRatio: null,
      maxDrawdown: null,
      var95: null,
      sector: yahooData.sector || '',
      industry: yahooData.industry || '',
      description: yahooData.longBusinessSummary || '',
      website: yahooData.website || '',
      employees: yahooData.fullTimeEmployees || null,
      founded: yahooData.founded || null,
      marketType: MarketType.TW_STOCK,
      lastUpdated: new Date(),
    };
  }

  /**
   * 轉換為ETF資料格式
   */
  private convertToETFData(yahooData: YahooFinanceQuote, symbol: string): ETFData {
    const baseData = this.convertToStockData(yahooData, symbol);
    
    return {
      ...baseData,
      marketType: MarketType.ETF,
      expenseRatio: yahooData.expenseRatio || null,
      holdings: yahooData.holdings || null,
      assetClass: yahooData.assetClass || null,
      category: yahooData.category || null,
    };
  }

  /**
   * 格式化股票代碼
   */
  private formatSymbol(symbol: string): string {
    // 台股加上 .TW 後綴
    if (/^\d{4}$/.test(symbol)) {
      return `${symbol}.TW`;
    }
    // 美股保持原樣
    if (symbol.includes('.')) {
      return symbol;
    }
    // 其他情況加上 .TW
    return `${symbol}.TW`;
  }

  /**
   * 計算波動率
   */
  private calculateVolatility(dayRange: string): number | null {
    try {
      const parts = dayRange.split('-');
      if (parts.length !== 2) return null;
      
      const low = Number(parts[0]);
      const high = Number(parts[1]);
      
      if (isNaN(low) || isNaN(high)) return null;
      
      const mid = (low + high) / 2;
      return ((high - low) / mid) * 100; // 百分比波動率
    } catch {
      return null;
    }
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
    if (this.requestCount.minute >= (this.source.rateLimit?.requestsPerMinute || 100)) {
      return false;
    }
    if (this.requestCount.hour >= (this.source.rateLimit?.requestsPerHour || 1000)) {
      return false;
    }
    if (this.requestCount.day >= (this.source.rateLimit?.requestsPerDay || 10000)) {
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
    const cacheKey = `yahoo_${type}:${key}`;
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
    const cacheKey = `yahoo_${type}:${key}`;
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
      quality: 0.9,
      confidence: 0.85,
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
             message.includes('temporary');
    }
    return false;
  }
}
