// 健康評分計算器
import {
  IHealthScoreService,
  HealthReport,
  ScoreCategory,
  ScoreGrade,
  ScoreBreakdown,
  HealthRiskFactor,
  ScoreCalculationConfig,
  ScoreComparison,
  HealthScoreHistory,
} from '../types/health-score';
import { AnalysisResult } from '../types/analysis';
import { MarketType } from '../types/stock';

const DEFAULT_WEIGHTS: Record<ScoreCategory, number> = {
  [ScoreCategory.VALUATION]: 0.2,
  [ScoreCategory.FUNDAMENTALS]: 0.2,
  [ScoreCategory.GROWTH]: 0.15,
  [ScoreCategory.QUALITY]: 0.15,
  [ScoreCategory.RISK]: 0.1,
  [ScoreCategory.TECHNICAL]: 0.1,
  [ScoreCategory.LIQUIDITY]: 0.1,
};

const DEFAULT_THRESHOLDS: ScoreCalculationConfig['thresholds'] = {
  valuation: { excellent: 90, good: 80, average: 70, belowAverage: 60, poor: 50 },
  fundamentals: { excellent: 90, good: 80, average: 70, belowAverage: 60, poor: 50 },
  growth: { excellent: 90, good: 80, average: 70, belowAverage: 60, poor: 50 },
  quality: { excellent: 90, good: 80, average: 70, belowAverage: 60, poor: 50 },
  risk: { excellent: 90, good: 80, average: 70, belowAverage: 60, poor: 50 },
  technical: { excellent: 90, good: 80, average: 70, belowAverage: 60, poor: 50 },
  liquidity: { excellent: 90, good: 80, average: 70, belowAverage: 60, poor: 50 },
};

export class HealthScoreCalculator implements IHealthScoreService {
  private readonly weights: Record<ScoreCategory, number>;

  constructor(config?: Partial<ScoreCalculationConfig>) {
    this.weights = (config?.categoryWeights as Record<ScoreCategory, number>) ?? DEFAULT_WEIGHTS;
    // thresholds 預留：目前未使用，若日後需要可從 config?.thresholds ?? DEFAULT_THRESHOLDS 取得
    void DEFAULT_THRESHOLDS;
  }

  calculateHealthScore(symbol: string, data: AnalysisResult): Promise<HealthReport> {
    const categoryScores: Record<ScoreCategory, ScoreBreakdown> = {
      [ScoreCategory.VALUATION]: this.calculateValuationScore(data),
      [ScoreCategory.FUNDAMENTALS]: this.calculateFundamentalsScore(data),
      [ScoreCategory.GROWTH]: this.calculateGrowthScore(data),
      [ScoreCategory.QUALITY]: this.calculateQualityScore(data),
      [ScoreCategory.RISK]: this.calculateRiskScore(data),
      [ScoreCategory.TECHNICAL]: this.calculateTechnicalScore(data),
      [ScoreCategory.LIQUIDITY]: this.calculateLiquidityScore(data),
    };

    // 加權總分
    const overallScore = Math.round(
      (Object.keys(categoryScores) as Array<keyof typeof categoryScores>).reduce(
        (acc, k) => acc + categoryScores[k].weightedScore,
        0
      )
    );

    const overallGrade = this.toGrade(overallScore);

    const riskFactors = this.deriveRiskFactors(data);
    const strengths = this.deriveStrengths(categoryScores);
    const weaknesses = this.deriveWeaknesses(categoryScores);
    const recommendations = this.buildRecommendations(categoryScores, riskFactors);

    return Promise.resolve({
      symbol,
      marketType:
        (this.getPropertySafely(data, 'marketType') as MarketType | undefined) ??
        MarketType.TW_STOCK,
      overallScore,
      overallGrade,
      categoryScores,
      riskFactors,
      strengths,
      weaknesses,
      recommendations,
      investmentAdvice: {
        suitability: overallScore >= 80 ? 'moderate' : 'conservative',
        timeHorizon: 'medium',
        riskTolerance: overallScore >= 80 ? 'medium' : 'low',
        advice: overallScore >= 80 ? '基本面良好，可分批布局。' : '持續觀察，等待更佳風險報酬比。',
      },
      lastUpdated: new Date(),
      confidence: 0.8,
      dataQuality: 0.85,
    });
  }

  getScoreBreakdown(_symbol: string): Promise<ScoreBreakdown[]> {
    return Promise.resolve([]);
  }

  getRiskAssessment(_symbol: string): Promise<HealthRiskFactor[]> {
    return Promise.resolve([]);
  }

  generateRecommendations(_healthReport: HealthReport): Promise<string[]> {
    return Promise.resolve([]);
  }

  compareWithPeers(symbol: string, industry: string): Promise<ScoreComparison> {
    return Promise.resolve({
      symbol,
      currentScore: 75,
      peerComparison: { industry, industryAverage: 70, industryRank: 30, industryPercentile: 80 },
      historicalComparison: {
        oneMonthAgo: 74,
        threeMonthsAgo: 72,
        sixMonthsAgo: 70,
        oneYearAgo: 68,
      },
      benchmarkComparison: { benchmark: 'TAIEX', benchmarkScore: 68, relativePerformance: 7 },
    });
  }

  getScoreHistory(symbol: string, _period: string): Promise<HealthScoreHistory> {
    return Promise.resolve({
      symbol,
      scores: [],
      trend: 'STABLE',
      volatility: 0.1,
      averageScore: 75,
      bestScore: 82,
      worstScore: 65,
    });
  }

  setAlertThresholds(_symbol: string, _thresholds: Record<string, number>): Promise<void> {
    return Promise.resolve();
  }

  /**
   * 安全地取得物件屬性值
   * @param obj - 物件
   * @param key - 屬性鍵
   * @returns 屬性值或 undefined
   */
  private getPropertySafely<T>(obj: T, key: string): unknown {
    return (obj as Record<string, unknown>)[key];
  }

  // 各類別計算（簡化版，依常見指標範圍進行歸一與加權）
  private calculateValuationScore(data: AnalysisResult): ScoreBreakdown {
    const pe = this.clampNum(this.getPropertySafely(data, 'peRatio') as number | undefined, 0, 60);
    const pb = this.clampNum(this.getPropertySafely(data, 'pbRatio') as number | undefined, 0, 20);
    const dy = this.clampNum(
      this.getPropertySafely(data, 'dividendYield') as number | undefined,
      0,
      0.12
    );

    // 估值越低越好，殖利率越高越好
    const peScore = this.toScoreInverse(pe, 10, 30);
    const pbScore = this.toScoreInverse(pb, 1, 5);
    const dyScore = this.toScoreLinear(dy, 0.02, 0.08);

    return this.composeCategory(ScoreCategory.VALUATION, [
      {
        name: 'PE',
        value: pe ?? 0,
        benchmark: 15,
        score: peScore,
        weight: 0.4,
        impact: 'positive',
        description: '本益比',
      },
      {
        name: 'PB',
        value: pb ?? 0,
        benchmark: 2,
        score: pbScore,
        weight: 0.3,
        impact: 'positive',
        description: '股價淨值比',
      },
      {
        name: 'DY',
        value: dy ?? 0,
        benchmark: 0.04,
        score: dyScore,
        weight: 0.3,
        impact: 'positive',
        description: '殖利率',
      },
    ]);
  }

  private calculateFundamentalsScore(data: AnalysisResult): ScoreBreakdown {
    const roe = this.clampNum(this.getPropertySafely(data, 'roe') as number | undefined, 0, 0.5);
    const dte = this.clampNum(
      this.getPropertySafely(data, 'debtToEquity') as number | undefined,
      0,
      2
    );
    const margin = this.clampNum(
      this.getPropertySafely(data, 'netProfitMargin') as number | undefined,
      0,
      0.4
    );

    const roeScore = this.toScoreLinear(roe, 0.1, 0.25);
    const dteScore = this.toScoreInverse(dte, 0.3, 1.0);
    const marginScore = this.toScoreLinear(margin, 0.1, 0.25);

    return this.composeCategory(ScoreCategory.FUNDAMENTALS, [
      {
        name: 'ROE',
        value: roe ?? 0,
        benchmark: 0.15,
        score: roeScore,
        weight: 0.4,
        impact: 'positive',
        description: '股東權益報酬率',
      },
      {
        name: 'Debt/Equity',
        value: dte ?? 0,
        benchmark: 0.5,
        score: dteScore,
        weight: 0.3,
        impact: 'neutral',
        description: '負債權益比',
      },
      {
        name: 'Net Margin',
        value: margin ?? 0,
        benchmark: 0.15,
        score: marginScore,
        weight: 0.3,
        impact: 'positive',
        description: '淨利率',
      },
    ]);
  }

  private calculateGrowthScore(data: AnalysisResult): ScoreBreakdown {
    const rg = this.clampNum(
      this.getPropertySafely(data, 'revenueGrowth') as number | undefined,
      -0.2,
      0.4
    );
    const eg = this.clampNum(
      this.getPropertySafely(data, 'earningsGrowth') as number | undefined,
      -0.2,
      0.4
    );

    const rgScore = this.toScoreLinear(rg, 0.05, 0.2);
    const egScore = this.toScoreLinear(eg, 0.05, 0.2);

    return this.composeCategory(ScoreCategory.GROWTH, [
      {
        name: 'Revenue Growth',
        value: rg ?? 0,
        benchmark: 0.1,
        score: rgScore,
        weight: 0.5,
        impact: 'positive',
        description: '營收成長率',
      },
      {
        name: 'Earnings Growth',
        value: eg ?? 0,
        benchmark: 0.1,
        score: egScore,
        weight: 0.5,
        impact: 'positive',
        description: '盈餘成長率',
      },
    ]);
  }

  private calculateQualityScore(data: AnalysisResult): ScoreBreakdown {
    const gross = this.clampNum(
      this.getPropertySafely(data, 'grossProfitMargin') as number | undefined,
      0.1,
      0.6
    );
    const operating = this.clampNum(
      this.getPropertySafely(data, 'operatingMargin') as number | undefined,
      0.05,
      0.4
    );

    const gScore = this.toScoreLinear(gross, 0.3, 0.5);
    const oScore = this.toScoreLinear(operating, 0.15, 0.3);

    return this.composeCategory(ScoreCategory.QUALITY, [
      {
        name: 'Gross Margin',
        value: gross ?? 0,
        benchmark: 0.35,
        score: gScore,
        weight: 0.6,
        impact: 'positive',
        description: '毛利率',
      },
      {
        name: 'Operating Margin',
        value: operating ?? 0,
        benchmark: 0.2,
        score: oScore,
        weight: 0.4,
        impact: 'positive',
        description: '營益率',
      },
    ]);
  }

  private calculateRiskScore(data: AnalysisResult): ScoreBreakdown {
    const beta = this.clampNum(this.getPropertySafely(data, 'beta') as number | undefined, 0, 2);
    const vol = this.clampNum(
      this.getPropertySafely(data, 'volatility') as number | undefined,
      0,
      50
    );

    const betaScore = this.toScoreInverse(beta, 0.8, 1.2);
    const volScore = this.toScoreInverse(vol, 10, 30);

    return this.composeCategory(ScoreCategory.RISK, [
      {
        name: 'Beta',
        value: beta ?? 0,
        benchmark: 1,
        score: betaScore,
        weight: 0.5,
        impact: 'negative',
        description: '貝塔值',
      },
      {
        name: 'Volatility',
        value: vol ?? 0,
        benchmark: 20,
        score: volScore,
        weight: 0.5,
        impact: 'negative',
        description: '波動率(%)',
      },
    ]);
  }

  private calculateTechnicalScore(data: AnalysisResult): ScoreBreakdown {
    const momentum = this.clampNum(
      (this.getPropertySafely(data, 'momentum') as number | undefined) ?? 0,
      -0.3,
      0.3
    );
    const momentumScore = this.toScoreLinear(momentum, 0.02, 0.08);

    return this.composeCategory(ScoreCategory.TECHNICAL, [
      {
        name: 'Momentum',
        value: momentum ?? 0,
        benchmark: 0.02,
        score: momentumScore,
        weight: 1,
        impact: 'positive',
        description: '動能',
      },
    ]);
  }

  private calculateLiquidityScore(data: AnalysisResult): ScoreBreakdown {
    const volume = this.clampNum(
      this.getPropertySafely(data, 'volume') as number | undefined,
      0,
      100000000
    );
    const liqScore = this.toScoreLinear(volume, 100000, 2000000);

    return this.composeCategory(ScoreCategory.LIQUIDITY, [
      {
        name: 'Volume',
        value: volume ?? 0,
        benchmark: 1000000,
        score: liqScore,
        weight: 1,
        impact: 'neutral',
        description: '成交量',
      },
    ]);
  }

  // 協助方法
  private composeCategory(
    category: ScoreCategory,
    factors: ScoreBreakdown['factors']
  ): ScoreBreakdown {
    const weight = this.weights[category] ?? 0.1;
    const score = Math.round(factors.reduce((acc, f) => acc + f.score * f.weight, 0));
    const weightedScore = Math.round(score * weight);
    const grade = this.toGrade(score);

    const description = `綜合 ${factors.length} 個因子得分。`;
    const recommendations: string[] = this.simpleRecommendations(category, score);

    return { category, score, grade, weight, weightedScore, factors, description, recommendations };
  }

  private toGrade(score: number): ScoreGrade {
    if (score >= 90) return ScoreGrade.EXCELLENT;
    if (score >= 80) return ScoreGrade.GOOD;
    if (score >= 70) return ScoreGrade.AVERAGE;
    if (score >= 60) return ScoreGrade.BELOW_AVERAGE;
    if (score >= 50) return ScoreGrade.POOR;
    return ScoreGrade.VERY_POOR;
  }

  private toScoreLinear(value: number | null, low: number, high: number): number {
    if (value === null || Number.isNaN(value)) return 50;
    if (value <= low) return 60;
    if (value >= high) return 90;
    const ratio = (value - low) / (high - low);
    return Math.round(60 + ratio * 30);
  }

  private toScoreInverse(value: number | null, low: number, high: number): number {
    if (value === null || Number.isNaN(value)) return 50;
    if (value <= low) return 90;
    if (value >= high) return 60;
    const ratio = (value - low) / (high - low);
    return Math.round(90 - ratio * 30);
  }

  private clampNum(value: unknown, min: number, max: number): number | null {
    if (value === null || value === undefined) return null;
    const n = Number(value);
    if (Number.isNaN(n)) return null;
    return Math.max(min, Math.min(max, n));
  }

  private deriveRiskFactors(data: AnalysisResult): HealthRiskFactor[] {
    const vol = (this.getPropertySafely(data, 'volatility') as number | undefined) ?? 0;
    const beta = (this.getPropertySafely(data, 'beta') as number | undefined) ?? 1;
    const risks: HealthRiskFactor[] = [];
    if (vol > 30)
      risks.push({
        name: '高波動',
        level: 'high',
        impact: 0.7,
        probability: 0.6,
        description: '日內波動率偏高',
        category: 'market',
      });
    if (beta > 1.2)
      risks.push({
        name: '市場敏感度高',
        level: 'medium',
        impact: 0.5,
        probability: 0.5,
        description: '對大盤敏感度較高',
        category: 'market',
      });
    return risks;
  }

  private deriveStrengths(scores: Record<ScoreCategory, ScoreBreakdown>): string[] {
    return (Object.values(scores) as ScoreBreakdown[])
      .filter(s => s.score >= 80)
      .map(s => `${s.category} 優勢`);
  }

  private deriveWeaknesses(scores: Record<ScoreCategory, ScoreBreakdown>): string[] {
    return (Object.values(scores) as ScoreBreakdown[])
      .filter(s => s.score < 60)
      .map(s => `${s.category} 需改善`);
  }

  private buildRecommendations(
    scores: Record<ScoreCategory, ScoreBreakdown>,
    risks: HealthRiskFactor[]
  ): string[] {
    const recs: string[] = [];
    (Object.values(scores) as ScoreBreakdown[]).forEach(s => {
      if (s.score < 60)
        recs.push(`提升 ${s.category}：聚焦因子 ${s.factors.map(f => f.name).join(', ')}`);
    });
    if (risks.length > 0) recs.push('採取風險控管策略，降低波動影響。');
    if (recs.length === 0) recs.push('維持目前策略並定期追蹤。');
    return recs;
  }

  private simpleRecommendations(category: ScoreCategory, score: number): string[] {
    if (score >= 80) return ['保持優勢，持續精進。'];
    if (score >= 60) return ['針對關鍵因子進行優化。'];
    return [`${category} 表現偏弱，建議優先改善。`];
  }
}
