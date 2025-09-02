// EntryPriceCalculator 測試
import { EntryPriceCalculator } from '../../services/EntryPriceCalculator';
import { MarketType } from '../../types/stock';
import { ScoreGrade } from '../../types/health-score';

// Mock 資料建立函數
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
  signal: 'CHEAP' as const,
  suggestedBuyPrice: 450,
  notes: [],
  timestamp: new Date(),
  dataQuality: 0.9,
  confidence: 0.8,
});

const buildMockHealthReport = () => ({
  symbol: '2330',
  marketType: MarketType.TW_STOCK,
  overallScore: 85,
  overallGrade: ScoreGrade.GOOD,
  categoryScores: {} as any,
  riskFactors: [],
  strengths: ['基本面穩健', '技術面良好'],
  weaknesses: [],
  recommendations: ['可考慮分批布局'],
  investmentAdvice: {
    suitability: 'moderate' as const,
    timeHorizon: 'medium' as const,
    riskTolerance: 'medium' as const,
    advice: '基本面良好，可分批布局。',
  },
  lastUpdated: new Date(),
  confidence: 0.85,
  dataQuality: 0.9,
});

describe('EntryPriceCalculator', () => {
  let calculator: EntryPriceCalculator;

  beforeEach(() => {
    calculator = new EntryPriceCalculator();
  });

  describe('基本功能', () => {
    test('應能計算建議進場價格', () => {
      const valuationResult = buildMockValuationResult();
      const healthReport = buildMockHealthReport();

      const result = calculator.calculateEntryPrice(
        '2330',
        valuationResult,
        healthReport
      );

      expect(result.symbol).toBe('2330');
      expect(result.currentPrice).toBe(500);
      expect(result.fairValue).toEqual({ low: 450, mid: 500, high: 550 });
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.reasoning).toBeInstanceOf(Array);
      expect(result.lastUpdated).toBeInstanceOf(Date);
    });

    test('應能處理不同的風險偏好', () => {
      const valuationResult = buildMockValuationResult();
      const healthReport = buildMockHealthReport();

      const conservativeResult = calculator.calculateEntryPrice(
        '2330',
        valuationResult,
        healthReport,
        'NEUTRAL',
        undefined,
        'conservative'
      );

      const aggressiveResult = calculator.calculateEntryPrice(
        '2330',
        valuationResult,
        healthReport,
        'NEUTRAL',
        undefined,
        'aggressive'
      );

      // 保守型應該有更高的安全邊際（更低的建議價格）
      expect(conservativeResult.recommendedEntryPrice.conservative).toBeLessThan(
        aggressiveResult.recommendedEntryPrice.aggressive
      );
    });

    test('應能處理不同的市場條件', () => {
      const valuationResult = buildMockValuationResult();
      const healthReport = buildMockHealthReport();

      const bullishResult = calculator.calculateEntryPrice(
        '2330',
        valuationResult,
        healthReport,
        'BULLISH'
      );

      const bearishResult = calculator.calculateEntryPrice(
        '2330',
        valuationResult,
        healthReport,
        'BEARISH'
      );

      // 多頭市場應該有較高的建議價格
      expect(bullishResult.marketAdjustedPrice.bullish).toBeGreaterThan(
        bearishResult.marketAdjustedPrice.bearish
      );
    });
  });

  describe('產業調整', () => {
    test('應能應用產業調整係數', () => {
      const valuationResult = buildMockValuationResult();
      const healthReport = buildMockHealthReport();

      const techResult = calculator.calculateEntryPrice(
        '2330',
        valuationResult,
        healthReport,
        'NEUTRAL',
        'semiconductor'
      );

      const financialResult = calculator.calculateEntryPrice(
        '2330',
        valuationResult,
        healthReport,
        'NEUTRAL',
        'banking'
      );

      // 半導體產業應該有較高的估值容忍度
      expect(techResult.recommendedEntryPrice.moderate).toBeGreaterThan(
        financialResult.recommendedEntryPrice.moderate
      );
    });

    test('應能新增自定義產業調整係數', () => {
      calculator.addIndustryAdjustment('custom', 1.1);

      const result = calculator.calculateEntryPrice(
        '2330',
        buildMockValuationResult(),
        buildMockHealthReport(),
        'NEUTRAL',
        'custom'
      );

      expect(result.reasoning).toContain('custom 產業具有較高估值容忍度');
    });

    test('應能移除產業調整係數', () => {
      calculator.addIndustryAdjustment('temp', 1.1);
      calculator.removeIndustryAdjustment('temp');

      const result = calculator.calculateEntryPrice(
        '2330',
        buildMockValuationResult(),
        buildMockHealthReport(),
        'NEUTRAL',
        'temp'
      );

      // 應該不會有產業調整的說明
      expect(result.reasoning.some(r => r.includes('產業具有較高估值容忍度'))).toBe(false);
    });
  });

  describe('風險評估', () => {
    test('應能根據健康評分調整風險等級', () => {
      const valuationResult = buildMockValuationResult();
      
      const highHealthReport = { ...buildMockHealthReport(), overallScore: 90 };
      const lowHealthReport = { ...buildMockHealthReport(), overallScore: 50 };

      const highHealthResult = calculator.calculateEntryPrice(
        '2330',
        valuationResult,
        highHealthReport
      );

      const lowHealthResult = calculator.calculateEntryPrice(
        '2330',
        valuationResult,
        lowHealthReport
      );

      // 高健康評分應該產生低風險調整
      expect(highHealthResult.riskAdjustedPrice.low).toBeGreaterThan(
        lowHealthResult.riskAdjustedPrice.low
      );
    });

    test('應能產生正確的風險等級描述', () => {
      const valuationResult = buildMockValuationResult();
      const healthReport = buildMockHealthReport();

      const result = calculator.calculateEntryPrice(
        '2330',
        valuationResult,
        healthReport
      );

      // 健康評分 85 應該產生低風險等級
      expect(result.reasoning).toContain('風險等級：低風險，適合長期持有');
    });
  });

  describe('價格分析', () => {
    test('應能分析當前價格與合理價值的關係', () => {
      const healthReport = buildMockHealthReport();
      
      // 價格低於合理價值下限
      const cheapValuation = {
        ...buildMockValuationResult(),
        price: 400,
        compositeFair: { low: 450, mid: 500, high: 550 },
      };

      const cheapResult = calculator.calculateEntryPrice(
        '2330',
        cheapValuation,
        healthReport
      );

      expect(cheapResult.reasoning).toContain('當前價格低於合理價值下限，具有投資價值');

      // 價格高於合理價值上限
      const expensiveValuation = {
        ...buildMockValuationResult(),
        price: 600,
        compositeFair: { low: 450, mid: 500, high: 550 },
      };

      const expensiveResult = calculator.calculateEntryPrice(
        '2330',
        expensiveValuation,
        healthReport
      );

      expect(expensiveResult.reasoning).toContain('當前價格高於合理價值上限，需謹慎評估');
    });

    test('應能提供進場時機建議', () => {
      const healthReport = buildMockHealthReport();
      
      // 價格遠高於建議價格
      const highPriceValuation = {
        ...buildMockValuationResult(),
        price: 600,
        compositeFair: { low: 450, mid: 500, high: 550 },
      };

      const highPriceResult = calculator.calculateEntryPrice(
        '2330',
        highPriceValuation,
        healthReport
      );

      expect(highPriceResult.reasoning).toContain('建議等待價格回調至建議區間');

      // 價格遠低於建議價格
      const lowPriceValuation = {
        ...buildMockValuationResult(),
        price: 400,
        compositeFair: { low: 450, mid: 500, high: 550 },
      };

      const lowPriceResult = calculator.calculateEntryPrice(
        '2330',
        lowPriceValuation,
        healthReport
      );

      expect(lowPriceResult.reasoning).toContain('當前價格具吸引力，可考慮分批布局');
    });
  });

  describe('配置管理', () => {
    test('應能更新配置', () => {
      const newConfig = {
        safetyMargin: {
          conservative: 0.20,
          moderate: 0.15,
          aggressive: 0.10,
        },
      };

      calculator.updateConfig(newConfig);
      const currentConfig = calculator.getConfig();

      expect(currentConfig.safetyMargin.conservative).toBe(0.20);
      expect(currentConfig.safetyMargin.moderate).toBe(0.15);
      expect(currentConfig.safetyMargin.aggressive).toBe(0.10);
    });

    test('應能保持其他配置不變', () => {
      const originalConfig = calculator.getConfig();
      
      calculator.updateConfig({
        safetyMargin: { conservative: 0.20, moderate: 0.15, aggressive: 0.10 },
      });

      const updatedConfig = calculator.getConfig();

      // 其他配置應該保持不變
      expect(updatedConfig.riskAdjustment).toEqual(originalConfig.riskAdjustment);
      expect(updatedConfig.marketAdjustment).toEqual(originalConfig.marketAdjustment);
    });
  });

  describe('錯誤處理', () => {
    test('應能在缺少合理價值資料時拋出錯誤', () => {
      const invalidValuationResult = {
        ...buildMockValuationResult(),
        compositeFair: null,
      };

      const healthReport = buildMockHealthReport();

      expect(() => {
        calculator.calculateEntryPrice(
          '2330',
          invalidValuationResult as any,
          healthReport
        );
      }).toThrow('無法取得合理價值資料');
    });
  });

  describe('置信度計算', () => {
    test('應能正確計算置信度', () => {
      const highConfidenceValuation = {
        ...buildMockValuationResult(),
        confidence: 0.9,
        dataQuality: 0.95,
      };

      const highConfidenceHealthReport = {
        ...buildMockHealthReport(),
        confidence: 0.9,
      };

      const result = calculator.calculateEntryPrice(
        '2330',
        highConfidenceValuation,
        highConfidenceHealthReport
      );

      expect(result.confidence).toBeGreaterThan(0.8);
    });

    test('應能處理缺少置信度資料的情況', () => {
      const noConfidenceValuation = {
        ...buildMockValuationResult(),
        confidence: undefined,
        dataQuality: undefined,
      };

      const noConfidenceHealthReport = {
        ...buildMockHealthReport(),
        confidence: undefined,
      };

      const result = calculator.calculateEntryPrice(
        '2330',
        noConfidenceValuation as any,
        noConfidenceHealthReport as any
      );

      // 應該使用預設值 0.8
      expect(result.confidence).toBe(0.8);
    });
  });
});
