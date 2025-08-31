import { BaseMarketDataAdapter } from './MarketDataAdapter';
import { StockData } from '../types/stock';
import type { YahooFinanceQuote, YahooFinanceHistoricalData } from 'yahoo-finance2';
export declare class StockDataAdapter extends BaseMarketDataAdapter {
    constructor();
    /**
     * 取得股票數據
     * @param symbol - 股票代碼
     * @returns 股票數據
     */
    fetchStockData(symbol: string): Promise<StockData>;
    /**
     * 取得多個股票數據
     * @param symbols - 股票代碼陣列
     * @returns 股票數據陣列
     */
    fetchMultipleStocks(symbols: string[]): Promise<StockData[]>;
    /**
     * 驗證股票代碼
     * @param symbol - 股票代碼
     * @returns 是否有效
     */
    validateSymbol(symbol: string): boolean;
    /**
     * 取得支援的股票代碼
     * @returns 支援的股票代碼陣列
     */
    getSupportedSymbols(): string[];
    /**
     * 格式化股票代碼
     * @param symbol - 原始代碼
     * @returns 格式化後的代碼
     */
    protected formatSymbol(symbol: string): string;
    /**
     * 從 Yahoo Finance 取得資料
     * @param symbol - 股票代碼
     * @returns Yahoo Finance 資料
     */
    private fetchFromYahooFinance;
    /**
     * 取得模擬資料
     * @param symbol - 股票代碼
     * @returns 模擬資料
     */
    private getMockData;
    /**
     * 計算波動率
     * @param dayRange - 日內價格範圍
     * @returns 波動率
     */
    private calculateVolatility;
    /**
     * 取得歷史數據
     * @param symbol - 股票代碼
     * @returns 歷史數據
     */
    getHistoricalData(symbol: string): Promise<YahooFinanceHistoricalData[]>;
    /**
     * 取得基本面數據
     * @param symbol - 股票代碼
     * @returns 基本面數據
     */
    getFundamentalData(symbol: string): Promise<YahooFinanceQuote>;
}
//# sourceMappingURL=StockDataAdapter.d.ts.map