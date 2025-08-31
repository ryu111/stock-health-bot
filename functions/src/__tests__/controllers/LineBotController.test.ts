import { LineBotController } from '../../controllers/LineBotController';
import { TestUtils } from '../utils/testUtils';
import { LineMessageEvent } from '../../types/line-events';

// 模擬依賴
jest.mock('../../config/LineConfig');
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
jest.mock('../../utils/Validation');
jest.mock('../../utils/FlexMessageGenerator');
jest.mock('../../services/AIAnalyzer');
jest.mock('../../adapters/StockDataAdapter');
jest.mock('../../adapters/ETFDataAdapter');
jest.mock('@line/bot-sdk', () => ({
  Client: jest.fn().mockImplementation(() => ({
    replyMessage: jest.fn().mockResolvedValue({}),
    pushMessage: jest.fn().mockResolvedValue({}),
    getProfile: jest.fn().mockResolvedValue({
      userId: 'U1234567890abcdef1234567890abcdef',
      displayName: '測試用戶',
      pictureUrl: 'https://example.com/avatar.jpg',
      statusMessage: 'Hello World',
    }),
  })),
  middleware: jest.fn(),
}));

describe('LineBotController', () => {
  let lineBotController: LineBotController;
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    lineBotController = new LineBotController();
    jest.clearAllMocks();

    // 模擬 Express 請求和回應
    mockRequest = {
      body: {
        events: [],
      },
      headers: {
        'x-line-signature': 'test-signature',
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('handleWebhook', () => {
    it('應該成功處理有效的 Webhook 請求', async () => {
      const mockMessageEvent = TestUtils.createMockLineEvent('message') as LineMessageEvent;
      mockRequest.body.events = [mockMessageEvent];

      await lineBotController.handleWebhook(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ status: 'ok' });
    });

    it('應該處理空事件陣列', async () => {
      mockRequest.body.events = [];

      await lineBotController.handleWebhook(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ status: 'ok' });
    });

    it('應該處理多個事件', async () => {
      const mockMessageEvent1 = TestUtils.createMockLineEvent('message') as LineMessageEvent;
      const mockMessageEvent2 = TestUtils.createMockLineEvent('message') as LineMessageEvent;
      mockRequest.body.events = [mockMessageEvent1, mockMessageEvent2];

      await lineBotController.handleWebhook(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ status: 'ok' });
    });

    it('應該處理無效簽名', async () => {
      // 模擬簽名驗證失敗
      const mockValidation = require('../../utils/Validation');
      mockValidation.Validation.validateSignature = jest.fn().mockReturnValue(false);

      // 移除簽名以觸發驗證失敗
      delete mockRequest.headers['x-line-signature'];

      await lineBotController.handleWebhook(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('應該處理處理錯誤', async () => {
      // 模擬處理過程中發生錯誤
      const mockMessageEvent = TestUtils.createMockLineEvent('message') as LineMessageEvent;
      mockRequest.body.events = [mockMessageEvent];

      // 模擬服務拋出錯誤
      const mockStockAdapter = require('../../adapters/StockDataAdapter');
      mockStockAdapter.StockDataAdapter.prototype.fetchStockData = jest.fn().mockRejectedValue(new Error('分析失敗'));

      await lineBotController.handleWebhook(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('處理不同類型的事件', () => {
    it('應該處理文字訊息事件', async () => {
      const mockMessageEvent = TestUtils.createMockLineEvent('message') as LineMessageEvent;
      (mockMessageEvent.message as any).text = '2330';
      mockRequest.body.events = [mockMessageEvent];

      await lineBotController.handleWebhook(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('應該處理貼圖訊息事件', async () => {
      const mockMessageEvent = TestUtils.createMockLineEvent('message') as LineMessageEvent;
      (mockMessageEvent.message as any).type = 'sticker';
      (mockMessageEvent.message as any).packageId = '11537';
      (mockMessageEvent.message as any).stickerId = '52002734';
      mockRequest.body.events = [mockMessageEvent];

      await lineBotController.handleWebhook(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('應該處理 Postback 事件', async () => {
      const mockPostbackEvent = TestUtils.createMockLineEvent('postback') as any;
      mockPostbackEvent.postback = { data: 'action=help' };
      mockRequest.body.events = [mockPostbackEvent];

      await lineBotController.handleWebhook(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('應該處理 Follow 事件', async () => {
      const mockFollowEvent = TestUtils.createMockLineEvent('follow') as any;
      mockRequest.body.events = [mockFollowEvent];

      await lineBotController.handleWebhook(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('應該處理 Unfollow 事件', async () => {
      const mockUnfollowEvent = TestUtils.createMockLineEvent('unfollow');
      mockRequest.body.events = [mockUnfollowEvent];

      await lineBotController.handleWebhook(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('處理股票查詢', () => {
    it('應該處理台股查詢', async () => {
      const mockMessageEvent = TestUtils.createMockLineEvent('message') as LineMessageEvent;
      (mockMessageEvent.message as any).text = '2330';
      mockRequest.body.events = [mockMessageEvent];

      // 模擬股票服務回應
      const mockStockAdapter = require('../../adapters/StockDataAdapter');
      mockStockAdapter.StockDataAdapter.prototype.fetchStockData = jest.fn().mockResolvedValue(
        TestUtils.createMockStockData('2330')
      );

      await lineBotController.handleWebhook(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('應該處理美股查詢', async () => {
      const mockMessageEvent = TestUtils.createMockLineEvent('message') as LineMessageEvent;
      (mockMessageEvent.message as any).text = 'AAPL';
      mockRequest.body.events = [mockMessageEvent];

      // 模擬股票服務回應
      const mockStockAdapter = require('../../adapters/StockDataAdapter');
      mockStockAdapter.StockDataAdapter.prototype.fetchStockData = jest.fn().mockResolvedValue(
        TestUtils.createMockStockData('AAPL')
      );

      await lineBotController.handleWebhook(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('應該處理 ETF 查詢', async () => {
      const mockMessageEvent = TestUtils.createMockLineEvent('message') as LineMessageEvent;
      (mockMessageEvent.message as any).text = '0050';
      mockRequest.body.events = [mockMessageEvent];

      // 模擬 ETF 服務回應
      const mockETFAdapter = require('../../adapters/ETFDataAdapter');
      mockETFAdapter.ETFDataAdapter.prototype.fetchStockData = jest.fn().mockResolvedValue(
        TestUtils.createMockETFData('0050')
      );

      await lineBotController.handleWebhook(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('應該處理無效股票代碼', async () => {
      const mockMessageEvent = TestUtils.createMockLineEvent('message') as LineMessageEvent;
      (mockMessageEvent.message as any).text = 'INVALID';
      mockRequest.body.events = [mockMessageEvent];

      // 模擬服務拋出錯誤
      const mockStockAdapter = require('../../adapters/StockDataAdapter');
      mockStockAdapter.StockDataAdapter.prototype.fetchStockData = jest.fn().mockRejectedValue(
        new Error('無效的股票代碼')
      );

      await lineBotController.handleWebhook(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('處理分析請求', () => {
    it('應該處理分析請求', async () => {
      const mockMessageEvent = TestUtils.createMockLineEvent('message') as LineMessageEvent;
      (mockMessageEvent.message as any).text = '分析 2330';
      mockRequest.body.events = [mockMessageEvent];

      // 模擬分析服務回應
      const mockAIAnalyzer = require('../../services/AIAnalyzer');
      mockAIAnalyzer.AIAnalyzer.prototype.analyzeStock = jest.fn().mockResolvedValue({
        symbol: '2330',
        healthScore: 85,
        recommendation: 'BUY',
        confidence: 0.9,
      });

      await lineBotController.handleWebhook(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('應該處理批量分析請求', async () => {
      const mockMessageEvent = TestUtils.createMockLineEvent('message') as LineMessageEvent;
      (mockMessageEvent.message as any).text = '分析 2330,2317,2454';
      mockRequest.body.events = [mockMessageEvent];

      // 模擬批量分析服務回應
      const mockAIAnalyzer = require('../../services/AIAnalyzer');
      mockAIAnalyzer.AIAnalyzer.prototype.analyzeMultipleStocks = jest.fn().mockResolvedValue([
        { symbol: '2330', healthScore: 85, recommendation: 'BUY' },
        { symbol: '2317', healthScore: 75, recommendation: 'HOLD' },
        { symbol: '2454', healthScore: 65, recommendation: 'HOLD' },
      ]);

      await lineBotController.handleWebhook(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('處理特殊指令', () => {
    it('應該處理幫助指令', async () => {
      const mockMessageEvent = TestUtils.createMockLineEvent('message') as LineMessageEvent;
      (mockMessageEvent.message as any).text = '幫助';
      mockRequest.body.events = [mockMessageEvent];

      await lineBotController.handleWebhook(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('應該處理 ETF 查詢指令', async () => {
      const mockMessageEvent = TestUtils.createMockLineEvent('message') as LineMessageEvent;
      (mockMessageEvent.message as any).text = 'ETF';
      mockRequest.body.events = [mockMessageEvent];

      await lineBotController.handleWebhook(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('應該處理問候指令', async () => {
      const mockMessageEvent = TestUtils.createMockLineEvent('message') as LineMessageEvent;
      (mockMessageEvent.message as any).text = '你好';
      mockRequest.body.events = [mockMessageEvent];

      await lineBotController.handleWebhook(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('錯誤處理', () => {
    it('應該處理服務錯誤', async () => {
      const mockMessageEvent = TestUtils.createMockLineEvent('message') as LineMessageEvent;
      (mockMessageEvent.message as any).text = '2330';
      mockRequest.body.events = [mockMessageEvent];

      // 模擬服務拋出錯誤
      const mockStockAdapter = require('../../adapters/StockDataAdapter');
      mockStockAdapter.StockDataAdapter.prototype.fetchStockData = jest.fn().mockRejectedValue(
        new Error('API 服務暫時無法使用')
      );

      await lineBotController.handleWebhook(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('應該處理網路錯誤', async () => {
      const mockMessageEvent = TestUtils.createMockLineEvent('message') as LineMessageEvent;
      (mockMessageEvent.message as any).text = '2330';
      mockRequest.body.events = [mockMessageEvent];

      // 模擬網路錯誤
      const mockStockAdapter = require('../../adapters/StockDataAdapter');
      mockStockAdapter.StockDataAdapter.prototype.fetchStockData = jest.fn().mockRejectedValue(
        new Error('網路連線失敗')
      );

      await lineBotController.handleWebhook(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('應該處理未知錯誤', async () => {
      const mockMessageEvent = TestUtils.createMockLineEvent('message') as LineMessageEvent;
      (mockMessageEvent.message as any).text = '2330';
      mockRequest.body.events = [mockMessageEvent];

      // 模擬未知錯誤
      const mockStockAdapter = require('../../adapters/StockDataAdapter');
      mockStockAdapter.StockDataAdapter.prototype.fetchStockData = jest.fn().mockRejectedValue(
        '未知錯誤'
      );

      await lineBotController.handleWebhook(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('邊界情況測試', () => {
    it('應該處理空訊息', async () => {
      const mockMessageEvent = TestUtils.createMockLineEvent('message') as LineMessageEvent;
      (mockMessageEvent.message as any).text = '';
      mockRequest.body.events = [mockMessageEvent];

      await lineBotController.handleWebhook(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('應該處理非常長的訊息', async () => {
      const mockMessageEvent = TestUtils.createMockLineEvent('message') as LineMessageEvent;
      (mockMessageEvent.message as any).text = 'A'.repeat(1000);
      mockRequest.body.events = [mockMessageEvent];

      await lineBotController.handleWebhook(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('應該處理特殊字元訊息', async () => {
      const mockMessageEvent = TestUtils.createMockLineEvent('message') as LineMessageEvent;
      (mockMessageEvent.message as any).text = '2330@#$%^&*()';
      mockRequest.body.events = [mockMessageEvent];

      await lineBotController.handleWebhook(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });
});
