import { MarketType, StockData, ETFData } from '../types/stock';

// 市場資料適配器介面
export interface MarketDataAdapter {
  marketType: MarketType;
  fetchStockData(symbol: string): Promise<StockData | ETFData>;
  fetchMultipleStocks(symbols: string[]): Promise<(StockData | ETFData)[]>;
  validateSymbol(symbol: string): boolean;
  getSupportedSymbols(): string[];
}

// 基礎市場資料適配器
export abstract class BaseMarketDataAdapter implements MarketDataAdapter {
  public readonly marketType: MarketType;

  constructor(marketType: MarketType) {
    this.marketType = marketType;
  }

  abstract fetchStockData(symbol: string): Promise<StockData | ETFData>;
  abstract fetchMultipleStocks(symbols: string[]): Promise<(StockData | ETFData)[]>;
  abstract validateSymbol(symbol: string): boolean;
  abstract getSupportedSymbols(): string[];

  /**
   * 格式化股票代碼
   * @param symbol - 原始代碼
   * @returns 格式化後的代碼
   */
  protected formatSymbol(symbol: string): string {
    return symbol.trim().toUpperCase();
  }

  /**
   * 處理錯誤
   * @param error - 錯誤物件
   * @param symbol - 股票代碼
   * @returns 錯誤處理結果
   */
  protected handleError(error: unknown, symbol: string): never {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to fetch data for ${symbol}: ${errorMessage}`);
  }
}

// 市場資料適配器工廠
export class MarketDataAdapterFactory {
  private static adapters = new Map<MarketType, MarketDataAdapter>();

  /**
   * 註冊適配器
   * @param marketType - 市場類型
   * @param adapter - 適配器實例
   */
  static registerAdapter(marketType: MarketType, adapter: MarketDataAdapter): void {
    this.adapters.set(marketType, adapter);
  }

  /**
   * 取得適配器
   * @param marketType - 市場類型
   * @returns 適配器實例
   */
  static getAdapter(marketType: MarketType): MarketDataAdapter | undefined {
    return this.adapters.get(marketType);
  }

  /**
   * 取得所有支援的市場類型
   * @returns 支援的市場類型陣列
   */
  static getSupportedMarkets(): MarketType[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * 檢查是否支援市場類型
   * @param marketType - 市場類型
   * @returns 是否支援
   */
  static isSupported(marketType: MarketType): boolean {
    return this.adapters.has(marketType);
  }

  /**
   * 清除所有適配器
   */
  static clear(): void {
    this.adapters.clear();
  }
}

// 統一市場資料服務
export class UnifiedMarketDataService {
  private factory: typeof MarketDataAdapterFactory;

  constructor() {
    this.factory = MarketDataAdapterFactory;
  }

  /**
   * 取得股票資料
   * @param symbol - 股票代碼
   * @param marketType - 市場類型
   * @returns 股票資料
   */
  async getStockData(symbol: string, marketType: MarketType): Promise<StockData | ETFData> {
    const adapter = this.factory.getAdapter(marketType);
    if (!adapter) {
      throw new Error(`No adapter found for market type: ${marketType}`);
    }

    return await adapter.fetchStockData(symbol);
  }

  /**
   * 取得多個股票資料
   * @param symbols - 股票代碼陣列
   * @param marketType - 市場類型
   * @returns 股票資料陣列
   */
  async getMultipleStockData(
    symbols: string[],
    marketType: MarketType
  ): Promise<(StockData | ETFData)[]> {
    const adapter = this.factory.getAdapter(marketType);
    if (!adapter) {
      throw new Error(`No adapter found for market type: ${marketType}`);
    }

    return await adapter.fetchMultipleStocks(symbols);
  }

  /**
   * 驗證股票代碼
   * @param symbol - 股票代碼
   * @param marketType - 市場類型
   * @returns 是否有效
   */
  validateSymbol(symbol: string, marketType: MarketType): boolean {
    const adapter = this.factory.getAdapter(marketType);
    if (!adapter) {
      return false;
    }

    return adapter.validateSymbol(symbol);
  }

  /**
   * 取得支援的股票代碼
   * @param marketType - 市場類型
   * @returns 支援的股票代碼陣列
   */
  getSupportedSymbols(marketType: MarketType): string[] {
    const adapter = this.factory.getAdapter(marketType);
    if (!adapter) {
      return [];
    }

    return adapter.getSupportedSymbols();
  }

  /**
   * 取得所有支援的市場類型
   * @returns 支援的市場類型陣列
   */
  getSupportedMarkets(): MarketType[] {
    return this.factory.getSupportedMarkets();
  }

  /**
   * 檢查是否支援市場類型
   * @param marketType - 市場類型
   * @returns 是否支援
   */
  isSupported(marketType: MarketType): boolean {
    return this.factory.isSupported(marketType);
  }
}
