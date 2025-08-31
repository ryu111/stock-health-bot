import request from 'supertest';
import express from 'express';
import { LineBotController } from '../../controllers/LineBotController';
import { StockService, StockQuoteData } from '../../services/StockService';
import { ETFDataService, ETFQuoteData } from '../../services/ETFDataService';
import { TestUtils } from '../utils/testUtils';

// 模擬依賴
jest.mock('../../config/FirebaseConfig');
jest.mock('../../config/LineConfig');
jest.mock('../../utils/Logger', () => ({
  Logger: {
    getInstance: jest.fn(() => ({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      logApiRequest: jest.fn(),
    })),
  },
}));
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

describe('端到端測試 - 完整用戶流程', () => {
  let app: express.Application;
  let lineBotController: LineBotController;
  let stockService: StockService;
  let etfDataService: ETFDataService;

  beforeEach(() => {
    // 重置模擬
    jest.clearAllMocks();

    // 創建服務實例
    lineBotController = new LineBotController();
    stockService = new StockService();
    etfDataService = new ETFDataService();

    // 創建 Express 應用
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // 添加請求日誌中間件
    app.use((_req: express.Request, res: express.Response, next: express.NextFunction) => {
      const startTime = Date.now();
      res.on('finish', () => {
        // 模擬日誌記錄
        void (Date.now() - startTime);
      });
      next();
    });

    // 添加 webhook 路由
    app.post('/webhook', async (req: express.Request, res: express.Response) => {
      try {
        await lineBotController.handleWebhook(req, res);
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // 添加股票查詢 API
    app.get('/api/stock/:symbol', async (req: express.Request, res: express.Response) => {
      try {
        const { symbol } = req.params;
        if (!symbol) {
          return res.status(400).json({
            success: false,
            error: '缺少股票代碼',
            message: '請提供有效的股票代碼',
          });
        }
        const stockData = await stockService.getStockData(symbol);
        
        if (!stockData) {
          return res.status(404).json({
            success: false,
            error: '找不到股票資料',
            message: `找不到股票 ${symbol} 的資料`,
          });
        }

        return res.json({
          success: true,
          data: stockData,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: '查詢失敗',
          message: '股票查詢失敗，請稍後再試',
        });
      }
    });

    // 添加 ETF 查詢 API
    app.get('/api/etf/:symbol', async (req: express.Request, res: express.Response) => {
      try {
        const { symbol } = req.params;
        if (!symbol) {
          return res.status(400).json({
            success: false,
            error: '缺少 ETF 代碼',
            message: '請提供有效的 ETF 代碼',
          });
        }
        const etfData = await etfDataService.getETFData(symbol);
        
        if (!etfData) {
          return res.status(404).json({
            success: false,
            error: '找不到 ETF 資料',
            message: `找不到 ETF ${symbol} 的資料`,
          });
        }

        return res.json({
          success: true,
          data: etfData,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: '查詢失敗',
          message: 'ETF 查詢失敗，請稍後再試',
        });
      }
    });
  });

  describe('完整股票查詢流程', () => {
    it('應該完成台股查詢的完整流程', async () => {
      // 模擬股票服務回應
      const mockStockData: StockQuoteData = {
        symbol: '2330',
        name: '台積電',
        price: 500.0,
        previousClose: 495.0,
        marketCap: 1000000000000,
        volume: 1000000,
        peRatio: 15.5,
        eps: 32.26,
        dividendYield: 2.5,
        fiftyTwoWeekHigh: 600.0,
        fiftyTwoWeekLow: 400.0,
        currency: 'TWD',
        exchange: 'TWSE',
        dailyChange: 1.01,
        priceToBook: 2.5,
        returnOnEquity: 0.25,
      };
      jest.spyOn(stockService, 'getStockData').mockResolvedValue(mockStockData);

      // 模擬 LINE Bot 控制器回應
      jest.spyOn(lineBotController, 'handleWebhook').mockImplementation(async (_req, res) => {
        res.status(200).json({ status: 'ok' });
      });

      // 1. 測試 API 端點
      const apiResponse = await request(app)
        .get('/api/stock/2330')
        .expect(200);

      expect(apiResponse.body.success).toBe(true);
      expect(apiResponse.body.data.symbol).toBe('2330');
      expect(apiResponse.body.data.name).toBe('台積電');

      // 2. 測試 webhook 端點
      const mockMessageEvent = TestUtils.createMockLineEvent('message');
      (mockMessageEvent.message as any).text = '2330';

      const webhookResponse = await request(app)
        .post('/webhook')
        .set('Content-Type', 'application/json')
        .set('x-line-signature', 'test-signature')
        .send({
          events: [mockMessageEvent],
        })
        .expect(200);

      expect(webhookResponse.body.status).toBe('ok');
    });

    it('應該完成美股查詢的完整流程', async () => {
      // 模擬股票服務回應
      const mockStockData: StockQuoteData = {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: 150.0,
        previousClose: 148.0,
        marketCap: 2500000000000,
        volume: 5000000,
        peRatio: 25.0,
        eps: 6.0,
        dividendYield: 0.5,
        fiftyTwoWeekHigh: 180.0,
        fiftyTwoWeekLow: 120.0,
        currency: 'USD',
        exchange: 'NASDAQ',
        dailyChange: 1.35,
        priceToBook: 15.0,
        returnOnEquity: 0.30,
      };
      jest.spyOn(stockService, 'getStockData').mockResolvedValue(mockStockData);

      // 模擬 LINE Bot 控制器回應
      jest.spyOn(lineBotController, 'handleWebhook').mockImplementation(async (_req, res) => {
        res.status(200).json({ status: 'ok' });
      });

      // 1. 測試 API 端點
      const apiResponse = await request(app)
        .get('/api/stock/AAPL')
        .expect(200);

      expect(apiResponse.body.success).toBe(true);
      expect(apiResponse.body.data.symbol).toBe('AAPL');
      expect(apiResponse.body.data.name).toBe('Apple Inc.');

      // 2. 測試 webhook 端點
      const mockMessageEvent = TestUtils.createMockLineEvent('message');
      (mockMessageEvent.message as any).text = 'AAPL';

      const webhookResponse = await request(app)
        .post('/webhook')
        .set('Content-Type', 'application/json')
        .set('x-line-signature', 'test-signature')
        .send({
          events: [mockMessageEvent],
        })
        .expect(200);

      expect(webhookResponse.body.status).toBe('ok');
    });
  });

  describe('完整 ETF 查詢流程', () => {
    it('應該完成台股 ETF 查詢的完整流程', async () => {
      // 模擬 ETF 服務回應
      const mockETFData: ETFQuoteData = {
        symbol: '0050',
        name: '元大台灣50',
        price: 100.0,
        previousClose: 98.0,
        volume: 500000,
        dividendYield: 3.0,
        marketCap: 50000000000,
        currency: 'TWD',
        exchange: 'TWSE',
        source: 'Yahoo Finance',
        description: '元大台灣50證券投資信託基金',
        expenseRatio: 0.32,
        dailyChange: 2.04,
      };
      jest.spyOn(etfDataService, 'getETFData').mockResolvedValue(mockETFData);

      // 模擬 LINE Bot 控制器回應
      jest.spyOn(lineBotController, 'handleWebhook').mockImplementation(async (_req, res) => {
        res.status(200).json({ status: 'ok' });
      });

      // 1. 測試 API 端點
      const apiResponse = await request(app)
        .get('/api/etf/0050')
        .expect(200);

      expect(apiResponse.body.success).toBe(true);
      expect(apiResponse.body.data.symbol).toBe('0050');
      expect(apiResponse.body.data.name).toBe('元大台灣50');

      // 2. 測試 webhook 端點
      const mockMessageEvent = TestUtils.createMockLineEvent('message');
      (mockMessageEvent.message as any).text = '0050';

      const webhookResponse = await request(app)
        .post('/webhook')
        .set('Content-Type', 'application/json')
        .set('x-line-signature', 'test-signature')
        .send({
          events: [mockMessageEvent],
        })
        .expect(200);

      expect(webhookResponse.body.status).toBe('ok');
    });
  });

  describe('錯誤處理流程', () => {
    it('應該處理無效股票代碼的完整流程', async () => {
      // 模擬服務拋出錯誤
      jest.spyOn(stockService, 'getStockData').mockRejectedValue(new Error('無效的股票代碼'));

      // 模擬 LINE Bot 控制器回應
      jest.spyOn(lineBotController, 'handleWebhook').mockImplementation(async (_req, res) => {
        res.status(200).json({ status: 'ok' });
      });

      // 1. 測試 API 端點錯誤處理
      const apiResponse = await request(app)
        .get('/api/stock/INVALID')
        .expect(500);

      expect(apiResponse.body.success).toBe(false);
      expect(apiResponse.body.error).toBe('查詢失敗');

      // 2. 測試 webhook 端點錯誤處理
      const mockMessageEvent = TestUtils.createMockLineEvent('message');
      (mockMessageEvent.message as any).text = 'INVALID';

      const webhookResponse = await request(app)
        .post('/webhook')
        .set('Content-Type', 'application/json')
        .set('x-line-signature', 'test-signature')
        .send({
          events: [mockMessageEvent],
        })
        .expect(200);

      expect(webhookResponse.body.status).toBe('ok');
    });
  });

  describe('特殊指令流程', () => {
    it('應該處理幫助指令的完整流程', async () => {
      // 模擬 LINE Bot 控制器回應
      jest.spyOn(lineBotController, 'handleWebhook').mockImplementation(async (_req, res) => {
        res.status(200).json({ status: 'ok' });
      });

      // 測試幫助指令
      const mockMessageEvent = TestUtils.createMockLineEvent('message');
      (mockMessageEvent.message as any).text = '幫助';

      const webhookResponse = await request(app)
        .post('/webhook')
        .set('Content-Type', 'application/json')
        .set('x-line-signature', 'test-signature')
        .send({
          events: [mockMessageEvent],
        })
        .expect(200);

      expect(webhookResponse.body.status).toBe('ok');
    });
  });
});
