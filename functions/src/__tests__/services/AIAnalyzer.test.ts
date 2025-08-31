import { AIAnalyzer } from '../../services/AIAnalyzer';
import { AnalysisType, AnalysisResult } from '../../types/analysis';
import { TestUtils } from '../utils/testUtils';

// 模擬依賴
jest.mock('../../engines/AnalysisEngine');
jest.mock('../../engines/FixedFormulaEngine');
jest.mock('../../engines/AIEngine');
jest.mock('../../utils/Logger', () => ({
  Logger: {
    getInstance: jest.fn(() => ({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    })),
  },
}));

describe('AIAnalyzer', () => {
  let aiAnalyzer: AIAnalyzer;

  beforeEach(() => {
    aiAnalyzer = new AIAnalyzer();
    jest.clearAllMocks();
  });

  describe('analyzeStock', () => {
    it('應該成功分析股票', async () => {
      // 準備測試數據
      const mockStockData = TestUtils.createMockStockData('2330');
      const mockAnalysisResult: AnalysisResult = {
        symbol: '2330',
        type: AnalysisType.COMPREHENSIVE,
        marketType: 'TW_STOCK' as any,
        technicalScore: 75,
        fundamentalScore: 80,
        riskScore: 25,
        healthScore: 78,
        recommendation: 'BUY',
        confidence: 0.85,
        factors: [],
        timestamp: new Date(),
        dataQuality: 0.9,
        marketCondition: 'BULLISH',
        summary: '強勁的基本面和技術面',
        details: {
          technical: {},
          fundamental: {},
          risk: {},
        },
      };

      // 模擬引擎回應
      const mockAIEngine = {
        analyze: jest.fn().mockResolvedValue(mockAnalysisResult)
      };
      const mockFixedEngine = {
        analyze: jest.fn().mockResolvedValue(mockAnalysisResult)
      };

      // 替換私有屬性
      (aiAnalyzer as any).aiEngine = mockAIEngine;
      (aiAnalyzer as any).fixedEngine = mockFixedEngine;

      // 執行測試
      const result = await aiAnalyzer.analyzeStock('2330', mockStockData);

      // 驗證結果
      expect(result).toBeDefined();
      expect(result.symbol).toBe('2330');
      expect(result.healthScore).toBe(78);
      expect(result.recommendation).toBe('BUY');
      expect(result.confidence).toBe(0.85);
      expect(mockAIEngine.analyze).toHaveBeenCalledWith('2330', mockStockData);
    });

    it('應該使用模擬數據當沒有提供數據時', async () => {
      // 準備模擬分析結果
      const mockAnalysisResult: AnalysisResult = {
        symbol: '2330',
        type: AnalysisType.COMPREHENSIVE,
        marketType: 'TW_STOCK' as any,
        technicalScore: 70,
        fundamentalScore: 75,
        riskScore: 30,
        healthScore: 72,
        recommendation: 'BUY',
        confidence: 0.8,
        factors: [],
        timestamp: new Date(),
        dataQuality: 0.85,
        marketCondition: 'BULLISH',
        summary: '良好的投資機會',
        details: {
          technical: {},
          fundamental: {},
          risk: {},
        },
      };

      // 模擬引擎回應
      const mockAIEngine = {
        analyze: jest.fn().mockResolvedValue(mockAnalysisResult)
      };
      const mockFixedEngine = {
        analyze: jest.fn().mockResolvedValue(mockAnalysisResult)
      };

      // 替換私有屬性
      (aiAnalyzer as any).aiEngine = mockAIEngine;
      (aiAnalyzer as any).fixedEngine = mockFixedEngine;

      // 執行測試
      const result = await aiAnalyzer.analyzeStock('2330');

      // 驗證結果
      expect(result).toBeDefined();
      expect(result.symbol).toBe('2330');
      expect(mockAIEngine.analyze).toHaveBeenCalledWith('2330', expect.any(Object));
    });

    it('應該使用技術分析引擎', async () => {
      // 準備測試數據
      const mockStockData = TestUtils.createMockStockData('2330');
      const mockAnalysisResult: AnalysisResult = {
        symbol: '2330',
        type: AnalysisType.TECHNICAL,
        marketType: 'TW_STOCK' as any,
        technicalScore: 80,
        fundamentalScore: 0,
        riskScore: 20,
        healthScore: 75,
        recommendation: 'BUY',
        confidence: 0.9,
        factors: [],
        timestamp: new Date(),
        dataQuality: 0.95,
        marketCondition: 'BULLISH',
        summary: '技術面強勁',
        details: {
          technical: {},
          fundamental: {},
          risk: {},
        },
      };

      // 模擬引擎回應
      const mockAIEngine = {
        analyze: jest.fn().mockResolvedValue(mockAnalysisResult)
      };
      const mockFixedEngine = {
        analyze: jest.fn().mockResolvedValue(mockAnalysisResult)
      };

      // 替換私有屬性
      (aiAnalyzer as any).aiEngine = mockAIEngine;
      (aiAnalyzer as any).fixedEngine = mockFixedEngine;

      // 執行測試
      const result = await aiAnalyzer.analyzeStock('2330', mockStockData, AnalysisType.TECHNICAL);

      // 驗證結果
      expect(result).toBeDefined();
      expect(result.type).toBe(AnalysisType.TECHNICAL);
      expect(mockFixedEngine.analyze).toHaveBeenCalledWith('2330', mockStockData);
    });

    it('應該處理分析錯誤', async () => {
      // 模擬引擎錯誤
      const mockAIEngine = {
        analyze: jest.fn().mockRejectedValue(new Error('分析失敗'))
      };
      const mockFixedEngine = {
        analyze: jest.fn().mockRejectedValue(new Error('分析失敗'))
      };

      // 替換私有屬性
      (aiAnalyzer as any).aiEngine = mockAIEngine;
      (aiAnalyzer as any).fixedEngine = mockFixedEngine;

      // 執行測試並驗證錯誤
      await expect(aiAnalyzer.analyzeStock('2330')).rejects.toThrow('分析失敗');
    });
  });

  describe('analyzeMultipleStocks', () => {
    it('應該成功批量分析股票', async () => {
      // 準備模擬分析結果
      const mockAnalysisResult: AnalysisResult = {
        symbol: '2330',
        type: AnalysisType.COMPREHENSIVE,
        marketType: 'TW_STOCK' as any,
        technicalScore: 75,
        fundamentalScore: 80,
        riskScore: 25,
        healthScore: 78,
        recommendation: 'BUY',
        confidence: 0.85,
        factors: [],
        timestamp: new Date(),
        dataQuality: 0.9,
        marketCondition: 'BULLISH',
        summary: '強勁的基本面和技術面',
        details: {
          technical: {},
          fundamental: {},
          risk: {},
        },
      };

      // 模擬引擎回應 - 為不同股票返回不同結果
      const mockAnalysisResult1: AnalysisResult = {
        ...mockAnalysisResult,
        symbol: '2330',
      };
      const mockAnalysisResult2: AnalysisResult = {
        ...mockAnalysisResult,
        symbol: '2317',
      };

      const mockAIEngine = {
        analyze: jest.fn()
          .mockResolvedValueOnce(mockAnalysisResult1)
          .mockResolvedValueOnce(mockAnalysisResult2)
      };
      const mockFixedEngine = {
        analyze: jest.fn()
          .mockResolvedValueOnce(mockAnalysisResult1)
          .mockResolvedValueOnce(mockAnalysisResult2)
      };

      // 替換私有屬性
      (aiAnalyzer as any).aiEngine = mockAIEngine;
      (aiAnalyzer as any).fixedEngine = mockFixedEngine;

      // 執行測試
      const results = await aiAnalyzer.analyzeMultipleStocks(['2330', '2317']);

      // 驗證結果
      expect(results).toHaveLength(2);
      expect(results[0]?.symbol).toBe('2330');
      expect(results[1]?.symbol).toBe('2317');
      expect(results[0]?.healthScore).toBe(78);
    });

    it('應該處理部分分析失敗的情況', async () => {
      // 模擬引擎回應（一個成功，一個失敗）
      const mockAnalysisResult: AnalysisResult = {
        symbol: '2330',
        type: AnalysisType.COMPREHENSIVE,
        marketType: 'TW_STOCK' as any,
        technicalScore: 75,
        fundamentalScore: 80,
        riskScore: 25,
        healthScore: 78,
        recommendation: 'BUY',
        confidence: 0.85,
        factors: [],
        timestamp: new Date(),
        dataQuality: 0.9,
        marketCondition: 'BULLISH',
        summary: '強勁的基本面和技術面',
        details: {
          technical: {},
          fundamental: {},
          risk: {},
        },
      };

      const mockAIEngine = {
        analyze: jest.fn()
          .mockResolvedValueOnce(mockAnalysisResult)
          .mockRejectedValueOnce(new Error('分析失敗'))
      };
      const mockFixedEngine = {
        analyze: jest.fn()
          .mockResolvedValueOnce(mockAnalysisResult)
          .mockRejectedValueOnce(new Error('分析失敗'))
      };

      // 替換私有屬性
      (aiAnalyzer as any).aiEngine = mockAIEngine;
      (aiAnalyzer as any).fixedEngine = mockFixedEngine;

      // 執行測試
      const results = await aiAnalyzer.analyzeMultipleStocks(['2330', 'INVALID']);

      // 驗證結果
      expect(results).toHaveLength(2);
      expect(results[0]?.symbol).toBe('2330');
      expect(results[0]?.healthScore).toBe(78);
      expect(results[1]?.symbol).toBe('INVALID');
      expect(results[1]?.healthScore).toBe(0); // 錯誤結果
    });
  });

  describe('compareAnalysisResults', () => {
    it('應該正確比較分析結果', () => {
      // 準備測試數據
      const mockResults: AnalysisResult[] = [
        {
          symbol: '2330',
          type: AnalysisType.COMPREHENSIVE,
          marketType: 'TW_STOCK' as any,
          technicalScore: 80,
          fundamentalScore: 85,
          riskScore: 20,
          healthScore: 82,
          recommendation: 'BUY',
          confidence: 0.9,
          factors: [],
          timestamp: new Date(),
          dataQuality: 0.95,
          marketCondition: 'BULLISH',
          summary: '優秀的投資機會',
          details: { technical: {}, fundamental: {}, risk: {} },
        },
        {
          symbol: '2317',
          type: AnalysisType.COMPREHENSIVE,
          marketType: 'TW_STOCK' as any,
          technicalScore: 70,
          fundamentalScore: 75,
          riskScore: 30,
          healthScore: 72,
          recommendation: 'HOLD',
          confidence: 0.8,
          factors: [],
          timestamp: new Date(),
          dataQuality: 0.85,
          marketCondition: 'NEUTRAL',
          summary: '穩定的投資選擇',
          details: { technical: {}, fundamental: {}, risk: {} },
        },
        {
          symbol: '2454',
          type: AnalysisType.COMPREHENSIVE,
          marketType: 'TW_STOCK' as any,
          technicalScore: 60,
          fundamentalScore: 65,
          riskScore: 40,
          healthScore: 62,
          recommendation: 'SELL',
          confidence: 0.7,
          factors: [],
          timestamp: new Date(),
          dataQuality: 0.8,
          marketCondition: 'BEARISH',
          summary: '需要謹慎考慮',
          details: { technical: {}, fundamental: {}, risk: {} },
        },
      ];

      // 執行測試
      const comparison = aiAnalyzer.compareAnalysisResults(mockResults);

      // 驗證結果
      expect(comparison['bestHealthScore']).toBe(82);
      expect(comparison['worstHealthScore']).toBe(62);
      expect(comparison['averageHealthScore']).toBeCloseTo(72, 1);
      expect(comparison['bestTechnicalScore']).toBe(80);
      expect(comparison['bestFundamentalScore']).toBe(85);
      expect(comparison['bestRiskScore']).toBe(40);
      expect((comparison['recommendations'] as any).buy).toBe(1);
      expect((comparison['recommendations'] as any).hold).toBe(1);
      expect((comparison['recommendations'] as any).sell).toBe(1);
      expect(comparison['topPerformers']).toHaveLength(3);
      expect(comparison['riskAnalysis']).toHaveLength(3);
    });

    it('應該處理空結果陣列', () => {
      // 執行測試
      const comparison = aiAnalyzer.compareAnalysisResults([]);

      // 驗證結果
      expect(comparison['bestHealthScore']).toBe(-Infinity);
      expect(comparison['worstHealthScore']).toBe(Infinity);
      expect(comparison['averageHealthScore']).toBeNaN();
    });
  });

  describe('getAnalysisHistory', () => {
    it('應該返回分析歷史', async () => {
      // 準備模擬分析結果
      const mockAnalysisResult: AnalysisResult = {
        symbol: '2330',
        type: AnalysisType.COMPREHENSIVE,
        marketType: 'TW_STOCK' as any,
        technicalScore: 75,
        fundamentalScore: 80,
        riskScore: 25,
        healthScore: 78,
        recommendation: 'BUY',
        confidence: 0.85,
        factors: [],
        timestamp: new Date(),
        dataQuality: 0.9,
        marketCondition: 'BULLISH',
        summary: '強勁的基本面和技術面',
        details: {
          technical: {},
          fundamental: {},
          risk: {},
        },
      };

      // 模擬引擎回應
      const mockAIEngine = {
        analyze: jest.fn().mockResolvedValue(mockAnalysisResult)
      };
      const mockFixedEngine = {
        analyze: jest.fn().mockResolvedValue(mockAnalysisResult)
      };

      // 替換私有屬性
      (aiAnalyzer as any).aiEngine = mockAIEngine;
      (aiAnalyzer as any).fixedEngine = mockFixedEngine;

      // 執行測試
      const history = await aiAnalyzer.getAnalysisHistory('2330', 5);

      // 驗證結果
      expect(history).toHaveLength(5);
      expect(history[0]?.symbol).toBe('2330');
      expect(history[0]?.healthScore).toBe(78);
      expect(history[0]?.timestamp).toBeInstanceOf(Date);
    });

    it('應該處理歷史查詢錯誤', async () => {
      // 模擬引擎錯誤
      const mockAIEngine = {
        analyze: jest.fn().mockRejectedValue(new Error('分析失敗'))
      };
      const mockFixedEngine = {
        analyze: jest.fn().mockRejectedValue(new Error('分析失敗'))
      };

      // 替換私有屬性
      (aiAnalyzer as any).aiEngine = mockAIEngine;
      (aiAnalyzer as any).fixedEngine = mockFixedEngine;

      // 執行測試並驗證錯誤
      await expect(aiAnalyzer.getAnalysisHistory('2330', 5)).rejects.toThrow('分析失敗');
    });
  });

  describe('模擬數據功能', () => {
    it('應該提供有效的模擬股票數據', () => {
      // 測試私有方法 (通過公開方法間接測試)
      const mockAnalysisResult: AnalysisResult = {
        symbol: '2330',
        type: AnalysisType.COMPREHENSIVE,
        marketType: 'TW_STOCK' as any,
        technicalScore: 75,
        fundamentalScore: 80,
        riskScore: 25,
        healthScore: 78,
        recommendation: 'BUY',
        confidence: 0.85,
        factors: [],
        timestamp: new Date(),
        dataQuality: 0.9,
        marketCondition: 'BULLISH',
        summary: '強勁的基本面和技術面',
        details: {
          technical: {},
          fundamental: {},
          risk: {},
        },
      };

      // 模擬引擎回應
      const mockAIEngine = {
        analyze: jest.fn().mockResolvedValue(mockAnalysisResult)
      };
      const mockFixedEngine = {
        analyze: jest.fn().mockResolvedValue(mockAnalysisResult)
      };

      // 替換私有屬性
      (aiAnalyzer as any).aiEngine = mockAIEngine;
      (aiAnalyzer as any).fixedEngine = mockFixedEngine;

      // 執行測試 - 應該使用模擬數據
      return aiAnalyzer.analyzeStock('2330').then(result => {
        expect(result).toBeDefined();
        expect(result.symbol).toBe('2330');
        expect(result.healthScore).toBe(78);
        expect(mockAIEngine.analyze).toHaveBeenCalledWith('2330', expect.any(Object));
      });
    });

    it('應該處理未知股票代碼的模擬數據', () => {
      // 測試私有方法 (通過公開方法間接測試)
      const mockAnalysisResult: AnalysisResult = {
        symbol: 'UNKNOWN',
        type: AnalysisType.COMPREHENSIVE,
        marketType: 'TW_STOCK' as any,
        technicalScore: 60,
        fundamentalScore: 65,
        riskScore: 35,
        healthScore: 63,
        recommendation: 'HOLD',
        confidence: 0.7,
        factors: [],
        timestamp: new Date(),
        dataQuality: 0.8,
        marketCondition: 'NEUTRAL',
        summary: '一般投資機會',
        details: {
          technical: {},
          fundamental: {},
          risk: {},
        },
      };

      // 模擬引擎回應
      const mockAIEngine = {
        analyze: jest.fn().mockResolvedValue(mockAnalysisResult)
      };
      const mockFixedEngine = {
        analyze: jest.fn().mockResolvedValue(mockAnalysisResult)
      };

      // 替換私有屬性
      (aiAnalyzer as any).aiEngine = mockAIEngine;
      (aiAnalyzer as any).fixedEngine = mockFixedEngine;

      // 執行測試
      return aiAnalyzer.analyzeStock('UNKNOWN').then(result => {
        expect(result).toBeDefined();
        expect(result.symbol).toBe('UNKNOWN');
        expect(result.healthScore).toBe(63);
      });
    });
  });

  describe('錯誤處理', () => {
    it('應該處理批量分析中的錯誤', async () => {
      // 模擬引擎錯誤
      const mockAIEngine = {
        analyze: jest.fn().mockRejectedValue(new Error('分析失敗'))
      };
      const mockFixedEngine = {
        analyze: jest.fn().mockRejectedValue(new Error('分析失敗'))
      };

      // 替換私有屬性
      (aiAnalyzer as any).aiEngine = mockAIEngine;
      (aiAnalyzer as any).fixedEngine = mockFixedEngine;

      // 執行測試
      const results = await aiAnalyzer.analyzeMultipleStocks(['2330', '2317']);

      // 驗證結果
      expect(results).toHaveLength(2);
      expect(results[0]?.symbol).toBe('2330');
      expect(results[0]?.healthScore).toBe(0); // 錯誤結果
      expect(results[1]?.symbol).toBe('2317');
      expect(results[1]?.healthScore).toBe(0); // 錯誤結果
    });

    it('應該處理比較分析結果的邊界情況', () => {
      // 準備邊界測試數據
      const boundaryResults = [
        {
          symbol: '2330',
          healthScore: 0,
          technicalScore: 0,
          fundamentalScore: 0,
          riskScore: 100,
          recommendation: 'SELL',
          confidence: 0.1,
          factors: [],
          timestamp: new Date(),
          dataQuality: 0.1,
          marketCondition: 'BEARISH',
          summary: '邊界測試',
          details: { technical: {}, fundamental: {}, risk: {} },
        } as any,
      ];

      // 執行測試
      const comparison = aiAnalyzer.compareAnalysisResults(boundaryResults);

      // 驗證結果
      expect(comparison['bestHealthScore']).toBe(0);
      expect(comparison['worstHealthScore']).toBe(0);
      expect(comparison['averageHealthScore']).toBe(0);
    });
  });
});
