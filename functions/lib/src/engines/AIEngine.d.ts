import { BaseAnalysisEngine } from './AnalysisEngine';
import { AnalysisType, AnalysisResult } from '../types/analysis';
import { StockData, ETFData } from '../types/stock';
interface AIEngineConfig {
    model: string;
    apiKey: string;
    endpoint: string;
    maxTokens: number;
    temperature: number;
}
export declare class AIEngine extends BaseAnalysisEngine {
    readonly type = AnalysisType.COMPREHENSIVE;
    private config;
    constructor(config?: Partial<AIEngineConfig>);
    /**
     * 分析股票
     * @param symbol - 股票代碼
     * @param data - 股票資料
     * @returns 分析結果
     */
    analyze(symbol: string, data: StockData | ETFData): Promise<AnalysisResult>;
    /**
     * 準備分析資料
     * @param symbol - 股票代碼
     * @param data - 股票資料
     * @returns 準備好的分析資料
     */
    private prepareAnalysisData;
    /**
     * 執行 AI 分析
     * @param symbol - 股票代碼
     * @param data - 分析資料
     * @returns AI 分析結果
     */
    private performAIAnalysis;
    /**
     * 建立分析提示
     * @param symbol - 股票代碼
     * @param data - 分析資料
     * @returns 分析提示
     */
    private buildAnalysisPrompt;
    /**
     * 呼叫 OpenAI API
     * @param prompt - 提示內容
     * @returns API 回應
     */
    private callOpenAI;
    /**
     * 解析 AI 回應
     * @param response - AI 回應
     * @returns 解析結果
     */
    private parseAIResponse;
    /**
     * 取得模擬 AI 分析
     * @param symbol - 股票代碼
     * @param data - 分析資料
     * @returns 模擬分析結果
     */
    private getMockAIAnalysis;
    /**
     * 計算技術分析分數
     * @param data - 股票資料
     * @returns 技術分析分數
     */
    protected calculateTechnicalScore(data: StockData | ETFData): number;
    /**
     * 計算基本面分析分數
     * @param data - 股票資料
     * @returns 基本面分析分數
     */
    protected calculateFundamentalScore(data: StockData | ETFData): number;
    /**
     * 計算風險分析分數
     * @param data - 股票資料
     * @returns 風險分析分數
     */
    protected calculateRiskScore(data: StockData | ETFData): number;
}
export {};
//# sourceMappingURL=AIEngine.d.ts.map