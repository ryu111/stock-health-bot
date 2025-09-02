import {
  AnalysisType,
  AnalysisResult,
  IAnalysisEngine,
  Recommendation,
  AnalysisFactor,
} from '../types/analysis';
import { StockData, ETFData, MarketType } from '../types/stock';
import { ValuationResult } from '../types/valuation';
import { HealthReport } from '../types/health-score';
import { ValuationEngine } from './ValuationEngine';
import { PEBandValuation } from './methods/PEBandValuation';
import { DCFValuation } from './methods/DCFValuation';
import { DDMValuation } from './methods/DDMValuation';
import { ETFYieldValuation } from './methods/ETFYieldValuation';
import { HealthReportGenerator } from '../services/HealthReportGenerator';
import { RecommendationEngine } from '../services/RecommendationEngine';
import { EntryPriceCalculator } from '../services/EntryPriceCalculator';

// 基礎分析引擎
export abstract class BaseAnalysisEngine implements IAnalysisEngine {
  public abstract readonly type: AnalysisType;

  /**
   * 分析股票
   * @param symbol - 股票代碼
   * @param data - 股票資料
   * @returns 分析結果
   */
  abstract analyze(symbol: string, data: StockData | ETFData): Promise<AnalysisResult>;

  /**
   * 執行綜合分析（包含估值、健康評分、建議）
   * @param symbol - 股票代碼
   * @param data - 股票資料
   * @param marketCondition - 市場條件
   * @param industry - 產業
   * @returns 綜合分析結果
   */
  async performComprehensiveAnalysis(
    symbol: string,
    data: StockData | ETFData,
    marketCondition: 'BULLISH' | 'NEUTRAL' | 'BEARISH' = 'NEUTRAL',
    industry?: string
  ): Promise<{
    analysisResult: AnalysisResult;
    valuationResult: ValuationResult;
    healthReport: HealthReport;
    investmentRecommendation: any;
    entryPriceResult: any;
  }> {
    // 執行基礎分析
    const analysisResult = await this.analyze(symbol, data);

    // 執行估值分析
    const methods = [];
    if (data.marketType === MarketType.ETF) {
      methods.push(new ETFYieldValuation());
    } else {
      methods.push(new PEBandValuation());
      methods.push(new DCFValuation());
      methods.push(new DDMValuation());
    }

    const valuationEngine = new ValuationEngine(methods);
    const valuationResult = await valuationEngine.evaluate({
      symbol,
      price: data.price || 0,
      marketType: data.marketType,
      financials: {
        epsTtm: (data as any).epsTtm,
        fcfPerShare: (data as any).fcf,
        dividendYield: (data as any).dividendYield,
      },
      epsCagr: (data as any).growthRate,
      fcfCagr: (data as any).growthRate,
      discountRate: (data as any).discountRate,
      terminalGrowth: (data as any).terminalGrowth,
      peLow: (data as any).peLow,
      peHigh: (data as any).peHigh,
      dividendGrowth: (data as any).dividendGrowth,
      ddmDiscountRate: (data as any).ddmDiscountRate,
      marginOfSafety: 0.1,
      industry: (data as any).industry,
      sector: (data as any).sector,
    });

    // 執行健康評分分析
    const healthReportGenerator = new HealthReportGenerator();
    const healthReport = await healthReportGenerator.generateReport(
      symbol,
      data.marketType,
      analysisResult,
      valuationResult,
      industry
    );

    // 生成投資建議
    const recommendationEngine = new RecommendationEngine();
    const investmentRecommendation = await recommendationEngine.generateRecommendation(
      symbol,
      healthReport,
      valuationResult,
      analysisResult,
      marketCondition
    );

    // 計算進場價格
    const entryPriceCalculator = new EntryPriceCalculator();
    const entryPriceResult = entryPriceCalculator.calculateEntryPrice(
      symbol,
      valuationResult,
      healthReport,
      marketCondition,
      industry
    );

    return {
      analysisResult,
      valuationResult,
      healthReport,
      investmentRecommendation,
      entryPriceResult,
    };
  }

  /**
   * 計算健康分數
   * @param data - 股票資料
   * @returns 健康分數
   */
  calculateHealthScore(data: StockData | ETFData): number {
    // 基礎健康分數計算邏輯
    let score = 50; // 基礎分數

    // 價格相關評分
    if (data.price && data.price > 0) {
      score += 10;
    }

    // 成交量相關評分
    if (data.volume && data.volume > 0) {
      score += 10;
    }

    // 市值相關評分
    if (data.marketCap && data.marketCap > 0) {
      score += 10;
    }

    // 股息相關評分
    if (data.dividendYield && data.dividendYield > 0) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 生成投資建議
   * @param data - 股票資料
   * @returns 投資建議
   */
  generateRecommendation(data: StockData | ETFData): Recommendation {
    const healthScore = this.calculateHealthScore(data);

    let type: 'BUY' | 'HOLD' | 'SELL';
    if (healthScore >= 70) {
      type = 'BUY';
    } else if (healthScore >= 40) {
      type = 'HOLD';
    } else {
      type = 'SELL';
    }

    return type as Recommendation;
  }

  /**
   * 取得分析因素
   * @param data - 股票資料
   * @returns 分析因素陣列
   */
  getAnalysisFactors(data: StockData | ETFData): AnalysisFactor[] {
    const factors = [];

    if (data.price) {
      factors.push({
        category: 'technical' as const,
        name: '價格',
        value: data.price,
        weight: 0.3,
        description: '當前股價',
      });
    }

    if (data.volume) {
      factors.push({
        category: 'technical' as const,
        name: '成交量',
        value: data.volume,
        weight: 0.2,
        description: '交易量',
      });
    }

    if (data.marketCap) {
      factors.push({
        category: 'fundamental' as const,
        name: '市值',
        value: data.marketCap,
        weight: 0.5,
        description: '市場價值',
      });
    }

    return factors;
  }
}

// 分析引擎工廠
export class AnalysisEngineFactory {
  private static engines = new Map<AnalysisType, new () => BaseAnalysisEngine>();

  /**
   * 註冊引擎
   * @param type - 分析類型
   * @param engineClass - 引擎類別
   */
  static registerEngine(type: AnalysisType, engineClass: new () => BaseAnalysisEngine): void {
    this.engines.set(type, engineClass);
  }

  /**
   * 建立引擎
   * @param type - 分析類型
   * @returns 引擎實例
   */
  static createEngine(type: AnalysisType): BaseAnalysisEngine | null {
    const EngineClass = this.engines.get(type);
    if (!EngineClass) {
      return null;
    }
    return new EngineClass();
  }

  /**
   * 取得支援的分析類型
   * @returns 支援的分析類型陣列
   */
  static getSupportedTypes(): AnalysisType[] {
    return Array.from(this.engines.keys());
  }

  /**
   * 檢查是否支援分析類型
   * @param type - 分析類型
   * @returns 是否支援
   */
  static isSupported(type: AnalysisType): boolean {
    return this.engines.has(type);
  }
}

// 綜合分析引擎 - 整合所有分析功能
export class ComprehensiveAnalysisEngine extends BaseAnalysisEngine {
  public readonly type = AnalysisType.COMPREHENSIVE;

  /**
   * 執行綜合分析
   * @param symbol - 股票代碼
   * @param data - 股票資料
   * @returns 分析結果
   */
  async analyze(symbol: string, data: StockData | ETFData): Promise<AnalysisResult> {
    // 基礎分析邏輯
    const healthScore = this.calculateHealthScore(data);
    const technicalScore = this.calculateTechnicalScore(data);
    const fundamentalScore = this.calculateFundamentalScore(data);
    const riskScore = this.calculateRiskScore(data);

    // 綜合評分
    const overallScore = Math.round(
      healthScore * 0.3 + technicalScore * 0.25 + fundamentalScore * 0.3 + (100 - riskScore) * 0.15
    );

    // 生成建議
    const recommendation = this.generateRecommendation(data);

    // 分析因素
    const factors = this.getAnalysisFactors(data);

    return {
      symbol,
      type: AnalysisType.COMPREHENSIVE,
      marketType: data.marketType,
      technicalScore,
      fundamentalScore,
      riskScore,
      healthScore: overallScore,
      recommendation,
      confidence: 0.8,
      factors,
      timestamp: new Date(),
      dataQuality: 0.9,
      marketCondition: 'NEUTRAL',
      summary: `綜合評分：${overallScore}分，建議：${recommendation}`,
      details: {
        technical: {
          score: technicalScore,
          factors: factors.filter(f => f.category === 'technical'),
        },
        fundamental: {
          score: fundamentalScore,
          factors: factors.filter(f => f.category === 'fundamental'),
        },
        risk: { score: riskScore, factors: factors.filter(f => f.category === 'risk') },
      },
    };
  }

  /**
   * 計算技術面分數
   */
  private calculateTechnicalScore(data: StockData | ETFData): number {
    let score = 50;

    if (data.price && data.price > 0) score += 15;
    if (data.volume && data.volume > 0) score += 15;
    if ((data as any).priceChange && (data as any).priceChange > 0) score += 20;

    return Math.min(100, score);
  }

  /**
   * 計算基本面分數
   */
  private calculateFundamentalScore(data: StockData | ETFData): number {
    let score = 50;

    if (data.marketCap && data.marketCap > 0) score += 20;
    if (data.dividendYield && data.dividendYield > 0) score += 15;
    if ((data as any).epsTtm && (data as any).epsTtm > 0) score += 15;

    return Math.min(100, score);
  }

  /**
   * 計算風險分數
   */
  private calculateRiskScore(data: StockData | ETFData): number {
    let score = 50;

    // 價格波動風險
    if ((data as any).volatility && (data as any).volatility > 0.3) score += 20;

    // 市值風險
    if (data.marketCap && data.marketCap < 1000000000) score += 15; // 小於10億

    // 流動性風險
    if (data.volume && data.volume < 1000000) score += 15; // 小於100萬股

    return Math.min(100, score);
  }
}
