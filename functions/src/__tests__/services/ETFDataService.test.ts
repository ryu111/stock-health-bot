import { ETFDataService, ETFQuoteData } from '../../services/ETFDataService';
import { TestUtils } from '../utils/testUtils';

// 模擬依賴
jest.mock('../../adapters/ETFDataAdapter');

describe('ETFDataService', () => {
  let etfDataService: ETFDataService;

  beforeEach(() => {
    etfDataService = new ETFDataService();
    jest.clearAllMocks();
  });

  describe('getETFData', () => {
    it('應該成功獲取 ETF 數據', async () => {
      // 準備測試數據
      const mockETFData = TestUtils.createMockETFData('0050');
      
      // 模擬適配器回應
      const mockETFAdapter = {
        fetchStockData: jest.fn().mockResolvedValue(mockETFData)
      };

      // 替換私有屬性
      (etfDataService as any).etfAdapter = mockETFAdapter;

      // 執行測試
      const result = await etfDataService.getETFData('0050');

      // 驗證結果
      expect(result).toBeDefined();
      expect(result.symbol).toBe('0050');
      expect(result.name).toBe('元大台灣50');
      expect(result.price).toBeGreaterThan(0);
      expect(result.currency).toBe('TWD');
      expect(result.source).toBeDefined();
      expect(mockETFAdapter.fetchStockData).toHaveBeenCalledWith('0050');
    });

    it('應該處理帶 .TW 後綴的 ETF 代碼', async () => {
      // 準備測試數據
      const mockETFData = TestUtils.createMockETFData('0050');
      
      // 模擬適配器回應
      const mockETFAdapter = {
        fetchStockData: jest.fn().mockResolvedValue(mockETFData)
      };

      // 替換私有屬性
      (etfDataService as any).etfAdapter = mockETFAdapter;

      // 執行測試
      const result = await etfDataService.getETFData('0050.TW');

      // 驗證結果
      expect(result).toBeDefined();
      expect(result.symbol).toBe('0050');
      expect(mockETFAdapter.fetchStockData).toHaveBeenCalledWith('0050.TW');
    });

    it('應該處理數據獲取錯誤並使用模擬數據', async () => {
      // 模擬適配器錯誤
      const mockETFAdapter = {
        fetchStockData: jest.fn().mockRejectedValue(new Error('API 錯誤'))
      };

      // 替換私有屬性
      (etfDataService as any).etfAdapter = mockETFAdapter;

      // 執行測試
      const result = await etfDataService.getETFData('0050');

      // 驗證結果 - 應該使用模擬數據
      expect(result).toBeDefined();
      expect(result.symbol).toBe('0050');
      expect(result.name).toBe('元大台灣50');
      expect(result.source).toBe('模擬資料');
    });

    it('應該處理不存在的 ETF 代碼', async () => {
      // 模擬適配器錯誤
      const mockETFAdapter = {
        fetchStockData: jest.fn().mockRejectedValue(new Error('API 錯誤'))
      };

      // 替換私有屬性
      (etfDataService as any).etfAdapter = mockETFAdapter;

      // 執行測試並驗證錯誤
      await expect(etfDataService.getETFData('INVALID')).rejects.toThrow('無法從任何來源取得 INVALID 的資料');
    });
  });

  describe('calculateETFHealthScore', () => {
    it('應該計算正確的 ETF 健康分數', () => {
      // 準備測試數據
      const testData: ETFQuoteData = {
        symbol: '0050',
        name: '元大台灣50',
        price: 52.5,
        previousClose: 52.3,
        volume: 15000000,
        dividendYield: 0.025,
        marketCap: 1500000000000,
        currency: 'TWD',
        exchange: 'TWSE',
        source: 'Yahoo Finance',
        expenseRatio: 0.0032,
        dailyChange: 0.38
      };

      // 執行測試
      const score = etfDataService.calculateETFHealthScore(testData);

      // 驗證結果
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
      expect(typeof score).toBe('number');
    });

    it('應該處理高股息率 ETF 的健康分數計算', () => {
      // 準備高股息率測試數據
      const highDividendData: ETFQuoteData = {
        symbol: '0056',
        name: '元大高股息',
        price: 28.5,
        previousClose: 28.2,
        volume: 8000000,
        dividendYield: 0.045, // 4.5%
        marketCap: 800000000000,
        currency: 'TWD',
        exchange: 'TWSE',
        source: 'Yahoo Finance',
        expenseRatio: 0.0035,
        dailyChange: 1.06
      };

      // 執行測試
      const score = etfDataService.calculateETFHealthScore(highDividendData);

      // 驗證結果
      expect(score).toBeGreaterThanOrEqual(60); // 高股息率應該得到較高分數
    });

    it('應該處理低費用率 ETF 的健康分數計算', () => {
      // 準備低費用率測試數據
      const lowExpenseData: ETFQuoteData = {
        symbol: '0050',
        name: '元大台灣50',
        price: 52.5,
        previousClose: 52.3,
        volume: 15000000,
        dividendYield: 0.025,
        marketCap: 1500000000000,
        currency: 'TWD',
        exchange: 'TWSE',
        source: 'Yahoo Finance',
        expenseRatio: 0.002, // 0.2%
        dailyChange: 0.38
      };

      // 執行測試
      const score = etfDataService.calculateETFHealthScore(lowExpenseData);

      // 驗證結果
      expect(score).toBeGreaterThanOrEqual(50);
    });

    it('應該處理缺失數據的健康分數計算', () => {
      // 準備最小測試數據
      const minimalData: ETFQuoteData = {
        symbol: '0050',
        name: '元大台灣50',
        price: 52.5,
        previousClose: null,
        volume: null,
        dividendYield: null,
        marketCap: null,
        currency: 'TWD',
        exchange: 'TWSE',
        source: 'Yahoo Finance',
        dailyChange: 0
      };

      // 執行測試
      const score = etfDataService.calculateETFHealthScore(minimalData);

      // 驗證結果
      expect(score).toBe(50); // 基礎分數
    });
  });

  describe('formatETFReport', () => {
    it('應該正確格式化 ETF 報告', () => {
      // 準備測試數據
      const testData: ETFQuoteData = {
        symbol: '0050',
        name: '元大台灣50',
        price: 52.5,
        previousClose: 52.3,
        volume: 15000000,
        dividendYield: 0.025,
        marketCap: 1500000000000,
        currency: 'TWD',
        exchange: 'TWSE',
        source: 'Yahoo Finance',
        description: '追蹤台灣50指數，投資台灣大型股',
        expenseRatio: 0.0032,
        lastDividend: 1.2,
        dividendFrequency: '季配',
        category: '市值型',
        topHoldings: ['台積電', '鴻海', '聯發科', '台達電', '中華電'],
        dailyChange: 0.38
      };

      const healthScore = 75;

      // 執行測試
      const report = etfDataService.formatETFReport(testData, healthScore);

      // 驗證結果
      expect(report).toContain('元大台灣50 (0050) ETF 健康報告');
      expect(report).toContain('健康分數: 75/100');
      expect(report).toContain('當前價格: $52.50');
      expect(report).toContain('股息殖利率: 2.50%');
      expect(report).toContain('費用率: 0.32%');
      expect(report).toContain('市值: 1.5 兆');
      expect(report).toContain('類型: 市值型');
    });

    it('應該處理缺失數據的報告格式化', () => {
      // 準備缺失數據的測試數據
      const minimalData: ETFQuoteData = {
        symbol: '0050',
        name: '元大台灣50',
        price: null,
        previousClose: null,
        volume: null,
        dividendYield: null,
        marketCap: null,
        currency: 'TWD',
        exchange: 'TWSE',
        source: 'Yahoo Finance',
        dailyChange: 0
      };

      const healthScore = 50;

      // 執行測試
      const report = etfDataService.formatETFReport(minimalData, healthScore);

      // 驗證結果
      expect(report).toContain('元大台灣50 (0050) ETF 健康報告');
      expect(report).toContain('健康分數: 50/100');
      expect(report).toContain('當前價格: $N/A');
      expect(report).toContain('股息殖利率: N/A%');
      expect(report).toContain('費用率: N/A%');
    });
  });

  describe('getETFLookupTable', () => {
    it('應該返回完整的 ETF 查詢表', () => {
      // 執行測試
      const lookupTable = etfDataService.getETFLookupTable();

      // 驗證結果
      expect(lookupTable).toBeDefined();
      expect(typeof lookupTable).toBe('object');
      expect(lookupTable['0050']).toBeDefined();
      expect(lookupTable['0056']).toBeDefined();
      expect(lookupTable['00878']).toBeDefined();
    });

    it('應該包含正確的 ETF 資訊', () => {
      // 執行測試
      const lookupTable = etfDataService.getETFLookupTable();

      // 驗證 0050 的資訊
      expect(lookupTable['0050']?.name).toBe('元大台灣50');
      expect(lookupTable['0050']?.category).toBe('市值型');
      expect(lookupTable['0050']?.dividendFrequency).toBe('季配');
      expect(lookupTable['0050']?.expenseRatio).toBe('0.32%');

      // 驗證 0056 的資訊
      expect(lookupTable['0056']?.name).toBe('元大高股息');
      expect(lookupTable['0056']?.category).toBe('高股息型');
      expect(lookupTable['0056']?.typicalYield).toBe('4.0-5.5%');
    });
  });

  describe('formatETFLookupTable', () => {
    it('應該正確格式化 ETF 速查表', () => {
      // 執行測試
      const formattedTable = etfDataService.formatETFLookupTable();

      // 驗證結果
      expect(formattedTable).toContain('台灣常見 ETF 速查表');
      expect(formattedTable).toContain('市值型 ETF:');
      expect(formattedTable).toContain('高股息型 ETF:');
      expect(formattedTable).toContain('0050 元大台灣50');
      expect(formattedTable).toContain('0056 元大高股息');
      expect(formattedTable).toContain('使用方式: 輸入「查詢 [代號]」即可獲得詳細分析');
    });

    it('應該包含分類資訊', () => {
      // 執行測試
      const formattedTable = etfDataService.formatETFLookupTable();

      // 驗證分類
      expect(formattedTable).toContain('🏷️ 市值型 ETF:');
      expect(formattedTable).toContain('🏷️ 高股息型 ETF:');
      expect(formattedTable).toContain('🏷️ 科技高股息型 ETF:');
      expect(formattedTable).toContain('🏷️ 海外型 ETF:');
    });
  });

  describe('模擬數據功能', () => {
    it('應該提供有效的模擬 ETF 數據', () => {
      // 測試私有方法 (通過公開方法間接測試)
      const mockETFAdapter = {
        fetchStockData: jest.fn().mockRejectedValue(new Error('API 錯誤'))
      };

      // 替換私有屬性
      (etfDataService as any).etfAdapter = mockETFAdapter;

      // 執行測試 - 應該使用模擬數據
      return etfDataService.getETFData('0050').then(result => {
        expect(result).toBeDefined();
        expect(result.symbol).toBe('0050');
        expect(result.name).toBe('元大台灣50');
        expect(result.price).toBeGreaterThan(0);
        expect(result.dividendYield).toBeGreaterThan(0);
        expect(result.source).toBe('模擬資料');
      });
    });

    it('應該處理不存在的模擬 ETF 代碼', () => {
      // 模擬適配器錯誤
      const mockETFAdapter = {
        fetchStockData: jest.fn().mockRejectedValue(new Error('API 錯誤'))
      };

      // 替換私有屬性
      (etfDataService as any).etfAdapter = mockETFAdapter;

      // 執行測試並驗證錯誤
      return expect(etfDataService.getETFData('INVALID')).rejects.toThrow('無法從任何來源取得 INVALID 的資料');
    });
  });

  describe('錯誤處理', () => {
    it('應該處理所有數據來源都失敗的情況', async () => {
      // 模擬所有適配器都失敗
      const mockETFAdapter = {
        fetchStockData: jest.fn().mockRejectedValue(new Error('API 錯誤'))
      };

      // 替換私有屬性
      (etfDataService as any).etfAdapter = mockETFAdapter;

      // 執行測試並驗證錯誤
      await expect(etfDataService.getETFData('INVALID')).rejects.toThrow('無法從任何來源取得 INVALID 的資料');
    });

    it('應該處理部分數據來源失敗的情況', async () => {
      // 模擬部分成功的情況
      const mockETFData = TestUtils.createMockETFData('0050');
      const mockETFAdapter = {
        fetchStockData: jest.fn()
          .mockRejectedValueOnce(new Error('API 錯誤')) // 第一次失敗
          .mockResolvedValueOnce(mockETFData) // 第二次成功
      };

      // 替換私有屬性
      (etfDataService as any).etfAdapter = mockETFAdapter;

      // 執行測試
      const result = await etfDataService.getETFData('0050');

      // 驗證結果
      expect(result).toBeDefined();
      expect(result.symbol).toBe('0050');
    });
  });
});
