"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnifiedMarketDataService = exports.MarketDataAdapterFactory = exports.BaseMarketDataAdapter = void 0;
// 基礎市場資料適配器
class BaseMarketDataAdapter {
    constructor(marketType) {
        this.marketType = marketType;
    }
    /**
     * 格式化股票代碼
     * @param symbol - 原始代碼
     * @returns 格式化後的代碼
     */
    formatSymbol(symbol) {
        return symbol.trim().toUpperCase();
    }
    /**
     * 處理錯誤
     * @param error - 錯誤物件
     * @param symbol - 股票代碼
     * @returns 錯誤處理結果
     */
    handleError(error, symbol) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to fetch data for ${symbol}: ${errorMessage}`);
    }
}
exports.BaseMarketDataAdapter = BaseMarketDataAdapter;
// 市場資料適配器工廠
class MarketDataAdapterFactory {
    /**
     * 註冊適配器
     * @param marketType - 市場類型
     * @param adapter - 適配器實例
     */
    static registerAdapter(marketType, adapter) {
        this.adapters.set(marketType, adapter);
    }
    /**
     * 取得適配器
     * @param marketType - 市場類型
     * @returns 適配器實例
     */
    static getAdapter(marketType) {
        return this.adapters.get(marketType);
    }
    /**
     * 取得所有支援的市場類型
     * @returns 支援的市場類型陣列
     */
    static getSupportedMarkets() {
        return Array.from(this.adapters.keys());
    }
    /**
     * 檢查是否支援市場類型
     * @param marketType - 市場類型
     * @returns 是否支援
     */
    static isSupported(marketType) {
        return this.adapters.has(marketType);
    }
    /**
     * 清除所有適配器
     */
    static clear() {
        this.adapters.clear();
    }
}
exports.MarketDataAdapterFactory = MarketDataAdapterFactory;
MarketDataAdapterFactory.adapters = new Map();
// 統一市場資料服務
class UnifiedMarketDataService {
    constructor() {
        this.factory = MarketDataAdapterFactory;
    }
    /**
     * 取得股票資料
     * @param symbol - 股票代碼
     * @param marketType - 市場類型
     * @returns 股票資料
     */
    async getStockData(symbol, marketType) {
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
    async getMultipleStockData(symbols, marketType) {
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
    validateSymbol(symbol, marketType) {
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
    getSupportedSymbols(marketType) {
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
    getSupportedMarkets() {
        return this.factory.getSupportedMarkets();
    }
    /**
     * 檢查是否支援市場類型
     * @param marketType - 市場類型
     * @returns 是否支援
     */
    isSupported(marketType) {
        return this.factory.isSupported(marketType);
    }
}
exports.UnifiedMarketDataService = UnifiedMarketDataService;
//# sourceMappingURL=MarketDataAdapter.js.map