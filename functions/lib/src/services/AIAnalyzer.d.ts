import { AnalysisType, AnalysisResult } from '../types/analysis';
import { StockData } from '../types/stock';
export declare class AIAnalyzer {
    private logger;
    private fixedEngine;
    private aiEngine;
    constructor();
    /**
     * 分析股票
     * @param symbol - 股票代碼
     * @param data - 股票資料
     * @param type - 分析類型
     * @returns 分析結果
     */
    analyzeStock(symbol: string, data?: StockData, type?: AnalysisType): Promise<AnalysisResult>;
    /**
     * 批量分析股票
     * @param symbols - 股票代碼陣列
     * @param type - 分析類型
     * @returns 分析結果陣列
     */
    analyzeMultipleStocks(symbols: string[], type?: AnalysisType): Promise<AnalysisResult[]>;
    /**
     * 比較分析結果
     * @param results - 分析結果陣列
     * @returns 比較結果
     */
    compareAnalysisResults(results: AnalysisResult[]): Record<string, unknown>;
    /**
     * 取得分析歷史
     * @param symbol - 股票代碼
     * @param limit - 限制數量
     * @returns 分析歷史
     */
    getAnalysisHistory(symbol: string, limit?: number): Promise<AnalysisResult[]>;
    /**
     * 取得模擬股票資料
     * @param symbol - 股票代碼
     * @returns 模擬股票資料
     */
    private getMockStockData;
    /**
     * 建立錯誤結果
     * @param symbol - 股票代碼
     * @param error - 錯誤
     * @returns 錯誤結果
     */
    private createErrorResult;
}
//# sourceMappingURL=AIAnalyzer.d.ts.map