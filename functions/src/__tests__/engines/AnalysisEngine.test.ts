// AnalysisEngine 測試
import { AnalysisEngineFactory, ComprehensiveAnalysisEngine } from '../../engines/AnalysisEngine';
import { AnalysisType } from '../../types/analysis';
import { MarketType } from '../../types/stock';

// Mock 資料建立函數
const buildMockStockData = () => ({
  symbol: '2330',
  marketType: MarketType.TW_STOCK,
  price: 500,
  volume: 1000000,
  marketCap: 5000000000000, // 5兆
  dividendYield: 0.02,
  epsTtm: 25,
  peLow: 15,
  peHigh: 25,
  fcf: 100000000000, // 1000億
  growthRate: 0.15,
  discountRate: 0.1,
  terminalGrowth: 0.03,
  ddmDiscountRate: 0.08,
  dividendGrowth: 0.05,
  volatility: 0.25,
  priceChange: 0.05,
  name: '台積電',
  currency: 'TWD',
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
});

const buildMockETFData = () => ({
  symbol: '0050',
  marketType: MarketType.ETF,
  price: 100,
  volume: 500000,
  marketCap: 100000000000, // 1000億
  dividendYield: 0.03,
  targetYields: [0.025, 0.03, 0.035],
  name: '元大台灣50',
  currency: 'TWD',
  peRatio: 15,
  pbRatio: 2.5,
  eps: 6.67,
  roe: 0.15,
  debtToEquity: 0.1,
  currentRatio: 2.0,
  quickRatio: 1.8,
  inventoryTurnover: 8,
  assetTurnover: 0.8,
  netProfitMargin: 0.2,
  grossProfitMargin: 0.4,
  operatingMargin: 0.25,
  revenueGrowth: 0.1,
  earningsGrowth: 0.12,
  beta: 1.0,
  volatility: 0.2,
  sharpeRatio: 1.2,
  maxDrawdown: 0.15,
  var95: 0.08,
  sector: 'ETF',
  industry: 'Index',
  description: '追蹤台灣50指數的ETF',
  website: 'https://www.yuanta.com.tw',
  employees: 100,
  founded: 2003,
  lastUpdated: new Date(),
});

describe('AnalysisEngine', () => {
  describe('ComprehensiveAnalysisEngine', () => {
    let engine: ComprehensiveAnalysisEngine;

    beforeEach(() => {
      engine = new ComprehensiveAnalysisEngine();
    });

    test('應能執行基礎分析', async () => {
      const stockData = buildMockStockData();
      const result = await engine.analyze('2330', stockData);

      expect(result.symbol).toBe('2330');
      expect(result.type).toBe(AnalysisType.COMPREHENSIVE);
      expect(result.marketType).toBe(MarketType.TW_STOCK);
      expect(result.technicalScore).toBeGreaterThan(0);
      expect(result.fundamentalScore).toBeGreaterThan(0);
      expect(result.riskScore).toBeGreaterThan(0);
      expect(result.healthScore).toBeGreaterThan(0);
      expect(result.recommendation).toBeDefined();
      expect(result.confidence).toBe(0.8);
      expect(result.factors).toBeInstanceOf(Array);
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.dataQuality).toBe(0.9);
      expect(result.summary).toContain('綜合評分');
    });

    test('應能計算技術面分數', async () => {
      const stockData = buildMockStockData();
      const result = await engine.analyze('2330', stockData);

      // 基礎分數 50 + 價格 15 + 成交量 15 + 價格變化 20 = 100
      expect(result.technicalScore).toBe(100);
    });

    test('應能計算基本面分數', async () => {
      const stockData = buildMockStockData();
      const result = await engine.analyze('2330', stockData);

      // 基礎分數 50 + 市值 20 + 股息 15 + EPS 15 = 100
      expect(result.fundamentalScore).toBe(100);
    });

    test('應能計算風險分數', async () => {
      const stockData = buildMockStockData();
      const result = await engine.analyze('2330', stockData);

      // 基礎分數 50，其他風險因素未觸發
      expect(result.riskScore).toBe(50);
    });

    test('應能計算綜合健康分數', async () => {
      const stockData = buildMockStockData();
      const result = await engine.analyze('2330', stockData);

      // 健康分數應該在 0-100 範圍內
      expect(result.healthScore).toBeGreaterThanOrEqual(0);
      expect(result.healthScore).toBeLessThanOrEqual(100);
    });

    test('應能生成投資建議', async () => {
      const stockData = buildMockStockData();
      const result = await engine.analyze('2330', stockData);

      expect(['BUY', 'HOLD', 'SELL', 'STRONG_BUY', 'STRONG_SELL']).toContain(result.recommendation);
    });

    test('應能處理 ETF 資料', async () => {
      const etfData = buildMockETFData();
      const result = await engine.analyze('0050', etfData);

      expect(result.symbol).toBe('0050');
      expect(result.marketType).toBe(MarketType.ETF);
      expect(result.type).toBe(AnalysisType.COMPREHENSIVE);
    });
  });

  describe('ComprehensiveAnalysisEngine - performComprehensiveAnalysis', () => {
    let engine: ComprehensiveAnalysisEngine;

    beforeEach(() => {
      engine = new ComprehensiveAnalysisEngine();
    });

    test('應能執行綜合分析', async () => {
      const stockData = buildMockStockData();
      
      const comprehensiveResult = await engine.performComprehensiveAnalysis(
        '2330',
        stockData,
        'NEUTRAL',
        'semiconductor'
      );

      expect(comprehensiveResult.analysisResult).toBeDefined();
      expect(comprehensiveResult.valuationResult).toBeDefined();
      expect(comprehensiveResult.healthReport).toBeDefined();
      expect(comprehensiveResult.investmentRecommendation).toBeDefined();
      expect(comprehensiveResult.entryPriceResult).toBeDefined();

      // 檢查分析結果
      expect(comprehensiveResult.analysisResult.symbol).toBe('2330');
      expect(comprehensiveResult.analysisResult.type).toBe(AnalysisType.COMPREHENSIVE);

      // 檢查估值結果
      expect(comprehensiveResult.valuationResult.symbol).toBe('2330');
      expect(comprehensiveResult.valuationResult.marketType).toBe(MarketType.TW_STOCK);

      // 檢查健康報告
      expect(comprehensiveResult.healthReport.symbol).toBe('2330');
      expect(comprehensiveResult.healthReport.overallScore).toBeGreaterThan(0);

      // 檢查投資建議
      expect(comprehensiveResult.investmentRecommendation.symbol).toBe('2330');
      expect(comprehensiveResult.investmentRecommendation.action).toBeDefined();

      // 檢查進場價格
      expect(comprehensiveResult.entryPriceResult.symbol).toBe('2330');
      expect(comprehensiveResult.entryPriceResult.currentPrice).toBe(500);
    });

    test('應能處理不同的市場條件', async () => {
      const stockData = buildMockStockData();
      
      const bullishResult = await engine.performComprehensiveAnalysis(
        '2330',
        stockData,
        'BULLISH'
      );

      const bearishResult = await engine.performComprehensiveAnalysis(
        '2330',
        stockData,
        'BEARISH'
      );

      expect(bullishResult.investmentRecommendation).toBeDefined();
      expect(bearishResult.investmentRecommendation).toBeDefined();
    });

    test('應能處理產業資訊', async () => {
      const stockData = buildMockStockData();
      
      const result = await engine.performComprehensiveAnalysis(
        '2330',
        stockData,
        'NEUTRAL',
        'semiconductor'
      );

      expect(result.healthReport).toBeDefined();
      expect(result.entryPriceResult).toBeDefined();
    });
  });

  describe('AnalysisEngineFactory', () => {
    beforeEach(() => {
      // 清理註冊的引擎
      (AnalysisEngineFactory as any).engines.clear();
    });

    test('應能註冊和建立引擎', () => {
      AnalysisEngineFactory.registerEngine(AnalysisType.COMPREHENSIVE, ComprehensiveAnalysisEngine);
      
      const engine = AnalysisEngineFactory.createEngine(AnalysisType.COMPREHENSIVE);
      expect(engine).toBeInstanceOf(ComprehensiveAnalysisEngine);
    });

    test('應能取得支援的分析類型', () => {
      AnalysisEngineFactory.registerEngine(AnalysisType.COMPREHENSIVE, ComprehensiveAnalysisEngine);
      
      const supportedTypes = AnalysisEngineFactory.getSupportedTypes();
      expect(supportedTypes).toContain(AnalysisType.COMPREHENSIVE);
    });

    test('應能檢查是否支援分析類型', () => {
      AnalysisEngineFactory.registerEngine(AnalysisType.COMPREHENSIVE, ComprehensiveAnalysisEngine);
      
      expect(AnalysisEngineFactory.isSupported(AnalysisType.COMPREHENSIVE)).toBe(true);
      expect(AnalysisEngineFactory.isSupported(AnalysisType.TECHNICAL)).toBe(false);
    });

    test('應能在未註冊時返回 null', () => {
      const engine = AnalysisEngineFactory.createEngine(AnalysisType.TECHNICAL);
      expect(engine).toBeNull();
    });
  });

  describe('BaseAnalysisEngine', () => {
    test('應能計算基礎健康分數', () => {
      const engine = new ComprehensiveAnalysisEngine();
      const stockData = buildMockStockData();
      
      const healthScore = engine.calculateHealthScore(stockData);
      expect(healthScore).toBeGreaterThan(0);
      expect(healthScore).toBeLessThanOrEqual(100);
    });

    test('應能生成基礎投資建議', () => {
      const engine = new ComprehensiveAnalysisEngine();
      const stockData = buildMockStockData();
      
      const recommendation = engine.generateRecommendation(stockData);
      expect(['BUY', 'HOLD', 'SELL']).toContain(recommendation);
    });

    test('應能取得分析因素', () => {
      const engine = new ComprehensiveAnalysisEngine();
      const stockData = buildMockStockData();
      
      const factors = engine.getAnalysisFactors(stockData);
      expect(factors).toBeInstanceOf(Array);
      expect(factors.length).toBeGreaterThan(0);
      
      // 檢查因素結構
      factors.forEach(factor => {
        expect(factor.category).toBeDefined();
        expect(factor.name).toBeDefined();
        expect(factor.value).toBeDefined();
        expect(factor.weight).toBeDefined();
        expect(factor.description).toBeDefined();
      });
    });
  });
});
