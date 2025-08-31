import { BaseAnalysisEngine } from './AnalysisEngine';
import { AnalysisType, AnalysisResult, Recommendation } from '../types/analysis';
import { StockData, ETFData } from '../types/stock';
export declare class FixedFormulaEngine extends BaseAnalysisEngine {
    readonly type = AnalysisType.TECHNICAL;
    constructor();
    /**
     * 分析股票
     * @param symbol - 股票代碼
     * @param data - 股票資料
     * @returns 分析結果
     */
    analyze(symbol: string, data: StockData | ETFData): Promise<AnalysisResult>;
    /**
     * 初始化分析公式
     */
    private initializeFormulas;
    /**
     * 分析股票資料
     * @param data - 股票資料
     * @returns 分析結果
     */
    private analyzeStockData;
    /**
     * 分析 ETF 資料
     * @param data - ETF 資料
     * @returns 分析結果
     */
    private analyzeETFData;
    /**
     * 計算技術面評分
     * @param data - 股票/ETF 資料
     * @returns 技術面評分 (0-100)
     */
    calculateTechnicalScore(data: StockData | ETFData): number;
    /**
     * 計算基本面評分
     * @param data - 股票/ETF 資料
     * @returns 基本面評分 (0-100)
     */
    calculateFundamentalScore(data: StockData | ETFData): number;
    /**
     * 計算風險評分
     * @param data - 股票/ETF 資料
     * @returns 風險評分 (0-100)
     */
    calculateRiskScore(data: StockData | ETFData): number;
    /**
     * 生成投資建議
     * @param data - 股票/ETF 資料
     * @returns 投資建議
     */
    generateRecommendation(data: StockData | ETFData): Recommendation;
    /**
     * 計算 RSI
     * @param data - 股票/ETF 資料
     * @returns RSI 值
     */
    private calculateRSI;
}
//# sourceMappingURL=FixedFormulaEngine.d.ts.map