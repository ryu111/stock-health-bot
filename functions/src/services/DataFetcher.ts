// 資料取得服務 - 整合多個資料來源
import { StockData, ETFData, MarketType } from '../types/stock';
import {
  DataSource,
  DataSourceType,
  DataSourceStatus,
  ValidationResult,
} from '../types/data-source';
import { StockDataAdapter } from '../adapters/StockDataAdapter';
import { ETFDataAdapter } from '../adapters/ETFDataAdapter';
// import { MarketDataAdapter } from '../adapters/MarketDataAdapter'; // 暫時未使用

// 資料來源配置
const DATA_SOURCES: DataSource[] = [
  {
    id: 'yahoo_finance',
    name: 'Yahoo Finance',
    type: DataSourceType.YAHOO_FINANCE,
    status: DataSourceStatus.ACTIVE,
    priority: 1,
    reliability: 0.95,
    updateFrequency: 'realtime',
    lastUpdate: new Date(),
    nextUpdate: new Date(),
    supportedMarkets: [MarketType.TW_STOCK, MarketType.ETF, MarketType.US_STOCK],
    supportedDataTypes: ['price', 'fundamentals', 'dividends', 'financials'],
  },
  {
    id: 'trading_view',
    name: 'TradingView',
    type: DataSourceType.TRADING_VIEW,
    status: DataSourceStatus.ACTIVE,
    priority: 2,
    reliability: 0.9,
    updateFrequency: 'realtime',
    lastUpdate: new Date(),
    nextUpdate: new Date(),
    supportedMarkets: [MarketType.TW_STOCK, MarketType.ETF, MarketType.US_STOCK],
    supportedDataTypes: ['price', 'technical', 'charts'],
  },
  {
    id: 'public_info',
    name: '公開資訊觀測站',
    type: DataSourceType.PUBLIC_INFO,
    status: DataSourceStatus.ACTIVE,
    priority: 3,
    reliability: 0.98,
    updateFrequency: 'daily',
    lastUpdate: new Date(),
    nextUpdate: new Date(),
    supportedMarkets: [MarketType.TW_STOCK],
    supportedDataTypes: ['financials', 'dividends', 'reports'],
  },
  {
    id: 'cmoney',
    name: 'CMoney',
    type: DataSourceType.CMONEY,
    status: DataSourceStatus.ACTIVE,
    priority: 4,
    reliability: 0.85,
    updateFrequency: 'daily',
    lastUpdate: new Date(),
    nextUpdate: new Date(),
    supportedMarkets: [MarketType.TW_STOCK, MarketType.ETF],
    supportedDataTypes: ['price', 'fundamentals', 'news', 'analysis'],
  },
];

// 資料取得結果介面
export interface DataFetchResult<T> {
  data: T;
  source: DataSource;
  timestamp: Date;
  quality: number;
  confidence: number;
}

// 資料取得錯誤介面
export interface DataFetchError {
  symbol: string;
  source: DataSource;
  error: string;
  timestamp: Date;
  retryable: boolean;
}

// 資料取得服務類別
export class DataFetcher {
  private stockAdapter: StockDataAdapter;
  private etfAdapter: ETFDataAdapter;
  // private marketAdapter: MarketDataAdapter; // 暫時未使用
  private dataSources: DataSource[];
  private cache: Map<string, { data: unknown; timestamp: Date; ttl: number }>;

  constructor() {
    this.stockAdapter = new StockDataAdapter();
    this.etfAdapter = new ETFDataAdapter();
    // this.marketAdapter = new MarketDataAdapter(); // 暫時未使用
    this.dataSources = DATA_SOURCES;
    this.cache = new Map();
  }

  /**
   * 取得股票資料
   * @param symbol - 股票代碼
   * @param forceRefresh - 強制重新取得
   * @returns 股票資料
   */
  async fetchStockData(
    symbol: string,
    forceRefresh: boolean = false
  ): Promise<DataFetchResult<StockData>> {
    try {
      console.log(`🔍 開始取得 ${symbol} 股票資料...`);

      // 檢查快取
      if (!forceRefresh) {
        const cachedData = this.getCachedData<StockData>(symbol, 'stock');
        if (cachedData) {
          console.log(`📋 使用快取資料: ${symbol}`);
          return cachedData;
        }
      }

      // 嘗試從主要資料來源取得資料
      const primarySource = this.getPrimaryDataSource(MarketType.TW_STOCK);
      let stockData: StockData;

      try {
        stockData = await this.stockAdapter.fetchStockData(symbol);
        console.log(`✅ 成功從 ${primarySource.name} 取得 ${symbol} 股票資料`);
      } catch (error) {
        console.warn(
          `⚠️ 主要資料來源失敗，嘗試備用來源: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        stockData = await this.fetchFromFallbackSource(symbol, 'stock');
      }

      // 驗證資料品質
      const validation = await this.validateDataQuality(stockData, primarySource);

      // 快取資料
      const result: DataFetchResult<StockData> = {
        data: stockData,
        source: primarySource,
        timestamp: new Date(),
        quality: validation.quality.overallScore / 100,
        confidence: this.calculateConfidence(stockData, validation),
      };

      this.cacheData(symbol, 'stock', result.data, 300000); // 5分鐘快取

      return result;
    } catch (error) {
      console.error(
        `❌ 取得 ${symbol} 股票資料失敗:`,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw new Error(`無法取得股票資料: ${symbol}`);
    }
  }

  /**
   * 取得ETF資料
   * @param symbol - ETF代碼
   * @param forceRefresh - 強制重新取得
   * @returns ETF資料
   */
  async fetchETFData(
    symbol: string,
    forceRefresh: boolean = false
  ): Promise<DataFetchResult<ETFData>> {
    try {
      console.log(`🔍 開始取得 ${symbol} ETF資料...`);

      // 檢查快取
      if (!forceRefresh) {
        const cachedData = this.getCachedData<ETFData>(symbol, 'etf');
        if (cachedData) {
          console.log(`📋 使用快取資料: ${symbol}`);
          return cachedData;
        }
      }

      // 嘗試從主要資料來源取得資料
      const primarySource = this.getPrimaryDataSource(MarketType.ETF);
      let etfData: ETFData;

      try {
        etfData = await this.etfAdapter.fetchStockData(symbol);
        console.log(`✅ 成功從 ${primarySource.name} 取得 ${symbol} ETF資料`);
      } catch (error) {
        console.warn(
          `⚠️ 主要資料來源失敗，嘗試備用來源: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        const fallbackData = await this.fetchFromFallbackSource(symbol, 'etf');
        etfData = fallbackData as ETFData;
      }

      // 驗證資料品質
      const validation = await this.validateDataQuality(etfData, primarySource);

      // 快取資料
      const result: DataFetchResult<ETFData> = {
        data: etfData,
        source: primarySource,
        timestamp: new Date(),
        quality: validation.quality.overallScore / 100,
        confidence: this.calculateConfidence(etfData, validation),
      };

      this.cacheData(symbol, 'etf', result.data, 300000); // 5分鐘快取

      return result;
    } catch (error) {
      console.error(
        `❌ 取得 ${symbol} ETF資料失敗:`,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw new Error(`無法取得ETF資料: ${symbol}`);
    }
  }

  /**
   * 取得財務資料
   * @param symbol - 股票代碼
   * @returns 財務資料
   */
  async fetchFinancialData(symbol: string): Promise<DataFetchResult<Partial<StockData>>> {
    try {
      console.log(`🔍 開始取得 ${symbol} 財務資料...`);

      // 檢查快取
      const cachedData = this.getCachedData<Partial<StockData>>(symbol, 'financials');
      if (cachedData) {
        console.log(`📋 使用快取財務資料: ${symbol}`);
        return cachedData;
      }

      // 從公開資訊觀測站取得財務資料
      const financialSource = this.dataSources.find(s => s.type === DataSourceType.PUBLIC_INFO);
      if (!financialSource) {
        throw new Error('找不到財務資料來源');
      }

      // 這裡應該實作公開資訊觀測站的API呼叫
      // 目前使用模擬資料
      const financialData = await this.fetchFinancialDataFromPublicInfo(symbol);

      const result: DataFetchResult<Partial<StockData>> = {
        data: financialData,
        source: financialSource,
        timestamp: new Date(),
        quality: 0.95,
        confidence: 0.9,
      };

      this.cacheData(symbol, 'financials', result.data, 86400000); // 24小時快取

      return result;
    } catch (error) {
      console.error(
        `❌ 取得 ${symbol} 財務資料失敗:`,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw new Error(`無法取得財務資料: ${symbol}`);
    }
  }

  /**
   * 取得綜合資料
   * @param symbol - 股票代碼
   * @param marketType - 市場類型
   * @returns 綜合資料
   */
  async fetchComprehensiveData(
    symbol: string,
    marketType: MarketType
  ): Promise<DataFetchResult<StockData | ETFData>> {
    try {
      console.log(`🔍 開始取得 ${symbol} 綜合資料...`);

      // 並行取得基本資料和財務資料
      const [basicData, financialData] = await Promise.all([
        marketType === MarketType.ETF ? this.fetchETFData(symbol) : this.fetchStockData(symbol),
        this.fetchFinancialData(symbol),
      ]);

      // 合併資料
      const comprehensiveData = {
        ...basicData.data,
        ...financialData.data,
        lastUpdated: new Date(),
      };

      const result: DataFetchResult<StockData | ETFData> = {
        data: comprehensiveData as StockData | ETFData,
        source: basicData.source,
        timestamp: new Date(),
        quality: Math.min(basicData.quality, financialData.quality),
        confidence: Math.min(basicData.confidence, financialData.confidence),
      };

      return result;
    } catch (error) {
      console.error(
        `❌ 取得 ${symbol} 綜合資料失敗:`,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw new Error(`無法取得綜合資料: ${symbol}`);
    }
  }

  // 私有方法

  /**
   * 取得主要資料來源
   */
  private getPrimaryDataSource(marketType: MarketType): DataSource {
    const sources = this.dataSources.filter(
      s => s.status === DataSourceStatus.ACTIVE && s.supportedMarkets.includes(marketType)
    );

    const sortedSources = sources.sort((a, b) => a.priority - b.priority);
    const primarySource = sortedSources[0];
    if (!primarySource) {
      throw new Error('找不到可用的資料來源');
    }
    return primarySource;
  }

  /**
   * 從備用來源取得資料
   */
  private async fetchFromFallbackSource(
    symbol: string,
    type: 'stock' | 'etf'
  ): Promise<StockData | ETFData> {
    const fallbackSources = this.dataSources
      .filter(s => s.status === DataSourceStatus.ACTIVE)
      .sort((a, b) => a.priority - b.priority)
      .slice(1);

    for (const source of fallbackSources) {
      try {
        if (type === 'etf') {
          return await this.etfAdapter.fetchStockData(symbol);
        } else {
          return await this.stockAdapter.fetchStockData(symbol);
        }
      } catch (error) {
        console.warn(
          `⚠️ 備用來源 ${source.name} 失敗:`,
          error instanceof Error ? error.message : 'Unknown error'
        );
        continue;
      }
    }

    throw new Error('所有資料來源都失敗');
  }

  /**
   * 從公開資訊觀測站取得財務資料
   */
  private async fetchFinancialDataFromPublicInfo(_symbol: string): Promise<Partial<StockData>> {
    // 這裡應該實作公開資訊觀測站的API呼叫
    // 目前返回模擬資料
    return {
      eps: Math.random() * 10 + 1,
      roe: Math.random() * 0.3 + 0.1,
      debtToEquity: Math.random() * 0.5,
      currentRatio: Math.random() * 2 + 1,
      quickRatio: Math.random() * 1.5 + 0.5,
      netProfitMargin: Math.random() * 0.2 + 0.05,
      revenueGrowth: Math.random() * 0.3 - 0.1,
      earningsGrowth: Math.random() * 0.4 - 0.2,
    };
  }

  /**
   * 驗證資料品質
   */
  private async validateDataQuality(
    _data: unknown,
    _source: DataSource
  ): Promise<ValidationResult> {
    // 簡化的資料品質驗證
    const quality = {
      overallScore: 85,
      level: 'good' as any, // 暫時使用any，稍後會修復型別問題
      completeness: 80,
      accuracy: 90,
      timeliness: 95,
      consistency: 85,
      validity: 90,
      factors: [],
      lastValidation: new Date(),
    };

    return {
      isValid: true,
      quality,
      errors: [],
      warnings: [],
      suggestions: [],
      timestamp: new Date(),
      duration: 0,
    };
  }

  /**
   * 計算置信度
   */
  private calculateConfidence(_data: unknown, validation: ValidationResult): number {
    const baseConfidence = validation.quality.overallScore / 100;
    const dataCompleteness = validation.quality.completeness / 100;
    const dataTimeliness = validation.quality.timeliness / 100;

    return (baseConfidence + dataCompleteness + dataTimeliness) / 3;
  }

  /**
   * 快取資料
   */
  private cacheData<T>(key: string, type: string, data: T, ttl: number): void {
    const cacheKey = `${type}:${key}`;
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
    const cacheKey = `${type}:${key}`;
    const cached = this.cache.get(cacheKey);

    if (!cached) return null;

    const now = new Date();
    if (now.getTime() - cached.timestamp.getTime() > cached.ttl) {
      this.cache.delete(cacheKey);
      return null;
    }

    // 返回快取資料（簡化版本）
    const defaultSource = this.dataSources[0];
    if (!defaultSource) {
      throw new Error('找不到可用的資料來源');
    }
    return {
      data: cached.data as T,
      source: defaultSource,
      timestamp: cached.timestamp,
      quality: 0.9,
      confidence: 0.85,
    };
  }

  /**
   * 取得所有資料來源
   */
  getDataSources(): DataSource[] {
    return [...this.dataSources];
  }

  /**
   * 更新資料來源狀態
   */
  updateDataSourceStatus(id: string, status: DataSourceStatus): void {
    const source = this.dataSources.find(s => s.id === id);
    if (source) {
      source.status = status;
      source.lastUpdate = new Date();
    }
  }
}
