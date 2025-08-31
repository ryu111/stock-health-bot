export interface ETFQuoteData {
    symbol: string;
    name: string;
    price: number | null;
    previousClose: number | null;
    volume: number | null;
    dividendYield: number | null;
    marketCap: number | null;
    currency: string;
    exchange: string;
    source: string;
    description?: string;
    expenseRatio?: number;
    lastDividend?: number;
    dividendFrequency?: string;
    category?: string;
    topHoldings?: string[];
    dailyChange?: number;
}
export interface ETFLookupItem {
    name: string;
    category: string;
    description: string;
    dividendFrequency: string;
    typicalYield: string;
    expenseRatio: string;
    topHoldings: string[];
}
export declare class ETFDataService {
    private etfAdapter;
    constructor();
    /**
     * 取得 ETF 詳細資料
     * @param symbol - ETF 代碼 (例如: '0050', '0056')
     * @returns ETF 資料物件
     */
    getETFData(symbol: string): Promise<ETFQuoteData>;
    /**
     * 從 Yahoo Finance 取得 ETF 資料
     * @param symbol - ETF 代碼
     * @returns ETF 資料
     */
    private getYahooFinanceData;
    /**
     * 模擬 ETF 資料 (基於實際市場資料)
     * 台灣常見 ETF 代號速查表
     * @param symbol - ETF 代碼
     * @returns 模擬 ETF 資料
     */
    private getMockETFData;
    /**
     * 計算 ETF 健康分數
     * @param etfData - ETF 資料
     * @returns 健康分數
     */
    calculateETFHealthScore(etfData: ETFQuoteData): number;
    /**
     * 格式化 ETF 報告
     * @param etfData - ETF 資料
     * @param healthScore - 健康分數
     * @returns 格式化的報告
     */
    formatETFReport(etfData: ETFQuoteData, healthScore: number): string;
    /**
     * 取得 ETF 投資建議
     * @param healthScore - 健康分數
     * @param etfData - ETF 資料
     * @returns 投資建議
     */
    private getETFRecommendation;
    /**
     * 格式化市值
     * @param marketCap - 市值
     * @returns 格式化的市值
     */
    private formatMarketCap;
    /**
     * 台灣 ETF 速查表
     * 提供常見 ETF 的基本資訊
     * @returns ETF 查詢表
     */
    getETFLookupTable(): Record<string, ETFLookupItem>;
    /**
     * 格式化 ETF 速查表
     * @returns 格式化的速查表
     */
    formatETFLookupTable(): string;
}
//# sourceMappingURL=ETFDataService.d.ts.map