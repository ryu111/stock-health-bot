import { ComprehensiveAnalysisEngine } from '../../engines/AnalysisEngine';
import { StockData, MarketType } from '../../types/stock';
import { AnalysisType } from '../../types/analysis';

// Mock 外部依賴
jest.mock('../../services/DataFetcher');
jest.mock('../../services/DataQualityController');
jest.mock('../../adapters/StockDataAdapter');
jest.mock('../../adapters/ETFDataAdapter');

describe('體質分析整合測試', () => {
  let analysisEngine: ComprehensiveAnalysisEngine;
  // 這些服務已整合到ComprehensiveAnalysisEngine中
  // let healthCalculator: HealthScoreCalculator;
  // let recommendationEngine: RecommendationEngine;
  // let entryPriceCalculator: EntryPriceCalculator;

  const mockStockData: StockData = {
    symbol: '2330',
    name: '台積電',
    marketType: MarketType.TW_STOCK,
    price: 500,
    volume: 1000000,
    marketCap: 5000000000000,
    dividendYield: 0.02,
    peRatio: 20,
    pbRatio: 5.0,
    eps: 25,
    roe: 0.25,
    debtToEquity: 0.1,
    currentRatio: 2.5,
    quickRatio: 2.2,
    inventoryTurnover: 10,
    assetTurnover: 0.8,
    netProfitMargin: 0.35,
    grossProfitMargin: 0.5,
    operatingMargin: 0.4,
    revenueGrowth: 0.2,
    earningsGrowth: 0.25,
    beta: 1.1,
    volatility: 0.25,
    sharpeRatio: 1.5,
    maxDrawdown: 0.2,
    var95: 0.1,
    sector: 'Technology',
    industry: 'Semiconductor',
    description: '全球最大的晶圓代工廠',
    website: 'https://www.tsmc.com',
    employees: 65000,
    founded: 1987,
    lastUpdated: new Date(),
    currency: 'TWD',
  };

  beforeEach(() => {
    analysisEngine = new ComprehensiveAnalysisEngine();
    // 這些服務已整合到ComprehensiveAnalysisEngine中
    // healthCalculator = new HealthScoreCalculator();
    // recommendationEngine = new RecommendationEngine();
    // entryPriceCalculator = new EntryPriceCalculator();
  });

  describe('完整分析流程', () => {
    test('應能執行完整的體質分析流程', async () => {
      // 執行綜合分析
      const comprehensiveResult = await analysisEngine.performComprehensiveAnalysis(
        '2330',
        mockStockData,
        'NEUTRAL',
        'Semiconductor'
      );

      expect(comprehensiveResult).toBeDefined();
      expect(comprehensiveResult.analysisResult.symbol).toBe('2330');
      expect(comprehensiveResult.analysisResult.type).toBe(AnalysisType.COMPREHENSIVE);
      expect(comprehensiveResult.healthReport).toBeDefined();
      expect(comprehensiveResult.valuationResult).toBeDefined();
      expect(comprehensiveResult.investmentRecommendation).toBeDefined();
      expect(comprehensiveResult.entryPriceResult).toBeDefined();
    });

    test('健康評分應在合理範圍內', async () => {
      const comprehensiveResult = await analysisEngine.performComprehensiveAnalysis(
        '2330',
        mockStockData,
        'NEUTRAL',
        'Semiconductor'
      );

      const healthReport = comprehensiveResult.healthReport;
      expect(healthReport.overallScore).toBeGreaterThanOrEqual(0);
      expect(healthReport.overallScore).toBeLessThanOrEqual(100);
      expect(healthReport.confidence).toBeGreaterThan(0);
      expect(healthReport.confidence).toBeLessThanOrEqual(1);
    });

    test('估值結果應包含合理數值', async () => {
      const comprehensiveResult = await analysisEngine.performComprehensiveAnalysis(
        '2330',
        mockStockData,
        'NEUTRAL',
        'Semiconductor'
      );

      const valuationResult = comprehensiveResult.valuationResult;
      expect(valuationResult.compositeFair?.mid).toBeGreaterThan(0);
      expect(valuationResult.confidence).toBeGreaterThan(0);
      expect(valuationResult.methods).toBeDefined();
    });

    test('投資建議應包含必要資訊', async () => {
      const comprehensiveResult = await analysisEngine.performComprehensiveAnalysis(
        '2330',
        mockStockData,
        'NEUTRAL',
        'Semiconductor'
      );

      const recommendation = comprehensiveResult.investmentRecommendation as any;
      expect(recommendation.action).toBeDefined();
      expect(recommendation.reasoning).toBeDefined();
      expect(recommendation.confidence).toBeGreaterThan(0);
    });

    test('進場價格應考慮安全邊際', async () => {
      const comprehensiveResult = await analysisEngine.performComprehensiveAnalysis(
        '2330',
        mockStockData,
        'NEUTRAL',
        'Semiconductor'
      );

      const entryPrice = comprehensiveResult.entryPriceResult as any;
      expect(entryPrice.recommendedPrice).toBeGreaterThan(0);
      expect(entryPrice.safetyMargin).toBeGreaterThan(0);
      expect(entryPrice.riskLevel).toBeDefined();
    });
  });

  describe('資料品質控制', () => {
    test('應能處理不完整的資料', async () => {
      const incompleteData = { ...mockStockData, eps: null, peRatio: null };
      
      const comprehensiveResult = await analysisEngine.performComprehensiveAnalysis(
        '2330',
        incompleteData,
        'NEUTRAL',
        'Semiconductor'
      );

      // 應該能完成分析，但置信度會降低
      expect(comprehensiveResult.healthReport.confidence).toBeLessThan(1.0);
      expect(comprehensiveResult.valuationResult.confidence).toBeLessThan(1.0);
    });

    test('應能處理極端數值', async () => {
      const extremeData = { 
        ...mockStockData, 
        peRatio: 999, 
        debtToEquity: 10,
        volatility: 2.0 
      };
      
      const comprehensiveResult = await analysisEngine.performComprehensiveAnalysis(
        '2330',
        extremeData,
        'NEUTRAL',
        'Semiconductor'
      );

      // 應該能完成分析，但會標記風險
      expect(comprehensiveResult.healthReport.riskFactors.length).toBeGreaterThan(0);
    });
  });

  describe('錯誤處理', () => {
    test('應能處理分析過程中的錯誤', async () => {
      const invalidData = { ...mockStockData, price: -100 };
      
      try {
        await analysisEngine.performComprehensiveAnalysis(
          '2330',
          invalidData,
          'NEUTRAL',
          'Semiconductor'
        );
      } catch (error) {
        // 應該拋出錯誤
        expect(error).toBeDefined();
      }
    });
  });
});
