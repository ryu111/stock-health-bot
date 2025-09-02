import { TestUtils } from './testUtils';

describe('TestUtils', () => {
  describe('createMockStockData', () => {
    it('應該創建有效的股票數據', () => {
      const stockData = TestUtils.createMockStockData('2330');
      
      expect(stockData).toBeDefined();
      expect(stockData.symbol).toBe('2330');
      expect(stockData.name).toBe('台積電');
      expect(stockData.price).toBe(500.0);
      expect(stockData.peRatio).toBe(15.5);
      expect(stockData.pbRatio).toBe(2.5);
    });

    it('應該使用預設股票代碼', () => {
      const stockData = TestUtils.createMockStockData();
      
      expect(stockData.symbol).toBe('2330');
    });
  });

  describe('createMockLineEvent', () => {
    it('應該創建有效的 LINE 事件', () => {
      const lineEvent = TestUtils.createMockLineEvent('查詢 2330');
      
      expect(lineEvent).toBeDefined();
      expect(lineEvent.type).toBe('message');
      expect(lineEvent.message.type).toBe('text');
      expect((lineEvent.message as any).text).toBe('查詢 2330');
      expect(lineEvent.replyToken).toBe('test-reply-token');
      expect(lineEvent.source.userId).toBe('test-user-id');
    });

    it('應該使用預設訊息', () => {
      const lineEvent = TestUtils.createMockLineEvent();
      
      expect((lineEvent.message as any).text).toBe('查詢 2330');
    });
  });

  describe('createMockETFData', () => {
    it('應該創建有效的 ETF 數據', () => {
      const etfData = TestUtils.createMockETFData('0050');
      
      expect(etfData).toBeDefined();
      expect(etfData.symbol).toBe('0050');
      expect(etfData.name).toBe('元大台灣50');
      expect(etfData.price).toBe(100.0);
    });
  });

  describe('validateStockData', () => {
    it('應該驗證有效的股票數據', () => {
      const validStockData = TestUtils.createMockStockData();
      const isValid = TestUtils.validateStockData(validStockData);
      
      expect(isValid).toBe(true);
    });

    it('應該拒絕無效的股票數據', () => {
      const invalidStockData = { symbol: '2330' };
      const isValid = TestUtils.validateStockData(invalidStockData);
      
      expect(isValid).toBe(false);
    });
  });

  describe('validateLineEvent', () => {
    it('應該驗證有效的 LINE 事件', () => {
      const validLineEvent = TestUtils.createMockLineEvent();
      const isValid = TestUtils.validateLineEvent(validLineEvent);
      
      expect(isValid).toBe(true);
    });

    it('應該拒絕無效的 LINE 事件', () => {
      const invalidLineEvent = { type: 'message' };
      const isValid = TestUtils.validateLineEvent(invalidLineEvent);
      
      expect(isValid).toBe(false);
    });
  });

  describe('wait', () => {
    it('應該等待指定時間', async () => {
      const startTime = Date.now();
      await TestUtils.wait(100);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeGreaterThanOrEqual(95);
    });
  });

  describe('createMockError', () => {
    it('應該創建模擬錯誤', () => {
      const error = TestUtils.createMockError('測試錯誤訊息');
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('測試錯誤訊息');
    });

    it('應該使用預設錯誤訊息', () => {
      const error = TestUtils.createMockError();
      
      expect(error.message).toBe('測試錯誤');
    });
  });
});
