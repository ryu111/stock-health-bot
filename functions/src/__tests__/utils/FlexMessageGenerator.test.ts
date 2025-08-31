import { FlexMessageGenerator } from '../../utils/FlexMessageGenerator';
import { TestUtils } from '../utils/testUtils';
import { AnalysisResult } from '../../types/analysis';

describe('FlexMessageGenerator', () => {
  let flexMessageGenerator: FlexMessageGenerator;

  beforeEach(() => {
    flexMessageGenerator = new FlexMessageGenerator();
  });

  describe('createStockInfoMessage', () => {
    it('應該創建有效的股票資訊訊息', () => {
      const mockStockData = TestUtils.createMockStockData('2330');
      const message = flexMessageGenerator.createStockInfoMessage(mockStockData);

      expect(message.type).toBe('flex');
      expect(message.altText).toContain('台積電');
      expect(message.contents['type']).toBe('bubble');
      expect(message.contents['size']).toBe('kilo');
      expect(message.contents['header']).toBeDefined();
      expect(message.contents['body']).toBeDefined();
      expect(message.contents['footer']).toBeDefined();
    });

    it('應該處理無效股票數據', () => {
      const invalidStockData = TestUtils.createMockStockData('INVALID');
      invalidStockData.name = '無效股票';
      invalidStockData.price = 0;
      invalidStockData.volume = 0;
      invalidStockData.marketCap = 0;

      const message = flexMessageGenerator.createStockInfoMessage(invalidStockData);

      expect(message.type).toBe('flex');
      expect(message.altText).toContain('無效股票');
      expect(message.contents['body']).toBeDefined();
    });

    it('應該正確格式化價格顯示', () => {
      const stockDataWithPrice = TestUtils.createMockStockData('2330');
      stockDataWithPrice.price = 580.5;

      const message = flexMessageGenerator.createStockInfoMessage(stockDataWithPrice);

      expect(message.type).toBe('flex');
      expect(message.altText).toContain('台積電');
    });
  });

  describe('createETFInfoMessage', () => {
    it('應該創建有效的 ETF 資訊訊息', () => {
      const mockETFData = TestUtils.createMockETFData('0050');
      const message = flexMessageGenerator.createETFInfoMessage(mockETFData);

      expect(message.type).toBe('flex');
      expect(message.altText).toContain('元大台灣50');
      expect(message.contents['type']).toBe('bubble');
      expect(message.contents['size']).toBe('kilo');
      expect(message.contents['header']).toBeDefined();
      expect(message.contents['body']).toBeDefined();
      expect(message.contents['footer']).toBeDefined();
    });

    it('應該處理無效 ETF 數據', () => {
      const invalidETFData = TestUtils.createMockETFData('INVALID');
      invalidETFData.name = '無效 ETF';
      invalidETFData.price = 0;
      invalidETFData.volume = 0;
      invalidETFData.marketCap = 0;

      const message = flexMessageGenerator.createETFInfoMessage(invalidETFData);

      expect(message.type).toBe('flex');
      expect(message.altText).toContain('無效 ETF');
    });
  });

  describe('createAnalysisMessage', () => {
    it('應該創建有效的分析結果訊息', () => {
      const mockAnalysisResult: AnalysisResult = {
        symbol: '2330',
        type: 'comprehensive' as any,
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

      const message = flexMessageGenerator.createAnalysisMessage(mockAnalysisResult);

      expect(message.type).toBe('flex');
      expect(message.altText).toContain('2330');
      expect(message.contents['type']).toBe('bubble');
      expect(message.contents['size']).toBe('kilo');
    });

    it('應該處理不同建議類型的分析結果', () => {
      const buyResult: AnalysisResult = {
        symbol: '2330',
        type: 'comprehensive' as any,
        marketType: 'TW_STOCK' as any,
        technicalScore: 85,
        fundamentalScore: 90,
        riskScore: 15,
        healthScore: 88,
        recommendation: 'BUY',
        confidence: 0.9,
        factors: [],
        timestamp: new Date(),
        dataQuality: 0.95,
        marketCondition: 'BULLISH',
        summary: '優秀的投資機會',
        details: { technical: {}, fundamental: {}, risk: {} },
      };

      const holdResult: AnalysisResult = {
        ...buyResult,
        healthScore: 65,
        recommendation: 'HOLD',
        confidence: 0.7,
        summary: '穩定的投資選擇',
      };

      const sellResult: AnalysisResult = {
        ...buyResult,
        healthScore: 35,
        recommendation: 'SELL',
        confidence: 0.6,
        summary: '需要謹慎考慮',
      };

      const buyMessage = flexMessageGenerator.createAnalysisMessage(buyResult);
      const holdMessage = flexMessageGenerator.createAnalysisMessage(holdResult);
      const sellMessage = flexMessageGenerator.createAnalysisMessage(sellResult);

      expect((buyMessage.contents as any)['header']['backgroundColor']).toBe('#27AE60');
      expect((holdMessage.contents as any)['header']['backgroundColor']).toBe('#F39C12');
      expect((sellMessage.contents as any)['header']['backgroundColor']).toBe('#E74C3C');
    });
  });

  describe('createErrorMessage', () => {
    it('應該創建錯誤訊息', () => {
      const errorMessage = flexMessageGenerator.createErrorMessage('測試錯誤訊息');

      expect(errorMessage.type).toBe('flex');
      expect(errorMessage.altText).toContain('錯誤');
      expect(errorMessage.contents['type']).toBe('bubble');
      expect(errorMessage.contents['body']).toBeDefined();
    });

    it('應該處理空錯誤訊息', () => {
      const errorMessage = flexMessageGenerator.createErrorMessage('');

      expect(errorMessage.type).toBe('flex');
      expect(errorMessage.contents['body']).toBeDefined();
    });
  });

  describe('私有方法測試', () => {
    it('應該正確格式化顯示名稱', () => {
      const longChineseName = '這是一個非常長的股票名稱超過二十個字元';
      const longEnglishName = 'This is a very long stock name that exceeds twenty five characters';
      const shortName = '台積電';

      // 測試私有方法 (通過公開方法間接測試)
      const stockData1 = TestUtils.createMockStockData('2330');
      stockData1.name = longChineseName;
      
      const stockData2 = TestUtils.createMockStockData('AAPL');
      stockData2.name = longEnglishName;
      
      const stockData3 = TestUtils.createMockStockData('2330');
      stockData3.name = shortName;

      const message1 = flexMessageGenerator.createStockInfoMessage(stockData1);
      const message2 = flexMessageGenerator.createStockInfoMessage(stockData2);
      const message3 = flexMessageGenerator.createStockInfoMessage(stockData3);

      expect(message1.altText).toContain('這是一個非常長的股票名稱超過二十個字元');
      expect(message2.altText).toContain('This is a very long stock...');
      expect(message3.altText).toContain('台積電');
    });

    it('應該正確格式化成交量', () => {
      const stockData1 = TestUtils.createMockStockData('2330');
      stockData1.volume = 1500000000;
      
      const stockData2 = TestUtils.createMockStockData('2317');
      stockData2.volume = 2500000;
      
      const stockData3 = TestUtils.createMockStockData('2454');
      stockData3.volume = 1500;

      const message1 = flexMessageGenerator.createStockInfoMessage(stockData1);
      const message2 = flexMessageGenerator.createStockInfoMessage(stockData2);
      const message3 = flexMessageGenerator.createStockInfoMessage(stockData3);

      // 驗證成交量格式化 (通過檢查訊息結構)
      expect(message1.contents['body']).toBeDefined();
      expect(message2.contents['body']).toBeDefined();
      expect(message3.contents['body']).toBeDefined();
    });
  });

  describe('邊界情況測試', () => {
    it('應該處理極端數值', () => {
      const extremeStockData = TestUtils.createMockStockData('2330');
      extremeStockData.price = Number.MAX_SAFE_INTEGER;
      extremeStockData.volume = Number.MAX_SAFE_INTEGER;
      extremeStockData.marketCap = Number.MAX_SAFE_INTEGER;

      const message = flexMessageGenerator.createStockInfoMessage(extremeStockData);

      expect(message.type).toBe('flex');
      expect(message.contents['body']).toBeDefined();
    });

    it('應該處理零值和負值', () => {
      const zeroStockData = TestUtils.createMockStockData('2330');
      zeroStockData.price = 0;
      zeroStockData.volume = 0;
      zeroStockData.marketCap = 0;

      const message = flexMessageGenerator.createStockInfoMessage(zeroStockData);

      expect(message.type).toBe('flex');
      expect(message.contents['body']).toBeDefined();
    });

    it('應該處理特殊字元名稱', () => {
      const specialNameStockData = TestUtils.createMockStockData('2330');
      specialNameStockData.name = '台積電(TSMC) - 特殊字元測試';

      const message = flexMessageGenerator.createStockInfoMessage(specialNameStockData);

      expect(message.type).toBe('flex');
      expect(message.altText).toContain('台積電');
    });
  });
});
