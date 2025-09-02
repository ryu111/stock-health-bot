// HealthReportGenerator 測試
import { HealthReportGenerator } from '../../services/HealthReportGenerator';
import { MarketType } from '../../types/stock';
import { AnalysisType } from '../../types/analysis';
import { ScoreCategory } from '../../types/health-score';

// Mock 資料建立函數
const buildMockAnalysisResult = () => ({
  symbol: '2330',
  type: AnalysisType.COMPREHENSIVE,
  marketType: MarketType.TW_STOCK,
  technicalScore: 75,
  fundamentalScore: 80,
  riskScore: 70,
  healthScore: 78,
  recommendation: 'HOLD' as const,
  confidence: 0.85,
  factors: [],
  timestamp: new Date(),
  dataQuality: 0.9,
  marketCondition: 'NEUTRAL' as const,
  summary: '基本面良好，技術面穩定',
  details: {
    technical: {},
    fundamental: {},
    risk: {},
  },
});

const buildMockValuationResult = () => ({
  symbol: '2330',
  price: 500,
  marketType: MarketType.TW_STOCK,
  methods: [
    {
      method: 'PE' as const,
      fairLow: 450,
      fairMid: 500,
      fairHigh: 550,
      confidence: 0.8,
      assumptions: ['使用 PE 估值法'],
      limitations: ['PE 法對成長股較適用'],
    },
  ],
  compositeFair: { low: 450, mid: 500, high: 550 },
  signal: 'FAIR' as const,
  suggestedBuyPrice: undefined,
  notes: [],
  timestamp: new Date(),
  dataQuality: 0.9,
  confidence: 0.85,
});

describe('HealthReportGenerator', () => {
  test('應能產生單一標的健康報告', async () => {
    const generator = new HealthReportGenerator();
    const analysis = buildMockAnalysisResult();
    const valuation = buildMockValuationResult();

    const report = await generator.generateReport(
      '2330',
      MarketType.TW_STOCK,
      analysis,
      valuation as any
    );

    expect(report.symbol).toBe('2330');
    expect(report.marketType).toBe(MarketType.TW_STOCK);
    expect(report.overallScore).toBeGreaterThan(0);
    expect(report.overallScore).toBeLessThanOrEqual(100);
    expect(report.categoryScores).toBeDefined();
    expect(report.riskFactors).toBeDefined();
    expect(report.recommendations).toBeDefined();
  });

  test('應能產生比較報告', async () => {
    const generator = new HealthReportGenerator();
    const symbols = ['2330', '2317', '2454'];
    const analysisResults: Record<string, any> = {};
    const valuationResults: Record<string, any> = {};

    // 為每個標的建立模擬資料
    symbols.forEach(symbol => {
      analysisResults[symbol] = buildMockAnalysisResult();
      valuationResults[symbol] = buildMockValuationResult();
    });

    const comparativeReport = await generator.generateComparativeReport(
      symbols,
      MarketType.TW_STOCK,
      analysisResults,
      valuationResults
    );

    expect(comparativeReport.reports).toHaveProperty('2330');
    expect(comparativeReport.reports).toHaveProperty('2317');
    expect(comparativeReport.reports).toHaveProperty('2454');
    expect(comparativeReport.comparison.topPerformers).toHaveLength(3);
    expect(comparativeReport.comparison.bottomPerformers).toHaveLength(3);
    expect(comparativeReport.comparison.averageScore).toBeGreaterThan(0);
  });

  test('應能套用產業權重調整', async () => {
    const generator = new HealthReportGenerator();
    const analysis = buildMockAnalysisResult();
    const valuation = buildMockValuationResult();

    const report = await generator.generateReport(
      '2330',
      MarketType.TW_STOCK,
      analysis,
      valuation as any,
      'semiconductor'
    );

    // 驗證報告產生成功（產業調整資訊會透過 console.log 輸出）
    expect(report.symbol).toBe('2330');
    expect(report.overallScore).toBeGreaterThan(0);
  });

  test('應能取得權重配置', () => {
    const generator = new HealthReportGenerator();
    const config = generator.getWeightConfiguration();

    expect(config.categoryWeights).toBeDefined();
    expect(config.factorWeights).toBeDefined();
    expect(config.thresholds).toBeDefined();
    expect(config.industryAdjustments).toBeDefined();
  });

  test('應能更新權重配置', () => {
    const generator = new HealthReportGenerator();
    const newConfig = {
      categoryWeights: {
        [ScoreCategory.VALUATION]: 0.3,
        [ScoreCategory.FUNDAMENTALS]: 0.3,
        [ScoreCategory.GROWTH]: 0.2,
        [ScoreCategory.QUALITY]: 0.1,
        [ScoreCategory.RISK]: 0.05,
        [ScoreCategory.TECHNICAL]: 0.03,
        [ScoreCategory.LIQUIDITY]: 0.02,
      } as any,
    };

    generator.updateWeights(newConfig);
    const updatedConfig = generator.getWeightConfiguration();

    expect(updatedConfig.categoryWeights[ScoreCategory.VALUATION]).toBe(0.3);
    expect(updatedConfig.categoryWeights[ScoreCategory.FUNDAMENTALS]).toBe(0.3);
  });
});
