import { StockService, StockQuoteData } from '../../services/StockService';
import { TestUtils } from '../utils/testUtils';

// 模擬依賴
jest.mock('../../adapters/StockDataAdapter');
jest.mock('../../adapters/ETFDataAdapter');

describe('StockService', () => {
  let stockService: StockService;

  beforeEach(() => {
    stockService = new StockService();
    jest.clearAllMocks();
  });

  describe('getStockData', () => {
    it('應該成功獲取股票數據', async () => {
      // 準備測試數據
      const mockStockData = TestUtils.createMockStockData('2330');
      
      // 模擬適配器回應
      const mockStockAdapter = {
        fetchStockData: jest.fn().mockResolvedValue(mockStockData)
      };
      const mockETFAdapter = {
        fetchStockData: jest.fn().mockResolvedValue(mockStockData)
      };

      // 替換私有屬性
      (stockService as any).stockAdapter = mockStockAdapter;
      (stockService as any).etfAdapter = mockETFAdapter;

      // 執行測試
      const result = await stockService.getStockData('2330');

      // 驗證結果
      expect(result).toBeDefined();
      expect(result.symbol).toBe('2330');
      expect(result.name).toBe('台積電');
      expect(result.price).toBe(500.0);
      expect(result.currency).toBe('TWD');
      expect(mockStockAdapter.fetchStockData).toHaveBeenCalledWith('2330');
    });

    it('應該處理 ETF 數據獲取', async () => {
      // 準備測試數據
      const mockETFData = TestUtils.createMockETFData('0050');
      
      // 模擬適配器回應
      const mockStockAdapter = {
        fetchStockData: jest.fn().mockResolvedValue(mockETFData)
      };
      const mockETFAdapter = {
        fetchStockData: jest.fn().mockResolvedValue(mockETFData)
      };

      // 替換私有屬性
      (stockService as any).stockAdapter = mockStockAdapter;
      (stockService as any).etfAdapter = mockETFAdapter;

      // 執行測試 - 使用真正的 ETF 代碼格式
      const result = await stockService.getStockData('SPY');

      // 驗證結果
      expect(result).toBeDefined();
      expect(result.symbol).toBe('0050'); // 模擬數據中的符號
      expect(result.name).toBe('元大台灣50');
      expect(mockETFAdapter.fetchStockData).toHaveBeenCalledWith('SPY');
    });

    it('應該處理數據獲取錯誤', async () => {
      // 模擬適配器錯誤
      const mockStockAdapter = {
        fetchStockData: jest.fn().mockRejectedValue(new Error('API 錯誤'))
      };
      const mockETFAdapter = {
        fetchStockData: jest.fn().mockRejectedValue(new Error('API 錯誤'))
      };

      // 替換私有屬性
      (stockService as any).stockAdapter = mockStockAdapter;
      (stockService as any).etfAdapter = mockETFAdapter;

      // 執行測試並驗證錯誤
      await expect(stockService.getStockData('INVALID')).rejects.toThrow('無法取得 INVALID 的股票數據');
    });

    it('應該處理不支援的市場類型', async () => {
      // 執行測試並驗證錯誤
      await expect(stockService.getStockData('INVALID_SYMBOL')).rejects.toThrow('無法取得 INVALID_SYMBOL 的股票數據');
    });
  });

  describe('calculateHealthScore', () => {
    it('應該計算正確的健康分數', () => {
      // 準備測試數據
      const testData: StockQuoteData = {
        symbol: '2330',
        name: '台積電',
        price: 500,
        previousClose: 495,
        marketCap: 1000000000000,
        volume: 1000000,
        peRatio: 15,
        eps: 32.26,
        dividendYield: 2.5,
        fiftyTwoWeekHigh: 550,
        fiftyTwoWeekLow: 450,
        currency: 'TWD',
        exchange: 'TWSE',
        dailyChange: 1.01,
        priceToBook: 2.5,
        returnOnEquity: 0.25
      };

      // 執行測試
      const score = stockService.calculateHealthScore(testData);

      // 驗證結果
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
      expect(typeof score).toBe('number');
    });

    it('應該處理缺失數據的健康分數計算', () => {
      // 準備最小測試數據
      const minimalData: StockQuoteData = {
        symbol: '2330',
        name: '台積電',
        price: 500,
        previousClose: null,
        marketCap: null,
        volume: null,
        peRatio: null,
        eps: null,
        dividendYield: null,
        fiftyTwoWeekHigh: null,
        fiftyTwoWeekLow: null,
        currency: 'TWD',
        exchange: 'TWSE',
        dailyChange: 0,
        priceToBook: null,
        returnOnEquity: null
      };

      // 執行測試
      const score = stockService.calculateHealthScore(minimalData);

      // 驗證結果
      expect(score).toBe(50); // 基礎分數
    });

    it('應該處理極端值情況', () => {
      // 準備極端測試數據
      const extremeData: StockQuoteData = {
        symbol: '2330',
        name: '台積電',
        price: 1000,
        previousClose: 100,
        marketCap: 1000000000000,
        volume: 1000000,
        peRatio: 100, // 極高本益比
        eps: 10,
        dividendYield: 0.01, // 極低股息率
        fiftyTwoWeekHigh: 1000,
        fiftyTwoWeekLow: 100,
        currency: 'TWD',
        exchange: 'TWSE',
        dailyChange: 10, // 極大漲跌幅
        priceToBook: 10,
        returnOnEquity: -0.5 // 負 ROE
      };

      // 執行測試
      const score = stockService.calculateHealthScore(extremeData);

      // 驗證結果
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('formatMarketCap', () => {
    it('應該正確格式化市值', () => {
      expect(stockService.formatMarketCap(1000000000000)).toBe('1.0 兆');
      expect(stockService.formatMarketCap(1000000000)).toBe('1.0 億');
      expect(stockService.formatMarketCap(1000000)).toBe('1.0 萬');
      expect(stockService.formatMarketCap(1000)).toBe('1000');
    });

    it('應該處理 null 值', () => {
      expect(stockService.formatMarketCap(null)).toBe('N/A');
    });

    it('應該處理零值', () => {
      expect(stockService.formatMarketCap(0)).toBe('N/A');
    });
  });

  describe('calculatePercentageChange', () => {
    it('應該正確計算百分比變化', () => {
      expect(stockService.calculatePercentageChange(110, 100)).toBe(10);
      expect(stockService.calculatePercentageChange(90, 100)).toBe(-10);
      expect(stockService.calculatePercentageChange(100, 100)).toBe(0);
    });

    it('應該處理零值和負值', () => {
      expect(stockService.calculatePercentageChange(100, 0)).toBe(0);
      expect(stockService.calculatePercentageChange(0, 100)).toBe(-100);
    });
  });

  describe('getMultipleStocks', () => {
    it('應該成功獲取多個股票數據', async () => {
      // 準備測試數據
      const mockStockData1 = TestUtils.createMockStockData('2330');
      const mockStockData2 = TestUtils.createMockStockData('2317');
      
      // 模擬適配器回應
      const mockStockAdapter = {
        fetchStockData: jest.fn()
          .mockResolvedValueOnce(mockStockData1)
          .mockResolvedValueOnce(mockStockData2)
      };
      const mockETFAdapter = {
        fetchStockData: jest.fn()
      };

      // 替換私有屬性
      (stockService as any).stockAdapter = mockStockAdapter;
      (stockService as any).etfAdapter = mockETFAdapter;

      // 執行測試
      const results = await stockService.getMultipleStocks(['2330', '2317']);

      // 驗證結果
      expect(results).toHaveLength(2);
      expect(results[0]?.symbol).toBe('2330');
      expect(results[1]?.symbol).toBe('2317');
    });

    it('應該處理部分失敗的情況', async () => {
      // 模擬適配器回應（一個成功，一個失敗）
      const mockStockAdapter = {
        fetchStockData: jest.fn()
          .mockResolvedValueOnce(TestUtils.createMockStockData('2330'))
          .mockRejectedValueOnce(new Error('API 錯誤'))
      };
      const mockETFAdapter = {
        fetchStockData: jest.fn()
      };

      // 替換私有屬性
      (stockService as any).stockAdapter = mockStockAdapter;
      (stockService as any).etfAdapter = mockETFAdapter;

      // 執行測試
      const results = await stockService.getMultipleStocks(['2330', 'INVALID']);

      // 驗證結果
      expect(results).toHaveLength(1);
      expect(results[0]?.symbol).toBe('2330');
    });
  });

  describe('analyzeTrend', () => {
    it('應該分析股票趨勢', async () => {
      // 模擬歷史數據
      const mockHistoricalData = [
        { date: new Date('2024-01-01'), open: 100, high: 105, low: 95, close: 102, volume: 1000 },
        { date: new Date('2024-01-02'), open: 102, high: 108, low: 100, close: 105, volume: 1100 },
        { date: new Date('2024-01-03'), open: 105, high: 110, low: 102, close: 108, volume: 1200 }
      ];

      // 模擬 getHistoricalData 方法
      jest.spyOn(stockService, 'getHistoricalData').mockResolvedValue(mockHistoricalData);

      // 執行測試
      const trend = await stockService.analyzeTrend('2330');

      // 驗證結果
      expect(trend).toBeDefined();
      expect(trend.trend).toBeDefined();
      expect(trend.strength).toBeGreaterThanOrEqual(0);
      expect(trend.strength).toBeLessThanOrEqual(100);
    });

    it('應該處理數據不足的情況', async () => {
      // 模擬數據不足
      jest.spyOn(stockService, 'getHistoricalData').mockResolvedValue([]);

      // 執行測試
      const trend = await stockService.analyzeTrend('2330');

      // 驗證結果
      expect(trend.trend).toBe('unknown');
      expect(trend.strength).toBe(0);
    });
  });

  describe('getStocksByRequest', () => {
    it('應該返回預設回應', () => {
      // 執行測試
      const result = stockService.getStocksByRequest({
        symbols: ['2330'],
        marketType: 'TW_STOCK' as any,
        includeTechnical: true,
        includeFundamental: true,
        language: 'zh_TW'
      });

      // 驗證結果
      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
      expect(result.errors).toContain('Service not implemented');
    });
  });
});
