import { MarketType, StockData, ETFData } from './stock';
export declare enum AnalysisType {
    TECHNICAL = "technical",
    FUNDAMENTAL = "fundamental",
    RISK = "risk",
    SENTIMENT = "sentiment",
    COMPREHENSIVE = "comprehensive",
    FIXED_FORMULA = "fixed-formula",
    AI = "ai"
}
export type Recommendation = 'BUY' | 'HOLD' | 'SELL' | 'STRONG_BUY' | 'STRONG_SELL';
export interface AnalysisFactor {
    category: 'technical' | 'fundamental' | 'risk' | 'error';
    name: string;
    value: number;
    weight: number;
    description: string;
}
export interface AnalysisResult {
    symbol: string;
    type: AnalysisType;
    marketType: MarketType;
    technicalScore: number;
    fundamentalScore: number;
    riskScore: number;
    healthScore: number;
    recommendation: Recommendation;
    confidence: number;
    factors: AnalysisFactor[];
    timestamp: Date;
    dataQuality: number;
    marketCondition: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    summary: string;
    details: {
        technical: Record<string, unknown>;
        fundamental: Record<string, unknown>;
        risk: Record<string, unknown>;
    };
}
export interface TechnicalAnalysis {
    rsi: number;
    macd: {
        value: number;
        signal: number;
        histogram: number;
    };
    movingAverages: {
        sma20: number;
        sma50: number;
        sma200: number;
    };
    support: number;
    resistance: number;
    volume: {
        current: number;
        average: number;
        trend: 'increasing' | 'decreasing' | 'stable';
    };
}
export interface FundamentalAnalysis {
    peRatio: number;
    pbRatio: number;
    debtToEquity: number;
    returnOnEquity: number;
    profitMargin: number;
    revenueGrowth: number;
    earningsGrowth: number;
    dividendYield: number;
    payoutRatio: number;
}
export interface RiskAnalysis {
    volatility: number;
    beta: number;
    sharpeRatio: number;
    maxDrawdown: number;
    var95: number;
    creditRating?: string;
    sectorRisk: 'low' | 'medium' | 'high';
    marketRisk: 'low' | 'medium' | 'high';
}
export interface FundamentalMetrics {
    marketCap: number;
    enterpriseValue: number;
    revenue: number;
    netIncome: number;
    totalAssets: number;
    totalLiabilities: number;
    cashFlow: number;
    freeCashFlow: number;
}
export interface RiskFactor {
    name: string;
    level: 'low' | 'medium' | 'high';
    impact: number;
    description: string;
    mitigation?: string;
}
export interface IAnalysisEngine {
    type: AnalysisType;
    analyze(symbol: string, data: StockData | ETFData): Promise<AnalysisResult>;
    generateRecommendation(data: StockData | ETFData): Recommendation;
    getAnalysisFactors(data: StockData | ETFData): AnalysisFactor[];
}
export interface IFixedFormulaEngine extends IAnalysisEngine {
    formulas: AnalysisFormula[];
    addFormula(formula: AnalysisFormula): void;
    removeFormula(name: string): void;
}
export interface IAIEngine extends IAnalysisEngine {
    model: string;
    version: string;
    apiKey?: string;
    predict(data: Record<string, unknown>): Promise<Record<string, unknown>>;
    train(data: Record<string, unknown>[]): Promise<void>;
    evaluateAccuracy(testData: Record<string, unknown>[]): Promise<number>;
}
export interface AnalysisFormula {
    name: string;
    description: string;
    weight: number;
    calculation: (data: Record<string, unknown>) => number;
    threshold: {
        min: number;
        max: number;
        optimal: number;
    };
}
export interface AnalysisRequest {
    symbol: string;
    analysisType: AnalysisType;
    preferences?: {
        riskTolerance: 'low' | 'medium' | 'high';
        timeHorizon: 'short' | 'medium' | 'long';
        includeTechnical: boolean;
        includeFundamental: boolean;
        includeRisk: boolean;
    };
}
export interface AnalysisResponse {
    success: boolean;
    result?: AnalysisResult;
    error?: string;
    processingTime: number;
    engine: string;
}
export interface BatchAnalysisResult {
    symbol: string;
    success: boolean;
    result?: AnalysisResult;
    error?: string;
}
export interface AnalysisSummary {
    totalAnalyzed: number;
    successful: number;
    failed: number;
    averageHealthScore: number;
    topPerformers: Array<{
        symbol: string;
        healthScore: number;
    }>;
    recommendations: {
        buy: number;
        hold: number;
        sell: number;
    };
}
//# sourceMappingURL=analysis.d.ts.map