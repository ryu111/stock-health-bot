import { MarketType, StockData, ETFData } from '../types/stock';
export interface MarketDataAdapter {
    marketType: MarketType;
    fetchStockData(symbol: string): Promise<StockData | ETFData>;
    fetchMultipleStocks(symbols: string[]): Promise<(StockData | ETFData)[]>;
    validateSymbol(symbol: string): boolean;
    getSupportedSymbols(): string[];
}
export declare abstract class BaseMarketDataAdapter implements MarketDataAdapter {
    readonly marketType: MarketType;
    constructor(marketType: MarketType);
    abstract fetchStockData(symbol: string): Promise<StockData | ETFData>;
    abstract fetchMultipleStocks(symbols: string[]): Promise<(StockData | ETFData)[]>;
    abstract validateSymbol(symbol: string): boolean;
    abstract getSupportedSymbols(): string[];
    /**
     * 格式化股票代碼
     * @param symbol - 原始代碼
     * @returns 格式化後的代碼
     */
    protected formatSymbol(symbol: string): string;
    /**
     * 處理錯誤
     * @param error - 錯誤物件
     * @param symbol - 股票代碼
     * @returns 錯誤處理結果
     */
    protected handleError(error: unknown, symbol: string): never;
}
export declare class MarketDataAdapterFactory {
    private static adapters;
    /**
     * 註冊適配器
     * @param marketType - 市場類型
     * @param adapter - 適配器實例
     */
    static registerAdapter(marketType: MarketType, adapter: MarketDataAdapter): void;
    /**
     * 取得適配器
     * @param marketType - 市場類型
     * @returns 適配器實例
     */
    static getAdapter(marketType: MarketType): MarketDataAdapter | undefined;
    /**
     * 取得所有支援的市場類型
     * @returns 支援的市場類型陣列
     */
    static getSupportedMarkets(): MarketType[];
    /**
     * 檢查是否支援市場類型
     * @param marketType - 市場類型
     * @returns 是否支援
     */
    static isSupported(marketType: MarketType): boolean;
    /**
     * 清除所有適配器
     */
    static clear(): void;
}
export declare class UnifiedMarketDataService {
    private factory;
    constructor();
    /**
     * 取得股票資料
     * @param symbol - 股票代碼
     * @param marketType - 市場類型
     * @returns 股票資料
     */
    getStockData(symbol: string, marketType: MarketType): Promise<StockData | ETFData>;
    /**
     * 取得多個股票資料
     * @param symbols - 股票代碼陣列
     * @param marketType - 市場類型
     * @returns 股票資料陣列
     */
    getMultipleStockData(symbols: string[], marketType: MarketType): Promise<(StockData | ETFData)[]>;
    /**
     * 驗證股票代碼
     * @param symbol - 股票代碼
     * @param marketType - 市場類型
     * @returns 是否有效
     */
    validateSymbol(symbol: string, marketType: MarketType): boolean;
    /**
     * 取得支援的股票代碼
     * @param marketType - 市場類型
     * @returns 支援的股票代碼陣列
     */
    getSupportedSymbols(marketType: MarketType): string[];
    /**
     * 取得所有支援的市場類型
     * @returns 支援的市場類型陣列
     */
    getSupportedMarkets(): MarketType[];
    /**
     * 檢查是否支援市場類型
     * @param marketType - 市場類型
     * @returns 是否支援
     */
    isSupported(marketType: MarketType): boolean;
}
//# sourceMappingURL=MarketDataAdapter.d.ts.map