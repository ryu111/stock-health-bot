import { StockQueryRequest, StockQueryResponse } from '../types';
export interface StockQuoteData {
    symbol: string;
    name: string;
    price: number | null;
    previousClose: number | null;
    marketCap: number | null;
    volume: number | null;
    peRatio: number | null;
    eps: number | null;
    dividendYield: number | null;
    fiftyTwoWeekHigh: number | null;
    fiftyTwoWeekLow: number | null;
    currency: string;
    exchange: string;
    dailyChange: number;
    priceToBook: number | null;
    returnOnEquity: number | null;
}
export interface TrendAnalysis {
    trend: 'up' | 'down' | 'unknown';
    strength: number;
}
export interface HistoricalDataPoint {
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}
export declare class StockService {
    private stockAdapter;
    private etfAdapter;
    constructor();
    /**
     * 取得股票資料並快取
     * @param symbol - 股票代碼 (例如: '2330.TW')
     * @returns 股票資料物件
     */
    getStockData(symbol: string): Promise<StockQuoteData>;
    /**
     * 基於多個指標計算健康分數
     * @param data - 股票資料物件
     * @returns 健康分數 (0-100)
     */
    calculateHealthScore(data: StockQuoteData): number;
    /**
     * 格式化市值以顯示
     * @param marketCap - 市值
     * @returns 格式化的市值
     */
    formatMarketCap(marketCap: number | null): string;
    /**
     * 計算百分比變化
     * @param current - 當前值
     * @param previous - 先前值
     * @returns 百分比變化
     */
    calculatePercentageChange(current: number, previous: number): number;
    /**
     * 取得歷史資料以進行趨勢分析
     * @param symbol - 股票代碼
     * @param period - 期間 ('1mo', '3mo', '6mo', '1y')
     * @returns 歷史資料點
     */
    getHistoricalData(symbol: string, _period?: string): Promise<HistoricalDataPoint[]>;
    /**
     * 取得多個股票資料
     * @param symbols - 股票代碼陣列
     * @returns 股票資料物件陣列
     */
    getMultipleStocks(symbols: string[]): Promise<StockQuoteData[]>;
    /**
     * 分析股票趨勢
     * @param symbol - 股票代碼
     * @returns 趨勢分析
     */
    analyzeTrend(symbol: string): Promise<TrendAnalysis>;
    /**
     * 使用統一服務取得股票資料
     * @param request - 股票查詢請求
     * @returns 股票查詢回應
     */
    getStocksByRequest(_request: StockQueryRequest): StockQueryResponse;
    /**
     * 檢測市場類型
     * @param symbol - 股票代碼
     * @returns 市場類型
     */
    private detectMarketType;
    /**
     * 轉換為統一報價資料格式
     * @param stockData - 股票資料
     * @param symbol - 股票代碼
     * @returns 統一格式的報價資料
     */
    private convertToQuoteData;
}
//# sourceMappingURL=StockService.d.ts.map