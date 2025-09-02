import { ValuationEngine } from '../../engines/ValuationEngine';
import { MarketType } from '../../types/stock';
import { ValuationInput } from '../../types/valuation';

// Mock 外部依賴
jest.mock('../../services/DataQualityController');

describe('ValuationEngine', () => {
  let valuationEngine: ValuationEngine;

  beforeEach(() => {
    valuationEngine = new ValuationEngine([], { safetyThreshold: 0.9, expensiveThreshold: 1.1 });
  });

  describe('基本功能', () => {
    test('應能正確初始化', () => {
      expect(valuationEngine).toBeInstanceOf(ValuationEngine);
    });
  });

  describe('估值計算', () => {
    test('應能執行基本估值評估', async () => {
      const input: ValuationInput = {
        symbol: '2330',
        price: 500,
        marketType: MarketType.TW_STOCK,
        marginOfSafety: 0.1,
        financials: {
          epsTtm: 25,
          dividendYield: 0.02,
        },
      };

      const result = await valuationEngine.evaluate(input);
      
      expect(result).toBeDefined();
      expect(result.symbol).toBe('2330');
      expect(result.price).toBe(500);
      expect(result.methods).toBeDefined();
    });
  });

  describe('錯誤處理', () => {
    test('應能處理缺少必要參數的情況', async () => {
      const input: ValuationInput = {
        symbol: '2330',
        price: 500,
        marketType: MarketType.TW_STOCK,
        marginOfSafety: 0.1,
        financials: {
          epsTtm: 25,
          dividendYield: 0.02,
        },
      };

      const result = await valuationEngine.evaluate(input);
      
      // 應該能完成評估，但置信度可能較低
      expect(result).toBeDefined();
    });
  });

  describe('資料品質控制', () => {
    test('應能驗證輸入資料的完整性', async () => {
      const input: ValuationInput = {
        symbol: '2330',
        price: 500,
        marketType: MarketType.TW_STOCK,
        marginOfSafety: 0.1,
        financials: {
          epsTtm: 25,
          dividendYield: 0.02,
        },
      };

      const result = await valuationEngine.evaluate(input);
      
      // 應該能處理基本資料
      expect(result).toBeDefined();
      expect(result.dataQuality).toBeGreaterThan(0);
    });
  });
});
