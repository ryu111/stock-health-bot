// HealthScoreCalculator 測試
import { HealthScoreCalculator } from '../../services/HealthScoreCalculator';
import { AnalysisResult } from '../../types/analysis';
import { MarketType } from '../../types/stock';

describe('HealthScoreCalculator', () => {
  const buildAnalysis = (overrides: Partial<AnalysisResult> = {}): AnalysisResult => ({
    symbol: '2330',
    price: 600,
    marketType: MarketType.TW_STOCK,
    peRatio: 18,
    pbRatio: 4,
    dividendYield: 0.03,
    roe: 0.2,
    debtToEquity: 0.4,
    netProfitMargin: 0.2,
    revenueGrowth: 0.12,
    earningsGrowth: 0.1,
    grossProfitMargin: 0.45,
    operatingMargin: 0.22,
    beta: 1,
    // volatility 與 momentum 在 AnalysisResult 可能不存在，改由 any 注入於呼叫前
    volume: 1500000,
    lastUpdated: new Date(),
    ...overrides,
  } as any);

  test('應能計算整體評分與各類別分數', async () => {
    const calc = new HealthScoreCalculator();
    const analysis = buildAnalysis();
    (analysis as any).volatility = 18;
    (analysis as any).momentum = 0.05;

    const report = await calc.calculateHealthScore('2330', analysis);

    expect(report.symbol).toBe('2330');
    expect(report.overallScore).toBeGreaterThan(0);
    expect(report.categoryScores.valuation).toBeDefined();
    expect(report.categoryScores.fundamentals).toBeDefined();
    expect(report.categoryScores.growth).toBeDefined();
    expect(report.categoryScores.quality).toBeDefined();
    expect(report.categoryScores.risk).toBeDefined();
    expect(report.categoryScores.technical).toBeDefined();
    expect(report.categoryScores.liquidity).toBeDefined();
  });

  test('應產生風險因子與建議', async () => {
    const calc = new HealthScoreCalculator();
    const analysis = buildAnalysis({ beta: 1.3 } as any);
    (analysis as any).volatility = 35;

    const report = await calc.calculateHealthScore('2330', analysis);

    expect(report.riskFactors.length).toBeGreaterThan(0);
    expect(report.recommendations.length).toBeGreaterThan(0);
  });
});
