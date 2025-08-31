import { AnalysisType, AnalysisResult, IAnalysisEngine, Recommendation, AnalysisFactor } from '../types/analysis';
import { StockData, ETFData } from '../types/stock';
export declare abstract class BaseAnalysisEngine implements IAnalysisEngine {
    abstract readonly type: AnalysisType;
    /**
     * 分析股票
     * @param symbol - 股票代碼
     * @param data - 股票資料
     * @returns 分析結果
     */
    abstract analyze(symbol: string, data: StockData | ETFData): Promise<AnalysisResult>;
    /**
     * 計算健康分數
     * @param data - 股票資料
     * @returns 健康分數
     */
    calculateHealthScore(data: StockData | ETFData): number;
    /**
     * 生成投資建議
     * @param data - 股票資料
     * @returns 投資建議
     */
    generateRecommendation(data: StockData | ETFData): Recommendation;
    /**
     * 取得分析因素
     * @param data - 股票資料
     * @returns 分析因素陣列
     */
    getAnalysisFactors(data: StockData | ETFData): AnalysisFactor[];
}
export declare class AnalysisEngineFactory {
    private static engines;
    /**
     * 註冊引擎
     * @param type - 分析類型
     * @param engineClass - 引擎類別
     */
    static registerEngine(type: AnalysisType, engineClass: new () => BaseAnalysisEngine): void;
    /**
     * 建立引擎
     * @param type - 分析類型
     * @returns 引擎實例
     */
    static createEngine(type: AnalysisType): BaseAnalysisEngine | null;
    /**
     * 取得支援的分析類型
     * @returns 支援的分析類型陣列
     */
    static getSupportedTypes(): AnalysisType[];
    /**
     * 檢查是否支援分析類型
     * @param type - 分析類型
     * @returns 是否支援
     */
    static isSupported(type: AnalysisType): boolean;
}
//# sourceMappingURL=AnalysisEngine.d.ts.map