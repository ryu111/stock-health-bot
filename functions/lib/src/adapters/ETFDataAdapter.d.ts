import { BaseMarketDataAdapter } from './MarketDataAdapter';
import { ETFData } from '../types/stock';
import type { YahooFinanceQuote, YahooFinanceHistoricalData } from 'yahoo-finance2';
export declare class ETFDataAdapter extends BaseMarketDataAdapter {
    constructor();
    /**
     * 取得 ETF 數據
     * @param symbol - ETF 代碼
     * @returns ETF 數據
     */
    fetchStockData(symbol: string): Promise<ETFData>;
    /**
     * 取得多個 ETF 數據
     * @param symbols - ETF 代碼陣列
     * @returns ETF 數據陣列
     */
    fetchMultipleStocks(symbols: string[]): Promise<ETFData[]>;
    /**
     * 驗證 ETF 代碼
     * @param symbol - ETF 代碼
     * @returns 是否有效
     */
    validateSymbol(symbol: string): boolean;
    /**
     * 取得支援的 ETF 代碼
     * @returns 支援的 ETF 代碼陣列
     */
    getSupportedSymbols(): string[];
    /**
     * 格式化 ETF 代碼
     * @param symbol - 原始代碼
     * @returns 格式化後的代碼
     */
    protected formatSymbol(symbol: string): string;
    /**
     * 從 Yahoo Finance 取得資料
     * @param symbol - ETF 代碼
     * @returns Yahoo Finance 資料
     */
    private fetchFromYahooFinance;
    /**
     * 取得模擬資料
     * @param symbol - ETF 代碼
     * @returns 模擬資料
     */
    private getMockData;
    /**
     * 取得歷史數據
     * @param symbol - ETF 代碼
     * @returns 歷史數據
     */
    getHistoricalData(symbol: string): Promise<YahooFinanceHistoricalData[]>;
    /**
     * 取得基本面數據
     * @param symbol - ETF 代碼
     * @returns 基本面數據
     */
    getFundamentalData(symbol: string): Promise<YahooFinanceQuote>;
}
//# sourceMappingURL=ETFDataAdapter.d.ts.map